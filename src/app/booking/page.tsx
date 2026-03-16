import type { Metadata } from "next";
import BookingWizard from "@/components/BookingWizard";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

const { brand, site, ui } = clinicUltrasoundScansContent;

export const metadata: Metadata = {
  title: "Book a Scan",
  description:
    "Request a clinic or home scan appointment with package selection, pregnancy details, and preferred appointment timing.",
  alternates: {
    canonical: `${site.canonicalBaseUrl}/booking`,
  },
};

export default function BookingPage() {
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                {ui.labels.booking}
              </p>
              <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">Book your scan</h1>
              <p className="text-sm text-muted sm:text-base">
                Choose the scan package, add pregnancy details, request your preferred appointment,
                and then continue to Stripe to pay the booking deposit.
              </p>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">How this booking flow works</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  <span>Select the clinic or home scan package you want.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  <span>Enter the pregnancy timing details so the package window can be checked.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  <span>Request a preferred location, date, and time. The team confirms the final slot.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  <span>Pay the booking deposit securely in Stripe once the request details are complete.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Need help before booking?</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>{brand.name}</p>
                <p>{brand.address}</p>
                <p>{brand.phone}</p>
                <p>{brand.email}</p>
              </div>
              <p className="mt-4 text-xs text-muted">
                We usually confirm booking requests within 24 hours.
              </p>
            </div>
          </div>

          <BookingWizard />
        </div>
      </section>
    </div>
  );
}
