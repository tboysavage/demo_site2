# Baby Sonovue LTD — Clinic Ultrasound Scans (Demo)

Modern Next.js 14+ App Router demo that recreates and upgrades the “Clinic Ultrasound Scans – Baby Sonovue LTD” page with improved UX, performance, and SEO.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the site.

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Production build
- `npm run start` — Run the production build
- `npm run lint` — Lint the project

## Project structure

- `src/app/` — App Router pages (`/`, `/services/clinic-ultrasound-scans`, `/contact`)
- `src/components/` — Reusable UI components
- `src/content/clinicUltrasoundScans.ts` — **All editable content** and brand details
- `public/` — Local placeholder assets used with `next/image`

## Updating content

All copy, pricing, packages, and brand details live in:

- `src/content/clinicUltrasoundScans.ts`

Update this file to edit the hero text, packages, FAQs, contact info, or canonical base URL.

## Booking and payments

The scan booking flow now uses:

- `POST /api/bookings` — creates a persisted booking record
- `POST /api/stripe/webhook` — updates payment state from Stripe events
- `data/bookings.sqlite` — local SQLite database file

Environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BOOKING_DEPOSIT_AMOUNT_PENCE` (defaults to `2500`)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `BOOKING_NOTIFICATION_EMAIL` (defaults to the brand email in content)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Copy `.env.example` to `.env.local` before testing Stripe locally.

The general contact form still submits to:

- `POST /api/contact`

## Admin portal

The app now includes an internal admin portal at:

- `/admin`

Features:

- patient contact messages stored in SQLite
- booking and deposit status view
- appointment calendar by month
- upcoming appointments list with a patient detail panel
- all-appointments history for the doctor

## Booking email notifications

When Stripe confirms a paid booking, the app now sends a notification email with the patient and
appointment details.

This uses SMTP. Configure:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `BOOKING_NOTIFICATION_EMAIL`

The notification is sent after a successful paid booking event, not when a draft booking request is
first created.

Admin access uses env-based credentials and an HTTP-only session cookie. Set:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

before using `/admin/login`.

## Deployment

Deploy on a Node.js platform that supports `node:sqlite` and persistent disk storage, or replace the SQLite layer with a hosted database before going live. Set your canonical base URL in `src/content/clinicUltrasoundScans.ts` before going live.
