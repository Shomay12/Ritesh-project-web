"""Email copy and layout. Every public function returns (subject, html)."""

from __future__ import annotations

from datetime import date, datetime
from html import escape
from typing import Any, Mapping, Sequence

from common import gallery_url, now_utc, parse_date, parse_ts, settings, to_local

INK = "#1d1b18"
PAPER = "#f3efe8"
MUTED = "#6b655c"
RULE = "#cfc7b9"
SERIF = "Georgia, 'Times New Roman', Times, serif"
SANS = "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"


# ---------------------------------------------------------------------------
# Small formatting helpers
# ---------------------------------------------------------------------------

def esc(value: Any) -> str:
    """HTML-escape any value; None becomes an empty string."""
    return "" if value is None else escape(str(value), quote=True)


def first_name(full_name: str | None) -> str:
    """First name for greetings; couples ("Priya & Rohan") are kept whole."""
    name = (full_name or "").strip()
    if not name:
        return "there"
    if "&" in name or " and " in name.lower():
        return name
    return name.split()[0]


def fmt_date(value: str | date | None, with_year: bool = True) -> str:
    d = parse_date(value)
    if d is None:
        return ""
    text = f"{d:%A}, {d.day} {d:%B}"
    return f"{text} {d.year}" if with_year else text


def fmt_short_date(value: str | date | None) -> str:
    d = parse_date(value)
    return f"{d.day} {d:%b %Y}" if d else ""


def fmt_ts(value: str | datetime | None) -> str:
    """Timestamp in the studio time zone, e.g. '3 Nov, 14:05'."""
    dt = parse_ts(value) if isinstance(value, str) else value
    if dt is None:
        return ""
    local = to_local(dt)
    return f"{local.day} {local:%b}, {local:%H:%M}"


def _signature() -> str:
    return settings().owner_name


def _closing(word: str = "Warmly") -> str:
    return p(f"{esc(word)},<br>{esc(_signature())}")


def h(text: str, size: int = 24) -> str:
    return (
        f'<h1 style="margin:0 0 18px 0;font-family:{SERIF};font-size:{size}px;line-height:1.3;'
        f'font-weight:normal;color:{INK};">{text}</h1>'
    )


def h2(text: str) -> str:
    return (
        f'<h2 style="margin:28px 0 10px 0;font-family:{SERIF};font-size:18px;line-height:1.3;'
        f'font-weight:normal;color:{INK};">{text}</h2>'
    )


def p(inner_html: str, muted: bool = False, size: int = 15) -> str:
    color = MUTED if muted else INK
    return (
        f'<p style="margin:0 0 16px 0;font-family:{SANS};font-size:{size}px;line-height:1.65;'
        f'color:{color};">{inner_html}</p>'
    )


def text_link(url: str, label: str) -> str:
    return f'<a href="{esc(url)}" style="color:{INK};text-decoration:underline;">{esc(label)}</a>'


def link_block(url: str, label: str) -> str:
    """Plain black rectangular link: no rounded corners, no colour."""
    return (
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">'
        f'<tr><td bgcolor="{INK}" style="background:{INK};padding:13px 24px;">'
        f'<a href="{esc(url)}" style="font-family:{SANS};font-size:14px;letter-spacing:0.04em;'
        f'color:{PAPER};text-decoration:none;display:inline-block;">{esc(label)}</a>'
        "</td></tr></table>"
    )


def details_table(rows: Sequence[tuple[str, str]]) -> str:
    """Two-column label/value list with thin rules. Values must already be escaped."""
    rows = [(label, value) for label, value in rows if value]
    if not rows:
        return ""
    cells = "".join(
        f'<tr><td style="padding:9px 16px 9px 0;border-top:1px solid {RULE};font-family:{SANS};'
        f'font-size:13px;color:{MUTED};white-space:nowrap;vertical-align:top;width:110px;">{esc(label)}</td>'
        f'<td style="padding:9px 0;border-top:1px solid {RULE};font-family:{SANS};font-size:14px;'
        f'color:{INK};vertical-align:top;">{value}</td></tr>'
        for label, value in rows
    )
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
        f'style="margin:4px 0 22px 0;border-bottom:1px solid {RULE};">{cells}</table>'
    )


def data_table(headers: Sequence[str], rows: Sequence[Sequence[str]], empty: str = "Nothing here today.") -> str:
    """Simple multi-column table with thin rules. Cell values must already be escaped."""
    if not rows:
        return p(esc(empty), muted=True, size=14)
    head = "".join(
        f'<th align="left" style="padding:6px 10px 6px 0;border-bottom:1px solid {INK};font-family:{SANS};'
        f'font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:normal;color:{MUTED};">'
        f"{esc(col)}</th>"
        for col in headers
    )
    body = "".join(
        "<tr>"
        + "".join(
            f'<td style="padding:8px 10px 8px 0;border-bottom:1px solid {RULE};font-family:{SANS};'
            f'font-size:13px;line-height:1.45;color:{INK};vertical-align:top;">{cell}</td>'
            for cell in row
        )
        + "</tr>"
        for row in rows
    )
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
        f'style="margin:0 0 8px 0;"><tr>{head}</tr>{body}</table>'
    )


def wrap(html_inner: str, preheader: str = "", footer_note: str = "") -> str:
    """Shared email layout: table-based, 560px max, off-white paper, dark ink."""
    cfg = settings()
    site_label = cfg.site_url.replace("https://", "").replace("http://", "").rstrip("/")
    contact_bits = [esc(cfg.studio_name)]
    if cfg.owner_city:
        contact_bits[0] += f", {esc(cfg.owner_city)}"
    line2 = []
    if cfg.owner_phone:
        line2.append(esc(cfg.owner_phone))
    if cfg.owner_email:
        line2.append(f'<a href="mailto:{esc(cfg.owner_email)}" style="color:{MUTED};text-decoration:underline;">{esc(cfg.owner_email)}</a>')
    if cfg.site_url:
        line2.append(f'<a href="{esc(cfg.site_url)}" style="color:{MUTED};text-decoration:underline;">{esc(site_label)}</a>')
    footer_lines = [contact_bits[0]]
    if line2:
        footer_lines.append(" &nbsp;/&nbsp; ".join(line2))
    if footer_note:
        footer_lines.append(esc(footer_note))
    footer = "<br>".join(footer_lines)

    hidden = (
        f'<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:{PAPER};">{esc(preheader)}</div>'
        if preheader
        else ""
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{esc(cfg.studio_name)}</title>
</head>
<body style="margin:0;padding:0;background:{PAPER};color:{INK};-webkit-text-size-adjust:100%;">
{hidden}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{PAPER}" style="background:{PAPER};">
<tr><td align="center" style="padding:36px 18px 40px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
<tr><td style="padding:0 0 16px 0;border-bottom:1px solid {INK};font-family:{SERIF};font-size:19px;letter-spacing:0.02em;color:{INK};">{esc(cfg.owner_name)}</td></tr>
<tr><td style="padding:30px 0 6px 0;font-family:{SANS};font-size:15px;line-height:1.65;color:{INK};">
{html_inner}
</td></tr>
<tr><td style="padding:20px 0 0 0;border-top:1px solid {RULE};font-family:{SANS};font-size:12px;line-height:1.7;color:{MUTED};">{footer}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>"""


def _is_wedding(session_type: str | None) -> bool:
    text = (session_type or "").lower()
    return any(word in text for word in ("wedding", "haldi", "mehendi", "mehndi", "sangeet", "engagement", "reception"))


# ---------------------------------------------------------------------------
# Client emails
# ---------------------------------------------------------------------------

def session_reminder(booking: Mapping[str, Any]) -> tuple[str, str]:
    """Reminder sent a few days before a confirmed session."""
    cfg = settings()
    name = first_name(booking.get("name"))
    session = (booking.get("session_type") or "session").strip()
    when = fmt_date(booking.get("event_date"), with_year=False)
    time_text = (booking.get("event_time") or "").strip()
    location = (booking.get("location") or "").strip()

    subject = f"See you on {when}" if when else "A quick note before your session"

    tips: list[str]
    if _is_wedding(session):
        tips = [
            "If the timings for any of the functions have moved, even by half an hour, let me know so I can plan around the light.",
            "It helps a lot to have one cousin or friend who knows both families point people out for the group photos. Could you let me know who that will be?",
            "Keep the rings, invitation and any jewellery you want photographed in one place for the getting-ready shots.",
        ]
    else:
        tips = [
            "If you would like a second look, bring a change of clothes. Solid colours and soft textures usually photograph better than busy prints or big logos.",
            "Plan to arrive ten minutes early so nobody feels rushed. The first few minutes are just us chatting anyway.",
            "If the weather looks doubtful the day before, I will message you and we can decide together whether to move it.",
        ]
    tip_html = "".join(
        f'<tr><td style="padding:0 10px 10px 0;vertical-align:top;font-family:{SANS};font-size:15px;color:{MUTED};">&ndash;</td>'
        f'<td style="padding:0 0 10px 0;font-family:{SANS};font-size:15px;line-height:1.6;color:{INK};">{esc(t)}</td></tr>'
        for t in tips
    )

    contact = "reply to this email"
    if cfg.owner_phone:
        contact += f" or call me on {esc(cfg.owner_phone)}"

    inner = (
        h(f"Hi {esc(name)},")
        + p(
            f"A quick note ahead of your {esc(session.lower())} on {esc(when)}. "
            "I have it in my calendar and I am really looking forward to it."
        )
        + details_table(
            [
                ("Date", esc(fmt_date(booking.get("event_date")))),
                ("Time", esc(time_text)),
                ("Location", esc(location)),
                ("Reference", esc(booking.get("reference"))),
            ]
        )
        + p("A few things that make the day easier:")
        + f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;">{tip_html}</table>'
        + p(f"If anything has changed, {contact}. Otherwise, see you then.")
        + _closing("See you soon")
    )
    pre = f"Your {session.lower()} on {when}" + (f" at {location}" if location else "")
    return subject, wrap(inner, preheader=pre, footer_note="You are receiving this because you have a session booked with me.")


def thank_you(booking: Mapping[str, Any]) -> tuple[str, str]:
    """Thank-you note and review request a few weeks after the session."""
    cfg = settings()
    name = first_name(booking.get("name"))
    session = (booking.get("session_type") or "session").strip()
    when = fmt_date(booking.get("event_date"), with_year=False)
    wedding = _is_wedding(session)

    subject = f"Thank you, {name}" if name != "there" else "Thank you"

    day_line = (
        f"It has been a few weeks since your {esc(session.lower())}"
        + (f" on {esc(when)}" if when else "")
        + ", and I wanted to say thank you properly. "
    )
    day_line += (
        "Thank you for trusting me with a day that mattered so much to both your families. "
        "I still think about some of those moments."
        if wedding
        else "I really enjoyed our time together, and I hope you enjoyed it too."
    )

    parts = [h(f"Hi {esc(name)},"), p(day_line)]
    if cfg.review_url:
        parts.append(
            p(
                "If you have a minute, a short review would mean a great deal to me. Most of the people who book me "
                "first read what earlier clients have written, so even two or three honest lines really help."
            )
        )
        parts.append(link_block(cfg.review_url, "Leave a review"))
    parts.append(
        p(
            "If you ever want prints, an album, or photographs of whatever comes next, just reply here. "
            "I would love to hear from you."
        )
    )
    parts.append(_closing("Warmly"))
    return subject, wrap("".join(parts), preheader="A short note to say thank you.")


def gallery_expiry_warning(gallery: Mapping[str, Any]) -> tuple[str, str]:
    """Warn the client that their gallery is about to close."""
    name = first_name(gallery.get("client_name"))
    title = gallery.get("title") or "your gallery"
    expires = parse_ts(gallery.get("expires_at"))
    expires_text = ""
    days_left = None
    if expires:
        local = to_local(expires)
        expires_text = fmt_date(local.date())
        days_left = max(0, (expires - now_utc()).days)
    link = gallery_url(str(gallery["id"]))

    when = f"on {expires_text}" if expires_text else "soon"
    if days_left is not None:
        when += " (tomorrow)" if days_left <= 1 else f" (in {days_left} days)"

    subject = f"Your gallery closes {('on ' + fmt_date(to_local(expires).date(), with_year=False)) if expires else 'soon'}"

    if gallery.get("allow_download", True):
        action = (
            "If you have not yet downloaded everything you want to keep, now is a good time. "
            "The downloads are the full-resolution files, so please save them somewhere safe, ideally in two places."
        )
    else:
        action = (
            "If you have not finished choosing your favourites, now is a good time to go through it once more, "
            "so I have your final selection for prints or the album."
        )

    inner = (
        h(f"Hi {esc(name)},")
        + p(f"A reminder that your gallery, &ldquo;{esc(title)}&rdquo;, will close {esc(when)}. After that the link stops working and I move the files to my archive.")
        + p(esc(action))
        + link_block(link, "Open your gallery")
        + p("If you need a little more time, just reply and I will extend it. That is completely fine.")
        + _closing("Warmly")
    )
    return subject, wrap(inner, preheader=f"{title} closes {when}.")


def gallery_ready(
    gallery: Mapping[str, Any],
    photo_count: int | None = None,
    link: str | None = None,
) -> tuple[str, str]:
    """Tell the client their gallery is online."""
    name = first_name(gallery.get("client_name"))
    title = gallery.get("title") or "Your gallery"
    link = link or gallery_url(str(gallery["id"]))
    event = fmt_date(gallery.get("event_date"), with_year=False)
    expires = parse_ts(gallery.get("expires_at"))
    email = gallery.get("client_email") or ""

    subject = f"Your photographs are ready: {title}"

    count_text = f"all {photo_count} photographs" if photo_count else "the final selection"
    intro = "I have finished going through every frame" + (f" from {esc(event)}" if event else "") + f", and {esc(count_text)} are now online in your private gallery."

    parts = [h(f"Hi {esc(name)},"), p(intro)]
    note = (gallery.get("note") or "").strip()
    if note:
        parts.append(
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">'
            f'<tr><td style="border-left:2px solid {INK};padding:2px 0 2px 16px;font-family:{SERIF};font-size:16px;'
            f'line-height:1.6;font-style:italic;color:{INK};">{esc(note).replace(chr(10), "<br>")}</td></tr></table>'
        )
    parts.append(link_block(link, "View your gallery"))
    how = f"Sign in with this email address ({esc(email)}) and you will get a secure link to open it. " if email else ""
    how += "You can mark favourites as you go, which helps me a lot if you would like prints or an album later."
    parts.append(p(how))
    if gallery.get("allow_download", True):
        parts.append(p("Downloads are the full-resolution files. Please keep a copy in two places; phones and laptops do get lost."))
    if expires:
        parts.append(p(f"The gallery stays open until {esc(fmt_date(to_local(expires).date()))}.", muted=True, size=14))
    parts.append(p("I hope you love them as much as I enjoyed making them."))
    parts.append(_closing("With love"))
    return subject, wrap("".join(parts), preheader=f"{title} is ready to view.")


# ---------------------------------------------------------------------------
# Owner digest
# ---------------------------------------------------------------------------

def _mailto(email: str | None) -> str:
    if not email:
        return ""
    return f'<a href="mailto:{esc(email)}" style="color:{INK};text-decoration:underline;">{esc(email)}</a>'


def _truncate(text: str | None, limit: int = 90) -> str:
    text = " ".join((text or "").split())
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "..."


def owner_digest(data: Mapping[str, Any]) -> tuple[str, str]:
    """Morning summary for the owner.

    Expected keys: new_bookings, needs_reply, unread_count, latest_messages,
    upcoming, expiring, downloads (list of dicts with gallery_title, client_email,
    single, zip), galleries_by_id (optional mapping for titles).
    """
    cfg = settings()
    day = data.get("date")
    new_bookings = data.get("new_bookings") or []
    needs_reply = data.get("needs_reply") or []
    unread_count = int(data.get("unread_count") or 0)
    latest_messages = data.get("latest_messages") or []
    upcoming = data.get("upcoming") or []
    expiring = data.get("expiring") or []
    downloads = data.get("downloads") or []

    headline_bits = []
    if new_bookings:
        headline_bits.append(f"{len(new_bookings)} new enquir{'y' if len(new_bookings) == 1 else 'ies'}")
    if needs_reply:
        headline_bits.append(f"{len(needs_reply)} awaiting reply")
    if unread_count:
        headline_bits.append(f"{unread_count} unread message{'s' if unread_count != 1 else ''}")
    day_label = fmt_date(day, with_year=False) if day else ""
    subject = f"Studio digest, {day_label}" if day_label else "Studio digest"
    if headline_bits:
        subject += ": " + ", ".join(headline_bits)

    parts = [h(f"Good morning, {esc(first_name(cfg.owner_name))}.", size=22)]
    summary = ", ".join(headline_bits) if headline_bits else "No new enquiries or unread messages"
    parts.append(
        p(
            f"{esc(summary)}. {len(upcoming)} confirmed session{'s' if len(upcoming) != 1 else ''} in the next 14 days, "
            f"{len(expiring)} galler{'y' if len(expiring) == 1 else 'ies'} closing this week."
        )
    )

    parts.append(h2("New enquiries, last 24 hours"))
    parts.append(
        data_table(
            ["Received", "Name", "Session", "Date", "Ref"],
            [
                [
                    esc(fmt_ts(b.get("created_at"))),
                    f"{esc(b.get('name'))}<br>{_mailto(b.get('email'))}"
                    + (f"<br>{esc(b.get('phone'))}" if b.get("phone") else ""),
                    esc(b.get("session_type")) + (f"<br>{esc(b.get('package'))}" if b.get("package") else ""),
                    esc(fmt_short_date(b.get("event_date"))),
                    esc(b.get("reference")),
                ]
                for b in new_bookings
            ],
            empty="No new enquiries.",
        )
    )

    parts.append(h2("Still waiting for a reply (over 48 hours)"))
    parts.append(
        data_table(
            ["Received", "Name", "Session", "Date"],
            [
                [
                    esc(fmt_ts(b.get("created_at"))),
                    f"{esc(b.get('name'))}<br>{_mailto(b.get('email'))}",
                    esc(b.get("session_type")),
                    esc(fmt_short_date(b.get("event_date"))),
                ]
                for b in needs_reply
            ],
            empty="Everyone has had a reply.",
        )
    )

    parts.append(h2(f"Unread messages ({unread_count})"))
    parts.append(
        data_table(
            ["Received", "From", "Message"],
            [
                [
                    esc(fmt_ts(m.get("created_at"))),
                    f"{esc(m.get('name'))}<br>{_mailto(m.get('email'))}",
                    (f"<strong style=\"font-weight:600;\">{esc(m.get('subject'))}</strong><br>" if m.get("subject") else "")
                    + esc(_truncate(m.get("message"))),
                ]
                for m in latest_messages
            ],
            empty="Inbox is clear.",
        )
    )
    if unread_count > len(latest_messages):
        parts.append(p(f"Showing the latest {len(latest_messages)} of {unread_count}.", muted=True, size=13))

    parts.append(h2("Confirmed sessions, next 14 days"))
    parts.append(
        data_table(
            ["Date", "Client", "Session", "Where", "Deposit"],
            [
                [
                    esc(fmt_short_date(b.get("event_date"))) + (f"<br>{esc(b.get('event_time'))}" if b.get("event_time") else ""),
                    f"{esc(b.get('name'))}" + (f"<br>{esc(b.get('phone'))}" if b.get("phone") else ""),
                    esc(b.get("session_type")),
                    esc(b.get("location")),
                    "Paid" if b.get("deposit_paid") else "Not yet",
                ]
                for b in upcoming
            ],
            empty="No confirmed sessions in the next two weeks.",
        )
    )

    parts.append(h2("Galleries closing in the next 7 days"))
    parts.append(
        data_table(
            ["Closes", "Gallery", "Client", "Warned"],
            [
                [
                    esc(fmt_ts(g.get("expires_at"))),
                    text_link(gallery_url(str(g["id"])), g.get("title") or "Untitled"),
                    f"{esc(g.get('client_name'))}<br>{_mailto(g.get('client_email'))}",
                    "Yes" if g.get("expiry_notice_sent_at") else "Not yet",
                ]
                for g in expiring
            ],
            empty="None.",
        )
    )

    parts.append(h2("Downloads, last 24 hours"))
    parts.append(
        data_table(
            ["Gallery", "Client", "Single", "Zip"],
            [
                [
                    esc(d.get("gallery_title") or "Unknown gallery"),
                    esc(d.get("client_email")),
                    esc(d.get("single", 0)),
                    esc(d.get("zip", 0)),
                ]
                for d in downloads
            ],
            empty="No downloads.",
        )
    )

    return subject, wrap("".join(parts), preheader=summary, footer_note="Sent automatically by the studio automation.")
