import { NextResponse } from "next/server";
import {
  attachCheckoutSession,
  createBooking,
  findRecentDuplicateBooking,
  hasSentBookingNotification,
  markBookingNotificationSent,
  updateBookingPaymentState,
} from "@/lib/booking-db";
import { createDepositCheckoutSession } from "@/lib/stripe";
import { bookingLocations, isLocationDateAvailable } from "@/content/scanBooking";
import { getScanBookingOptions } from "@/lib/booking-options";
import { checkRateLimit, getRequestIpAddress } from "@/lib/rate-limit";
import { getAdminBookingByReference } from "@/lib/admin-data";
import {
  sendBookingRequestCustomerNotification,
  sendBookingRequestNotification,
} from "@/lib/booking-notifications";

export const runtime = "nodejs";

const BOOKING_REQUEST_CLINIC_NOTIFICATION_TYPE = "booking_request_created_email";
const BOOKING_REQUEST_CUSTOMER_NOTIFICATION_TYPE = "booking_request_customer_email";

type BookingRequestBody = {
  requestedService?: string;
  requestedPackageGroupId?: string;
  package?: {
    id?: string;
    title?: string;
    pricingOptionLabel?: string | null;
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

function toDateStart(value: string) {
  return new Date(`${value}T00:00:00`);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrowValue() {
  return addDays(new Date(), 1).toISOString().slice(0, 10);
}

function calculateAge(dateOfBirth: string) {
  const birth = toDateStart(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function getGestationFromZeroDate(zeroDate: Date) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = todayStart.getTime() - zeroDate.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (!Number.isFinite(totalDays) || totalDays < 0) {
    return null;
  }

  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
  };
}

function parseWeeksRange(weeksText: string) {
  const match = weeksText.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) {
    return null;
  }

  return {
    min: Number.parseInt(match[1], 10),
    max: Number.parseInt(match[2], 10),
  };
}

function validatePregnancyDetails(
  payload: BookingRequestBody["pregnancy"],
  service: string,
  packageWeeks: string,
) {
  if (!payload) {
    return { error: "Pregnancy details are missing." };
  }

  if (service === "blood") {
    return {
      pregnancy: {
        mode: "not_applicable",
        multiple: "not_applicable",
        gestationWeeks: 0,
        gestationDays: 0,
      },
    };
  }

  if (payload.multiple !== "single" && payload.multiple !== "multiple") {
    return { error: "Pregnancy type was not recognised." };
  }

  let gestation:
    | {
        weeks: number;
        days: number;
      }
    | null = null;

  if (payload.mode === "due") {
    if (!isValidDate(payload.dueDate)) {
      return { error: "A valid due date is required for this package." };
    }

    gestation = getGestationFromZeroDate(addDays(toDateStart(payload.dueDate), -280));
    if (!gestation) {
      return { error: "The due date entered does not produce a valid gestation." };
    }

    return {
      pregnancy: {
        mode: "due",
        multiple: payload.multiple,
        dueDate: payload.dueDate,
        gestationWeeks: gestation.weeks,
        gestationDays: gestation.days,
      },
    };
  }

  if (payload.mode === "cycle") {
    if (!isValidDate(payload.cycleDate)) {
      return { error: "A valid last cycle date is required for this package." };
    }

    if (payload.cycleDate > getTodayValue()) {
      return { error: "The last cycle date cannot be in the future." };
    }

    gestation = getGestationFromZeroDate(toDateStart(payload.cycleDate));
    if (!gestation) {
      return { error: "The last cycle date entered does not produce a valid gestation." };
    }

    return {
      pregnancy: {
        mode: "cycle",
        multiple: payload.multiple,
        cycleDate: payload.cycleDate,
        gestationWeeks: gestation.weeks,
        gestationDays: gestation.days,
      },
    };
  }

  if (payload.mode !== "weeks") {
    return { error: "Pregnancy dating method was not recognised." };
  }

  const manualWeeks = Number.parseInt(payload.weeksDue ?? "", 10);
  const manualDays = Number.parseInt(payload.daysDue ?? "", 10);

  if (
    Number.isNaN(manualWeeks) ||
    manualWeeks < 0 ||
    manualWeeks > 45 ||
    Number.isNaN(manualDays) ||
    manualDays < 0 ||
    manualDays > 6
  ) {
    return { error: "Enter the current pregnancy weeks and days to continue." };
  }

  const packageRange = parseWeeksRange(packageWeeks);
  if (
    packageRange &&
    (manualWeeks < packageRange.min || manualWeeks > packageRange.max)
  ) {
    return { error: `This package is usually booked between ${packageWeeks}.` };
  }

  return {
    pregnancy: {
      mode: "weeks",
      multiple: payload.multiple,
      weeksDue: String(manualWeeks),
      daysDue: String(manualDays),
      gestationWeeks: manualWeeks,
      gestationDays: manualDays,
    },
  };
}

export async function POST(request: Request) {
  const requestIp = getRequestIpAddress(request);
  const rateLimit = checkRateLimit({
    key: `bookings:${requestIp}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many booking attempts. Try again in a few minutes." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

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

  const packageData: {
    id: string;
    title: string;
    pricingOptionLabel: string | null;
    group: string;
    service: string;
    weeks: string;
    price: string | null;
  } = {
    id: payload.package.id,
    title: payload.package.title,
    pricingOptionLabel: payload.package.pricingOptionLabel ?? null,
    group: payload.package.group,
    service: payload.package.service,
    weeks: payload.package.weeks,
    price: payload.package.price ?? null,
  };
  const scanBookingOptions = await getScanBookingOptions();
  const matchedOption = scanBookingOptions.find((option) => option.id === packageData.id);
  if (!matchedOption) {
    return NextResponse.json({ error: "Selected package is not recognised." }, { status: 400 });
  }

  const matchedPricingOption = packageData.pricingOptionLabel
    ? matchedOption.pricingOptions?.find(
        (pricingOption) => pricingOption.label === packageData.pricingOptionLabel,
      ) ?? null
    : null;

  if (packageData.pricingOptionLabel && !matchedPricingOption) {
    return NextResponse.json(
      { error: "The selected pricing option is not recognised for this package." },
      { status: 400 },
    );
  }

  const expectedPackageTitle = matchedPricingOption
    ? `${matchedOption.title} - ${matchedPricingOption.label}`
    : matchedOption.title;
  const expectedPackagePrice = matchedPricingOption?.price ?? matchedOption.priceLabel ?? null;

  if (
    matchedOption.service !== payload.requestedService ||
    matchedOption.groupId !== payload.requestedPackageGroupId ||
    matchedOption.groupTitle !== packageData.group ||
    matchedOption.serviceLabel !== packageData.service ||
    expectedPackageTitle !== packageData.title ||
    matchedOption.weeks !== packageData.weeks ||
    expectedPackagePrice !== (packageData.price ?? null)
  ) {
    return NextResponse.json(
      { error: "Booking package data does not match the selected option." },
      { status: 400 },
    );
  }

  const matchedLocation = bookingLocations.find(
    (location) =>
      location.id === payload.appointment?.locationId &&
      location.service === matchedOption.service,
  );
  if (!matchedLocation || matchedLocation.label !== payload.appointment.location) {
    return NextResponse.json(
      { error: "The selected booking location is not valid for this package." },
      { status: 400 },
    );
  }

  if (!matchedLocation.timeSlots.includes(payload.appointment.preferredTime)) {
    return NextResponse.json(
      { error: "The selected appointment time is not available for that location." },
      { status: 400 },
    );
  }

  if (payload.appointment.preferredDate < getTomorrowValue()) {
    return NextResponse.json(
      { error: "Choose a preferred appointment date from tomorrow onwards." },
      { status: 400 },
    );
  }

  if (!isLocationDateAvailable(matchedLocation, payload.appointment.preferredDate)) {
    return NextResponse.json(
      { error: `${matchedLocation.label} appointments are available Monday to Friday only.` },
      { status: 400 },
    );
  }

  if (calculateAge(payload.customer.dateOfBirth) < 16) {
    return NextResponse.json(
      { error: "Bookings require a patient aged 16 or over." },
      { status: 400 },
    );
  }

  const validatedPregnancy = validatePregnancyDetails(
    payload.pregnancy,
    matchedOption.service,
    matchedOption.weeks,
  );
  if ("error" in validatedPregnancy) {
    return NextResponse.json({ error: validatedPregnancy.error }, { status: 400 });
  }

  if (matchedOption.service !== "blood") {
    const packageRange = parseWeeksRange(matchedOption.weeks);
    if (
      packageRange &&
      (validatedPregnancy.pregnancy.gestationWeeks < packageRange.min ||
        validatedPregnancy.pregnancy.gestationWeeks > packageRange.max)
    ) {
      return NextResponse.json(
        { error: `This package is usually booked between ${matchedOption.weeks}.` },
        { status: 400 },
      );
    }
  }

  const bookingInput = {
    requestedService: payload.requestedService,
    requestedPackageGroupId: payload.requestedPackageGroupId,
    package: {
      id: packageData.id,
      title: packageData.title,
      group: packageData.group,
      service: packageData.service,
      weeks: packageData.weeks,
      price: packageData.price ?? null,
    },
    pregnancy: {
      ...validatedPregnancy.pregnancy,
      gestationToday: `${validatedPregnancy.pregnancy.gestationWeeks} weeks and ${validatedPregnancy.pregnancy.gestationDays} days`,
    },
    gestationWeeks: validatedPregnancy.pregnancy.gestationWeeks,
    gestationDays: validatedPregnancy.pregnancy.gestationDays,
    appointment: {
      locationId: matchedLocation.id,
      location: matchedLocation.label,
      preferredDate: payload.appointment.preferredDate,
      preferredTime: payload.appointment.preferredTime,
    },
    customer: {
      firstName: payload.customer.firstName.trim(),
      lastName: payload.customer.lastName.trim(),
      email: payload.customer.email.trim().toLowerCase(),
      phone: payload.customer.phone.trim(),
      addressLine1: payload.customer.addressLine1.trim(),
      townOrCity: payload.customer.townOrCity.trim(),
      postcode: payload.customer.postcode.trim(),
      dateOfBirth: payload.customer.dateOfBirth,
      notes: payload.customer.notes?.trim() || undefined,
    },
  } as const;

  const duplicateBooking = await findRecentDuplicateBooking(bookingInput);
  if (duplicateBooking?.paymentStatus === "paid") {
    return NextResponse.json(
      {
        error:
          "This booking request has already been submitted and paid. Contact the clinic if you need to change it.",
      },
      { status: 409 },
    );
  }

  const booking = duplicateBooking ?? (await createBooking(bookingInput));

  if (
    !(await hasSentBookingNotification(
      booking.reference,
      BOOKING_REQUEST_CLINIC_NOTIFICATION_TYPE,
    ))
  ) {
    try {
      const detailedBooking = await getAdminBookingByReference(booking.reference);
      if (detailedBooking) {
        await sendBookingRequestNotification(detailedBooking);
        await markBookingNotificationSent(
          booking.reference,
          BOOKING_REQUEST_CLINIC_NOTIFICATION_TYPE,
        );
      }
    } catch (error) {
      console.error("Booking request notification failed", error);
    }
  }

  if (
    !(await hasSentBookingNotification(
      booking.reference,
      BOOKING_REQUEST_CUSTOMER_NOTIFICATION_TYPE,
    ))
  ) {
    try {
      const detailedBooking = await getAdminBookingByReference(booking.reference);
      if (detailedBooking) {
        await sendBookingRequestCustomerNotification(detailedBooking);
        await markBookingNotificationSent(
          booking.reference,
          BOOKING_REQUEST_CUSTOMER_NOTIFICATION_TYPE,
        );
      }
    } catch (error) {
      console.error("Customer booking request notification failed", error);
    }
  }

  try {
    const origin = new URL(request.url).origin;
    const session = await createDepositCheckoutSession({
      booking,
      customerEmail: bookingInput.customer.email,
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
        message:
          error instanceof Error
            ? error.message
            : "Stripe checkout session creation failed.",
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
