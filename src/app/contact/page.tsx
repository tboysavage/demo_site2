import BookingForm from "@/components/BookingForm";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

const { contactPage, booking, brand, ui } = clinicUltrasoundScansContent;

export default function ContactPage() {
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                {ui.labels.contact}
              </p>
              <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
                {contactPage.title}
              </h1>
              <p className="text-sm text-muted">{contactPage.subtitle}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Baby Sonovue LTD</p>
              <p className="mt-2">{brand.address}</p>
              <p>{brand.phone}</p>
              <p>{brand.email}</p>
              <p className="mt-4 text-xs text-muted">
                {ui.bookingNotes.confirmation}
              </p>
            </div>
          </div>
          <BookingForm submitLabel={booking.ctaLabel} />
        </div>
      </section>
    </div>
  );
}
