"""Shared configuration, logging, Supabase client and email sending for the studio automation."""

from __future__ import annotations

import logging
import os
import sys
import threading
import time
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from functools import lru_cache
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import TYPE_CHECKING, Any, Iterable
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests
from dotenv import load_dotenv

if TYPE_CHECKING:  # pragma: no cover
    from supabase import Client

AUTOMATION_DIR = Path(__file__).resolve().parent
REPO_ROOT = AUTOMATION_DIR.parent
LOG_DIR = AUTOMATION_DIR / "logs"
LOG_FILE = LOG_DIR / "automation.log"

# automation/.env wins; a repo-root .env is used as a fallback. Real environment
# variables (e.g. GitHub Actions secrets) are never overridden.
load_dotenv(AUTOMATION_DIR / ".env", override=False)
load_dotenv(REPO_ROOT / ".env", override=False)

GALLERY_BUCKET = "client-galleries"
PORTFOLIO_BUCKET = "portfolio"
EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send"


class ConfigError(RuntimeError):
    """Raised when required configuration is missing or invalid."""


# ---------------------------------------------------------------------------
# Environment helpers
# ---------------------------------------------------------------------------

def env(name: str, default: str = "") -> str:
    """Return an env var, treating empty / whitespace-only values as unset."""
    value = os.environ.get(name)
    if value is None or not value.strip():
        return default
    return value.strip()


def env_int(name: str, default: int) -> int:
    raw = env(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise ConfigError(f"Environment variable {name} must be a whole number, got {raw!r}.") from exc


def env_bool(name: str, default: bool = False) -> bool:
    raw = env(name)
    if not raw:
        return default
    return raw.lower() in {"1", "true", "yes", "y", "on"}


def require_env(*names: str) -> dict[str, str]:
    """Return the requested env vars, or raise ConfigError listing every missing one."""
    values = {name: env(name) for name in names}
    missing = [name for name, value in values.items() if not value]
    if missing:
        raise ConfigError(
            "Missing required environment variable(s): "
            + ", ".join(missing)
            + ". Set them in automation/.env (see automation/.env.example) "
            "or in the environment / GitHub Actions secrets."
        )
    return values


@dataclass(frozen=True)
class Settings:
    owner_name: str
    owner_email: str
    owner_phone: str
    owner_city: str
    studio_name: str
    site_url: str
    client_portal_url: str
    review_url: str
    reminder_days_before: int
    followup_days_after: int
    expiry_warning_days: int
    timezone: str
    backup_dir: Path
    dry_run: bool

    @property
    def tz(self) -> ZoneInfo:
        return ZoneInfo(self.timezone)


@lru_cache(maxsize=1)
def settings() -> Settings:
    """Load non-secret settings with sensible defaults."""
    owner_name = env("OWNER_NAME", "Ritesh Farswan")
    site_url = env("SITE_URL", "https://riteshfarswan.com").rstrip("/")
    portal = env("CLIENT_PORTAL_URL", f"{site_url}/client/")
    if not portal.endswith("/"):
        portal += "/"

    tz_name = env("TIMEZONE", "Asia/Kolkata")
    try:
        ZoneInfo(tz_name)
    except (ZoneInfoNotFoundError, ValueError) as exc:
        raise ConfigError(f"TIMEZONE={tz_name!r} is not a valid IANA time zone (e.g. Asia/Kolkata).") from exc

    backup_dir = Path(env("BACKUP_DIR", "./backups")).expanduser()
    if not backup_dir.is_absolute():
        backup_dir = (AUTOMATION_DIR / backup_dir).resolve()

    return Settings(
        owner_name=owner_name,
        owner_email=env("OWNER_EMAIL"),
        owner_phone=env("OWNER_PHONE"),
        owner_city=env("OWNER_CITY", "Mumbai"),
        studio_name=env("STUDIO_NAME", f"{owner_name} Photography"),
        site_url=site_url,
        client_portal_url=portal,
        review_url=env("REVIEW_URL"),
        reminder_days_before=env_int("REMINDER_DAYS_BEFORE", 3),
        followup_days_after=env_int("FOLLOWUP_DAYS_AFTER", 21),
        expiry_warning_days=env_int("EXPIRY_WARNING_DAYS", 7),
        timezone=tz_name,
        backup_dir=backup_dir,
        dry_run=env_bool("DRY_RUN", False),
    )


def is_dry_run() -> bool:
    return settings().dry_run


def gallery_url(gallery_id: str) -> str:
    """Public client-portal link for a gallery."""
    return f"{settings().client_portal_url}gallery.html?id={gallery_id}"


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

_logging_ready = False
_logging_lock = threading.Lock()


def setup_logging(level: int = logging.INFO) -> None:
    """Configure the 'studio' logger to write to stdout and logs/automation.log (idempotent)."""
    global _logging_ready
    with _logging_lock:
        if _logging_ready:
            return
        root = logging.getLogger("studio")
        root.setLevel(level)
        root.propagate = False
        fmt = logging.Formatter("%(asctime)s %(levelname)-7s %(name)s: %(message)s", "%Y-%m-%d %H:%M:%S")

        stream = logging.StreamHandler(sys.stdout)
        stream.setFormatter(fmt)
        root.addHandler(stream)

        try:
            LOG_DIR.mkdir(parents=True, exist_ok=True)
            file_handler = RotatingFileHandler(LOG_FILE, maxBytes=2_000_000, backupCount=5, encoding="utf-8")
            file_handler.setFormatter(fmt)
            root.addHandler(file_handler)
        except OSError as exc:
            root.warning("File logging disabled (%s); logging to stdout only.", exc)

        # Keep third-party HTTP chatter out of the log.
        for noisy in ("httpx", "httpcore", "urllib3", "hpack"):
            logging.getLogger(noisy).setLevel(logging.WARNING)
        _logging_ready = True


def get_logger(name: str) -> logging.Logger:
    setup_logging()
    return logging.getLogger(f"studio.{name}")


log = get_logger("common")


# ---------------------------------------------------------------------------
# Time helpers
# ---------------------------------------------------------------------------

def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_local() -> datetime:
    return datetime.now(settings().tz)


def today() -> date:
    """Today's date in the configured TIMEZONE."""
    return now_local().date()


def iso(dt: datetime) -> str:
    """ISO-8601 string in UTC, as stored in timestamptz columns."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def utc_now_iso() -> str:
    return iso(now_utc())


def parse_ts(value: str | None) -> datetime | None:
    """Parse a Postgres timestamptz string into an aware datetime."""
    if not value:
        return None
    text = value.strip().replace(" ", "T", 1)
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(text)
    except ValueError:
        # Normalise fractional seconds to 6 digits for older Python versions.
        head, sep, tail = text.partition(".")
        if not sep:
            raise
        digits = "".join(ch for ch in tail if ch.isdigit())
        rest = tail[len(digits):]
        dt = datetime.fromisoformat(f"{head}.{digits[:6].ljust(6, '0')}{rest}")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def parse_date(value: str | date | None) -> date | None:
    if value is None or value == "":
        return None
    if isinstance(value, date):
        return value
    return date.fromisoformat(value[:10])


def to_local(dt: datetime) -> datetime:
    return dt.astimezone(settings().tz)


def days_ago_iso(days: float) -> str:
    return iso(now_utc() - timedelta(days=days))


# ---------------------------------------------------------------------------
# Supabase
# ---------------------------------------------------------------------------

def new_supabase() -> "Client":
    """Create a fresh Supabase client authenticated with the service role key."""
    creds = require_env("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
    try:
        from supabase import create_client
    except ImportError as exc:  # pragma: no cover
        raise ConfigError("The 'supabase' package is not installed. Run: pip install -r automation/requirements.txt") from exc
    return create_client(creds["SUPABASE_URL"], creds["SUPABASE_SERVICE_ROLE_KEY"])


@lru_cache(maxsize=1)
def get_supabase() -> "Client":
    """Shared Supabase client (service role, bypasses RLS)."""
    return new_supabase()


def fetch_all(query_builder_factory, page_size: int = 1000) -> list[dict[str, Any]]:
    """Fetch every row of a query by paging with .range().

    `query_builder_factory` must return a fresh, ordered select builder on each call,
    e.g. ``lambda: sb.table("bookings").select("*").order("id")``.
    """
    rows: list[dict[str, Any]] = []
    start = 0
    while True:
        batch = query_builder_factory().range(start, start + page_size - 1).execute().data or []
        rows.extend(batch)
        if len(batch) < page_size:
            return rows
        start += page_size


def chunked(items: list[Any], size: int) -> Iterable[list[Any]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


# ---------------------------------------------------------------------------
# Email (EmailJS REST API)
# ---------------------------------------------------------------------------

_EMAIL_KEYS = ("EMAILJS_SERVICE_ID", "EMAILJS_TEMPLATE_ID", "EMAILJS_PUBLIC_KEY", "EMAILJS_PRIVATE_KEY")
_send_lock = threading.Lock()
_last_send = 0.0
_MIN_SEND_INTERVAL = 1.1  # EmailJS allows roughly one request per second.


def send_email(
    to_email: str,
    to_name: str,
    subject: str,
    html_body: str,
    reply_to: str | None = None,
) -> bool:
    """Send one email through EmailJS. Returns True on success (or when DRY_RUN logs it)."""
    global _last_send
    cfg = settings()
    reply = reply_to or cfg.owner_email

    if cfg.dry_run:
        log.info("[dry-run] email to %s <%s>: %s (%d chars of HTML)", to_name, to_email, subject, len(html_body))
        return True

    keys = require_env(*_EMAIL_KEYS)
    payload = {
        "service_id": keys["EMAILJS_SERVICE_ID"],
        "template_id": keys["EMAILJS_TEMPLATE_ID"],
        "user_id": keys["EMAILJS_PUBLIC_KEY"],
        "accessToken": keys["EMAILJS_PRIVATE_KEY"],
        "template_params": {
            "to_email": to_email,
            "to_name": to_name,
            "from_name": cfg.owner_name,
            "reply_to": reply,
            "subject": subject,
            "html_body": html_body,
        },
    }

    attempts = 3  # first try + two retries
    for attempt in range(1, attempts + 1):
        with _send_lock:
            wait = _MIN_SEND_INTERVAL - (time.monotonic() - _last_send)
            if wait > 0:
                time.sleep(wait)
            try:
                resp = requests.post(EMAILJS_ENDPOINT, json=payload, timeout=30)
                error: str | None = None
            except requests.RequestException as exc:
                resp = None
                error = f"network error: {exc}"
            finally:
                _last_send = time.monotonic()

        if resp is not None:
            if 200 <= resp.status_code < 300:
                log.info("Email sent to %s: %s", to_email, subject)
                return True
            body = (resp.text or "").strip()[:300]
            if resp.status_code < 500 and resp.status_code != 429:
                log.error("EmailJS rejected email to %s (HTTP %s): %s", to_email, resp.status_code, body)
                if resp.status_code == 403 and "non-browser" in body.lower():
                    log.error('Enable "Allow EmailJS API for non-browser applications" in EmailJS Account > Security.')
                return False
            error = f"HTTP {resp.status_code}: {body}"

        if attempt < attempts:
            delay = 2 * attempt
            log.warning("Email to %s failed (%s); retrying in %ss", to_email, error, delay)
            time.sleep(delay)
        else:
            log.error("Email to %s failed after %d attempts (%s)", to_email, attempts, error)
    return False


def run_cli(main_fn) -> None:
    """Run a script entry point, turning ConfigError into a clean exit code 2."""
    try:
        code = main_fn()
    except ConfigError as exc:
        log.error("%s", exc)
        sys.exit(2)
    except KeyboardInterrupt:
        log.warning("Interrupted.")
        sys.exit(130)
    sys.exit(code or 0)
