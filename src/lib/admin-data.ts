import { getClinicTodayDate } from "@/lib/clinic-time";
import { getDatabase } from "@/lib/database";

export type AdminBookingStatus =
  | "awaiting_deposit"
  | "pending_confirmation"
  | "deposit_expired"
  | "deposit_failed"
  | "confirmed"
  | "cancelled";

export type AdminPaymentStatus = "pending" | "paid" | "expired" | "failed";
export type ContactMessageStatus = "new" | "read" | "archived";

export const ACTIONABLE_BOOKING_STATUSES: readonly AdminBookingStatus[] = [
  "pending_confirmation",
  "confirmed",
];
export const REQUEST_BOOKING_STATUSES: readonly AdminBookingStatus[] = [
  "awaiting_deposit",
  "deposit_expired",
  "deposit_failed",
];

export const ACTIONABLE_PAYMENT_STATUSES: readonly AdminPaymentStatus[] = ["paid"];

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
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
};

type AdminUserRow = {
  id: number;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

type AdminActivityRow = {
  id: number;
  actor_user_id: number | null;
  actor_username: string | null;
  action_type: string;
  target_type: string;
  target_id: string | null;
  message: string;
  details: string | null;
  created_at: string;
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
  status: ContactMessageStatus;
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
  totalRequests: number;
  pendingDepositRequests: number;
  awaitingConfirmation: number;
  confirmedUpcoming: number;
  todayAppointments: number;
  newMessages: number;
  paidDepositAmountPence: number;
};

export type AdminUserRecord = {
  id: number;
  username: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type AdminActivityRecord = {
  id: number;
  actorUserId: number | null;
  actorUsername: string | null;
  actionType: string;
  targetType: string;
  targetId: string | null;
  message: string;
  details: string | null;
  createdAt: string;
};

export type BookingQueryOptions = {
  limit?: number;
  offset?: number;
  fromDate?: string;
  toDate?: string;
  sortDirection?: "asc" | "desc";
  services?: readonly string[];
  bookingStatuses?: readonly AdminBookingStatus[];
  paymentStatuses?: readonly AdminPaymentStatus[];
  search?: string;
};

export type ContactMessageQueryOptions = {
  limit?: number;
  offset?: number;
  statuses?: readonly ContactMessageStatus[];
  search?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function mapContactMessage(row: ContactMessageRow): ContactMessageRecord {
  return {
    id: Number(row.id),
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
    id: Number(row.id),
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
    manualWeeksDue: row.manual_weeks_due === null ? null : Number(row.manual_weeks_due),
    manualDaysDue: row.manual_days_due === null ? null : Number(row.manual_days_due),
    gestationWeeks: Number(row.gestation_weeks),
    gestationDays: Number(row.gestation_days),
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
    depositAmountPence: Number(row.deposit_amount_pence),
    depositCurrency: row.deposit_currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdminUser(row: AdminUserRow): AdminUserRecord {
  return {
    id: Number(row.id),
    username: row.username,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

function mapAdminActivity(row: AdminActivityRow): AdminActivityRecord {
  return {
    id: Number(row.id),
    actorUserId: row.actor_user_id === null ? null : Number(row.actor_user_id),
    actorUsername: row.actor_username,
    actionType: row.action_type,
    targetType: row.target_type,
    targetId: row.target_id,
    message: row.message,
    details: row.details,
    createdAt: row.created_at,
  };
}

function appendArrayClause<T extends string>(
  clauses: string[],
  params: (string | number)[],
  column: string,
  values: readonly T[] | undefined,
) {
  if (!values?.length) {
    return;
  }

  const placeholders = values.map((value) => {
    params.push(value);
    return `$${params.length}`;
  });

  clauses.push(`${column} IN (${placeholders.join(", ")})`);
}

function buildBookingWhereClause(options: BookingQueryOptions) {
  const { fromDate, toDate, services, bookingStatuses, paymentStatuses, search } = options;
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (fromDate) {
    clauses.push(`appointment_date >= $${params.length + 1}`);
    params.push(fromDate);
  }

  if (toDate) {
    clauses.push(`appointment_date <= $${params.length + 1}`);
    params.push(toDate);
  }

  appendArrayClause(clauses, params, "service", services);
  appendArrayClause(clauses, params, "booking_status", bookingStatuses);
  appendArrayClause(clauses, params, "payment_status", paymentStatuses);

  if (search?.trim()) {
    const pattern = `%${search.trim()}%`;
    const fields = [
      "reference",
      "customer_first_name",
      "customer_last_name",
      "customer_email",
      "customer_phone",
      "package_title",
      "location_label",
    ];
    const searchClauses = fields.map((field) => {
      params.push(pattern);
      return `${field} ILIKE $${params.length}`;
    });
    clauses.push(`(${searchClauses.join(" OR ")})`);
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

function buildContactMessageWhereClause(options: ContactMessageQueryOptions) {
  const { statuses, search } = options;
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  appendArrayClause(clauses, params, "status", statuses);

  if (search?.trim()) {
    const pattern = `%${search.trim()}%`;
    const fields = ["name", "email", "phone", "preferred_date", "message"];
    const searchClauses = fields.map((field) => {
      params.push(pattern);
      return `${field} ILIKE $${params.length}`;
    });
    clauses.push(`(${searchClauses.join(" OR ")})`);
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export async function addAdminActivityLog(input: {
  actorUserId?: number | null;
  actionType: string;
  targetType: string;
  targetId?: string | null;
  message: string;
  details?: string | null;
}) {
  const sql = await getDatabase();
  await sql`
    INSERT INTO admin_activity_log (
      actor_user_id,
      action_type,
      target_type,
      target_id,
      message,
      details,
      created_at
    ) VALUES (
      ${input.actorUserId ?? null},
      ${input.actionType},
      ${input.targetType},
      ${input.targetId ?? null},
      ${input.message},
      ${input.details ?? null},
      ${nowIso()}
    )
  `;
}

export async function listRecentAdminActivity(limit = 20) {
  const sql = await getDatabase();
  const rows = await sql<AdminActivityRow[]>`
    SELECT
      admin_activity_log.id,
      admin_activity_log.actor_user_id,
      admin_users.username AS actor_username,
      admin_activity_log.action_type,
      admin_activity_log.target_type,
      admin_activity_log.target_id,
      admin_activity_log.message,
      admin_activity_log.details,
      admin_activity_log.created_at
    FROM admin_activity_log
    LEFT JOIN admin_users ON admin_users.id = admin_activity_log.actor_user_id
    ORDER BY admin_activity_log.created_at DESC
    LIMIT ${limit}
  `;

  return rows.map(mapAdminActivity);
}

export async function createContactMessage(input: CreateContactMessageInput) {
  const sql = await getDatabase();
  const createdAt = nowIso();

  await sql`
    INSERT INTO contact_messages (
      name,
      email,
      phone,
      preferred_date,
      message,
      status,
      raw_payload,
      created_at,
      updated_at
    ) VALUES (
      ${input.name.trim()},
      ${input.email.trim().toLowerCase()},
      ${input.phone.trim()},
      ${input.preferredDate},
      ${input.message?.trim() || null},
      ${"new"},
      ${JSON.stringify(input)},
      ${createdAt},
      ${createdAt}
    )
  `;
}

export async function updateContactMessageStatus(params: {
  id: number;
  status: ContactMessageStatus;
  actorUserId?: number | null;
}) {
  const sql = await getDatabase();
  const updatedAt = nowIso();

  const rows = await sql<ContactMessageRow[]>`
    UPDATE contact_messages
    SET status = ${params.status}, updated_at = ${updatedAt}
    WHERE id = ${params.id}
    RETURNING id, name, email, phone, preferred_date, message, status, created_at, updated_at
  `;

  const row = rows[0];
  if (!row) {
    throw new Error("Message could not be updated.");
  }

  await addAdminActivityLog({
    actorUserId: params.actorUserId,
    actionType: "message_status_updated",
    targetType: "contact_message",
    targetId: String(params.id),
    message: `Marked message from ${row.name} as ${params.status}.`,
    details: JSON.stringify({ id: params.id, status: params.status }),
  });

  return mapContactMessage(row);
}

export async function listContactMessages(options?: ContactMessageQueryOptions) {
  const { limit = 100, offset = 0 } = options ?? {};
  const sql = await getDatabase();
  const { whereClause, params } = buildContactMessageWhereClause(options ?? {});

  const rows = await sql.unsafe<ContactMessageRow[]>(
    `SELECT id, name, email, phone, preferred_date, message, status, created_at, updated_at
     FROM contact_messages
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return rows.map(mapContactMessage);
}

export async function countContactMessages(options?: ContactMessageQueryOptions) {
  const sql = await getDatabase();
  const { whereClause, params } = buildContactMessageWhereClause(options ?? {});
  const rows = await sql.unsafe<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count
     FROM contact_messages
     ${whereClause}`,
    params,
  );

  return Number(rows[0]?.count ?? "0");
}

export async function listAdminBookings(options?: BookingQueryOptions) {
  const { limit = 100, offset = 0, sortDirection = "asc" } = options ?? {};
  const orderDirection = sortDirection === "desc" ? "DESC" : "ASC";
  const sql = await getDatabase();
  const { whereClause, params } = buildBookingWhereClause(options ?? {});

  const rows = await sql.unsafe<AdminBookingRow[]>(
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
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return rows.map(mapAdminBooking);
}

export async function countAdminBookings(options?: BookingQueryOptions) {
  const sql = await getDatabase();
  const { whereClause, params } = buildBookingWhereClause(options ?? {});
  const rows = await sql.unsafe<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count
     FROM bookings
     ${whereClause}`,
    params,
  );

  return Number(rows[0]?.count ?? "0");
}

export async function getAdminBookingByReference(reference: string) {
  const sql = await getDatabase();
  const rows = await sql<AdminBookingRow[]>`
    SELECT
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
    WHERE reference = ${reference}
    LIMIT 1
  `;

  return rows[0] ? mapAdminBooking(rows[0]) : null;
}

export async function listAdminUsers() {
  const sql = await getDatabase();
  const rows = await sql<AdminUserRow[]>`
    SELECT id, username, is_active, created_at, updated_at, last_login_at
    FROM admin_users
    ORDER BY username ASC
  `;

  return rows.map(mapAdminUser);
}

export async function listAdminUsersCount() {
  const sql = await getDatabase();
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM admin_users
    WHERE is_active = TRUE
  `;

  return Number(rows[0]?.count ?? "0");
}

export async function getAdminMetrics() {
  const today = getClinicTodayDate();
  const sql = await getDatabase();
  const rows = await sql<{
    total_requests: number;
    pending_deposit_requests: number;
    awaiting_confirmation: number;
    confirmed_upcoming: number;
    today_appointments: number;
    new_messages: number;
    paid_deposit_amount_pence: number | null;
  }[]>`
    SELECT
      (SELECT COUNT(*)::int FROM bookings) AS total_requests,
      (SELECT COUNT(*)::int FROM bookings WHERE booking_status = 'awaiting_deposit' AND appointment_date >= ${today}) AS pending_deposit_requests,
      (SELECT COUNT(*)::int FROM bookings WHERE booking_status = 'pending_confirmation' AND payment_status = 'paid' AND appointment_date >= ${today}) AS awaiting_confirmation,
      (SELECT COUNT(*)::int FROM bookings WHERE booking_status = 'confirmed' AND payment_status = 'paid' AND appointment_date >= ${today}) AS confirmed_upcoming,
      (SELECT COUNT(*)::int FROM bookings WHERE booking_status IN ('pending_confirmation', 'confirmed') AND payment_status = 'paid' AND appointment_date = ${today}) AS today_appointments,
      (SELECT COUNT(*)::int FROM contact_messages WHERE status = 'new') AS new_messages,
      (SELECT COALESCE(SUM(deposit_amount_pence), 0)::int FROM bookings WHERE payment_status = 'paid') AS paid_deposit_amount_pence
  `;

  const row = rows[0];
  return {
    totalRequests: Number(row?.total_requests ?? 0),
    pendingDepositRequests: Number(row?.pending_deposit_requests ?? 0),
    awaitingConfirmation: Number(row?.awaiting_confirmation ?? 0),
    confirmedUpcoming: Number(row?.confirmed_upcoming ?? 0),
    todayAppointments: Number(row?.today_appointments ?? 0),
    newMessages: Number(row?.new_messages ?? 0),
    paidDepositAmountPence: Number(row?.paid_deposit_amount_pence ?? 0),
  } satisfies AdminMetrics;
}
