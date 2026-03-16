import { getDatabase } from "@/lib/database";

type AdminBookingStatus =
  | "awaiting_deposit"
  | "pending_confirmation"
  | "deposit_expired"
  | "deposit_failed"
  | "confirmed"
  | "cancelled";

type AdminPaymentStatus = "pending" | "paid" | "expired" | "failed";

type AdminBookingRow = {
  id: number;
  reference: string;
  service: string;
  package_id: string;
  package_title: string;
  package_group_id: string;
  package_group_title: string;
  package_weeks: string;
  package_price_label: string | null;
  pregnancy_mode: string;
  pregnancy_multiple: string;
  due_date: string | null;
  cycle_date: string | null;
  manual_weeks_due: number | null;
  manual_days_due: number | null;
  gestation_weeks: number;
  gestation_days: number;
  location_id: string;
  location_label: string;
  appointment_date: string;
  appointment_time: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address_line1: string;
  customer_town_or_city: string;
  customer_postcode: string;
  customer_date_of_birth: string;
  customer_notes: string | null;
  booking_status: AdminBookingStatus;
  payment_status: AdminPaymentStatus;
  deposit_amount_pence: number;
  deposit_currency: string;
  created_at: string;
  updated_at: string;
};

type ContactMessageRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  message: string | null;
  status: "new" | "read" | "archived";
  created_at: string;
  updated_at: string;
};

export type CreateContactMessageInput = {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  message?: string;
};

export type ContactMessageRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  message: string | null;
  status: "new" | "read" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type AdminBookingRecord = {
  id: number;
  reference: string;
  service: string;
  packageId: string;
  packageTitle: string;
  packageGroupId: string;
  packageGroupTitle: string;
  packageWeeks: string;
  packagePriceLabel: string | null;
  pregnancyMode: string;
  pregnancyMultiple: string;
  dueDate: string | null;
  cycleDate: string | null;
  manualWeeksDue: number | null;
  manualDaysDue: number | null;
  gestationWeeks: number;
  gestationDays: number;
  locationId: string;
  locationLabel: string;
  appointmentDate: string;
  appointmentTime: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddressLine1: string;
  customerTownOrCity: string;
  customerPostcode: string;
  customerDateOfBirth: string;
  customerNotes: string | null;
  bookingStatus: AdminBookingStatus;
  paymentStatus: AdminPaymentStatus;
  depositAmountPence: number;
  depositCurrency: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminMetrics = {
  totalBookings: number;
  upcomingAppointments: number;
  todayAppointments: number;
  paidDeposits: number;
  totalMessages: number;
  newMessages: number;
};

function nowIso() {
  return new Date().toISOString();
}

function mapContactMessage(row: ContactMessageRow): ContactMessageRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    preferredDate: row.preferred_date,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdminBooking(row: AdminBookingRow): AdminBookingRecord {
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
    pregnancyMode: row.pregnancy_mode,
    pregnancyMultiple: row.pregnancy_multiple,
    dueDate: row.due_date,
    cycleDate: row.cycle_date,
    manualWeeksDue: row.manual_weeks_due,
    manualDaysDue: row.manual_days_due,
    gestationWeeks: row.gestation_weeks,
    gestationDays: row.gestation_days,
    locationId: row.location_id,
    locationLabel: row.location_label,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    customerFirstName: row.customer_first_name,
    customerLastName: row.customer_last_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerAddressLine1: row.customer_address_line1,
    customerTownOrCity: row.customer_town_or_city,
    customerPostcode: row.customer_postcode,
    customerDateOfBirth: row.customer_date_of_birth,
    customerNotes: row.customer_notes,
    bookingStatus: row.booking_status,
    paymentStatus: row.payment_status,
    depositAmountPence: row.deposit_amount_pence,
    depositCurrency: row.deposit_currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createContactMessage(input: CreateContactMessageInput) {
  const database = getDatabase();
  const createdAt = nowIso();
  database
    .prepare(
      `INSERT INTO contact_messages (
        name,
        email,
        phone,
        preferred_date,
        message,
        status,
        raw_payload,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.name,
      input.email,
      input.phone,
      input.preferredDate,
      input.message?.trim() || null,
      "new",
      JSON.stringify(input),
      createdAt,
      createdAt,
    );
}

export function listContactMessages(limit = 100) {
  const rows = getDatabase()
    .prepare(
      `SELECT id, name, email, phone, preferred_date, message, status, created_at, updated_at
       FROM contact_messages
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(limit) as ContactMessageRow[];

  return rows.map(mapContactMessage);
}

export function listAdminBookings(options?: {
  limit?: number;
  fromDate?: string;
  toDate?: string;
  sortDirection?: "asc" | "desc";
}) {
  const { limit = 100, fromDate, toDate, sortDirection = "asc" } = options ?? {};
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (fromDate) {
    clauses.push("appointment_date >= ?");
    params.push(fromDate);
  }

  if (toDate) {
    clauses.push("appointment_date <= ?");
    params.push(toDate);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const orderDirection = sortDirection === "desc" ? "DESC" : "ASC";
  const rows = getDatabase()
    .prepare(
      `SELECT
        id,
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
        created_at,
        updated_at
       FROM bookings
       ${whereClause}
       ORDER BY appointment_date ${orderDirection}, appointment_time ${orderDirection}, created_at DESC
       LIMIT ?`
    )
    .all(...params, limit) as AdminBookingRow[];

  return rows.map(mapAdminBooking);
}

export function getAdminBookingByReference(reference: string) {
  const row = getDatabase()
    .prepare(
      `SELECT
        id,
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
        created_at,
        updated_at
       FROM bookings
       WHERE reference = ?`
    )
    .get(reference) as AdminBookingRow | undefined;

  return row ? mapAdminBooking(row) : null;
}

export function getAdminMetrics() {
  const today = new Date().toISOString().slice(0, 10);
  const row = getDatabase()
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE appointment_date >= ?) AS upcoming_appointments,
        (SELECT COUNT(*) FROM bookings WHERE appointment_date = ?) AS today_appointments,
        (SELECT COUNT(*) FROM bookings WHERE payment_status = 'paid') AS paid_deposits,
        (SELECT COUNT(*) FROM contact_messages) AS total_messages,
        (SELECT COUNT(*) FROM contact_messages WHERE status = 'new') AS new_messages`
    )
    .get(today, today) as {
    total_bookings: number;
    upcoming_appointments: number;
    today_appointments: number;
    paid_deposits: number;
    total_messages: number;
    new_messages: number;
  };

  return {
    totalBookings: row.total_bookings,
    upcomingAppointments: row.upcoming_appointments,
    todayAppointments: row.today_appointments,
    paidDeposits: row.paid_deposits,
    totalMessages: row.total_messages,
    newMessages: row.new_messages,
  } satisfies AdminMetrics;
}
