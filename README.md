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

## Contact form

The booking/contact form submits to:

- `POST /api/contact`

The API route logs the submission to the console and returns `{ ok: true }`.

## Deployment

Deploy on any Node.js-compatible platform (Vercel recommended). Set your canonical base URL in `src/content/clinicUltrasoundScans.ts` before going live.
