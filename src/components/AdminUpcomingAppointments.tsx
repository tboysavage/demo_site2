"use client";

import { useMemo, useState } from "react";
import { formatCurrencyFromPence } from "@/lib/booking-config";
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
};

export default function AdminUpcomingAppointments({
  appointments,
}: AdminUpcomingAppointmentsProps) {
  const [selectedReference, setSelectedReference] = useState<string | null>(
    appointments[0]?.reference ?? null,
  );

  const selectedAppointment = useMemo(
    () =>
      appointments.find((appointment) => appointment.reference === selectedReference) ??
      appointments[0] ??
      null,
    [appointments, selectedReference],
  );

  if (!appointments.length) {
    return <p className="mt-6 text-sm text-slate-500">No upcoming appointments have been booked yet.</p>;
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
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Selected appointment
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                {selectedAppointment.customerFirstName} {selectedAppointment.customerLastName}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{selectedAppointment.reference}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(selectedAppointment.bookingStatus)}`}
              >
                {formatStatusLabel(selectedAppointment.bookingStatus)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(selectedAppointment.paymentStatus)}`}
              >
                {formatStatusLabel(selectedAppointment.paymentStatus)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Appointment
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {adminDateFormatter.format(new Date(`${selectedAppointment.appointmentDate}T00:00:00`))}
              </p>
              <p className="mt-1 text-sm text-slate-700">{selectedAppointment.appointmentTime}</p>
              <p className="mt-1 text-sm text-slate-600">{selectedAppointment.locationLabel}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Package
              </p>
              <p className="mt-2 font-semibold text-slate-900">{selectedAppointment.packageTitle}</p>
              <p className="mt-1 text-sm text-slate-700">
                {formatServiceLabel(selectedAppointment.service)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{selectedAppointment.packageGroupTitle}</p>
              {selectedAppointment.packagePriceLabel ? (
                <p className="mt-1 text-sm text-slate-600">{selectedAppointment.packagePriceLabel}</p>
              ) : null}
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Deposit
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {formatCurrencyFromPence(
                  selectedAppointment.depositAmountPence,
                  selectedAppointment.depositCurrency,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Requested {adminDateTimeFormatter.format(new Date(selectedAppointment.createdAt))}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Patient details</p>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">Phone:</span>{" "}
                  {selectedAppointment.customerPhone}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Email:</span>{" "}
                  {selectedAppointment.customerEmail}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Date of birth:</span>{" "}
                  {adminDateFormatter.format(
                    new Date(`${selectedAppointment.customerDateOfBirth}T00:00:00`),
                  )}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Address:</span>{" "}
                  {selectedAppointment.customerAddressLine1}, {selectedAppointment.customerTownOrCity},{" "}
                  {selectedAppointment.customerPostcode}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Pregnancy / clinical details</p>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>{formatPregnancySummary(selectedAppointment)}</p>
                <p>
                  <span className="font-semibold text-slate-900">Weeks covered:</span>{" "}
                  {selectedAppointment.packageWeeks}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Payment:</span>{" "}
                  {formatStatusLabel(selectedAppointment.paymentStatus)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Notes</p>
            <p className="mt-3 text-sm text-slate-700">
              {selectedAppointment.customerNotes?.trim() || "No patient notes were provided."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
