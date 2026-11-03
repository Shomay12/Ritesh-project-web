# Ritesh Farswan &mdash; Photography Portfolio, Client Portal &amp; Studio Automation

A business-ready, dual-site web platform and Python automation suite designed for a professional documentary and portrait photographer.

> **Full Platform Audit & Engineering Report:** See [`STUDIO_AUDIT_REPORT.md`](STUDIO_AUDIT_REPORT.md) for the in-depth architectural breakdown, zero-AI-touch design forensics, optics simulation physics, and Supabase RLS security specs.

---

## 1. Architectural Overview

The repository is organized into five self-contained modules:

```
photographer-portfolio/
├── STUDIO_AUDIT_REPORT.md       # Comprehensive architectural & forensic audit report
├── website/                     # Public client-facing website + private client portal
│   ├── index.html               # Home (curated portfolio, lens simulator, film stocks, RAW vs graded)
│   ├── work.html                # Full archive (Masonry, Contact Sheet 35mm, Editorial Spread + Loupe)
│   ├── about.html               # Bio, philosophy, exhibitions, publication record, gear standards
│   ├── services.html            # Collections I, II, III, pricing, process, comprehensive FAQ
│   ├── booking.html             # Interactive availability calendar, multi-step booking inquiry
│   ├── contact.html             # Direct correspondence form & studio contact details
│   ├── client/                  # Client section (private gallery & downloads)
│   │   ├── index.html           # Client portal login (passwordless magic link / PIN access)
│   │   └── gallery.html         # Private gallery proofs, favorite selection, single & ZIP downloads
│   └── assets/                  # Shared styling, scripts, and local demo store
│       ├── css/main.css         # Refined editorial typography & responsive grid
│       └── js/                  # config.js, api.js, demo-store.js, creative-interactions.js, emails.js
│
├── studio/                      # Owner studio administration portal (second site)
│   ├── login.html               # Owner authentication (email/password via Supabase Auth)
│   ├── index.html               # Dashboard: metrics bar, recent enquiries, download logs
│   ├── bookings.html            # Manage enquiries, status transitions, quote amounts, notes
│   ├── galleries.html           # Create, publish, unpublish, and copy links for client galleries
│   ├── upload.html              # Web upload center: EXIF transpose, auto-resizing, direct storage upload
│   ├── portfolio.html           # Public portfolio curator (re-order, publish/hide, delete)
│   ├── messages.html            # Incoming contact enquiries manager
│   └── assets/css/studio.css    # Clean, distraction-free administration interface
│
├── supabase/
│   └── schema.sql               # Production PostgreSQL schema, Row Level Security, Storage buckets
│
├── automation/                  # Python background automation suite
│   ├── common.py                # Supabase client, EmailJS REST sender, logging, timezone utilities
│   ├── emails.py                # Zero-emoji transactional email templates (reminders, digests, alerts)
│   ├── reminders.py             # Pre-session reminder & post-session follow-up jobs
│   ├── gallery_expiry.py        # Client gallery expiration warning & auto-archiving job
│   ├── daily_digest.py          # Daily morning executive summary email for the studio owner
│   ├── bulk_upload.py           # Multi-threaded CLI tool to process & upload folders of high-res photos
│   ├── backup.py                # Nightly database backup to JSON and CSV with 30-day retention
│   ├── scheduler.py             # Master scheduler daemon or one-shot runner (--once, --skip, --job)
│   ├── requirements.txt         # supabase, python-dotenv, Pillow, requests, schedule
│   └── .env.example             # Complete environment configuration template
│
└── .github/workflows/
    └── studio-automation.yml    # GitHub Actions workflow running daily at 09:00 IST (03:30 UTC)
```

---

## 2. Design Philosophy: Eliminating the "AI Touch"

Modern AI-generated websites often share tell-tale patterns that erode credibility:
- Neon gradient overlays and glowing purple/cyan accents
- Floating icon cards arranged in repetitive 3&times;3 grids
- Decorative emojis in headers and lists
- Pulsating colored status dots
- Empty marketing jargon ("Unleashing bespoke synergy...")
- Laggy custom cursor followers that stutter and block native browser interaction

This site was engineered to look like a **genuine fine-art photography monograph** (inspired by Aperture, Steidl, and vintage Leica archives):
- **Warm Archival Palette**: Natural linen and paper tones (`#f6f3ed`, `#ede8df`), deep carbon ink (`#161513`), and analog darkroom amber (`#12100e`, `#cf714c`).
- **Typography**: Editorial serif (*Cormorant Garamond*) paired with clean geometric grotesque (*Jost*) and technical stamp (*JetBrains Mono*).
- **Interactive Analog Instruments**:
  - **Procedural Mechanical Leaf Shutter Sound**: Real-time Web Audio API acoustic feedback (no MP3/WAV files).
  - **Darkroom Amber Safelight**: Live CSS variable toggle between daylight linen and darkroom red safelight.
  - **Film Emulsion Profiles**: Live switching between Kodak Portra 400, Kodak Tri-X 400, and Fujifilm Pro 400H.
  - **Optical Lens Simulator**: Interactive field-of-view and perspective demonstration (28mm, 50mm, 85mm).
  - **RAW vs Graded Slider**: Split-screen tonal comparison with EXIF readouts.
  - **Contact Sheet 35mm View**: Film sprockets, edge rebate stamps (`KODAK 400TX`), and grease-pencil editor selections (`SELECT`, `+ 1/2 STOP`).
- **Zero Laggy Custom Cursor**: Uses standard, high-precision native browser pointers throughout.
- **Authentic Voice**: Clear, personal first-person prose describing medium-format equipment, archival pigment printing, and documentary ethics.

---

## 3. Getting Started Immediately (Zero-Setup Demo Mode)

Both the public website and the studio portal work **straight out of the box** without configuring a database or email account first.

1. Open `website/index.html` in your web browser.
   - Explore the home page, portfolio filters, interactive booking calendar, and client portal.
2. In the Client Portal (`website/client/index.html`):
   - Enter `client@example.com` to immediately access the sample wedding gallery (*Riya &amp; Kunal*).
   - In `gallery.html`: heart favorite photos, copy the favorites list, and test the **"Download All (ZIP)"** button (generates a zip archive in the browser).
3. Open `studio/login.html`:
   - Click **"Sign In to Studio"** (password can be left blank in demo mode).
   - View recent bookings, create client galleries, test the upload center, and manage public portfolio items.

---

## 4. Production Supabase & EmailJS Setup

When you are ready to connect live cloud services:

### Step 1: Supabase Database & Storage
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor &rarr; New query**, paste the entire contents of `supabase/schema.sql`, and click **Run**.
   - This creates all tables (`bookings`, `messages`, `portfolio_items`, `galleries`, `gallery_photos`, `favorites`, `downloads`, `availability_blocks`, `profiles`).
   - Configures storage buckets (`portfolio` for public images, `client-galleries` for private proofs).
   - Enables Row Level Security (RLS) policies so clients can only view their own files.
3. Promote your email to the owner role in the SQL editor:
   ```sql
   update public.profiles set role = 'owner' where email = 'your-email@studio.com';
   ```

### Step 2: Configure Client Keys
Open `website/assets/js/config.js` and `studio/assets/js/config.js` and fill in:
```javascript
window.SITE_CONFIG = {
  supabaseUrl: 'https://xyzcompany.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...',
  emailjs: {
    publicKey: 'your_emailjs_public_key',
    serviceId: 'your_service_id',
    templateId: 'your_template_id'
  },
  owner: {
    name: 'Ritesh Farswan',
    email: 'photosritesh8@gmail.com',
    phone: '+91 98200 41736',
    city: 'Mumbai'
  }
};
```

---

## 5. Python Automation Suite

### Installation
```bash
cd automation
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Edit `automation/.env` with your Supabase service role key, EmailJS private credentials, and studio preferences.

### Running Automation Tasks

| Task | Command | Description |
|---|---|---|
| **Daily Reminders** | `python automation/reminders.py` | Sends reminders 3 days before shoot, thank-yous 21 days after, auto-completes past bookings |
| **Gallery Expiry** | `python automation/gallery_expiry.py` | Warns clients 7 days before gallery expires; archives expired collections |
| **Morning Digest** | `python automation/daily_digest.py` | Emails owner an executive summary of new bookings, unread messages, and downloads |
| **Bulk CLI Upload** | `python automation/bulk_upload.py --folder /path/to/photos --create --title "Anya & Rohan" --client-email anya@domain.com --publish --notify` | Auto-transposes EXIF, scales 2000px previews & 720px thumbs, uploads concurrently, emails client |
| **Database Backup** | `python automation/backup.py --keep 30` | Exports all database tables to JSON & CSV files, retaining the last 30 backups |
| **Continuous Scheduler** | `python automation/scheduler.py` | Runs the master daemon according to studio timezone (02:30 Backup, 08:00 Digest, 09:00 Reminders) |
| **One-Shot Run** | `python automation/scheduler.py --once` | Runs all daily tasks once and terminates (ideal for Linux cron or CI/CD) |

### Automated GitHub Actions
A workflow is already included in `.github/workflows/studio-automation.yml`. Add your credentials as GitHub repository secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, `OWNER_EMAIL`). It runs automatically every day at **09:00 IST (03:30 UTC)**.

---

## 6. One-Click Dual-Site Deployment (GitHub Pages)

A continuous deployment workflow is included in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that bundles and publishes both sites in parallel:
- **Public Client Website**: `https://<username>.github.io/<repo>/`
- **Private Client Portal**: `https://<username>.github.io/<repo>/client/`
- **Studio Administration Portal**: `https://<username>.github.io/<repo>/studio/`

### Enabling GitHub Pages Deployment
1. In your GitHub repository, navigate to **Settings &rarr; Pages**.
2. Under **Build and deployment &rarr; Source**, select **GitHub Actions**.
3. Every commit pushed to `main` (or triggered via **Actions &rarr; Deploy Website & Studio**) will automatically assemble and publish both sites live.


