"""Session reminders, post-session thank-you emails and auto-completion of past bookings.

Run daily:  python automation/reminders.py
"""

from __future__ import annotations

import argparse
from datetime import timedelta
from typing import Any

import emails
from common import get_logger, get_supabase, is_dry_run, run_cli, send_email, settings, today, utc_now_iso

log = get_logger("reminders")

# Follow-ups older than FOLLOWUP_DAYS_AFTER are still sent if they are at most this many days late
# (covers days when the job did not run). Anything older is left alone.
FOLLOWUP_CATCHUP_DAYS = 7


def send_session_reminders() -> int:
    """Remind confirmed clients a few days before their session. Returns emails sent."""
    sb = get_supabase()
    cfg = settings()
    target = today() + timedelta(days=cfg.reminder_days_before)
    # Window from tomorrow up to the target date so a missed daily run is caught next time.
    tomorrow = today() + timedelta(days=1)
    rows: list[dict[str, Any]] = (
        sb.table("bookings")
        .select("*")
        .eq("status", "confirmed")
        .gte("event_date", tomorrow.isoformat())
        .lte("event_date", target.isoformat())
        .is_("reminder_sent_at", "null")
        .order("event_date")
        .execute()
        .data
        or []
    )
    log.info("Session reminders: %d booking(s) between %s and %s need a reminder", len(rows), tomorrow, target)

    sent = 0
    for booking in rows:
        if not booking.get("email"):
            log.warning("Booking %s has no email address; skipping reminder", booking.get("reference"))
            continue
        subject, html = emails.session_reminder(booking)
        if not send_email(booking["email"], booking.get("name") or "", subject, html):
            continue
        sent += 1
        if is_dry_run():
            continue
        sb.table("bookings").update({"reminder_sent_at": utc_now_iso()}).eq("id", booking["id"]).execute()
        log.info("Reminder recorded for booking %s (%s)", booking.get("reference"), booking.get("event_date"))
    return sent


def complete_past_bookings() -> int:
    """Mark confirmed bookings whose event date has passed as completed. Returns rows changed."""
    sb = get_supabase()
    cutoff = today().isoformat()
    rows = (
        sb.table("bookings")
        .select("id, reference, event_date")
        .eq("status", "confirmed")
        .lt("event_date", cutoff)
        .execute()
        .data
        or []
    )
    if not rows:
        return 0
    if is_dry_run():
        log.info("[dry-run] would mark %d past booking(s) as completed", len(rows))
        return len(rows)
    sb.table("bookings").update({"status": "completed"}).eq("status", "confirmed").lt("event_date", cutoff).execute()
    log.info("Marked %d past booking(s) as completed: %s", len(rows), ", ".join(r["reference"] for r in rows))
    return len(rows)


def send_thank_yous() -> int:
    """Send the thank-you / review request FOLLOWUP_DAYS_AFTER days after the event. Returns emails sent."""
    sb = get_supabase()
    cfg = settings()
    newest = today() - timedelta(days=cfg.followup_days_after)
    oldest = newest - timedelta(days=FOLLOWUP_CATCHUP_DAYS)
    rows: list[dict[str, Any]] = (
        sb.table("bookings")
        .select("*")
        .in_("status", ["confirmed", "completed"])
        .gte("event_date", oldest.isoformat())
        .lte("event_date", newest.isoformat())
        .is_("followup_sent_at", "null")
        .order("event_date")
        .execute()
        .data
        or []
    )
    log.info("Thank-you emails: %d booking(s) with sessions between %s and %s", len(rows), oldest, newest)

    sent = 0
    for booking in rows:
        if not booking.get("email"):
            log.warning("Booking %s has no email address; skipping thank-you", booking.get("reference"))
            continue
        subject, html = emails.thank_you(booking)
        if not send_email(booking["email"], booking.get("name") or "", subject, html):
            continue
        sent += 1
        if is_dry_run():
            continue
        sb.table("bookings").update({"followup_sent_at": utc_now_iso()}).eq("id", booking["id"]).execute()
        log.info("Thank-you recorded for booking %s", booking.get("reference"))
    return sent


def run() -> dict[str, int]:
    """Run all booking jobs and return a summary."""
    summary = {
        "reminders_sent": send_session_reminders(),
        "bookings_completed": complete_past_bookings(),
        "thank_yous_sent": send_thank_yous(),
    }
    log.info(
        "Reminders done: %d reminder(s), %d booking(s) completed, %d thank-you(s)",
        summary["reminders_sent"],
        summary["bookings_completed"],
        summary["thank_yous_sent"],
    )
    return summary


def main() -> int:
    argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter).parse_args()
    run()
    return 0


if __name__ == "__main__":
    run_cli(main)
