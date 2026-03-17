import { NextResponse } from "next/server";
import { attachCheckoutSession, createBooking, updateBookingPaymentState } from "@/lib/booking-db";
import { createDepositCheckoutSession } from "@/lib/stripe";
import { scanBookingOptions } from "@/content/scanBooking";

export const runtime = "nodejs";

type BookingRequestBody = {
  requestedService?: string;
  requestedPackageGroupId?: string;
  package?: {
    id?: string;
    title?: string;
    group?: string;
    service?: string;
    weeks?: string;
    price?: string | null;
  };
  pregnancy?: {
    mode?: string;
    multiple?: string;
    dueDate?: string;
    cycleDate?: string;
    weeksDue?: string;
    daysDue?: string;
    gestationWeeks?: number;
    gestationDays?: number;
  };
  appointment?: {
    locationId?: string;
    location?: string;
    preferredDate?: string;
    preferredTime?: string;
  };
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    townOrCity?: string;
    postcode?: string;
    dateOfBirth?: string;
    notes?: string;
  };
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: unknown): value is string {
  return isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDate(value: unknown): value is string {
  return isNonEmptyString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  let payload: BookingRequestBody;

  try {
    payload = (await request.json()) as BookingRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (
    !isNonEmptyString(payload.requestedService) ||
    !isNonEmptyString(payload.requestedPackageGroupId) ||
    !payload.package ||
    !isNonEmptyString(payload.package.id) ||
    !isNonEmptyString(payload.package.title) ||
    !isNonEmptyString(payload.package.group) ||
    !isNonEmptyString(payload.package.service) ||
    !isNonEmptyString(payload.package.weeks) ||
    !payload.pregnancy ||
    !isNonEmptyString(payload.pregnancy.mode) ||
    !isNonEmptyString(payload.pregnancy.multiple) ||
    typeof payload.pregnancy.gestationWeeks !== "number" ||
    typeof payload.pregnancy.gestationDays !== "number" ||
    !payload.appointment ||
    !isNonEmptyString(payload.appointment.locationId) ||
    !isNonEmptyString(payload.appointment.location) ||
    !isValidDate(payload.appointment.preferredDate) ||
    !isNonEmptyString(payload.appointment.preferredTime) ||
    !payload.customer ||
    !isNonEmptyString(payload.customer.firstName) ||
    !isNonEmptyString(payload.customer.lastName) ||
    !isValidEmail(payload.customer.email) ||
    !isNonEmptyString(payload.customer.phone) ||
    !isNonEmptyString(payload.customer.addressLine1) ||
    !isNonEmptyString(payload.customer.townOrCity) ||
    !isNonEmptyString(payload.customer.postcode) ||
    !isValidDate(payload.customer.dateOfBirth)
  ) {
    return NextResponse.json({ error: "Booking request is incomplete." }, { status: 400 });
  }

  const matchedOption = scanBookingOptions.find((option) => option.id === payload.package?.id);
  if (!matchedOption) {
    return NextResponse.json({ error: "Selected package is not recognised." }, { status: 400 });
  }

  if (
    matchedOption.service !== payload.requestedService ||
    matchedOption.groupId !== payload.requestedPackageGroupId ||
    matchedOption.groupTitle !== payload.package.group ||
    matchedOption.serviceLabel !== payload.package.service
  ) {
    return NextResponse.json({ error: "Booking package data does not match the selected option." }, { status: 400 });
  }

  const booking = await createBooking({
    requestedService: payload.requestedService,
    requestedPackageGroupId: payload.requestedPackageGroupId,
    package: {
      id: payload.package.id,
      title: payload.package.title,
      group: payload.package.group,
      service: payload.package.service,
      weeks: payload.package.weeks,
      price: payload.package.price ?? null,
    },
    pregnancy: {
      mode: payload.pregnancy.mode,
      multiple: payload.pregnancy.multiple,
      dueDate: payload.pregnancy.dueDate,
      cycleDate: payload.pregnancy.cycleDate,
      weeksDue: payload.pregnancy.weeksDue,
      daysDue: payload.pregnancy.daysDue,
      gestationToday: `${payload.pregnancy.gestationWeeks} weeks and ${payload.pregnancy.gestationDays} days`,
    },
    gestationWeeks: payload.pregnancy.gestationWeeks,
    gestationDays: payload.pregnancy.gestationDays,
    appointment: {
      locationId: payload.appointment.locationId,
      location: payload.appointment.location,
      preferredDate: payload.appointment.preferredDate,
      preferredTime: payload.appointment.preferredTime,
    },
    customer: {
      firstName: payload.customer.firstName,
      lastName: payload.customer.lastName,
      email: payload.customer.email,
      phone: payload.customer.phone,
      addressLine1: payload.customer.addressLine1,
      townOrCity: payload.customer.townOrCity,
      postcode: payload.customer.postcode,
      dateOfBirth: payload.customer.dateOfBirth,
      notes: payload.customer.notes,
    },
  });

  try {
    const origin = new URL(request.url).origin;
    const session = await createDepositCheckoutSession({
      booking,
      customerEmail: payload.customer.email,
      origin,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }
    await attachCheckoutSession(booking.reference, session.id);

    return NextResponse.json({
      reference: booking.reference,
      checkoutUrl: session.url,
    });
  } catch (error) {
    await updateBookingPaymentState({
      reference: booking.reference,
      bookingStatus: "deposit_failed",
      paymentStatus: "failed",
      eventType: "checkout_session_failed",
      eventPayload: {
        message: error instanceof Error ? error.message : "Stripe checkout session creation failed.",
      },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe checkout session creation failed.",
      },
      { status: 500 },
    );
  }
}
