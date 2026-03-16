import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const databasePath = join(process.cwd(), "data", "bookings.sqlite");

declare global {
  var __babySonovueDatabase: DatabaseSync | undefined;
}

function ensureDatabaseSchema(database: DatabaseSync) {
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      );

      CREATE TABLE IF NOT EXISTS booking_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_reference TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_payload TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (booking_reference) REFERENCES bookings(reference) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS processed_webhooks (
        event_id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS booking_notifications (
        booking_reference TEXT NOT NULL,
        notification_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (booking_reference, notification_type),
        FOREIGN KEY (booking_reference) REFERENCES bookings(reference) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        preferred_date TEXT NOT NULL,
        message TEXT,
        status TEXT NOT NULL,
        raw_payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference);
      CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON bookings(stripe_checkout_session_id);
      CREATE INDEX IF NOT EXISTS idx_booking_events_reference ON booking_events(booking_reference);
      CREATE INDEX IF NOT EXISTS idx_booking_notifications_reference ON booking_notifications(booking_reference);
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
    `);
}

export function getDatabase() {
  if (!globalThis.__babySonovueDatabase) {
    mkdirSync(dirname(databasePath), { recursive: true });
    globalThis.__babySonovueDatabase = new DatabaseSync(databasePath);
  }

  ensureDatabaseSchema(globalThis.__babySonovueDatabase);

  return globalThis.__babySonovueDatabase;
}
