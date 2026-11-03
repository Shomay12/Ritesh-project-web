"""Quick verification script for Resend email delivery."""
import os
import sys
from pathlib import Path

# Add automation dir to path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import send_email, settings

def test():
    cfg = settings()
    print(f"Testing Resend delivery to: {cfg.owner_email}")
    success = send_email(
        to_email=cfg.owner_email,
        to_name=cfg.owner_name,
        subject="Resend Verification: Ritesh Farswan Photography",
        html_body="<p>This is a live test notification verifying that Resend is active and sending emails directly to your inbox.</p>"
    )
    if success:
        print(f"Success! Resend delivered the email to {cfg.owner_email}.")
    else:
        print("Delivery failed or RESEND_API_KEY is not configured yet. Check logs/automation.log.")

if __name__ == "__main__":
    test()

