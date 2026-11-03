"""Database backup utility for the photography studio.

Exports every Supabase table to JSON and CSV in a date-stamped folder:
  <BACKUP_DIR>/YYYY-MM-DD/<table>.json
  <BACKUP_DIR>/YYYY-MM-DD/<table>.csv

Keeps the most recent N backups (default: 30) and prunes older ones.

Usage:
  python automation/backup.py
  python automation/backup.py --keep 60
"""

from __future__ import annotations

import argparse
import csv
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from common import fetch_all, get_logger, get_supabase, run_cli, settings, today

log = get_logger("backup")

TABLES = (
    "bookings",
    "messages",
    "portfolio_items",
    "galleries",
    "gallery_photos",
    "favorites",
    "downloads",
    "availability_blocks",
    "profiles",
)


def export_table(table_name: str, target_dir: Path) -> int:
    sb = get_supabase()
    rows = fetch_all(lambda: sb.table(table_name).select("*").order("id"), page_size=1000)

    # 1. Save JSON
    json_path = target_dir / f"{table_name}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False, default=str)

    # 2. Save CSV
    csv_path = target_dir / f"{table_name}.csv"
    if rows:
        fieldnames = list(rows[0].keys())
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in rows:
                writer.writerow({k: (json.dumps(v) if isinstance(v, (dict, list)) else v) for k, v in r.items()})
    else:
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            f.write("# empty table\n")

    return len(rows)


def prune_old_backups(backup_root: Path, keep: int) -> int:
    if keep <= 0:
        return 0

    subdirs = [p for p in backup_root.iterdir() if p.is_dir() and not p.name.startswith(".")]
    # Match YYYY-MM-DD directories
    valid_dirs: list[tuple[str, Path]] = []
    for d in subdirs:
        try:
            datetime.strptime(d.name, "%Y-%m-%d")
            valid_dirs.append((d.name, d))
        except ValueError:
            continue

    valid_dirs.sort(key=lambda t: t[0], reverse=True)
    to_delete = valid_dirs[keep:]
    for _, d in to_delete:
        log.info("Pruning old backup folder: %s", d.name)
        shutil.rmtree(d, ignore_errors=True)

    return len(to_delete)


def run(keep: int = 30) -> None:
    cfg = settings()
    backup_root = cfg.backup_dir
    today_str = today().isoformat()
    target_dir = backup_root / today_str
    target_dir.mkdir(parents=True, exist_ok=True)

    log.info("Starting database backup into %s", target_dir)
    total_records = 0
    for t in TABLES:
        try:
            count = export_table(t, target_dir)
            total_records += count
            log.info("Exported table %-20s (%d rows)", t, count)
        except Exception as exc:
            log.error("Failed exporting table %s: %s", t, exc)

    log.info("Backup complete. Total rows exported: %d", total_records)

    pruned = prune_old_backups(backup_root, keep=keep)
    if pruned:
        log.info("Pruned %d older backup directory(ies).", pruned)


def main() -> None:
    parser = argparse.ArgumentParser(description="Backup Supabase database tables to JSON and CSV.")
    parser.add_argument("--keep", type=int, default=30, help="Number of daily backups to preserve (default: 30).")
    args = parser.parse_args()
    run_cli(lambda: run(keep=args.keep))


if __name__ == "__main__":
    main()

