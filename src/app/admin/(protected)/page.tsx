import Link from "next/link";
import AdminUpcomingAppointments from "@/components/AdminUpcomingAppointments";
import AdminCalendar from "@/components/AdminCalendar";
import {
  ACTIONABLE_BOOKING_STATUSES,
  ACTIONABLE_PAYMENT_STATUSES,
  REQUEST_BOOKING_STATUSES,
  countAdminBookings,
  countContactMessages,
  getAdminMetrics,
  listAdminBookings,
  listAdminUsers,
  listContactMessages,
  listRecentAdminActivity,
} from "@/lib/admin-data";
import { getAdminSession, MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/admin-auth";
import {
  adminDateFormatter,
  adminDateTimeFormatter,
  formatContactPreference,
  formatServiceLabel,
  formatStatusLabel,
  getStatusBadgeClass,
} from "@/lib/admin-format";
import { formatCurrencyFromPence } from "@/lib/booking-config";
import {
  MAX_BOOKING_DEPOSIT_AMOUNT_PENCE,
  MIN_BOOKING_DEPOSIT_AMOUNT_PENCE,
  getPaymentSettings,
} from "@/lib/payment-settings";
import { listManagedPackageGroups, listManagedPackages } from "@/lib/package-catalog";
import { getClinicTodayDate } from "@/lib/clinic-time";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APPOINTMENTS_PAGE_SIZE = 20;
const MESSAGES_PAGE_SIZE = 12;

const adminTabOptions = ["dashboard", "appointments", "messages", "packages", "users", "settings"] as const;
const appointmentViewOptions = ["all", "actionable", "requests", "cancelled"] as const;
const serviceOptions = ["all", "clinic", "home", "blood"] as const;
const messageStatusOptions = ["all", "new", "read", "archived"] as const;

type AdminTab = (typeof adminTabOptions)[number];
type AppointmentView = (typeof appointmentViewOptions)[number];

type PageProps = {
  searchParams: Promise<{
    tab?: string;
    month?: string;
    settings?: string;
    security?: string;
    booking?: string;
    messages?: string;
    packages?: string;
    users?: string;
    appointmentsPage?: string;
    appointmentView?: string;
    service?: string;
    bookingSearch?: string;
    messagesPage?: string;
    messageStatus?: string;
    messageSearch?: string;
  }>;
};

type Notice = {
  kind: "success" | "error";
  message: string;
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

function formatDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

function getEnumValue<T extends readonly string[]>(
  value: string | undefined,
  options: T,
  fallback: T[number],
): T[number] {
  return options.includes(value as T[number]) ? (value as T[number]) : fallback;
}

function buildAdminHref(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...params, ...overrides })) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return `/admin${query ? `?${query}` : ""}`;
}

function getAppointmentFilters(view: AppointmentView) {
  if (view === "actionable") {
    return {
      bookingStatuses: ACTIONABLE_BOOKING_STATUSES,
      paymentStatuses: ACTIONABLE_PAYMENT_STATUSES,
    } as const;
  }

  if (view === "requests") {
    return {
      bookingStatuses: REQUEST_BOOKING_STATUSES,
    } as const;
  }

  if (view === "cancelled") {
    return {
      bookingStatuses: ["cancelled"] as const,
    } as const;
  }

  return {};
}

function getSectionNoticeClasses(kind: Notice["kind"]) {
  return kind === "success"
    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border border-red-200 bg-red-50 text-red-700";
}

function getSettingsNotice(status: string | undefined): Notice | null {
  if (status === "payment-saved") {
    return {
      kind: "success",
      message: "Deposit settings updated. New bookings will use the new amount.",
    };
  }

  if (status === "payment-confirmation-required") {
    return {
      kind: "error",
      message: "Tick the confirmation box before changing the deposit amount.",
    };
  }

  if (status === "payment-out-of-range") {
    return {
      kind: "error",
      message: `Choose a deposit between ${formatCurrencyFromPence(MIN_BOOKING_DEPOSIT_AMOUNT_PENCE)} and ${formatCurrencyFromPence(MAX_BOOKING_DEPOSIT_AMOUNT_PENCE)}.`,
    };
  }

  if (status === "payment-error") {
    return {
      kind: "error",
      message: "Enter a valid deposit amount in pounds.",
    };
  }

  return null;
}

function getSecurityNotice(status: string | undefined): Notice | null {
  if (status === "password-saved") {
    return {
      kind: "success",
      message: "Password updated. Other active admin sessions were signed out.",
    };
  }

  if (status === "password-invalid-current") {
    return {
      kind: "error",
      message: "The current password did not match the admin account.",
    };
  }

  if (status === "password-mismatch") {
    return {
      kind: "error",
      message: "The new password confirmation did not match.",
    };
  }

  if (status === "password-too-short") {
    return {
      kind: "error",
      message: `Use at least ${MIN_ADMIN_PASSWORD_LENGTH} characters for the new password.`,
    };
  }

  if (status === "password-same") {
    return {
      kind: "error",
      message: "Choose a different password instead of reusing the current one.",
    };
  }

  return null;
}

function getBookingNotice(status: string | undefined): Notice | null {
  switch (status) {
    case "booking-confirmed":
      return { kind: "success", message: "Appointment confirmed." };
    case "booking-cancelled":
      return { kind: "success", message: "Booking cancelled." };
    case "booking-rescheduled":
      return { kind: "success", message: "Appointment changes saved." };
    case "booking-confirm-payment-required":
      return {
        kind: "error",
        message: "This booking cannot be confirmed until the deposit is marked as paid.",
      };
    case "booking-reschedule-date":
      return {
        kind: "error",
        message: "Choose a valid appointment date that is not in the past.",
      };
    case "booking-reschedule-slot":
      return {
        kind: "error",
        message: "Choose a valid location and time slot for that service.",
      };
    case "booking-missing":
    case "booking-action-invalid":
      return {
        kind: "error",
        message: "The booking action could not be completed. Refresh and try again.",
      };
    default:
      return null;
  }
}

function getMessageNotice(status: string | undefined): Notice | null {
  if (status === "message-saved") {
    return { kind: "success", message: "Message status updated." };
  }

  if (status === "message-invalid") {
    return { kind: "error", message: "That message action could not be completed." };
  }

  return null;
}

function getPackageNotice(status: string | undefined): Notice | null {
  switch (status) {
    case "package-created":
      return { kind: "success", message: "Package added." };
    case "package-updated":
      return { kind: "success", message: "Package changes saved." };
    case "package-deleted":
      return { kind: "success", message: "Package removed." };
    case "package-duplicate":
      return { kind: "error", message: "A package with that identifier already exists." };
    case "package-invalid":
      return { kind: "error", message: "Fill in the package title, group, and timing before saving." };
    case "package-error":
      return { kind: "error", message: "The package change could not be completed." };
    default:
      return null;
  }
}

function getUserNotice(status: string | undefined): Notice | null {
  switch (status) {
    case "user-created":
      return { kind: "success", message: "Admin user created." };
    case "user-reactivated":
      return { kind: "success", message: "Admin user reactivated." };
    case "user-deactivated":
      return { kind: "success", message: "Admin user deactivated." };
    case "user-invalid-username":
      return {
        kind: "error",
        message: "Use a valid email address or a simple username for the admin account.",
      };
    case "user-username-taken":
      return { kind: "error", message: "That admin username already exists." };
    case "user-password-too-short":
      return {
        kind: "error",
        message: `Use at least ${MIN_ADMIN_PASSWORD_LENGTH} characters for a new admin password.`,
      };
    case "user-cannot-disable-self":
      return { kind: "error", message: "You cannot deactivate the account you are using right now." };
    case "user-error":
      return { kind: "error", message: "The admin user change could not be completed." };
    default:
      return null;
  }
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "accent";
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p
        className={`mt-3 text-3xl font-semibold ${tone === "accent" ? "text-[var(--accent-strong)]" : "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionNotice({ notice }: { notice: Notice | null }) {
  if (!notice) {
    return null;
  }

  return (
    <div className={`mt-6 rounded-3xl p-4 text-sm font-semibold ${getSectionNoticeClasses(notice.kind)}`}>
      {notice.message}
    </div>
  );
}

function formatPricingOptionLines(
  pricingOptions: readonly { label: string; price: string }[] | undefined,
) {
  return (pricingOptions ?? []).map((option) => `${option.label} | ${option.price}`).join("\n");
}

function getPackagePriceSummary(packageItem: {
  priceLabel: string | null;
  pricingOptions: readonly { label: string; price: string }[];
}) {
  if (packageItem.priceLabel) {
    return packageItem.priceLabel;
  }

  if (packageItem.pricingOptions.length) {
    return `From ${packageItem.pricingOptions[0].price}`;
  }

  return "No price set";
}

function PaginationLinks({
  currentPage,
  totalPages,
  previousHref,
  nextHref,
}: {
  currentPage: number;
  totalPages: number;
  previousHref: string;
  nextHref: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {currentPage > 1 ? (
        <Link
          href={previousHref}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Previous page
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </p>
      {currentPage < totalPages ? (
        <Link
          href={nextHref}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Next page
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}

function getTabDescription(tab: AdminTab) {
  if (tab === "dashboard") {
    return "Today's summary and the latest admin activity.";
  }

  if (tab === "appointments") {
    return "Manage paid appointments, pending requests, and booking history.";
  }

  if (tab === "messages") {
    return "Review patient enquiries and track follow-up status.";
  }

  if (tab === "packages") {
    return "Add, remove, and update package pricing across clinic, home, and blood screening services.";
  }

  if (tab === "users") {
    return "Manage portal access for clinic staff.";
  }

  return "Adjust payment settings and keep the admin account secure.";
}

function getDefaultTab(params: {
  tab?: string;
  booking?: string;
  messages?: string;
  packages?: string;
  users?: string;
  settings?: string;
  security?: string;
  appointmentView?: string;
  service?: string;
  bookingSearch?: string;
  messageStatus?: string;
  messageSearch?: string;
}) {
  if (params.booking || params.appointmentView || params.service || params.bookingSearch) {
    return "appointments" as const;
  }

  if (params.messages || params.messageStatus || params.messageSearch) {
    return "messages" as const;
  }

  if (params.packages) {
    return "packages" as const;
  }

  if (params.users) {
    return "users" as const;
  }

  if (params.settings || params.security) {
    return "settings" as const;
  }

  return "dashboard" as const;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const {
    tab: tabParam,
    month,
    settings,
    security,
    booking,
    messages,
    packages,
    users,
    appointmentsPage: appointmentsPageParam,
    appointmentView: appointmentViewParam,
    service: serviceParam,
    bookingSearch: bookingSearchParam,
    messagesPage: messagesPageParam,
    messageStatus: messageStatusParam,
    messageSearch: messageSearchParam,
  } = params;

  const displayMonth = parseMonthParam(month);
  const monthStart = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
  const monthEnd = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0);
  const monthParam = `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, "0")}`;
  const appointmentsPage = parsePositiveInteger(appointmentsPageParam, 1);
  const messagesPage = parsePositiveInteger(messagesPageParam, 1);
  const appointmentView = getEnumValue(appointmentViewParam, appointmentViewOptions, "all");
  const serviceFilter = getEnumValue(serviceParam, serviceOptions, "all");
  const messageStatusFilter = getEnumValue(messageStatusParam, messageStatusOptions, "all");
  const bookingSearch = bookingSearchParam?.trim() ?? "";
  const messageSearch = messageSearchParam?.trim() ?? "";
  const selectedTab = getEnumValue(
    tabParam,
    adminTabOptions,
    getDefaultTab({
      tab: tabParam,
      booking,
      messages,
      packages,
      users,
      settings,
      security,
      appointmentView: appointmentViewParam,
      service: serviceParam,
      bookingSearch: bookingSearchParam,
      messageStatus: messageStatusParam,
      messageSearch: messageSearchParam,
    }),
  );

  const sharedParams = {
    tab: selectedTab,
    month: monthParam,
    appointmentView: appointmentView === "all" ? undefined : appointmentView,
    service: serviceFilter === "all" ? undefined : serviceFilter,
    bookingSearch: bookingSearch || undefined,
    messagesPage: messagesPage > 1 ? String(messagesPage) : undefined,
    messageStatus: messageStatusFilter === "all" ? undefined : messageStatusFilter,
    messageSearch: messageSearch || undefined,
    appointmentsPage: appointmentsPage > 1 ? String(appointmentsPage) : undefined,
  };

  const appointmentFilters = getAppointmentFilters(appointmentView);
  const appointmentServiceFilter = serviceFilter === "all" ? undefined : [serviceFilter];
  const appointmentQuery = {
    ...appointmentFilters,
    services: appointmentServiceFilter,
    search: bookingSearch || undefined,
  };
  const session = await getAdminSession();
  const metrics = await getAdminMetrics();
  const paymentSettings = await getPaymentSettings();
  const adminUsers = await listAdminUsers();
  const recentActivity = await listRecentAdminActivity(14);
  const managedPackageGroups = listManagedPackageGroups();
  const activeAdminCount = adminUsers.filter((user) => user.isActive).length;
  const clinicToday = getClinicTodayDate();

  const [
    monthBookings,
    upcomingAppointments,
    bookingRequests,
    allAppointments,
    allAppointmentsCount,
    contactMessages,
    contactMessagesCount,
    managedPackages,
  ] = await Promise.all([
    listAdminBookings({
      limit: 500,
      fromDate: formatDateOnly(monthStart),
      toDate: formatDateOnly(monthEnd),
      sortDirection: "asc",
      bookingStatuses: [...ACTIONABLE_BOOKING_STATUSES, ...REQUEST_BOOKING_STATUSES],
    }),
    listAdminBookings({
      limit: 40,
      fromDate: clinicToday,
      sortDirection: "asc",
      bookingStatuses: ACTIONABLE_BOOKING_STATUSES,
      paymentStatuses: ACTIONABLE_PAYMENT_STATUSES,
    }),
    listAdminBookings({
      limit: 40,
      fromDate: clinicToday,
      sortDirection: "asc",
      bookingStatuses: REQUEST_BOOKING_STATUSES,
    }),
    listAdminBookings({
      ...appointmentQuery,
      limit: APPOINTMENTS_PAGE_SIZE,
      offset: (appointmentsPage - 1) * APPOINTMENTS_PAGE_SIZE,
      sortDirection: appointmentView === "all" ? "desc" : "asc",
    }),
    countAdminBookings(appointmentQuery),
    listContactMessages({
      limit: MESSAGES_PAGE_SIZE,
      offset: (messagesPage - 1) * MESSAGES_PAGE_SIZE,
      statuses: messageStatusFilter === "all" ? undefined : [messageStatusFilter],
      search: messageSearch || undefined,
    }),
    countContactMessages({
      statuses: messageStatusFilter === "all" ? undefined : [messageStatusFilter],
      search: messageSearch || undefined,
    }),
    listManagedPackages(),
  ]);

  const settingsNotice = getSettingsNotice(settings);
  const securityNotice = getSecurityNotice(security);
  const bookingNotice = getBookingNotice(booking);
  const messageNotice = getMessageNotice(messages);
  const packageNotice = getPackageNotice(packages);
  const userNotice = getUserNotice(users);
  const appointmentsTotalPages = Math.max(1, Math.ceil(allAppointmentsCount / APPOINTMENTS_PAGE_SIZE));
  const messagesTotalPages = Math.max(1, Math.ceil(contactMessagesCount / MESSAGES_PAGE_SIZE));
  const managedPackagesByService = {
    clinic: managedPackages.filter((packageItem) => packageItem.service === "clinic"),
    home: managedPackages.filter((packageItem) => packageItem.service === "home"),
    blood: managedPackages.filter((packageItem) => packageItem.service === "blood"),
  };

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Admin
            </p>
            <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">Clinic portal</h1>
            <p className="text-sm text-muted">{getTabDescription(selectedTab)}</p>
            {session ? (
              <p className="text-sm text-slate-600">
                Signed in as <span className="font-semibold text-slate-900">{session.username}</span>
              </p>
            ) : null}
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
            >
              Log out
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            ["dashboard", "Dashboard"],
            ["appointments", "Appointments"],
            ["messages", "Messages"],
            ["packages", "Packages"],
            ["users", "Admin users"],
            ["settings", "Settings"],
          ].map(([tabValue, label]) => {
            const isActive = selectedTab === tabValue;
            return (
              <Link
                key={tabValue}
                href={buildAdminHref(sharedParams, { tab: tabValue })}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--accent-strong)] text-white"
                    : "bg-[var(--baby-blue)] text-slate-800"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </section>

      {selectedTab === "dashboard" ? (
        <>
          <section className="mx-auto max-w-6xl px-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total booking requests" value={metrics.totalRequests} />
              <MetricCard label="Awaiting deposit" value={metrics.pendingDepositRequests} />
              <MetricCard label="Awaiting confirmation" value={metrics.awaitingConfirmation} />
              <MetricCard label="Confirmed upcoming" value={metrics.confirmedUpcoming} />
              <MetricCard label="Today appointments" value={metrics.todayAppointments} />
              <MetricCard
                label="Deposits received"
                value={formatCurrencyFromPence(metrics.paidDepositAmountPence)}
                tone="accent"
              />
              <MetricCard label="New messages" value={metrics.newMessages} />
              <MetricCard label="Active admin users" value={activeAdminCount} />
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Recent activity
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Latest admin changes</h2>
              <p className="mt-3 text-sm text-muted">
                A short audit trail of booking actions, message updates, password changes, and admin access changes.
              </p>
              <div className="mt-6 space-y-3">
                {recentActivity.length ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{activity.message}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {activity.actorUsername ? `By ${activity.actorUsername}` : "System action"}
                          </p>
                        </div>
                        <p className="text-sm text-slate-500">
                          {adminDateTimeFormatter.format(new Date(activity.createdAt))}
                        </p>
                      </div>
                      {activity.details ? (
                        <p className="mt-3 text-sm text-slate-500">{activity.details}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No recent admin activity recorded yet.</p>
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {selectedTab === "appointments" ? (
        <>
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <AdminCalendar monthValue={monthParam} appointments={monthBookings} />
          </section>

          <section className="mx-auto max-w-6xl px-4 py-4">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Appointment actions
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Manage bookings</h2>
              <p className="mt-3 text-sm text-muted">
                Review paid appointments first, then handle requests that are still waiting on a deposit.
              </p>
              <SectionNotice notice={bookingNotice} />
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-4">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Upcoming appointments
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Next paid appointments</h2>
              <p className="mt-3 text-sm text-muted">
                Open an appointment to view patient details and manage confirmation, cancellation, or rescheduling.
              </p>
              <AdminUpcomingAppointments appointments={upcomingAppointments} mode="appointments" />
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Booking requests
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Requests still waiting on deposit</h2>
              <p className="mt-3 text-sm text-muted">
                These requests are not live appointments yet. They stay here until the deposit is completed or the request is cancelled.
              </p>
              <AdminUpcomingAppointments appointments={bookingRequests} mode="requests" />
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-4">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                    All appointments
                  </p>
                  <h2 className="mt-3 font-display text-3xl text-slate-900">Search the booking history</h2>
                  <p className="mt-3 text-sm text-muted">
                    Filter by service, queue type, or patient details without exposing every private field in the list view.
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {allAppointmentsCount} result{allAppointmentsCount === 1 ? "" : "s"}
                </p>
              </div>

              <form action="/admin" method="get" className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-[1.1fr_0.8fr_0.8fr_auto]">
                <input type="hidden" name="tab" value="appointments" />
                <input type="hidden" name="month" value={monthParam} />
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Search
                  <input
                    type="search"
                    name="bookingSearch"
                    defaultValue={bookingSearch}
                    placeholder="Patient, reference, email, phone, package"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  View
                  <select
                    name="appointmentView"
                    defaultValue={appointmentView}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="all">All bookings</option>
                    <option value="actionable">Paid appointments</option>
                    <option value="requests">Booking requests</option>
                    <option value="cancelled">Cancelled bookings</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Service
                  <select
                    name="service"
                    defaultValue={serviceFilter}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="all">All services</option>
                    <option value="clinic">Clinic scans</option>
                    <option value="home">Home scans</option>
                    <option value="blood">Blood screening</option>
                  </select>
                </label>
                <div className="flex items-end gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Apply filters
                  </button>
                  <Link
                    href={buildAdminHref(sharedParams, {
                      tab: "appointments",
                      appointmentView: undefined,
                      service: undefined,
                      bookingSearch: undefined,
                      appointmentsPage: undefined,
                    })}
                    className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    Clear
                  </Link>
                </div>
              </form>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="px-3 py-3 font-semibold">Appointment</th>
                      <th className="px-3 py-3 font-semibold">Patient</th>
                      <th className="px-3 py-3 font-semibold">Contact</th>
                      <th className="px-3 py-3 font-semibold">Package</th>
                      <th className="px-3 py-3 font-semibold">Statuses</th>
                      <th className="px-3 py-3 font-semibold">Requested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allAppointments.length ? (
                      allAppointments.map((bookingItem) => (
                        <tr key={bookingItem.reference} className="align-top">
                          <td className="px-3 py-4">
                            <p className="font-semibold text-slate-900">
                              {adminDateFormatter.format(new Date(`${bookingItem.appointmentDate}T00:00:00`))}
                            </p>
                            <p className="mt-1 text-slate-700">{bookingItem.appointmentTime}</p>
                            <p className="text-slate-500">{bookingItem.locationLabel}</p>
                          </td>
                          <td className="px-3 py-4">
                            <p className="font-semibold text-slate-900">
                              {bookingItem.customerFirstName} {bookingItem.customerLastName}
                            </p>
                            <p className="mt-1 text-slate-600">{bookingItem.reference}</p>
                          </td>
                          <td className="px-3 py-4">
                            <p className="text-slate-700">{bookingItem.customerPhone}</p>
                            <p className="mt-1 text-slate-700">{bookingItem.customerEmail}</p>
                          </td>
                          <td className="px-3 py-4">
                            <p className="font-semibold text-slate-900">{bookingItem.packageTitle}</p>
                            <p className="mt-1 text-slate-700">{formatServiceLabel(bookingItem.service)}</p>
                            <p className="text-slate-500">{bookingItem.packageGroupTitle}</p>
                            {bookingItem.packagePriceLabel ? (
                              <p className="mt-1 text-slate-500">{bookingItem.packagePriceLabel}</p>
                            ) : null}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex flex-wrap gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(bookingItem.bookingStatus)}`}>
                                {formatStatusLabel(bookingItem.bookingStatus)}
                              </span>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(bookingItem.paymentStatus)}`}>
                                {formatStatusLabel(bookingItem.paymentStatus)}
                              </span>
                            </div>
                            <p className="mt-3 text-slate-600">
                              {formatCurrencyFromPence(bookingItem.depositAmountPence, bookingItem.depositCurrency)}
                            </p>
                          </td>
                          <td className="px-3 py-4 text-slate-600">
                            {adminDateTimeFormatter.format(new Date(bookingItem.createdAt))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                          No bookings matched these filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <PaginationLinks
                currentPage={appointmentsPage}
                totalPages={appointmentsTotalPages}
                previousHref={buildAdminHref(sharedParams, {
                  tab: "appointments",
                  appointmentsPage: String(appointmentsPage - 1),
                })}
                nextHref={buildAdminHref(sharedParams, {
                  tab: "appointments",
                  appointmentsPage: String(appointmentsPage + 1),
                })}
              />
            </div>
          </section>
        </>
      ) : null}

      {selectedTab === "messages" ? (
        <section className="mx-auto max-w-6xl px-4 py-4">
          <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                  Messages
                </p>
                <h2 className="mt-3 font-display text-3xl text-slate-900">Patient contact messages</h2>
                <p className="mt-3 text-sm text-muted">
                  Track whether a message is new, being handled, or archived after follow-up.
                </p>
              </div>
              <p className="text-sm text-slate-500">
                {contactMessagesCount} message{contactMessagesCount === 1 ? "" : "s"}
              </p>
            </div>

            <SectionNotice notice={messageNotice} />

            <form action="/admin" method="get" className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-[1.2fr_0.8fr_auto]">
              <input type="hidden" name="tab" value="messages" />
              <input type="hidden" name="month" value={monthParam} />
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Search
                <input
                  type="search"
                  name="messageSearch"
                  defaultValue={messageSearch}
                  placeholder="Patient, email, phone, or message"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Status
                <select
                  name="messageStatus"
                  defaultValue={messageStatusFilter}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="all">All messages</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Apply filters
                </button>
                <Link
                  href={buildAdminHref(sharedParams, {
                    tab: "messages",
                    messageStatus: undefined,
                    messageSearch: undefined,
                    messagesPage: undefined,
                  })}
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Clear
                </Link>
              </div>
            </form>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {contactMessages.length ? (
                contactMessages.map((messageItem) => (
                  <div
                    key={messageItem.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{messageItem.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{messageItem.phone}</p>
                        <p className="text-sm text-slate-600">{messageItem.email}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(messageItem.status)}`}>
                        {formatStatusLabel(messageItem.status)}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold text-slate-900">Preferred date:</span>{" "}
                        {formatContactPreference(messageItem.preferredDate)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Submitted:</span>{" "}
                        {adminDateTimeFormatter.format(new Date(messageItem.createdAt))}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Message:</span>{" "}
                        {messageItem.message || "No message left."}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {messageItem.status !== "read" ? (
                        <form action="/api/admin/messages" method="post">
                          <input type="hidden" name="id" value={messageItem.id} />
                          <input type="hidden" name="status" value="read" />
                          <button
                            type="submit"
                            className="rounded-full bg-[var(--baby-blue)] px-4 py-2 text-sm font-semibold text-slate-800"
                          >
                            Mark as read
                          </button>
                        </form>
                      ) : null}
                      {messageItem.status !== "new" ? (
                        <form action="/api/admin/messages" method="post">
                          <input type="hidden" name="id" value={messageItem.id} />
                          <input type="hidden" name="status" value="new" />
                          <button
                            type="submit"
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                          >
                            Mark as new
                          </button>
                        </form>
                      ) : null}
                      {messageItem.status !== "archived" ? (
                        <form action="/api/admin/messages" method="post">
                          <input type="hidden" name="id" value={messageItem.id} />
                          <input type="hidden" name="status" value="archived" />
                          <button
                            type="submit"
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                          >
                            Archive
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No patient messages matched these filters.</p>
              )}
            </div>

            <PaginationLinks
              currentPage={messagesPage}
              totalPages={messagesTotalPages}
              previousHref={buildAdminHref(sharedParams, {
                tab: "messages",
                messagesPage: String(messagesPage - 1),
              })}
              nextHref={buildAdminHref(sharedParams, {
                tab: "messages",
                messagesPage: String(messagesPage + 1),
              })}
            />
          </div>
        </section>
      ) : null}

      {selectedTab === "packages" ? (
        <>
          <section className="mx-auto max-w-6xl px-4 py-4">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Packages
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Manage package catalogue</h2>
              <p className="mt-3 text-sm text-muted">
                Add new packages, remove old ones, and update public pricing across clinic, home, and blood screening pages.
              </p>

              <SectionNotice notice={packageNotice} />

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <form
                  action="/api/admin/packages"
                  method="post"
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <input type="hidden" name="action" value="create" />
                  <p className="text-sm font-semibold text-slate-900">Add package</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Use one line per bullet or paragraph. For pricing options, write each line as
                    <span className="font-semibold text-slate-900"> Label | £Price</span>.
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Service
                      <select
                        name="service"
                        required
                        defaultValue="clinic"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      >
                        <option value="clinic">Clinic scans</option>
                        <option value="home">Home scans</option>
                        <option value="blood">Blood screening</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Group
                      <select
                        name="groupId"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      >
                        {managedPackageGroups.map((group) => (
                          <option key={`${group.service}:${group.groupId}`} value={group.groupId}>
                            {group.service === "clinic"
                              ? "Clinic"
                              : group.service === "home"
                                ? "Home"
                                : "Blood"}{" "}
                            · {group.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                      Package title
                      <input
                        type="text"
                        name="title"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Timing label
                      <input
                        type="text"
                        name="weeks"
                        required
                        placeholder="e.g. 16-40 weeks"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Main price label
                      <input
                        type="text"
                        name="priceLabel"
                        placeholder="e.g. £109 or From £125"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                      Summary or subtitle
                      <textarea
                        name="summary"
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                      Description paragraphs
                      <textarea
                        name="descriptionLines"
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                      Bullet points / included items
                      <textarea
                        name="includesLines"
                        rows={5}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                      Extra measurements or outputs
                      <textarea
                        name="providesLines"
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                      Notes
                      <textarea
                        name="notesLines"
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                      Secondary description
                      <textarea
                        name="descriptionSecondary"
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                      Pricing options
                      <textarea
                        name="pricingOptionLines"
                        rows={4}
                        placeholder={"Anatomy scan | £139\nAnatomy plus Gender | £149"}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="mt-5 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
                  >
                    Add package
                  </button>
                </form>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                  <p className="text-sm font-semibold text-slate-900">What changes here</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>Changes apply to the public service pages and to the booking wizard package list.</p>
                    <p>Existing package links keep working because seeded packages keep their original IDs even when you rename them.</p>
                    <p>If a package has several price choices, leave the main price blank and use pricing options instead.</p>
                    <p>The booking deposit is still managed separately in the Settings tab.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-4">
            <div className="space-y-6">
              {([
                ["clinic", "Clinic scan packages"],
                ["home", "Home scan packages"],
                ["blood", "Blood screening packages"],
              ] as const).map(([service, heading]) => (
                <div key={service} className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                    {heading}
                  </p>
                  <h2 className="mt-3 font-display text-3xl text-slate-900">Edit package details</h2>
                  <p className="mt-3 text-sm text-muted">
                    Open a package to update its name, public price, descriptive text, or remove it from the site.
                  </p>

                  <div className="mt-6 space-y-4">
                    {managedPackagesByService[service].length ? (
                      managedPackagesByService[service].map((packageItem) => (
                        <details
                          key={packageItem.packageId}
                          className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70"
                        >
                          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{packageItem.title}</p>
                              <p className="mt-1 text-sm text-slate-600">
                                {managedPackageGroups.find(
                                  (group) =>
                                    group.service === packageItem.service &&
                                    group.groupId === packageItem.groupId,
                                )?.title ?? packageItem.groupId}
                                {" · "}
                                {packageItem.weeks}
                              </p>
                            </div>
                            <span className="rounded-full bg-[var(--ink-strong)] px-3 py-1 text-xs font-semibold text-white">
                              {getPackagePriceSummary(packageItem)}
                            </span>
                          </summary>

                          <div className="border-t border-slate-200 bg-white p-5">
                            <form action="/api/admin/packages" method="post">
                              <input type="hidden" name="action" value="update" />
                              <input type="hidden" name="packageId" value={packageItem.packageId} />
                              <input type="hidden" name="service" value={packageItem.service} />

                              <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2 text-sm font-semibold text-slate-700">
                                  Service
                                  <input
                                    type="text"
                                    value={
                                      packageItem.service === "clinic"
                                        ? "Clinic scans"
                                        : packageItem.service === "home"
                                          ? "Home scans"
                                          : "Blood screening"
                                    }
                                    readOnly
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700">
                                  Group
                                  <select
                                    name="groupId"
                                    defaultValue={packageItem.groupId}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  >
                                    {managedPackageGroups
                                      .filter((group) => group.service === packageItem.service)
                                      .map((group) => (
                                        <option key={`${group.service}:${group.groupId}`} value={group.groupId}>
                                          {group.title}
                                        </option>
                                      ))}
                                  </select>
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                                  Package title
                                  <input
                                    type="text"
                                    name="title"
                                    required
                                    defaultValue={packageItem.title}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700">
                                  Timing label
                                  <input
                                    type="text"
                                    name="weeks"
                                    required
                                    defaultValue={packageItem.weeks}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700">
                                  Main price label
                                  <input
                                    type="text"
                                    name="priceLabel"
                                    defaultValue={packageItem.priceLabel ?? ""}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                                  Summary or subtitle
                                  <textarea
                                    name="summary"
                                    rows={3}
                                    defaultValue={packageItem.summary ?? ""}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                                  Description paragraphs
                                  <textarea
                                    name="descriptionLines"
                                    rows={4}
                                    defaultValue={packageItem.description.join("\n")}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                                  Bullet points / included items
                                  <textarea
                                    name="includesLines"
                                    rows={5}
                                    defaultValue={packageItem.includes.join("\n")}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                                  Extra measurements or outputs
                                  <textarea
                                    name="providesLines"
                                    rows={3}
                                    defaultValue={packageItem.provides.join("\n")}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                                  Notes
                                  <textarea
                                    name="notesLines"
                                    rows={3}
                                    defaultValue={packageItem.notes.join("\n")}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                                  Secondary description
                                  <textarea
                                    name="descriptionSecondary"
                                    rows={3}
                                    defaultValue={packageItem.descriptionSecondary ?? ""}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                                <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
                                  Pricing options
                                  <textarea
                                    name="pricingOptionLines"
                                    rows={4}
                                    defaultValue={formatPricingOptionLines(packageItem.pricingOptions)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                  />
                                </label>
                              </div>

                              <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                  type="submit"
                                  className="rounded-full bg-[var(--accent-strong)] px-5 py-2.5 text-sm font-semibold text-white"
                                >
                                  Save package
                                </button>
                              </div>
                            </form>

                            <form action="/api/admin/packages" method="post" className="mt-4">
                              <input type="hidden" name="action" value="delete" />
                              <input type="hidden" name="packageId" value={packageItem.packageId} />
                              <button
                                type="submit"
                                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                              >
                                Remove package
                              </button>
                            </form>
                          </div>
                        </details>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No packages found for this service.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {selectedTab === "users" ? (
        <section className="mx-auto max-w-6xl px-4 py-4">
          <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Admin users
            </p>
            <h2 className="mt-3 font-display text-3xl text-slate-900">Manage portal access</h2>
            <p className="mt-3 text-sm text-muted">
              Give each staff member their own login so password changes and activity can be traced properly.
            </p>

            <SectionNotice notice={userNotice} />

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <form action="/api/admin/users" method="post" className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <input type="hidden" name="action" value="create" />
                <p className="text-sm font-semibold text-slate-900">Create admin user</p>
                <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-700">
                  Username or email
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-700">
                  Temporary password
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={MIN_ADMIN_PASSWORD_LENGTH}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  />
                </label>
                <p className="mt-3 text-sm text-slate-600">
                  Use at least {MIN_ADMIN_PASSWORD_LENGTH} characters. The new admin can change it after signing in.
                </p>
                <button
                  type="submit"
                  className="mt-5 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
                >
                  Create admin user
                </button>
              </form>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-sm font-semibold text-slate-900">Current admin users</p>
                <div className="mt-4 space-y-3">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="rounded-2xl bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{user.username}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            Added {adminDateFormatter.format(new Date(user.createdAt))}
                          </p>
                          <p className="text-sm text-slate-500">
                            {user.lastLoginAt
                              ? `Last signed in ${adminDateTimeFormatter.format(new Date(user.lastLoginAt))}`
                              : "No sign-in recorded yet"}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="mt-4">
                        <form action="/api/admin/users" method="post">
                          <input type="hidden" name="action" value="set-active-state" />
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="isActive" value={user.isActive ? "false" : "true"} />
                          <button
                            type="submit"
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                          >
                            {user.isActive ? "Deactivate user" : "Reactivate user"}
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {selectedTab === "settings" ? (
        <>
          <section className="mx-auto max-w-6xl px-4 py-4">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Payment settings
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Deposits and Stripe</h2>
              <p className="mt-3 text-sm text-muted">
                Adjust the deposit patients pay today and confirm whether Stripe is in test mode or live mode.
              </p>

              <SectionNotice notice={settingsNotice} />

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <form action="/api/admin/payment-settings" method="post" className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                  <p className="text-sm font-semibold text-slate-900">Booking deposit amount</p>
                  <p className="mt-2 text-sm text-slate-600">
                    This is the amount taken before an appointment can move into the paid queue.
                  </p>
                  <label className="mt-5 block space-y-2 text-sm font-semibold text-slate-700">
                    Deposit amount in pounds
                    <input
                      type="number"
                      name="depositAmountGBP"
                      min={(MIN_BOOKING_DEPOSIT_AMOUNT_PENCE / 100).toFixed(2)}
                      max={(MAX_BOOKING_DEPOSIT_AMOUNT_PENCE / 100).toFixed(2)}
                      step="0.01"
                      defaultValue={(paymentSettings.depositAmountPence / 100).toFixed(2)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="mt-4 flex items-start gap-3 rounded-2xl bg-white p-4 text-sm text-slate-700">
                    <input type="checkbox" name="confirmDepositChange" value="yes" className="mt-1 h-4 w-4" />
                    <span>I confirm that the new deposit amount should apply to new bookings.</span>
                  </label>
                  <p className="mt-3 text-sm text-slate-600">
                    Allowed range: {formatCurrencyFromPence(MIN_BOOKING_DEPOSIT_AMOUNT_PENCE)} to {formatCurrencyFromPence(MAX_BOOKING_DEPOSIT_AMOUNT_PENCE)}.
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Current deposit: <span className="font-semibold text-slate-900">{paymentSettings.depositAmountLabel}</span>
                  </p>
                  <button
                    type="submit"
                    className="mt-5 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
                  >
                    Save payment settings
                  </button>
                </form>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                  <p className="text-sm font-semibold text-slate-900">Stripe connection</p>
                  <p className="mt-2 text-sm text-slate-600">
                    These checks show whether payments are wired up and whether Stripe is running in test mode or live mode.
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Publishable key", status: paymentSettings.stripe.publishableKey },
                      { label: "Secret key", status: paymentSettings.stripe.secretKey },
                      { label: "Webhook secret", status: paymentSettings.stripe.webhookSecret },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{item.status.label}</p>
                        <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status.configured ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          {item.status.configured ? "Ready" : "Missing"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Security
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Change your password</h2>
              <p className="mt-3 text-sm text-muted">
                Update the password for the account you are using now. Your current session stays signed in and older sessions are closed.
              </p>

              <SectionNotice notice={securityNotice} />

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <form action="/api/admin/password" method="post" className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                  <label className="block space-y-2 text-sm font-semibold text-slate-700">
                    Current password
                    <input
                      type="password"
                      name="currentPassword"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-700">
                    New password
                    <input
                      type="password"
                      name="newPassword"
                      autoComplete="new-password"
                      required
                      minLength={MIN_ADMIN_PASSWORD_LENGTH}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-700">
                    Confirm new password
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      required
                      minLength={MIN_ADMIN_PASSWORD_LENGTH}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-5 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
                  >
                    Save new password
                  </button>
                </form>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                  <p className="text-sm font-semibold text-slate-900">Good password guidance</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>Use at least {MIN_ADMIN_PASSWORD_LENGTH} characters so the password is long enough to be safe and still memorable.</p>
                    <p>Avoid reusing the same password from your email, hosting account, or payment systems.</p>
                    <p>If more than one person needs access, create a separate admin account for each person instead of sharing one login.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
