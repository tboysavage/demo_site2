import { NextResponse } from "next/server";
import { bookingLocations, isLocationDateAvailable } from "@/content/scanBooking";
import { getAdminBookingByReference, addAdminActivityLog } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-auth";
import { getClinicTodayDate } from "@/lib/clinic-time";
import { updateAdminBooking } from "@/lib/booking-db";

export const runtime = "nodejs";

function redirectWithStatus(request: Request, status: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("tab", "appointments");
  url.searchParams.set("booking", status);
  return NextResponse.redirect(url, { status: 303 });
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const reference = String(formData.get("reference") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();

  if (!reference) {
    return redirectWithStatus(request, "booking-missing");
  }

  const booking = await getAdminBookingByReference(reference);
  if (!booking) {
    return redirectWithStatus(request, "booking-missing");
  }

  if (action === "confirm") {
    if (booking.paymentStatus !== "paid") {
      return redirectWithStatus(request, "booking-confirm-payment-required");
    }

    await updateAdminBooking({
      reference,
      bookingStatus: "confirmed",
      eventType: "admin_booking_confirmed",
      eventPayload: {
        actorUserId: session.userId,
      },
    });
    await addAdminActivityLog({
      actorUserId: session.userId,
      actionType: "booking_confirmed",
      targetType: "booking",
      targetId: reference,
      message: `Confirmed booking ${reference} for ${booking.customerFirstName} ${booking.customerLastName}.`,
    });
    return redirectWithStatus(request, "booking-confirmed");
  }

  if (action === "cancel") {
    await updateAdminBooking({
      reference,
      bookingStatus: "cancelled",
      eventType: "admin_booking_cancelled",
      eventPayload: {
        actorUserId: session.userId,
      },
    });
    await addAdminActivityLog({
      actorUserId: session.userId,
      actionType: "booking_cancelled",
      targetType: "booking",
      targetId: reference,
      message: `Cancelled booking ${reference} for ${booking.customerFirstName} ${booking.customerLastName}.`,
    });
    return redirectWithStatus(request, "booking-cancelled");
  }

  if (action === "reschedule") {
    const appointmentDate = String(formData.get("appointmentDate") ?? "").trim();
    const appointmentTime = String(formData.get("appointmentTime") ?? "").trim();
    const locationId = String(formData.get("locationId") ?? "").trim();

    if (!isValidDate(appointmentDate) || appointmentDate < getClinicTodayDate()) {
      return redirectWithStatus(request, "booking-reschedule-date");
    }

    const location = bookingLocations.find(
      (item) => item.id === locationId && item.service === booking.service,
    );
    if (
      !location ||
      !location.timeSlots.includes(appointmentTime) ||
      !isLocationDateAvailable(location, appointmentDate)
    ) {
      return redirectWithStatus(request, "booking-reschedule-slot");
    }

    await updateAdminBooking({
      reference,
      appointmentDate,
      appointmentTime,
      locationId: location.id,
      locationLabel: location.label,
      eventType: "admin_booking_rescheduled",
      eventPayload: {
        actorUserId: session.userId,
        appointmentDate,
        appointmentTime,
        locationId,
      },
    });
    await addAdminActivityLog({
      actorUserId: session.userId,
      actionType: "booking_rescheduled",
      targetType: "booking",
      targetId: reference,
      message: `Rescheduled booking ${reference} to ${appointmentDate} at ${appointmentTime}.`,
      details: JSON.stringify({
        locationId,
        appointmentDate,
        appointmentTime,
      }),
    });
    return redirectWithStatus(request, "booking-rescheduled");
  }

  return redirectWithStatus(request, "booking-action-invalid");
}
