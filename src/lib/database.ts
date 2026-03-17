import postgres from "postgres";
import type { Sql } from "postgres";

declare global {
  var __babySonovueDatabase: Sql | undefined;
  var __babySonovueSchemaPromise: Promise<void> | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL");
  }
  return databaseUrl;
}

function createClient() {
  const databaseUrl = getDatabaseUrl();
  const isLocal = /localhost|127\.0\.0\.1/.test(databaseUrl);

  return postgres(databaseUrl, {
    prepare: false,
    max: 1,
    ssl: isLocal ? false : "require",
  });
}

async function ensureDatabaseSchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      service TEXT NOT NULL,
      package_id TEXT NOT NULL,
      package_title TEXT NOT NULL,
      package_group_id TEXT NOT NULL,
      package_group_title TEXT NOT NULL,
      package_weeks TEXT NOT NULL,
      package_price_label TEXT,
      pregnancy_mode TEXT NOT NULL,
      pregnancy_multiple TEXT NOT NULL,
      due_date TEXT,
      cycle_date TEXT,
      manual_weeks_due INTEGER,
      manual_days_due INTEGER,
      gestation_weeks INTEGER NOT NULL,
      gestation_days INTEGER NOT NULL,
      location_id TEXT NOT NULL,
      location_label TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      customer_first_name TEXT NOT NULL,
      customer_last_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address_line1 TEXT NOT NULL,
      customer_town_or_city TEXT NOT NULL,
      customer_postcode TEXT NOT NULL,
      customer_date_of_birth TEXT NOT NULL,
      customer_notes TEXT,
      booking_status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      deposit_amount_pence INTEGER NOT NULL,
      deposit_currency TEXT NOT NULL,
      stripe_checkout_session_id TEXT,
      stripe_payment_intent_id TEXT,
      stripe_payment_status TEXT,
      raw_payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS booking_events (
      id SERIAL PRIMARY KEY,
      booking_reference TEXT NOT NULL REFERENCES bookings(reference) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      event_payload TEXT,
      created_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS processed_webhooks (
      event_id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS booking_notifications (
      booking_reference TEXT NOT NULL REFERENCES bookings(reference) ON DELETE CASCADE,
      notification_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (booking_reference, notification_type)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL,
      raw_payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      session_token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON bookings(stripe_checkout_session_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_booking_events_reference ON booking_events(booking_reference)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_booking_notifications_reference ON booking_notifications(booking_reference)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(session_token_hash)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id)`;
}

export async function getDatabase() {
  if (!globalThis.__babySonovueDatabase) {
    globalThis.__babySonovueDatabase = createClient();
  }

  if (!globalThis.__babySonovueSchemaPromise) {
    globalThis.__babySonovueSchemaPromise = ensureDatabaseSchema(globalThis.__babySonovueDatabase);
  }

  await globalThis.__babySonovueSchemaPromise;
  return globalThis.__babySonovueDatabase;
}
