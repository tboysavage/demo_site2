import { createHmac, timingSafeEqual } from "node:crypto";
import { DEFAULT_CURRENCY } from "@/lib/booking-config";
import type { BookingRecord } from "@/lib/booking-db";
import { getConfiguredDepositAmountPence } from "@/lib/payment-settings";

type StripeCheckoutSession = {
  id: string;
  url: string | null;
  payment_status?: string;
  payment_intent?: string | null;
  metadata?: Record<string, string> | null;
};

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
};

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return secretKey;
}

function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return webhookSecret;
}

export function assertStripeServerConfig() {
  getStripeSecretKey();
  getStripeWebhookSecret();
}

export async function createDepositCheckoutSession(params: {
  booking: BookingRecord;
  customerEmail: string;
  origin: string;
}) {
  const depositAmountPence =
    params.booking.depositAmountPence || getConfiguredDepositAmountPence();
  const formData = new URLSearchParams();

  formData.append("mode", "payment");
  formData.append("payment_method_types[0]", "card");
  formData.append(
    "success_url",
    `${params.origin}/booking/success?reference=${encodeURIComponent(params.booking.reference)}&session_id={CHECKOUT_SESSION_ID}`,
  );
  formData.append(
    "cancel_url",
    `${params.origin}/booking/cancel?reference=${encodeURIComponent(params.booking.reference)}`,
  );
  formData.append("client_reference_id", params.booking.reference);
  formData.append("customer_email", params.customerEmail);
  formData.append("metadata[booking_reference]", params.booking.reference);
  formData.append("metadata[package_id]", params.booking.packageId);
  formData.append("payment_intent_data[metadata][booking_reference]", params.booking.reference);
  formData.append("line_items[0][quantity]", "1");
  formData.append("line_items[0][price_data][currency]", params.booking.depositCurrency || DEFAULT_CURRENCY);
  formData.append("line_items[0][price_data][unit_amount]", String(depositAmountPence));
  formData.append(
    "line_items[0][price_data][product_data][name]",
    `${params.booking.packageTitle} deposit`,
  );
  formData.append(
    "line_items[0][price_data][product_data][description]",
    `Deposit for booking ${params.booking.reference}`,
  );

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    const message =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : "Stripe checkout session creation failed.";
    throw new Error(message);
  }

  return payload as StripeCheckoutSession;
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  if (!signatureHeader) {
    throw new Error("Missing Stripe-Signature header");
  }

  const timestampPart = signatureHeader
    .split(",")
    .find((segment) => segment.startsWith("t="))
    ?.slice(2);
  const signatures = signatureHeader
    .split(",")
    .filter((segment) => segment.startsWith("v1="))
    .map((segment) => segment.slice(3));

  if (!timestampPart || signatures.length === 0) {
    throw new Error("Invalid Stripe-Signature header");
  }

  const timestamp = Number.parseInt(timestampPart, 10);
  if (Number.isNaN(timestamp)) {
    throw new Error("Invalid Stripe webhook timestamp");
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTimestamp - timestamp) > STRIPE_WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("Stripe webhook timestamp outside tolerance");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", getStripeWebhookSecret())
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const isValid = signatures.some((signature) => {
    const receivedBuffer = Buffer.from(signature, "utf8");
    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return timingSafeEqual(receivedBuffer, expectedBuffer);
  });

  if (!isValid) {
    throw new Error("Invalid Stripe webhook signature");
  }

  return JSON.parse(payload) as StripeEvent;
}
