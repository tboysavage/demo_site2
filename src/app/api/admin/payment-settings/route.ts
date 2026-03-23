import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { addAdminActivityLog } from "@/lib/admin-data";
import {
  MAX_BOOKING_DEPOSIT_AMOUNT_PENCE,
  MIN_BOOKING_DEPOSIT_AMOUNT_PENCE,
  updateConfiguredDepositAmountPence,
} from "@/lib/payment-settings";

export const runtime = "nodejs";

function redirectWithStatus(request: Request, status: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("tab", "settings");
  url.searchParams.set("settings", status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const rawDepositAmount = String(formData.get("depositAmountGBP") ?? "").trim();
  const parsedAmount = Number.parseFloat(rawDepositAmount);
  const confirmChange = String(formData.get("confirmDepositChange") ?? "") === "yes";

  if (!confirmChange) {
    return redirectWithStatus(request, "payment-confirmation-required");
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return redirectWithStatus(request, "payment-error");
  }

  const amountPence = Math.round(parsedAmount * 100);
  if (
    amountPence < MIN_BOOKING_DEPOSIT_AMOUNT_PENCE ||
    amountPence > MAX_BOOKING_DEPOSIT_AMOUNT_PENCE
  ) {
    return redirectWithStatus(request, "payment-out-of-range");
  }

  await updateConfiguredDepositAmountPence(amountPence);
  await addAdminActivityLog({
    actorUserId: session.userId,
    actionType: "deposit_amount_updated",
    targetType: "payment_settings",
    targetId: "booking_deposit_amount_pence",
    message: `Updated booking deposit amount to £${(amountPence / 100).toFixed(2)}.`,
    details: JSON.stringify({ amountPence }),
  });
  return redirectWithStatus(request, "payment-saved");
}
