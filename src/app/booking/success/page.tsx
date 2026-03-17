import Link from "next/link";
import { getBookingByReference } from "@/lib/booking-db";
import { formatCurrencyFromPence } from "@/lib/booking-config";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const { reference } = await searchParams;
  const booking = reference ? await getBookingByReference(reference) : null;

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Deposit received
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900 sm:text-5xl">
            Booking request submitted
          </h1>
          <p className="mt-4 text-base text-muted">
            Your deposit has been taken and the booking request is now stored in the system. The
            team will confirm the appointment slot by phone or email.
          </p>

          {booking ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-[var(--accent-soft)] p-5">
                <p className="text-sm font-semibold text-slate-900">Booking reference</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{booking.reference}</p>
                <p className="mt-3 text-sm text-slate-700">{booking.packageTitle}</p>
                <p className="text-sm text-slate-700">{booking.locationLabel}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">Deposit status</p>
                <p className="mt-2 text-lg font-semibold text-[var(--accent-strong)]">
                  {formatCurrencyFromPence(booking.depositAmountPence, booking.depositCurrency)} paid
                </p>
                <p className="mt-3 text-sm text-slate-700">Preferred date: {booking.appointmentDate}</p>
                <p className="text-sm text-slate-700">Preferred time: {booking.appointmentTime}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
            >
              Return home
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
