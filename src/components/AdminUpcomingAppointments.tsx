"use client";

import { useMemo, useState } from "react";
import { bookingLocations } from "@/content/scanBooking";
import { formatCurrencyFromPence } from "@/lib/booking-config";
import { getClinicTodayDate } from "@/lib/clinic-time";
import {
  adminDateFormatter,
  adminDateTimeFormatter,
  formatPregnancySummary,
  formatServiceLabel,
  formatStatusLabel,
  getStatusBadgeClass,
} from "@/lib/admin-format";
import type { AdminBookingRecord } from "@/lib/admin-data";

type AdminUpcomingAppointmentsProps = {
  appointments: AdminBookingRecord[];
  mode?: "appointments" | "requests";
};

function SelectedAppointmentPanel({
  appointment,
  mode,
}: {
  appointment: AdminBookingRecord;
  mode: "appointments" | "requests";
}) {
  const locationOptions = useMemo(
    () => bookingLocations.filter((location) => location.service === appointment.service),
    [appointment.service],
  );
  const fallbackLocation = locationOptions.find((location) => location.id === appointment.locationId);
  const [rescheduleLocationId, setRescheduleLocationId] = useState(
    fallbackLocation?.id ?? locationOptions[0]?.id ?? appointment.locationId,
  );
  const selectedLocation =
    locationOptions.find((location) => location.id === rescheduleLocationId) ?? fallbackLocation;
  const availableTimeSlots = selectedLocation?.timeSlots ?? [appointment.appointmentTime];
  const [rescheduleTime, setRescheduleTime] = useState(
    availableTimeSlots.includes(appointment.appointmentTime)
      ? appointment.appointmentTime
      : (availableTimeSlots[0] ?? appointment.appointmentTime),
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            {mode === "appointments" ? "Selected appointment" : "Selected request"}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            {appointment.customerFirstName} {appointment.customerLastName}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{appointment.reference}</p>
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

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Appointment
          </p>
          <p className="mt-2 font-semibold text-slate-900">
            {adminDateFormatter.format(new Date(`${appointment.appointmentDate}T00:00:00`))}
          </p>
          <p className="mt-1 text-sm text-slate-700">{appointment.appointmentTime}</p>
          <p className="mt-1 text-sm text-slate-600">{appointment.locationLabel}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Package
          </p>
          <p className="mt-2 font-semibold text-slate-900">{appointment.packageTitle}</p>
          <p className="mt-1 text-sm text-slate-700">{formatServiceLabel(appointment.service)}</p>
          <p className="mt-1 text-sm text-slate-600">{appointment.packageGroupTitle}</p>
          {appointment.packagePriceLabel ? (
            <p className="mt-1 text-sm text-slate-600">{appointment.packagePriceLabel}</p>
          ) : null}
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Deposit
          </p>
          <p className="mt-2 font-semibold text-slate-900">
            {formatCurrencyFromPence(appointment.depositAmountPence, appointment.depositCurrency)}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Requested {adminDateTimeFormatter.format(new Date(appointment.createdAt))}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {appointment.paymentStatus === "paid"
              ? "Deposit received"
              : "Deposit not yet completed"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Patient details</p>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Phone:</span> {appointment.customerPhone}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Email:</span> {appointment.customerEmail}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Date of birth:</span>{" "}
              {adminDateFormatter.format(new Date(`${appointment.customerDateOfBirth}T00:00:00`))}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Address:</span>{" "}
              {appointment.customerAddressLine1}, {appointment.customerTownOrCity}, {appointment.customerPostcode}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Pregnancy / clinical details</p>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>{formatPregnancySummary(appointment)}</p>
            <p>
              <span className="font-semibold text-slate-900">Weeks covered:</span> {appointment.packageWeeks}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Payment:</span>{" "}
              {formatStatusLabel(appointment.paymentStatus)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Notes</p>
        <p className="mt-3 text-sm text-slate-700">
          {appointment.customerNotes?.trim() || "No patient notes were provided."}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Quick actions</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {appointment.paymentStatus === "paid" &&
            appointment.bookingStatus !== "confirmed" &&
            appointment.bookingStatus !== "cancelled" ? (
              <form action="/api/admin/bookings" method="post">
                <input type="hidden" name="reference" value={appointment.reference} />
                <input type="hidden" name="action" value="confirm" />
                <button
                  type="submit"
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Confirm appointment
                </button>
              </form>
            ) : null}
            {appointment.bookingStatus !== "cancelled" ? (
              <form action="/api/admin/bookings" method="post">
                <input type="hidden" name="reference" value={appointment.reference} />
                <input type="hidden" name="action" value="cancel" />
                <button
                  type="submit"
                  className="rounded-full border border-red-300 px-5 py-3 text-sm font-semibold text-red-700"
                >
                  Cancel booking
                </button>
              </form>
            ) : null}
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {mode === "appointments"
              ? "Use these controls to confirm, reschedule, or cancel a paid appointment."
              : "Requests stay here until the deposit is completed or the request is cancelled."}
          </p>
        </div>

        <form action="/api/admin/bookings" method="post" className="rounded-2xl bg-white p-4">
          <input type="hidden" name="reference" value={appointment.reference} />
          <input type="hidden" name="action" value="reschedule" />
          <p className="text-sm font-semibold text-slate-900">Reschedule appointment</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Date
              <input
                type="date"
                name="appointmentDate"
                defaultValue={appointment.appointmentDate}
                min={getClinicTodayDate()}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Time
              <select
                name="appointmentTime"
                value={rescheduleTime}
                onChange={(event) => setRescheduleTime(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                {availableTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Location
              <select
                name="locationId"
                value={rescheduleLocationId}
                onChange={(event) => {
                  const nextLocationId = event.target.value;
                  const nextLocation =
                    locationOptions.find((location) => location.id === nextLocationId) ?? fallbackLocation;
                  setRescheduleLocationId(nextLocationId);
                  if (nextLocation && !nextLocation.timeSlots.includes(rescheduleTime)) {
                    setRescheduleTime(nextLocation.timeSlots[0] ?? "");
                  }
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                {locationOptions.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white"
          >
            Save appointment changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminUpcomingAppointments({
  appointments,
  mode = "appointments",
}: AdminUpcomingAppointmentsProps) {
  const [selectedReference, setSelectedReference] = useState<string | null>(
    appointments[0]?.reference ?? null,
  );

  const effectiveSelectedReference = appointments.some(
    (appointment) => appointment.reference === selectedReference,
  )
    ? selectedReference
    : (appointments[0]?.reference ?? null);

  const selectedAppointment =
    appointments.find((appointment) => appointment.reference === effectiveSelectedReference) ??
    appointments[0] ??
    null;

  if (!appointments.length) {
    return (
      <p className="mt-6 text-sm text-slate-500">
        {mode === "appointments"
          ? "No upcoming appointments are ready for follow-up yet."
          : "No open booking requests need attention right now."}
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="max-h-[42rem] space-y-2 overflow-y-auto pr-1">
          {appointments.map((booking) => {
            const isSelected = booking.reference === selectedAppointment?.reference;

            return (
              <button
                key={booking.reference}
                type="button"
                onClick={() => setSelectedReference(booking.reference)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-[var(--accent-strong)] bg-white shadow-sm"
                    : "border-transparent bg-white/75 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {booking.customerFirstName} {booking.customerLastName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{booking.packageTitle}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusBadgeClass(booking.bookingStatus)}`}
                  >
                    {formatStatusLabel(booking.bookingStatus)}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>{adminDateFormatter.format(new Date(`${booking.appointmentDate}T00:00:00`))}</p>
                  <p>
                    {booking.appointmentTime} · {booking.locationLabel}
                  </p>
                  <p>{formatServiceLabel(booking.service)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedAppointment ? (
        <SelectedAppointmentPanel
          key={selectedAppointment.reference}
          appointment={selectedAppointment}
          mode={mode}
        />
      ) : null}
    </div>
  );
}
