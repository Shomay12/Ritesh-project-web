"""Master automation scheduler for the photography studio.

Schedules daily tasks in the configured timezone (default Asia/Kolkata):
  - 02:30  Database backup (tables to JSON and CSV)
  - 08:00  Morning digest email to studio owner
  - 09:00  Session reminders and post-session follow-up emails
  - 09:00  Client gallery expiry warnings and auto-archiving

Usage:
  python automation/scheduler.py                # Run continuously
  python automation/scheduler.py --once         # Run all jobs once and exit (for cron/CI)
  python automation/scheduler.py --once --skip backup
  python automation/scheduler.py --job digest   # Run a single task once
"""

from __future__ import annotations

import argparse
import sys
import time
from typing import Callable

import backup
import daily_digest
import gallery_expiry
import reminders
from common import get_logger, now_local, settings

log = get_logger("scheduler")


def safe_execute(name: str, fn: Callable[[], Any]) -> None:
    log.info("Executing job: %s", name)
    try:
        fn()
        log.info("Finished job: %s successfully", name)
    except Exception as exc:
        log.error("Job %s failed with error: %s", name, exc, exc_info=True)


def run_reminders() -> None:
    safe_execute("reminders", reminders.run)


def run_expiry() -> None:
    safe_execute("gallery_expiry", gallery_expiry.run)


def run_digest() -> None:
    safe_execute("daily_digest", daily_digest.run)


def run_backup() -> None:
    safe_execute("backup", backup.run)


JOB_MAP: dict[str, Callable[[], None]] = {
    "reminders": run_reminders,
    "expiry": run_expiry,
    "digest": run_digest,
    "backup": run_backup,
}


def run_all_once(skip: set[str]) -> None:
    log.info("Running automation tasks once (skipped: %s)...", ", ".join(skip) if skip else "none")
    for name, func in JOB_MAP.items():
        if name in skip:
            log.info("Skipping job %s as requested.", name)
            continue
        func()
    log.info("All selected tasks completed.")


def start_loop() -> None:
    try:
        import schedule
    except ImportError:
        log.error("The 'schedule' package is required for continuous scheduling. Run: pip install schedule")
        sys.exit(1)

    tz_str = settings().timezone
    log.info("Starting studio automation scheduler (Timezone: %s)...", tz_str)

    # Schedule tasks at local studio time
    try:
        # Schedule library supports .timezone() in newer versions
        schedule.every().day.at("02:30").timezone(tz_str).do(run_backup)
        schedule.every().day.at("08:00").timezone(tz_str).do(run_digest)
        schedule.every().day.at("09:00").timezone(tz_str).do(run_reminders)
        schedule.every().day.at("09:00").timezone(tz_str).do(run_expiry)
    except AttributeError:
        # Fallback if schedule version does not support .timezone()
        schedule.every().day.at("02:30").do(run_backup)
        schedule.every().day.at("08:00").do(run_digest)
        schedule.every().day.at("09:00").do(run_reminders)
        schedule.every().day.at("09:00").do(run_expiry)
        log.warning("Installed schedule library does not support timezone parameter; using local system time.")

    log.info("Scheduler active. Current local studio time: %s", now_local().strftime("%Y-%m-%d %H:%M:%S %Z"))

    while True:
        schedule.run_pending()
        time.sleep(30)


def main() -> None:
    parser = argparse.ArgumentParser(description="Photography studio automation scheduler.")
    parser.add_argument("--once", action="store_true", help="Run all tasks immediately and exit.")
    parser.add_argument(
        "--skip",
        action="append",
        default=[],
        help="Job name to skip when running with --once (can be specified multiple times: --skip backup --skip digest).",
    )
    parser.add_argument(
        "--job",
        choices=list(JOB_MAP.keys()),
        help="Run a specific job immediately and exit (choices: %(choices)s).",
    )

    args = parser.parse_args()

    if args.job:
        JOB_MAP[args.job]()
        return

    if args.once:
        run_all_once(skip=set(args.skip))
        return

    start_loop()


if __name__ == "__main__":
    main()

