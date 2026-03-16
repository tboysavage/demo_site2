import nodemailer from "nodemailer";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";
import type { AdminBookingRecord } from "@/lib/admin-data";
import { formatCurrencyFromPence } from "@/lib/booking-config";
import { adminDateFormatter, formatPregnancySummary, formatServiceLabel } from "@/lib/admin-format";

declare global {
  var __babySonovueMailTransporter:
    | ReturnType<typeof nodemailer.createTransport>
    | undefined;
}

function parsePort(rawValue: string | undefined) {
  const parsed = Number.parseInt(rawValue ?? "", 10);
  return Number.isNaN(parsed) ? 587 : parsed;
}

function parseSecure(rawValue: string | undefined, port: number) {
  if (!rawValue) {
    return port === 465;
  }

  return rawValue === "true";
}

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = parsePort(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || clinicUltrasoundScansContent.brand.email;
  const to = process.env.BOOKING_NOTIFICATION_EMAIL || clinicUltrasoundScansContent.brand.email;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  }

  return {
    host,
    port,
    secure: parseSecure(process.env.SMTP_SECURE, port),
    user,
    pass,
    from,
    to,
  };
}

function getTransporter() {
  if (globalThis.__babySonovueMailTransporter) {
    return globalThis.__babySonovueMailTransporter;
  }

  const config = getMailConfig();
  globalThis.__babySonovueMailTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return globalThis.__babySonovueMailTransporter;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildBookingNotificationText(booking: AdminBookingRecord) {
  return [
    "A new appointment has been booked and the deposit has been paid.",
    "",
    `Reference: ${booking.reference}`,
    `Patient: ${booking.customerFirstName} ${booking.customerLastName}`,
    `Service: ${formatServiceLabel(booking.service)}`,
    `Package: ${booking.packageTitle}`,
    `Package group: ${booking.packageGroupTitle}`,
    `Appointment: ${adminDateFormatter.format(new Date(`${booking.appointmentDate}T00:00:00`))} at ${booking.appointmentTime}`,
    `Location: ${booking.locationLabel}`,
    `Deposit paid: ${formatCurrencyFromPence(booking.depositAmountPence, booking.depositCurrency)}`,
    "",
    "Patient contact details",
    `Phone: ${booking.customerPhone}`,
    `Email: ${booking.customerEmail}`,
    `Date of birth: ${adminDateFormatter.format(new Date(`${booking.customerDateOfBirth}T00:00:00`))}`,
    `Address: ${booking.customerAddressLine1}, ${booking.customerTownOrCity}, ${booking.customerPostcode}`,
    "",
    "Pregnancy / clinical details",
    formatPregnancySummary(booking),
    "",
    `Notes: ${booking.customerNotes?.trim() || "No patient notes were provided."}`,
  ].join("\n");
}

function buildBookingNotificationHtml(booking: AdminBookingRecord) {
  const noteText = booking.customerNotes?.trim() || "No patient notes were provided.";

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">New appointment booked</h2>
      <p style="margin-top: 0;">A new appointment has been booked and the deposit has been paid.</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
        <tbody>
          <tr><td style="padding: 6px 0; font-weight: 700;">Reference</td><td style="padding: 6px 0;">${escapeHtml(booking.reference)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Patient</td><td style="padding: 6px 0;">${escapeHtml(`${booking.customerFirstName} ${booking.customerLastName}`)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Service</td><td style="padding: 6px 0;">${escapeHtml(formatServiceLabel(booking.service))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Package</td><td style="padding: 6px 0;">${escapeHtml(booking.packageTitle)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Appointment</td><td style="padding: 6px 0;">${escapeHtml(adminDateFormatter.format(new Date(`${booking.appointmentDate}T00:00:00`)))} at ${escapeHtml(booking.appointmentTime)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Location</td><td style="padding: 6px 0;">${escapeHtml(booking.locationLabel)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Deposit paid</td><td style="padding: 6px 0;">${escapeHtml(formatCurrencyFromPence(booking.depositAmountPence, booking.depositCurrency))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Phone</td><td style="padding: 6px 0;">${escapeHtml(booking.customerPhone)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Email</td><td style="padding: 6px 0;">${escapeHtml(booking.customerEmail)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Date of birth</td><td style="padding: 6px 0;">${escapeHtml(adminDateFormatter.format(new Date(`${booking.customerDateOfBirth}T00:00:00`)))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Address</td><td style="padding: 6px 0;">${escapeHtml(`${booking.customerAddressLine1}, ${booking.customerTownOrCity}, ${booking.customerPostcode}`)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Pregnancy / clinical</td><td style="padding: 6px 0;">${escapeHtml(formatPregnancySummary(booking))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Notes</td><td style="padding: 6px 0;">${escapeHtml(noteText)}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

export async function sendNewAppointmentNotification(booking: AdminBookingRecord) {
  const config = getMailConfig();
  const transporter = getTransporter();
  const patientName = `${booking.customerFirstName} ${booking.customerLastName}`;

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: booking.customerEmail,
    subject: `New booking: ${patientName} on ${booking.appointmentDate} at ${booking.appointmentTime}`,
    text: buildBookingNotificationText(booking),
    html: buildBookingNotificationHtml(booking),
  });
}
