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

type BookingNotificationStage = "request_received" | "deposit_paid";

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  clinicTo: string;
};

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

function getMailConfig(): MailConfig {
  const host = process.env.SMTP_HOST;
  const port = parsePort(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || clinicUltrasoundScansContent.brand.email;
  const clinicTo =
    process.env.BOOKING_NOTIFICATION_EMAIL || clinicUltrasoundScansContent.brand.email;

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
    clinicTo,
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

function getAppointmentSummary(booking: AdminBookingRecord) {
  return `${adminDateFormatter.format(new Date(`${booking.appointmentDate}T00:00:00`))} at ${booking.appointmentTime}`;
}

function getClinicMessage(stage: BookingNotificationStage) {
  if (stage === "deposit_paid") {
    return {
      subjectPrefix: "New paid booking",
      heading: "New appointment booked",
      intro: "A new appointment has been booked and the deposit has been paid.",
      depositLabel: "Deposit paid",
      notesLine:
        "Full patient address, date of birth, and any detailed notes should be reviewed in the admin portal.",
    };
  }

  return {
    subjectPrefix: "New booking request",
    heading: "New booking request received",
    intro:
      "A new booking request has been submitted. The patient has not completed the deposit yet.",
    depositLabel: "Deposit amount due",
    notesLine:
      "Use the admin portal to monitor whether the patient completes the deposit and to review full patient details if needed.",
  };
}

function getCustomerMessage(stage: BookingNotificationStage) {
  const brand = clinicUltrasoundScansContent.brand;

  if (stage === "deposit_paid") {
    return {
      subjectPrefix: "Deposit received",
      heading: `Your deposit has been received by ${brand.name}`,
      intro:
        "We have received your deposit. Your booking is now in our confirmation queue and the clinic will contact you if anything else is needed.",
      statusLine: "Your booking is not automatically confirmed until the clinic finishes reviewing it.",
      nextSteps:
        "Keep this email for your records. If you need to change anything, reply to this email or contact the clinic directly.",
      depositLabel: "Deposit paid today",
    };
  }

  return {
    subjectPrefix: "Booking request received",
    heading: `Your booking request has been received by ${brand.name}`,
    intro:
      "We have received your booking request. Your appointment is not confirmed until your deposit is completed and the clinic has reviewed the booking.",
    statusLine: "If you close the payment page before paying, the clinic still has your request details.",
    nextSteps:
      "You can complete the deposit from the Stripe checkout page. If you need help, contact the clinic directly.",
    depositLabel: "Deposit due",
  };
}

function buildClinicNotificationText(booking: AdminBookingRecord, stage: BookingNotificationStage) {
  const copy = getClinicMessage(stage);

  return [
    copy.intro,
    "",
    `Reference: ${booking.reference}`,
    `Patient: ${booking.customerFirstName} ${booking.customerLastName}`,
    `Service: ${formatServiceLabel(booking.service)}`,
    `Package: ${booking.packageTitle}`,
    `Package group: ${booking.packageGroupTitle}`,
    `Appointment: ${getAppointmentSummary(booking)}`,
    `Location: ${booking.locationLabel}`,
    `${copy.depositLabel}: ${formatCurrencyFromPence(booking.depositAmountPence, booking.depositCurrency)}`,
    "",
    "Patient contact details",
    `Phone: ${booking.customerPhone}`,
    `Email: ${booking.customerEmail}`,
    "",
    "Pregnancy / clinical details",
    formatPregnancySummary(booking),
    "",
    `Notes provided: ${booking.customerNotes?.trim() ? "Yes - review in the admin portal." : "No patient notes were provided."}`,
    copy.notesLine,
  ].join("\n");
}

function buildClinicNotificationHtml(booking: AdminBookingRecord, stage: BookingNotificationStage) {
  const copy = getClinicMessage(stage);

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">${escapeHtml(copy.heading)}</h2>
      <p style="margin-top: 0;">${escapeHtml(copy.intro)}</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
        <tbody>
          <tr><td style="padding: 6px 0; font-weight: 700;">Reference</td><td style="padding: 6px 0;">${escapeHtml(booking.reference)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Patient</td><td style="padding: 6px 0;">${escapeHtml(`${booking.customerFirstName} ${booking.customerLastName}`)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Service</td><td style="padding: 6px 0;">${escapeHtml(formatServiceLabel(booking.service))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Package</td><td style="padding: 6px 0;">${escapeHtml(booking.packageTitle)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Appointment</td><td style="padding: 6px 0;">${escapeHtml(getAppointmentSummary(booking))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Location</td><td style="padding: 6px 0;">${escapeHtml(booking.locationLabel)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">${escapeHtml(copy.depositLabel)}</td><td style="padding: 6px 0;">${escapeHtml(formatCurrencyFromPence(booking.depositAmountPence, booking.depositCurrency))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Phone</td><td style="padding: 6px 0;">${escapeHtml(booking.customerPhone)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Email</td><td style="padding: 6px 0;">${escapeHtml(booking.customerEmail)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Pregnancy / clinical</td><td style="padding: 6px 0;">${escapeHtml(formatPregnancySummary(booking))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Notes</td><td style="padding: 6px 0;">${escapeHtml(booking.customerNotes?.trim() ? "Notes were provided. Review them in the admin portal." : "No patient notes were provided.")}</td></tr>
        </tbody>
      </table>
      <p style="margin-top: 16px;">${escapeHtml(copy.notesLine)}</p>
    </div>
  `;
}

function buildCustomerNotificationText(
  booking: AdminBookingRecord,
  stage: BookingNotificationStage,
) {
  const copy = getCustomerMessage(stage);
  const brand = clinicUltrasoundScansContent.brand;

  return [
    `Hello ${booking.customerFirstName},`,
    "",
    copy.intro,
    copy.statusLine,
    "",
    `Reference: ${booking.reference}`,
    `Package: ${booking.packageTitle}`,
    `Service: ${formatServiceLabel(booking.service)}`,
    `Appointment request: ${getAppointmentSummary(booking)}`,
    `Location: ${booking.locationLabel}`,
    `${copy.depositLabel}: ${formatCurrencyFromPence(booking.depositAmountPence, booking.depositCurrency)}`,
    "",
    copy.nextSteps,
    "",
    `${brand.name}`,
    `Phone: ${brand.phone}`,
    `Email: ${brand.email}`,
  ].join("\n");
}

function buildCustomerNotificationHtml(
  booking: AdminBookingRecord,
  stage: BookingNotificationStage,
) {
  const copy = getCustomerMessage(stage);
  const brand = clinicUltrasoundScansContent.brand;

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <p>Hello ${escapeHtml(booking.customerFirstName)},</p>
      <h2 style="margin-bottom: 8px;">${escapeHtml(copy.heading)}</h2>
      <p>${escapeHtml(copy.intro)}</p>
      <p>${escapeHtml(copy.statusLine)}</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
        <tbody>
          <tr><td style="padding: 6px 0; font-weight: 700;">Reference</td><td style="padding: 6px 0;">${escapeHtml(booking.reference)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Package</td><td style="padding: 6px 0;">${escapeHtml(booking.packageTitle)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Service</td><td style="padding: 6px 0;">${escapeHtml(formatServiceLabel(booking.service))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Appointment request</td><td style="padding: 6px 0;">${escapeHtml(getAppointmentSummary(booking))}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Location</td><td style="padding: 6px 0;">${escapeHtml(booking.locationLabel)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">${escapeHtml(copy.depositLabel)}</td><td style="padding: 6px 0;">${escapeHtml(formatCurrencyFromPence(booking.depositAmountPence, booking.depositCurrency))}</td></tr>
        </tbody>
      </table>
      <p style="margin-top: 16px;">${escapeHtml(copy.nextSteps)}</p>
      <p style="margin-top: 16px;">
        ${escapeHtml(brand.name)}<br />
        Phone: ${escapeHtml(brand.phone)}<br />
        Email: ${escapeHtml(brand.email)}
      </p>
    </div>
  `;
}

async function sendClinicNotification(
  booking: AdminBookingRecord,
  stage: BookingNotificationStage,
) {
  const config = getMailConfig();
  const transporter = getTransporter();
  const patientName = `${booking.customerFirstName} ${booking.customerLastName}`;
  const copy = getClinicMessage(stage);

  await transporter.sendMail({
    from: config.from,
    to: config.clinicTo,
    replyTo: booking.customerEmail,
    subject: `${copy.subjectPrefix}: ${patientName} on ${booking.appointmentDate} at ${booking.appointmentTime}`,
    text: buildClinicNotificationText(booking, stage),
    html: buildClinicNotificationHtml(booking, stage),
  });
}

async function sendCustomerNotification(
  booking: AdminBookingRecord,
  stage: BookingNotificationStage,
) {
  const config = getMailConfig();
  const transporter = getTransporter();
  const copy = getCustomerMessage(stage);

  await transporter.sendMail({
    from: config.from,
    to: booking.customerEmail,
    replyTo: clinicUltrasoundScansContent.brand.email,
    subject: `${copy.subjectPrefix}: ${booking.packageTitle} on ${booking.appointmentDate}`,
    text: buildCustomerNotificationText(booking, stage),
    html: buildCustomerNotificationHtml(booking, stage),
  });
}

export async function sendBookingRequestNotification(booking: AdminBookingRecord) {
  await sendClinicNotification(booking, "request_received");
}

export async function sendBookingRequestCustomerNotification(booking: AdminBookingRecord) {
  await sendCustomerNotification(booking, "request_received");
}

export async function sendNewAppointmentNotification(booking: AdminBookingRecord) {
  await sendClinicNotification(booking, "deposit_paid");
}

export async function sendNewAppointmentCustomerNotification(booking: AdminBookingRecord) {
  await sendCustomerNotification(booking, "deposit_paid");
}
