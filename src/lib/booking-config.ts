export const DEFAULT_DEPOSIT_AMOUNT_PENCE = 2500;
export const DEFAULT_CURRENCY = "gbp";

export function getDepositAmountPence() {
  const rawValue = process.env.BOOKING_DEPOSIT_AMOUNT_PENCE;
  if (!rawValue) return DEFAULT_DEPOSIT_AMOUNT_PENCE;

  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_DEPOSIT_AMOUNT_PENCE;
  }

  return parsed;
}

export function formatCurrencyFromPence(amountPence: number, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountPence / 100);
}
