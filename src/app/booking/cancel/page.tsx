import Link from "next/link";
import { getBookingByReference } from "@/lib/booking-db";

type PageProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function BookingCancelPage({ searchParams }: PageProps) {
  const { reference } = await searchParams;
  const booking = reference ? await getBookingByReference(reference) : null;

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Deposit not completed
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900 sm:text-5xl">
            Payment was cancelled
          </h1>
          <p className="mt-4 text-base text-muted">
            Your booking request was not completed because the Stripe deposit checkout was cancelled.
            No appointment slot has been confirmed.
          </p>

          {booking ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-[var(--accent-soft)] p-5">
              <p className="text-sm font-semibold text-slate-900">Saved booking reference</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{booking.reference}</p>
              <p className="mt-3 text-sm text-slate-700">{booking.packageTitle}</p>
              <p className="text-sm text-slate-700">
                Preferred slot: {booking.appointmentDate} at {booking.appointmentTime}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
            >
              Start booking again
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Contact the team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
