import AdminUpcomingAppointments from "@/components/AdminUpcomingAppointments";
import AdminCalendar from "@/components/AdminCalendar";
import { getAdminMetrics, listAdminBookings, listContactMessages } from "@/lib/admin-data";
import {
  adminDateFormatter,
  adminDateTimeFormatter,
  formatPregnancySummary,
  formatServiceLabel,
  formatStatusLabel,
  getStatusBadgeClass,
} from "@/lib/admin-format";
import { formatCurrencyFromPence } from "@/lib/booking-config";
import { getPaymentSettings } from "@/lib/payment-settings";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    month?: string;
    settings?: string;
  }>;
};

function parseMonthParam(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return new Date();
  }

  const [yearText, monthText] = value.split("-");
  const year = Number.parseInt(yearText, 10);
  const monthIndex = Number.parseInt(monthText, 10) - 1;

  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return new Date();
  }

  return new Date(year, monthIndex, 1);
}

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getSettingsNotice(status: string | undefined) {
  if (status === "payment-saved") {
    return {
      kind: "success" as const,
      message: "Payment settings updated. New bookings will use the new deposit amount.",
    };
  }

  if (status === "payment-error") {
    return {
      kind: "error" as const,
      message: "The deposit amount was not valid. Enter a positive amount in pounds.",
    };
  }

  return null;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const { month, settings } = await searchParams;
  const displayMonth = parseMonthParam(month);
  const monthStart = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
  const monthEnd = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0);
  const today = new Date().toISOString().slice(0, 10);

  const metrics = await getAdminMetrics();
  const monthBookings = await listAdminBookings({
    limit: 500,
    fromDate: toDateOnly(monthStart),
    toDate: toDateOnly(monthEnd),
    sortDirection: "asc",
  });
  const upcomingBookings = await listAdminBookings({
    limit: 40,
    fromDate: today,
    sortDirection: "asc",
  });
  const allAppointments = await listAdminBookings({
    limit: 500,
    sortDirection: "desc",
  });
  const contactMessages = await listContactMessages(100);
  const paymentSettings = await getPaymentSettings();
  const settingsNotice = getSettingsNotice(settings);

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Admin
            </p>
            <p className="text-sm text-muted">
              Appointments, messages, and patient details in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[
              ["#calendar", "Calendar"],
              ["#payments", "Payment settings"],
              ["#bookings", "Upcoming appointments"],
              ["#all-appointments", "All appointments"],
              ["#messages", "Messages"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full bg-[var(--baby-blue)] px-4 py-2 text-sm font-semibold text-slate-800"
              >
                {label}
              </a>
            ))}
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Total bookings", value: metrics.totalBookings },
            { label: "Upcoming appointments", value: metrics.upcomingAppointments },
            { label: "Today appointments", value: metrics.todayAppointments },
            { label: "Paid deposits", value: metrics.paidDeposits },
            { label: "Total messages", value: metrics.totalMessages },
            { label: "New messages", value: metrics.newMessages },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-600">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="payments" className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Payment settings
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">Deposits and Stripe</h2>
          <p className="mt-3 text-sm text-muted">
            The doctor can safely change the booking deposit amount here. Stripe secret keys remain
            server-side and are shown only as connection status.
          </p>

          {settingsNotice ? (
            <div
              className={`mt-6 rounded-3xl p-4 text-sm font-semibold ${
                settingsNotice.kind === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {settingsNotice.message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form
              action="/api/admin/payment-settings"
              method="post"
              className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
            >
              <p className="text-sm font-semibold text-slate-900">Booking deposit amount</p>
              <p className="mt-2 text-sm text-slate-600">
                This is the amount taken in Stripe before the appointment is confirmed.
              </p>
              <label className="mt-5 block space-y-2 text-sm font-semibold text-slate-700">
                Deposit amount in pounds
                <input
                  type="number"
                  name="depositAmountGBP"
                  min="0.01"
                  step="0.01"
                  defaultValue={(paymentSettings.depositAmountPence / 100).toFixed(2)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <p className="mt-3 text-sm text-slate-600">
                Current deposit:{" "}
                <span className="font-semibold text-slate-900">
                  {paymentSettings.depositAmountLabel}
                </span>
              </p>
              <button
                type="submit"
                className="mt-5 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
              >
                Save payment settings
              </button>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <p className="text-sm font-semibold text-slate-900">Stripe connection</p>
              <p className="mt-2 text-sm text-slate-600">
                These are shown as status only. Secret keys are intentionally not editable from the
                browser.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: "Publishable key",
                    value: paymentSettings.stripe.publishableKey.maskedValue,
                    configured: paymentSettings.stripe.publishableKey.configured,
                  },
                  {
                    label: "Secret key",
                    value: paymentSettings.stripe.secretKey.maskedValue,
                    configured: paymentSettings.stripe.secretKey.configured,
                  },
                  {
                    label: "Webhook secret",
                    value: paymentSettings.stripe.webhookSecret.maskedValue,
                    configured: paymentSettings.stripe.webhookSecret.configured,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                    <p
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.configured
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.configured ? "Configured" : "Missing"}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600">
                If Stripe keys ever need replacing, they should be updated in the secure server
                environment rather than through the admin portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="calendar" className="mx-auto max-w-6xl px-4 py-16">
        <AdminCalendar monthDate={displayMonth} appointments={monthBookings} />
      </section>

      <section id="bookings" className="mx-auto max-w-6xl px-4 py-4">
        <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Upcoming appointments
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">Next bookings</h2>
          <p className="mt-3 text-sm text-muted">
            Clear patient and appointment details for the next confirmed or requested bookings.
          </p>
          <AdminUpcomingAppointments appointments={upcomingBookings} />
        </div>
      </section>

      <section id="all-appointments" className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            All appointments
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">Appointment history</h2>
          <p className="mt-3 text-sm text-muted">
            Every stored booking in one table, with the practical details a clinician actually
            needs.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-3 py-3 font-semibold">Appointment</th>
                  <th className="px-3 py-3 font-semibold">Patient</th>
                  <th className="px-3 py-3 font-semibold">Contact</th>
                  <th className="px-3 py-3 font-semibold">Package</th>
                  <th className="px-3 py-3 font-semibold">Clinical details</th>
                  <th className="px-3 py-3 font-semibold">Statuses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAppointments.length ? (
                  allAppointments.map((booking) => (
                    <tr key={booking.reference} className="align-top">
                      <td className="px-3 py-4">
                        <p className="font-semibold text-slate-900">
                          {adminDateFormatter.format(new Date(`${booking.appointmentDate}T00:00:00`))}
                        </p>
                        <p className="mt-1 text-slate-700">{booking.appointmentTime}</p>
                        <p className="text-slate-500">{booking.locationLabel}</p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-slate-900">
                          {booking.customerFirstName} {booking.customerLastName}
                        </p>
                        <p className="mt-1 text-slate-600">{booking.reference}</p>
                        <p className="text-slate-500">
                          DOB {adminDateFormatter.format(new Date(`${booking.customerDateOfBirth}T00:00:00`))}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-slate-700">{booking.customerPhone}</p>
                        <p className="mt-1 text-slate-700">{booking.customerEmail}</p>
                        <p className="mt-1 text-slate-500">
                          {booking.customerAddressLine1}, {booking.customerTownOrCity}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-slate-900">{booking.packageTitle}</p>
                        <p className="mt-1 text-slate-700">{formatServiceLabel(booking.service)}</p>
                        <p className="text-slate-500">{booking.packageGroupTitle}</p>
                        {booking.packagePriceLabel ? (
                          <p className="mt-1 text-slate-500">{booking.packagePriceLabel}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-slate-700">{formatPregnancySummary(booking)}</p>
                        {booking.customerNotes ? (
                          <p className="mt-2 text-slate-500">Notes: {booking.customerNotes}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(booking.bookingStatus)}`}
                          >
                            {formatStatusLabel(booking.bookingStatus)}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(booking.paymentStatus)}`}
                          >
                            {formatStatusLabel(booking.paymentStatus)}
                          </span>
                        </div>
                        <p className="mt-3 text-slate-600">
                          {formatCurrencyFromPence(
                            booking.depositAmountPence,
                            booking.depositCurrency,
                          )}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Requested {adminDateTimeFormatter.format(new Date(booking.createdAt))}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                      No appointments found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="messages" className="mx-auto max-w-6xl px-4 py-4">
        <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Messages
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">Patient contact messages</h2>
          <p className="mt-3 text-sm text-muted">
            Messages from the contact form, shown with the basic patient details needed for follow
            up.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {contactMessages.length ? (
              contactMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{message.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{message.phone}</p>
                      <p className="text-sm text-slate-600">{message.email}</p>
                    </div>
                    <span className="rounded-full bg-[var(--baby-blue)] px-3 py-1 text-xs font-semibold text-slate-800">
                      {formatStatusLabel(message.status)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">Preferred date:</span>{" "}
                      {message.preferredDate}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Submitted:</span>{" "}
                      {adminDateTimeFormatter.format(new Date(message.createdAt))}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Message:</span>{" "}
                      {message.message || "No message left."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No patient messages have been submitted yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
