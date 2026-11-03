"""Gallery expiry: warn clients before their gallery closes, archive expired galleries,
and optionally purge storage files of galleries that have been archived for a while.

Examples:
  python automation/gallery_expiry.py
  python automation/gallery_expiry.py --purge-archived-days 180
"""

from __future__ import annotations

import argparse
from datetime import timedelta
from typing import Any

import emails
from common import (
    GALLERY_BUCKET,
    chunked,
    get_logger,
    get_supabase,
    iso,
    is_dry_run,
    now_utc,
    run_cli,
    send_email,
    settings,
    utc_now_iso,
)

log = get_logger("gallery_expiry")

SUBFOLDERS = ("originals", "previews", "thumbs")
LIST_PAGE = 1000
REMOVE_BATCH = 100


def send_expiry_warnings() -> int:
    """Email clients whose published gallery expires within EXPIRY_WARNING_DAYS. Returns emails sent."""
    sb = get_supabase()
    now = now_utc()
    horizon = now + timedelta(days=settings().expiry_warning_days)
    rows: list[dict[str, Any]] = (
        sb.table("galleries")
        .select("*")
        .eq("status", "published")
        .gt("expires_at", iso(now))
        .lte("expires_at", iso(horizon))
        .is_("expiry_notice_sent_at", "null")
        .order("expires_at")
        .execute()
        .data
        or []
    )
    log.info("Expiry warnings: %d gallery(ies) expire before %s", len(rows), horizon.date())

    sent = 0
    for gallery in rows:
        if not gallery.get("client_email"):
            log.warning("Gallery %s has no client email; skipping", gallery["id"])
            continue
        subject, html = emails.gallery_expiry_warning(gallery)
        if not send_email(gallery["client_email"], gallery.get("client_name") or "", subject, html):
            continue
        sent += 1
        if is_dry_run():
            continue
        sb.table("galleries").update({"expiry_notice_sent_at": utc_now_iso()}).eq("id", gallery["id"]).execute()
        log.info("Expiry warning recorded for gallery %s (%s)", gallery["id"], gallery.get("title"))
    return sent


def archive_expired() -> int:
    """Set status='archived' on published galleries whose expires_at has passed. Returns rows changed."""
    sb = get_supabase()
    now_iso = utc_now_iso()
    rows = (
        sb.table("galleries")
        .select("id, title")
        .eq("status", "published")
        .lt("expires_at", now_iso)
        .execute()
        .data
        or []
    )
    if not rows:
        return 0
    if is_dry_run():
        log.info("[dry-run] would archive %d expired gallery(ies)", len(rows))
        return len(rows)
    ids = [r["id"] for r in rows]
    for batch in chunked(ids, 100):
        sb.table("galleries").update({"status": "archived"}).in_("id", batch).execute()
    log.info("Archived %d expired gallery(ies): %s", len(rows), ", ".join(str(r.get("title")) for r in rows))
    return len(rows)


def _list_folder(prefix: str) -> list[str]:
    """Return full object paths of every file directly inside `prefix`."""
    bucket = get_supabase().storage.from_(GALLERY_BUCKET)
    paths: list[str] = []
    offset = 0
    while True:
        items = bucket.list(prefix, {"limit": LIST_PAGE, "offset": offset, "sortBy": {"column": "name", "order": "asc"}}) or []
        for item in items:
            name = item.get("name")
            # Sub-folders come back with id=None and are not files.
            if not name or item.get("id") is None:
                continue
            paths.append(f"{prefix}/{name}")
        if len(items) < LIST_PAGE:
            return paths
        offset += LIST_PAGE


def purge_gallery_files(gallery_id: str) -> int:
    """Delete all stored files of one gallery. Returns number of objects removed."""
    bucket = get_supabase().storage.from_(GALLERY_BUCKET)
    paths: list[str] = []
    for sub in SUBFOLDERS:
        paths.extend(_list_folder(f"{gallery_id}/{sub}"))
    if not paths:
        return 0
    if is_dry_run():
        log.info("[dry-run] would delete %d file(s) from gallery %s", len(paths), gallery_id)
        return len(paths)
    removed = 0
    for batch in chunked(paths, REMOVE_BATCH):
        bucket.remove(batch)
        removed += len(batch)
    return removed


def purge_archived(days: int) -> int:
    """Delete storage files for galleries archived and expired more than `days` days ago. Keeps DB rows."""
    sb = get_supabase()
    cutoff = iso(now_utc() - timedelta(days=days))
    rows = (
        sb.table("galleries")
        .select("id, title, expires_at")
        .eq("status", "archived")
        .lt("expires_at", cutoff)
        .execute()
        .data
        or []
    )
    log.info("Purge: %d archived gallery(ies) expired before %s", len(rows), cutoff[:10])
    total = 0
    for gallery in rows:
        try:
            count = purge_gallery_files(gallery["id"])
        except Exception:  # keep going with the next gallery
            log.exception("Could not purge files for gallery %s", gallery["id"])
            continue
        if count:
            log.info("Purged %d file(s) from gallery %s (%s)", count, gallery["id"], gallery.get("title"))
        total += count
    return total


def run(purge_archived_days: int | None = None) -> dict[str, int]:
    """Run the expiry jobs and return a summary."""
    summary = {
        "warnings_sent": send_expiry_warnings(),
        "archived": archive_expired(),
        "files_purged": 0,
    }
    if purge_archived_days is not None:
        summary["files_purged"] = purge_archived(purge_archived_days)
    log.info(
        "Gallery expiry done: %d warning(s), %d archived, %d file(s) purged",
        summary["warnings_sent"],
        summary["archived"],
        summary["files_purged"],
    )
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--purge-archived-days",
        type=int,
        metavar="N",
        help="delete storage files (originals, previews, thumbs) of galleries archived and expired more than N days ago; database rows are kept",
    )
    args = parser.parse_args()
    if args.purge_archived_days is not None and args.purge_archived_days < 0:
        parser.error("--purge-archived-days must be zero or more")
    run(purge_archived_days=args.purge_archived_days)
    return 0


if __name__ == "__main__":
    run_cli(main)
