import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

const { brand, site, ui } = clinicUltrasoundScansContent;
const mapQuery = encodeURIComponent(brand.address);

export const metadata: Metadata = {
  title: "Our Salisbury Clinic",
  description: `Visit ${brand.name} at ${brand.address}. View the clinic location, official address, and contact details.`,
  alternates: {
    canonical: `${site.canonicalBaseUrl}/clinic`,
  },
  openGraph: {
    title: `Our Salisbury Clinic | ${brand.name}`,
    description: `Find ${brand.name} at ${brand.address}.`,
    url: `${site.canonicalBaseUrl}/clinic`,
  },
};

export default function ClinicPage() {
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeading
              eyebrow={ui.labels.contact}
              title="Our Salisbury Clinic"
              description="Use the map below to find the clinic and check the official address before travelling."
            />

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Official address
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p className="text-lg font-semibold text-slate-900">{brand.name}</p>
                <p>{brand.address}</p>
                <p>{brand.postalCode}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${brand.phone}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  Call: {brand.phone}
                </a>
                <a
                  href={`mailto:${brand.email}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  Email: {brand.email}
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
                >
                  Open in Google Maps
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border-2 border-solid border-[var(--baby-blue)] bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <p className="text-sm font-semibold text-slate-900">Clinic map</p>
              <p className="mt-1 text-sm text-muted">{brand.address}</p>
            </div>
            <div className="relative aspect-[4/3] min-h-[420px] w-full">
              <iframe
                title="Baby Sonovue Salisbury clinic map"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
