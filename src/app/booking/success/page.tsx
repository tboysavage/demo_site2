import Link from "next/link";
import { getBookingByReference } from "@/lib/booking-db";
import { formatCurrencyFromPence } from "@/lib/booking-config";
import { getCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  searchParams: Promise<{
    reference?: string;
    session_id?: string;
  }>;
};

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const { reference, session_id: sessionId } = await searchParams;
  const booking = reference ? await getBookingByReference(reference) : null;
  const sessionMatches = Boolean(
    booking && sessionId && booking.stripeCheckoutSessionId === sessionId,
  );

  let stripePaymentLooksPaid = false;
  if (booking && sessionId && sessionMatches && booking.paymentStatus !== "paid") {
    try {
      const session = await getCheckoutSession(sessionId);
      stripePaymentLooksPaid = session.payment_status === "paid";
    } catch {
      stripePaymentLooksPaid = false;
    }
  }

  const depositConfirmed = Boolean(
    booking && booking.paymentStatus === "paid" && (!sessionId || sessionMatches),
  );
  const depositSyncing = Boolean(
    booking && sessionMatches && !depositConfirmed && stripePaymentLooksPaid,
  );

  const eyebrow = depositConfirmed
    ? "Deposit received"
    : depositSyncing
      ? "Payment received"
      : "Payment status pending";
  const title = depositConfirmed
    ? "Booking request submitted"
    : depositSyncing
      ? "Finalising your booking"
      : "We are checking your payment";
  const intro = depositConfirmed
    ? "Your deposit has been taken and the booking request is now stored in the system. Only the deposit was charged in Stripe today. The team will confirm the appointment slot by phone or email."
    : depositSyncing
      ? "Stripe shows the deposit as paid, but the booking record is still being updated. The team will confirm the appointment slot by phone or email once the payment sync completes."
      : "We have not confirmed a paid deposit for this booking yet. If you completed checkout very recently, wait a moment and refresh this page. If not, contact the clinic team before paying again.";

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base text-muted">{intro}</p>

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
                  {depositConfirmed
                    ? `${formatCurrencyFromPence(booking.depositAmountPence, booking.depositCurrency)} paid`
                    : depositSyncing
                      ? "Paid in Stripe, syncing booking record"
                      : "Awaiting payment confirmation"}
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
