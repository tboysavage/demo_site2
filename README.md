# Baby Sonovue LTD — Clinic Ultrasound Scans (Demo)

Modern Next.js App Router site for Baby Sonovue with scan pages, booking flow, blood screening, and an internal admin portal.

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

- `src/app/` — App Router pages
- `src/components/` — Reusable UI components
- `src/content/clinicUltrasoundScans.ts` — Main editable clinic content and brand details
- `src/content/homeScans.ts` — Home-scan page content
- `src/content/bloodScreening.ts` — Blood-screening page content
- `src/lib/` — Booking, admin, Stripe, and database helpers
- `public/` — Local assets used with `next/image`

## Content updates

Most marketing copy, package labels, FAQs, and brand details live in:

- `src/content/clinicUltrasoundScans.ts`
- `src/content/homeScans.ts`
- `src/content/bloodScreening.ts`

## Booking and payments

The booking flow uses:

- `POST /api/bookings` — creates a booking record in the hosted database
- `POST /api/stripe/webhook` — updates payment state from Stripe events
- Stripe Checkout for test or live deposits

Required environment variables:

- `DATABASE_URL`
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
- `ADMIN_USERNAME` (used only to bootstrap the first admin user if none exists yet)
- `ADMIN_PASSWORD` (used only to bootstrap the first admin user if none exists yet)

Copy `.env.example` to `.env.local` before local testing.

The general contact form submits to:

- `POST /api/contact`

## Admin portal

The app includes an internal admin portal at:

- `/admin`

Features:

- patient contact messages stored in the hosted database
- booking and deposit status view
- appointment calendar by month
- upcoming appointments list with a patient detail panel
- all-appointments history for the doctor
- payment settings for deposit amount

The admin portal now uses hashed passwords stored in the database plus revocable session records.
For a fresh environment, `ADMIN_USERNAME` and `ADMIN_PASSWORD` create the first admin account on
first use.

## Booking email notifications

The app can send:

- a booking-request email when the patient submits the booking and is sent to Stripe Checkout
- a payment-confirmed email when Stripe confirms the deposit payment

This uses SMTP. Configure:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `BOOKING_NOTIFICATION_EMAIL`

If SMTP is missing, bookings still work, but email notifications will not send.

## Deployment

For Vercel deployment:

- use a hosted Postgres database and set `DATABASE_URL`
- keep Stripe in test mode for demo deployments if needed
- configure all environment variables in the Vercel project settings
- set `STRIPE_SECRET_KEY` and create a Stripe webhook endpoint for `/api/stripe/webhook`
- copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`
- set `ADMIN_USERNAME` and `ADMIN_PASSWORD` so the first admin user can be bootstrapped
- set SMTP variables if you want booking and customer emails to send
- set your canonical base URL in `src/content/clinicUltrasoundScans.ts` before going live
- point Stripe webhooks at `/api/stripe/webhook` on the deployed domain
- expect the package-driven public pages to render dynamically so admin package edits appear without a redeploy

This project no longer relies on local SQLite, so it is compatible with a hosted Vercel-style deployment once `DATABASE_URL` is configured.
