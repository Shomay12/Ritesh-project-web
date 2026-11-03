"""Bulk upload photographs into a client gallery from the command line.

Features:
  - Automatic EXIF orientation normalization via Pillow
  - Generates high-res preview (2000px) and web thumbnail (720px)
  - Concurrent uploads via ThreadPoolExecutor
  - Skips files already uploaded (idempotent)
  - Automatically sets cover photo if missing
  - Optional --publish and --notify flags to publish and send client email

Usage:
  python automation/bulk_upload.py --gallery-id <uuid> --folder /path/to/photos
  python automation/bulk_upload.py --create --title "Anya & Rohan" --client-email anya@example.com --folder /path/to/photos --publish --notify
"""

from __future__ import annotations

import argparse
import io
import mimetypes
import os
import re
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import timedelta
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps

import emails
from common import (
    GALLERY_BUCKET,
    get_logger,
    get_supabase,
    gallery_url,
    is_dry_run,
    now_utc,
    send_email,
    settings,
    utc_now_iso,
)

log = get_logger("bulk_upload")

SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


def safe_filename(name: str) -> str:
    cleaned = re.sub(r"[^\w.\-]+", "_", name)
    cleaned = re.sub(r"_+", "_", cleaned).strip("._")
    return cleaned[-80:] if len(cleaned) > 80 else cleaned


def make_stem(name: str) -> str:
    s = Path(name).stem
    cleaned = re.sub(r"[^\w\-]+", "_", s)
    return re.sub(r"_+", "_", cleaned).strip("_")[:50]


def resize_image(img: Image.Image, max_edge: int, quality: int) -> tuple[bytes, int, int]:
    w, h = img.size
    scale = min(1.0, max_edge / max(w, h))
    target_w = max(1, round(w * scale))
    target_h = max(1, round(h * scale))

    if scale < 1.0:
        resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    else:
        resized = img

    buf = io.BytesIO()
    resized.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue(), target_w, target_h


def process_and_upload_single(
    file_path: Path,
    gallery_id: str,
    sort_order: int,
) -> dict[str, Any]:
    sb = get_supabase()
    original_size = file_path.stat().st_size
    filename = file_path.name
    short_key = uuid.uuid4().hex[:8]
    clean_stem = make_stem(filename)
    safe_name = safe_filename(filename)

    orig_storage_path = f"{gallery_id}/originals/{short_key}-{safe_name}"
    prev_storage_path = f"{gallery_id}/previews/{short_key}-{clean_stem}.jpg"
    thumb_storage_path = f"{gallery_id}/thumbs/{short_key}-{clean_stem}.jpg"

    # Read and normalise orientation
    with Image.open(file_path) as raw_img:
        img = ImageOps.exif_transpose(raw_img)
        if img is None:
            img = raw_img.copy()
        if img.mode != "RGB":
            img = img.convert("RGB")
        orig_w, orig_h = img.size

        prev_bytes, _, _ = resize_image(img, max_edge=2000, quality=85)
        thumb_bytes, _, _ = resize_image(img, max_edge=720, quality=80)

    # Read original file bytes for storage
    with open(file_path, "rb") as f:
        orig_bytes = f.read()

    mime_type, _ = mimetypes.guess_type(str(file_path))
    if not mime_type:
        mime_type = "image/jpeg"

    # Upload files to Supabase Storage
    sb.storage.from_(GALLERY_BUCKET).upload(
        orig_storage_path,
        orig_bytes,
        file_options={"content-type": mime_type, "upsert": "true"},
    )
    sb.storage.from_(GALLERY_BUCKET).upload(
        prev_storage_path,
        prev_bytes,
        file_options={"content-type": "image/jpeg", "upsert": "true"},
    )
    sb.storage.from_(GALLERY_BUCKET).upload(
        thumb_storage_path,
        thumb_bytes,
        file_options={"content-type": "image/jpeg", "upsert": "true"},
    )

    # Insert metadata row into database
    row = {
        "gallery_id": gallery_id,
        "filename": filename,
        "original_path": orig_storage_path,
        "preview_path": prev_storage_path,
        "thumb_path": thumb_storage_path,
        "width": orig_w,
        "height": orig_h,
        "size_bytes": original_size,
        "sort_order": sort_order,
    }
    inserted = sb.table("gallery_photos").insert(row).select().single().execute().data
    return inserted


def bulk_upload(
    gallery_id: str,
    folder_path: Path,
    workers: int = 4,
    publish: bool = False,
    notify: bool = False,
) -> None:
    sb = get_supabase()

    # Verify gallery exists
    gal = sb.table("galleries").select("*").eq("id", gallery_id).maybe_single().execute().data
    if not gal:
        raise ValueError(f"Gallery with ID {gallery_id!r} not found in database.")

    # Find candidate image files
    all_files = [
        p for p in folder_path.iterdir()
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS and not p.name.startswith(".")
    ]
    all_files.sort(key=lambda p: p.name.lower())

    if not all_files:
        log.warning("No supported image files found in %s", folder_path)
        return

    # Fetch existing photos to ensure idempotency and compute sort order
    existing_photos = (
        sb.table("gallery_photos")
        .select("id, filename, sort_order")
        .eq("gallery_id", gallery_id)
        .order("sort_order")
        .execute()
        .data
        or []
    )
    existing_filenames = {p["filename"] for p in existing_photos}
    current_max_order = max([p.get("sort_order", 0) for p in existing_photos], default=-1)

    to_upload = [f for f in all_files if f.name not in existing_filenames]
    skipped_count = len(all_files) - len(to_upload)
    if skipped_count:
        log.info("Skipping %d file(s) that already exist in gallery %s", skipped_count, gallery_id)

    if not to_upload:
        log.info("All %d images are already uploaded.", len(all_files))
    else:
        log.info("Uploading %d images with %d concurrent worker(s)...", len(to_upload), workers)

        uploaded_records: list[dict[str, Any]] = []
        total = len(to_upload)
        completed = 0

        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_file = {
                executor.submit(
                    process_and_upload_single,
                    file_path,
                    gallery_id,
                    current_max_order + 1 + i,
                ): file_path
                for i, file_path in enumerate(to_upload)
            }

            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                completed += 1
                try:
                    res = future.result()
                    uploaded_records.append(res)
                    print(f"[{completed:4d}/{total:4d}] {file_path.name:<32} uploaded", flush=True)
                except Exception as exc:
                    log.error("Failed uploading %s: %s", file_path.name, exc)
                    print(f"[{completed:4d}/{total:4d}] {file_path.name:<32} ERROR: {exc}", file=sys.stderr, flush=True)

        log.info("Uploaded %d of %d photos successfully.", len(uploaded_records), total)

    # Set cover photo if not present
    fresh_photos = (
        sb.table("gallery_photos")
        .select("id")
        .eq("gallery_id", gallery_id)
        .order("sort_order")
        .limit(1)
        .execute()
        .data
    )
    if fresh_photos and not gal.get("cover_photo_id"):
        cover_id = fresh_photos[0]["id"]
        sb.table("galleries").update({"cover_photo_id": cover_id}).eq("id", gallery_id).execute()
        log.info("Set cover photo to %s", cover_id)

    # Handle --publish
    if publish:
        now = now_utc()
        updates: dict[str, Any] = {"status": "published"}
        if not gal.get("published_at"):
            updates["published_at"] = utc_now_iso()
        if not gal.get("expires_at"):
            exp_date = now + timedelta(days=settings().expiry_warning_days or 90)
            updates["expires_at"] = exp_date.isoformat()
        sb.table("galleries").update(updates).eq("id", gallery_id).execute()
        log.info("Gallery marked as published.")

    # Handle --notify
    if notify:
        gal_refreshed = sb.table("galleries").select("*").eq("id", gallery_id).single().execute().data
        client_email = gal_refreshed.get("client_email")
        if client_email:
            count = sb.table("gallery_photos").select("id", count="exact").eq("gallery_id", gallery_id).execute().count or 0
            subject, html = emails.gallery_ready(gal_refreshed, count=count)
            ok = send_email(client_email, gal_refreshed.get("client_name") or "", subject, html)
            if ok and not is_dry_run():
                sb.table("galleries").update({"notified_at": utc_now_iso()}).eq("id", gallery_id).execute()
                log.info("Notification email sent to %s", client_email)
        else:
            log.warning("Cannot notify client: gallery has no client_email.")

    print("\nBulk upload complete.")
    print(f"Gallery URL: {gallery_url(gallery_id)}\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Bulk upload photographs into a client gallery.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--gallery-id", help="Existing gallery UUID to upload photos into.")
    group.add_argument("--create", action="store_true", help="Create a new gallery before uploading.")

    parser.add_argument("--folder", required=True, type=Path, help="Local directory containing photo files.")
    parser.add_argument("--title", help="Gallery title (required if --create is given).")
    parser.add_argument("--client-email", help="Client email (required if --create is given).")
    parser.add_argument("--client-name", help="Client name.")
    parser.add_argument("--event-date", help="Event date (YYYY-MM-DD).")
    parser.add_argument("--expires-days", type=int, default=90, help="Days before gallery expires (default: 90).")
    parser.add_argument("--workers", type=int, default=4, help="Concurrent upload threads (default: 4).")
    parser.add_argument("--publish", action="store_true", help="Mark gallery as published after upload.")
    parser.add_argument("--notify", action="store_true", help="Send client email notification after upload.")

    args = parser.parse_args()

    if not args.folder.is_dir():
        parser.error(f"Folder does not exist or is not a directory: {args.folder}")

    gallery_id = args.gallery_id

    if args.create:
        if not args.title or not args.client_email:
            parser.error("--create requires both --title and --client-email.")
        sb = get_supabase()
        exp_at = (now_utc() + timedelta(days=args.expires_days)).isoformat() if args.expires_days > 0 else None
        new_row = {
            "title": args.title,
            "client_name": args.client_name,
            "client_email": args.client_email.strip().lower(),
            "event_date": args.event_date,
            "status": "draft",
            "allow_download": True,
            "expires_at": exp_at,
        }
        res = sb.table("galleries").insert(new_row).select().single().execute().data
        gallery_id = res["id"]
        log.info("Created new gallery %s (%r)", gallery_id, args.title)

    bulk_upload(
        gallery_id=gallery_id,
        folder_path=args.folder,
        workers=args.workers,
        publish=args.publish,
        notify=args.notify,
    )


if __name__ == "__main__":
    main()

