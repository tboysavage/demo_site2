"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AdminBookingRecord } from "@/lib/admin-data";
import { formatCurrencyFromPence } from "@/lib/booking-config";
import {
  adminDateFormatter,
  formatPregnancySummary,
  formatServiceLabel,
  formatStatusLabel,
  getStatusBadgeClass,
} from "@/lib/admin-format";
import { getClinicTodayDate } from "@/lib/clinic-time";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

const selectedDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseMonthValue(value: string) {
  const [yearText, monthText] = value.split("-");
  const year = Number.parseInt(yearText ?? "", 10);
  const monthIndex = Number.parseInt(monthText ?? "", 10) - 1;

  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return new Date();
  }

  return new Date(year, monthIndex, 1);
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getCalendarStart(date: Date) {
  const start = getMonthStart(date);
  const weekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - weekday);
  return start;
}

function getCalendarEnd(date: Date) {
  const end = getMonthEnd(date);
  const weekday = (end.getDay() + 6) % 7;
  end.setDate(end.getDate() + (6 - weekday));
  return end;
}

function makeMonthParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthHref(date: Date) {
  return `/admin?tab=appointments&month=${makeMonthParam(date)}#calendar`;
}

function sortAppointments(appointments: readonly AdminBookingRecord[]) {
  return [...appointments].sort((left, right) => {
    if (left.appointmentTime === right.appointmentTime) {
      return left.reference.localeCompare(right.reference);
    }

    return left.appointmentTime.localeCompare(right.appointmentTime);
  });
}

function getCalendarStatusClasses(appointment: AdminBookingRecord) {
  if (appointment.paymentStatus === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (appointment.bookingStatus === "awaiting_deposit") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (appointment.bookingStatus === "deposit_failed") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (appointment.bookingStatus === "deposit_expired") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  return "border-[var(--baby-blue)] bg-[color:rgba(163,225,255,0.18)] text-slate-800";
}

function getCalendarStatusLabel(appointment: AdminBookingRecord) {
  if (appointment.paymentStatus === "paid") {
    return "Paid";
  }

  if (appointment.bookingStatus === "awaiting_deposit") {
    return "Awaiting deposit";
  }

  if (appointment.bookingStatus === "deposit_failed") {
    return "Payment failed";
  }

  if (appointment.bookingStatus === "deposit_expired") {
    return "Deposit expired";
  }

  return formatStatusLabel(appointment.bookingStatus);
}

function getDepositSummary(appointment: AdminBookingRecord) {
  if (appointment.paymentStatus === "paid") {
    return "Deposit received";
  }

  if (appointment.bookingStatus === "awaiting_deposit") {
    return "Waiting for the patient to complete the deposit.";
  }

  if (appointment.bookingStatus === "deposit_failed") {
    return "The deposit attempt failed. Follow up before treating this as booked.";
  }

  if (appointment.bookingStatus === "deposit_expired") {
    return "The deposit window expired before payment was completed.";
  }

  return "Deposit not yet completed";
}

function SelectedAppointmentDetail({ appointment }: { appointment: AdminBookingRecord }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Appointment details
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {appointment.customerFirstName} {appointment.customerLastName}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{appointment.reference}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(appointment.bookingStatus)}`}
          >
            {formatStatusLabel(appointment.bookingStatus)}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(appointment.paymentStatus)}`}
          >
            {formatStatusLabel(appointment.paymentStatus)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Time</p>
          <p className="mt-2 font-semibold text-slate-900">{appointment.appointmentTime}</p>
          <p className="mt-1 text-sm text-slate-600">{adminDateFormatter.format(new Date(`${appointment.appointmentDate}T00:00:00`))}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Package</p>
          <p className="mt-2 font-semibold text-slate-900">{appointment.packageTitle}</p>
          <p className="mt-1 text-sm text-slate-600">{formatServiceLabel(appointment.service)}</p>
          {appointment.packagePriceLabel ? (
            <p className="mt-1 text-sm text-slate-600">{appointment.packagePriceLabel}</p>
          ) : null}
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Deposit</p>
          <p className="mt-2 font-semibold text-slate-900">
            {formatCurrencyFromPence(appointment.depositAmountPence, appointment.depositCurrency)}
          </p>
          <p className="mt-1 text-sm text-slate-600">{getDepositSummary(appointment)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Patient contact</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>{appointment.customerPhone}</p>
            <p>{appointment.customerEmail}</p>
            <p>
              {appointment.customerAddressLine1}, {appointment.customerTownOrCity}, {appointment.customerPostcode}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Clinical summary</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>{formatPregnancySummary(appointment)}</p>
            <p>{appointment.locationLabel}</p>
            <p>{appointment.customerNotes?.trim() || "No patient notes were provided."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCalendar({
  monthValue,
  appointments,
}: {
  monthValue: string;
  appointments: readonly AdminBookingRecord[];
}) {
  const monthDate = useMemo(() => parseMonthValue(monthValue), [monthValue]);
  const calendarStart = useMemo(() => getCalendarStart(monthDate), [monthDate]);
  const calendarEnd = useMemo(() => getCalendarEnd(monthDate), [monthDate]);
  const todayKey = getClinicTodayDate();

  const appointmentMap = useMemo(() => {
    const nextMap = new Map<string, AdminBookingRecord[]>();

    for (const appointment of appointments) {
      const bucket = nextMap.get(appointment.appointmentDate);
      if (bucket) {
        bucket.push(appointment);
      } else {
        nextMap.set(appointment.appointmentDate, [appointment]);
      }
    }

    for (const [dateKey, bucket] of nextMap.entries()) {
      nextMap.set(dateKey, sortAppointments(bucket));
    }

    return nextMap;
  }, [appointments]);

  const cells = useMemo(() => {
    const nextCells: Date[] = [];
    for (
      const cursor = new Date(calendarStart);
      cursor <= calendarEnd;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      nextCells.push(new Date(cursor));
    }
    return nextCells;
  }, [calendarEnd, calendarStart]);

  const currentMonthDateKeys = useMemo(
    () =>
      cells
        .filter((cellDate) => cellDate.getMonth() === monthDate.getMonth())
        .map((cellDate) => formatDateKey(cellDate)),
    [cells, monthDate],
  );

  const initialSelectedDateKey = useMemo(() => {
    if (currentMonthDateKeys.includes(todayKey)) {
      return todayKey;
    }

    const firstAppointmentDate = currentMonthDateKeys.find((dateKey) => appointmentMap.has(dateKey));
    return firstAppointmentDate ?? currentMonthDateKeys[0] ?? todayKey;
  }, [appointmentMap, currentMonthDateKeys, todayKey]);

  const [selectedDateKey, setSelectedDateKey] = useState(initialSelectedDateKey);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDateKey(initialSelectedDateKey);
    const firstAppointment = appointmentMap.get(initialSelectedDateKey)?.[0];
    setSelectedReference(firstAppointment?.reference ?? null);
  }, [appointmentMap, initialSelectedDateKey]);

  const selectedDayAppointments = useMemo(
    () => appointmentMap.get(selectedDateKey) ?? [],
    [appointmentMap, selectedDateKey],
  );

  const selectedAppointment = useMemo(() => {
    if (!selectedDayAppointments.length) {
      return null;
    }

    return (
      selectedDayAppointments.find((appointment) => appointment.reference === selectedReference) ??
      selectedDayAppointments[0]
    );
  }, [selectedDayAppointments, selectedReference]);

  const selectedDate = useMemo(() => {
    const selectedCell = cells.find((cellDate) => formatDateKey(cellDate) === selectedDateKey);
    return selectedCell ?? new Date(`${selectedDateKey}T00:00:00`);
  }, [cells, selectedDateKey]);

  const previousMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
  const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  const currentMonth = new Date();
  const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

  return (
    <div id="calendar" className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Calendar
          </p>
          <h2 className="mt-2 font-display text-3xl text-slate-900">
            {monthFormatter.format(monthDate)}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Click a day to review that schedule. Paid appointments and unpaid booking requests are both shown here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={buildMonthHref(previousMonth)}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Previous
          </Link>
          <Link
            href={buildMonthHref(currentMonthStart)}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            This month
          </Link>
          <Link
            href={buildMonthHref(nextMonth)}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Next
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[56rem]">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {weekdayLabels.map((label) => (
              <div key={label} className="rounded-2xl bg-slate-50 px-2 py-3">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {cells.map((cellDate) => {
              const dateKey = formatDateKey(cellDate);
              const dayAppointments = appointmentMap.get(dateKey) ?? [];
              const isCurrentMonth = cellDate.getMonth() === monthDate.getMonth();
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDateKey;

              return (
                <button
                  key={`${dateKey}-${isCurrentMonth ? "current" : "overflow"}`}
                  type="button"
                  onClick={() => {
                    setSelectedDateKey(dateKey);
                    setSelectedReference(dayAppointments[0]?.reference ?? null);
                  }}
                  className={`min-h-40 rounded-3xl border p-3 text-left transition ${
                    isSelected
                      ? "border-[var(--accent-strong)] bg-[color:rgba(230,90,134,0.10)] shadow-sm"
                      : isToday
                        ? "border-[var(--accent-strong)] bg-[color:rgba(230,90,134,0.06)]"
                        : "border-slate-200 bg-slate-50/70 hover:border-[var(--baby-blue)] hover:bg-white"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrentMonth ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {cellDate.getDate()}
                    </span>
                    {dayAppointments.length ? (
                      <span className="rounded-full bg-[var(--ink-strong)] px-2 py-1 text-[10px] font-semibold text-white">
                        {dayAppointments.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-2">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.reference}
                        className={`rounded-2xl border px-3 py-2 text-left text-xs shadow-sm ${getCalendarStatusClasses(appointment)}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">{appointment.appointmentTime}</p>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                            {getCalendarStatusLabel(appointment)}
                          </span>
                        </div>
                        <p>
                          {appointment.customerFirstName} {appointment.customerLastName}
                        </p>
                        <p className="truncate">{appointment.packageTitle}</p>
                      </div>
                    ))}
                    {dayAppointments.length > 2 ? (
                      <p className="text-xs font-semibold text-slate-500">
                        +{dayAppointments.length - 2} more appointments
                      </p>
                    ) : null}
                    {!dayAppointments.length ? (
                      <p className="pt-8 text-xs text-slate-400">No appointments</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Selected day
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            {selectedDateFormatter.format(selectedDate)}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {selectedDayAppointments.length
              ? `${selectedDayAppointments.length} booking${selectedDayAppointments.length === 1 ? "" : "s"} on this day.`
              : "No bookings are scheduled for this day yet."}
          </p>

          <div className="mt-5 space-y-3">
            {selectedDayAppointments.length ? (
              selectedDayAppointments.map((appointment) => {
                const isSelectedAppointment = selectedAppointment?.reference === appointment.reference;
                return (
                  <button
                    key={appointment.reference}
                    type="button"
                    onClick={() => setSelectedReference(appointment.reference)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelectedAppointment
                        ? "border-[var(--accent-strong)] bg-white shadow-sm"
                        : "border-slate-200 bg-white/80 hover:border-[var(--baby-blue)]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{appointment.appointmentTime}</p>
                        <p className="mt-1 text-sm text-slate-700">
                          {appointment.customerFirstName} {appointment.customerLastName}
                        </p>
                        <p className="text-sm text-slate-600">{appointment.packageTitle}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getCalendarStatusClasses(appointment)}`}
                        >
                          {getCalendarStatusLabel(appointment)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusBadgeClass(appointment.bookingStatus)}`}
                        >
                          {formatStatusLabel(appointment.bookingStatus)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
                Choose another day in the month grid if you want to inspect a different schedule.
              </div>
            )}
          </div>
        </div>

        {selectedAppointment ? (
          <SelectedAppointmentDetail appointment={selectedAppointment} />
        ) : (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
            <div className="max-w-md space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                No booking selected
              </p>
              <p className="text-lg font-semibold text-slate-900">
                Pick a day with bookings to see the schedule details here.
              </p>
              <p className="text-sm text-slate-600">
                Once a day is selected, you can click any appointment in the list to inspect the patient and booking details.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
