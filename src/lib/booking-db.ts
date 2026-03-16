import { randomBytes } from "node:crypto";
import { DEFAULT_CURRENCY } from "@/lib/booking-config";
import { getDatabase } from "@/lib/database";
import { getConfiguredDepositAmountPence } from "@/lib/payment-settings";

type BookingStatus =
  | "awaiting_deposit"
  | "pending_confirmation"
  | "deposit_expired"
  | "deposit_failed"
  | "confirmed"
  | "cancelled";

type PaymentStatus = "pending" | "paid" | "expired" | "failed";

type BookingPayload = {
  package: {
    id: string;
    title: string;
    group: string;
    service: string;
    weeks: string;
    price?: string | null;
  };
  pregnancy: {
    mode: string;
    multiple: string;
    dueDate?: string;
    cycleDate?: string;
    weeksDue?: string;
    daysDue?: string;
    gestationToday: string;
  };
  appointment: {
    locationId: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    townOrCity: string;
    postcode: string;
    dateOfBirth: string;
    notes?: string;
  };
};

export type CreateBookingInput = BookingPayload & {
  requestedService: string;
  requestedPackageGroupId: string;
  gestationWeeks: number;
  gestationDays: number;
};

export type BookingRecord = {
  id: number;
  reference: string;
  service: string;
  packageId: string;
  packageTitle: string;
  packageGroupId: string;
  packageGroupTitle: string;
  packageWeeks: string;
  packagePriceLabel: string | null;
  gestationWeeks: number;
  gestationDays: number;
  appointmentDate: string;
  appointmentTime: string;
  locationLabel: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  depositAmountPence: number;
  depositCurrency: string;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
};

type BookingRow = {
  id: number;
  reference: string;
  service: string;
  package_id: string;
  package_title: string;
  package_group_id: string;
  package_group_title: string;
  package_weeks: string;
  package_price_label: string | null;
  gestation_weeks: number;
  gestation_days: number;
  appointment_date: string;
  appointment_time: string;
  location_label: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  deposit_amount_pence: number;
  deposit_currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapBooking(row: BookingRow): BookingRecord {
  return {
    id: row.id,
    reference: row.reference,
    service: row.service,
    packageId: row.package_id,
    packageTitle: row.package_title,
    packageGroupId: row.package_group_id,
    packageGroupTitle: row.package_group_title,
    packageWeeks: row.package_weeks,
    packagePriceLabel: row.package_price_label,
    gestationWeeks: row.gestation_weeks,
    gestationDays: row.gestation_days,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    locationLabel: row.location_label,
    customerFirstName: row.customer_first_name,
    customerLastName: row.customer_last_name,
    customerEmail: row.customer_email,
    bookingStatus: row.booking_status,
    paymentStatus: row.payment_status,
    depositAmountPence: row.deposit_amount_pence,
    depositCurrency: row.deposit_currency,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function makeReference() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `BSV-${stamp}-${suffix}`;
}

function addBookingEvent(reference: string, eventType: string, eventPayload: unknown) {
  const database = getDatabase();
  database
    .prepare(
      `INSERT INTO booking_events (booking_reference, event_type, event_payload, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .run(reference, eventType, JSON.stringify(eventPayload ?? null), nowIso());
}

export function createBooking(input: CreateBookingInput) {
  const database = getDatabase();
  const reference = makeReference();
  const createdAt = nowIso();
  const depositAmountPence = getConfiguredDepositAmountPence();
  const manualWeeks = input.pregnancy.weeksDue ? Number.parseInt(input.pregnancy.weeksDue, 10) : null;
  const manualDays = input.pregnancy.daysDue ? Number.parseInt(input.pregnancy.daysDue, 10) : null;

  database
    .prepare(
      `INSERT INTO bookings (
        reference,
        service,
        package_id,
        package_title,
        package_group_id,
        package_group_title,
        package_weeks,
        package_price_label,
        pregnancy_mode,
        pregnancy_multiple,
        due_date,
        cycle_date,
        manual_weeks_due,
        manual_days_due,
        gestation_weeks,
        gestation_days,
        location_id,
        location_label,
        appointment_date,
        appointment_time,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        customer_address_line1,
        customer_town_or_city,
        customer_postcode,
        customer_date_of_birth,
        customer_notes,
        booking_status,
        payment_status,
        deposit_amount_pence,
        deposit_currency,
        raw_payload,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      reference,
      input.requestedService,
      input.package.id,
      input.package.title,
      input.requestedPackageGroupId,
      input.package.group,
      input.package.weeks,
      input.package.price ?? null,
      input.pregnancy.mode,
      input.pregnancy.multiple,
      input.pregnancy.dueDate ?? null,
      input.pregnancy.cycleDate ?? null,
      Number.isNaN(manualWeeks ?? Number.NaN) ? null : manualWeeks,
      Number.isNaN(manualDays ?? Number.NaN) ? null : manualDays,
      input.gestationWeeks,
      input.gestationDays,
      input.appointment.locationId,
      input.appointment.location,
      input.appointment.preferredDate,
      input.appointment.preferredTime,
      input.customer.firstName,
      input.customer.lastName,
      input.customer.email,
      input.customer.phone,
      input.customer.addressLine1,
      input.customer.townOrCity,
      input.customer.postcode,
      input.customer.dateOfBirth,
      input.customer.notes ?? null,
      "awaiting_deposit",
      "pending",
      depositAmountPence,
      DEFAULT_CURRENCY,
      JSON.stringify(input),
      createdAt,
      createdAt,
    );

  addBookingEvent(reference, "booking_created", input);
  const booking = getBookingByReference(reference);
  if (!booking) {
    throw new Error("Booking could not be loaded after creation.");
  }
  return booking;
}

export function getBookingByReference(reference: string) {
  const row = getDatabase()
    .prepare("SELECT * FROM bookings WHERE reference = ?")
    .get(reference) as BookingRow | undefined;

  return row ? mapBooking(row) : null;
}

export function getBookingByCheckoutSessionId(sessionId: string) {
  const row = getDatabase()
    .prepare("SELECT * FROM bookings WHERE stripe_checkout_session_id = ?")
    .get(sessionId) as BookingRow | undefined;

  return row ? mapBooking(row) : null;
}

export function attachCheckoutSession(reference: string, sessionId: string) {
  const database = getDatabase();
  const updatedAt = nowIso();
  database
    .prepare(
      `UPDATE bookings
       SET stripe_checkout_session_id = ?, updated_at = ?
       WHERE reference = ?`
    )
    .run(sessionId, updatedAt, reference);
  addBookingEvent(reference, "checkout_session_created", { sessionId });
}

export function updateBookingPaymentState(params: {
  reference: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  stripePaymentStatus?: string | null;
  stripePaymentIntentId?: string | null;
  eventType: string;
  eventPayload?: unknown;
}) {
  const database = getDatabase();
  const updatedAt = nowIso();
  database
    .prepare(
      `UPDATE bookings
       SET booking_status = ?,
           payment_status = ?,
           stripe_payment_status = ?,
           stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id),
           updated_at = ?
       WHERE reference = ?`
    )
    .run(
      params.bookingStatus,
      params.paymentStatus,
      params.stripePaymentStatus ?? null,
      params.stripePaymentIntentId ?? null,
      updatedAt,
      params.reference,
    );
  addBookingEvent(params.reference, params.eventType, params.eventPayload ?? null);
}

export function hasProcessedWebhook(eventId: string) {
  const row = getDatabase()
    .prepare("SELECT event_id FROM processed_webhooks WHERE event_id = ?")
    .get(eventId) as { event_id: string } | undefined;
  return Boolean(row);
}

export function markWebhookProcessed(eventId: string) {
  getDatabase()
    .prepare("INSERT INTO processed_webhooks (event_id, created_at) VALUES (?, ?)")
    .run(eventId, nowIso());
}

export function hasSentBookingNotification(reference: string, notificationType: string) {
  const row = getDatabase()
    .prepare(
      `SELECT booking_reference
       FROM booking_notifications
       WHERE booking_reference = ? AND notification_type = ?`
    )
    .get(reference, notificationType) as { booking_reference: string } | undefined;

  return Boolean(row);
}

export function markBookingNotificationSent(reference: string, notificationType: string) {
  getDatabase()
    .prepare(
      `INSERT OR IGNORE INTO booking_notifications (booking_reference, notification_type, created_at)
       VALUES (?, ?, ?)`
    )
    .run(reference, notificationType, nowIso());
}
