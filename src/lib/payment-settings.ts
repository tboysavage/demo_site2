import {
  DEFAULT_DEPOSIT_AMOUNT_PENCE,
  DEFAULT_CURRENCY,
  formatCurrencyFromPence,
} from "@/lib/booking-config";
import { getDatabase } from "@/lib/database";

const DEPOSIT_AMOUNT_KEY = "booking_deposit_amount_pence";

type StripeKeyStatus = {
  configured: boolean;
  maskedValue: string;
};

export type PaymentSettings = {
  depositAmountPence: number;
  depositAmountLabel: string;
  currency: string;
  stripe: {
    publishableKey: StripeKeyStatus;
    secretKey: StripeKeyStatus;
    webhookSecret: StripeKeyStatus;
  };
};

function parsePositiveInteger(rawValue: string | null | undefined) {
  if (!rawValue) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getEnvDepositAmountPence() {
  return parsePositiveInteger(process.env.BOOKING_DEPOSIT_AMOUNT_PENCE) ?? DEFAULT_DEPOSIT_AMOUNT_PENCE;
}

function maskValue(rawValue: string | undefined) {
  if (!rawValue) {
    return "Not configured";
  }

  if (rawValue.length <= 12) {
    return "Configured";
  }

  return `${rawValue.slice(0, 8)}...${rawValue.slice(-4)}`;
}

function getStripeKeyStatus(rawValue: string | undefined): StripeKeyStatus {
  return {
    configured: Boolean(rawValue),
    maskedValue: maskValue(rawValue),
  };
}

export function getConfiguredDepositAmountPence() {
  const row = getDatabase()
    .prepare("SELECT value FROM app_settings WHERE key = ?")
    .get(DEPOSIT_AMOUNT_KEY) as { value: string } | undefined;

  return parsePositiveInteger(row?.value) ?? getEnvDepositAmountPence();
}

export function updateConfiguredDepositAmountPence(amountPence: number) {
  const updatedAt = new Date().toISOString();
  getDatabase()
    .prepare(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .run(DEPOSIT_AMOUNT_KEY, String(amountPence), updatedAt);
}

export function getPaymentSettings(): PaymentSettings {
  const depositAmountPence = getConfiguredDepositAmountPence();

  return {
    depositAmountPence,
    depositAmountLabel: formatCurrencyFromPence(depositAmountPence, DEFAULT_CURRENCY),
    currency: DEFAULT_CURRENCY,
    stripe: {
      publishableKey: getStripeKeyStatus(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      secretKey: getStripeKeyStatus(process.env.STRIPE_SECRET_KEY),
      webhookSecret: getStripeKeyStatus(process.env.STRIPE_WEBHOOK_SECRET),
    },
  };
}
