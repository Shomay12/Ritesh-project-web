"""Daily morning digest for the studio owner.

Summarises:
  - New bookings created in the last 24 hours
  - Bookings still in 'new' status older than 48 hours (needing a reply)
  - Unread contact messages (count and latest 5)
  - Confirmed sessions in the next 14 days
  - Client galleries expiring in the next 7 days
  - Gallery downloads logged in the last 24 hours

Usage:
  python automation/daily_digest.py
  python automation/daily_digest.py --always
"""

from __future__ import annotations

import argparse
from datetime import timedelta
from typing import Any

import emails
from common import (
    days_ago_iso,
    get_logger,
    get_supabase,
    iso,
    is_dry_run,
    now_utc,
    run_cli,
    send_email,
    settings,
    today,
)

log = get_logger("daily_digest")


def collect_digest_data() -> dict[str, Any]:
    sb = get_supabase()
    now = now_utc()
    t_today = today()
    last_24h = days_ago_iso(1)
    last_48h = days_ago_iso(2)
    next_14d = (t_today + timedelta(days=14)).isoformat()
    next_7d_dt = now + timedelta(days=7)

    # 1. New bookings in last 24 hours
    new_bookings: list[dict[str, Any]] = (
        sb.table("bookings")
        .select("*")
        .gte("created_at", last_24h)
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )

    # 2. Bookings still 'new' older than 48 hours
    needs_reply: list[dict[str, Any]] = (
        sb.table("bookings")
        .select("*")
        .eq("status", "new")
        .lte("created_at", last_48h)
        .order("created_at")
        .execute()
        .data
        or []
    )

    # 3. Unread contact messages
    unread_res = sb.table("messages").select("id", count="exact").eq("is_read", False).execute()
    unread_count = unread_res.count if unread_res.count is not None else 0

    latest_messages: list[dict[str, Any]] = (
        sb.table("messages")
        .select("*")
        .eq("is_read", False)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
        .data
        or []
    )

    # 4. Confirmed sessions in the next 14 days
    upcoming: list[dict[str, Any]] = (
        sb.table("bookings")
        .select("*")
        .eq("status", "confirmed")
        .gte("event_date", t_today.isoformat())
        .lte("event_date", next_14d)
        .order("event_date")
        .execute()
        .data
        or []
    )

    # 5. Galleries expiring in the next 7 days
    expiring: list[dict[str, Any]] = (
        sb.table("galleries")
        .select("*")
        .eq("status", "published")
        .gt("expires_at", iso(now))
        .lte("expires_at", iso(next_7d_dt))
        .order("expires_at")
        .execute()
        .data
        or []
    )

    # 6. Downloads in the last 24 hours
    raw_downloads: list[dict[str, Any]] = (
        sb.table("downloads")
        .select("*")
        .gte("created_at", last_24h)
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )

    # Aggregate downloads by gallery_id and client_email
    galleries_cache: dict[str, str] = {}
    gallery_ids = list({d["gallery_id"] for d in raw_downloads if d.get("gallery_id")})
    if gallery_ids:
        gal_rows = (
            sb.table("galleries")
            .select("id, title")
            .in_("id", gallery_ids)
            .execute()
            .data
            or []
        )
        galleries_cache = {g["id"]: g["title"] for g in gal_rows}

    # Group downloads
    downloads_map: dict[tuple[str, str], dict[str, Any]] = {}
    for d in raw_downloads:
        gid = d.get("gallery_id", "")
        email = d.get("client_email", "")
        key = (gid, email)
        if key not in downloads_map:
            downloads_map[key] = {
                "gallery_title": galleries_cache.get(gid, "Gallery"),
                "client_email": email,
                "single": 0,
                "zip": 0,
            }
        if d.get("kind") == "zip":
            downloads_map[key]["zip"] += 1
        else:
            downloads_map[key]["single"] += 1

    return {
        "date": t_today,
        "new_bookings": new_bookings,
        "needs_reply": needs_reply,
        "unread_count": unread_count,
        "latest_messages": latest_messages,
        "upcoming": upcoming,
        "expiring": expiring,
        "downloads": list(downloads_map.values()),
    }


def run(always: bool = False) -> bool:
    """Collect metrics and send the daily digest to the owner. Returns True if sent."""
    cfg = settings()
    if not cfg.owner_email:
        log.warning("OWNER_EMAIL is not configured; skipping daily digest.")
        return False

    data = collect_digest_data()

    has_activity = bool(
        data["new_bookings"]
        or data["needs_reply"]
        or data["unread_count"]
        or data["upcoming"]
        or data["expiring"]
        or data["downloads"]
    )

    if not has_activity and not always:
        log.info("No studio activity to report today and --always was not given; skipping digest.")
        return False

    subject, html = emails.owner_digest(data)
    ok = send_email(cfg.owner_email, cfg.owner_name, subject, html)
    if ok:
        log.info("Daily digest sent to %s", cfg.owner_email)
    else:
        log.warning("Daily digest failed to send or was skipped (dry run: %s)", is_dry_run())
    return ok


def main() -> None:
    parser = argparse.ArgumentParser(description="Send the daily morning studio digest.")
    parser.add_argument("--always", action="store_true", help="Send even if there are no new items or activity.")
    args = parser.parse_args()
    run_cli(lambda: run(always=args.always))


if __name__ == "__main__":
    main()

