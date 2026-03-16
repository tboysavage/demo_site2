import type { AdminBookingRecord } from "@/lib/admin-data";

export const adminDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const adminDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatServiceLabel(service: string) {
  if (service === "clinic") return "Clinic scan";
  if (service === "home") return "Home scan";
  if (service === "blood") return "Blood screening";
  return service;
}

export function formatPregnancyMode(mode: string) {
  if (mode === "due") return "From due date";
  if (mode === "cycle") return "From last cycle";
  if (mode === "weeks") return "Entered as weeks + days";
  return "Not required";
}

export function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getStatusBadgeClass(status: string) {
  if (status === "confirmed" || status === "paid") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "awaiting_deposit" || status === "pending_confirmation" || status === "pending") {
    return "bg-amber-100 text-amber-800";
  }

  if (status === "cancelled" || status === "deposit_failed" || status === "failed") {
    return "bg-red-100 text-red-800";
  }

  return "bg-slate-200 text-slate-700";
}

export function formatPregnancySummary(booking: AdminBookingRecord) {
  if (booking.service === "blood" || booking.pregnancyMode === "not_applicable") {
    return "No pregnancy timing required";
  }

  const parts: string[] = [
    `${booking.gestationWeeks} weeks ${booking.gestationDays} days`,
    booking.pregnancyMultiple === "multiple" ? "Multiple pregnancy" : "Single pregnancy",
    formatPregnancyMode(booking.pregnancyMode),
  ];

  if (booking.dueDate) {
    parts.push(`Due date ${adminDateFormatter.format(new Date(`${booking.dueDate}T00:00:00`))}`);
  } else if (booking.cycleDate) {
    parts.push(`Last cycle ${adminDateFormatter.format(new Date(`${booking.cycleDate}T00:00:00`))}`);
  } else if (booking.manualWeeksDue !== null) {
    parts.push(`Entered as ${booking.manualWeeksDue} weeks ${booking.manualDaysDue ?? 0} days`);
  }

  return parts.join(" · ");
}
