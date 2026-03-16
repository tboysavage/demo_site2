import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { updateConfiguredDepositAmountPence } from "@/lib/payment-settings";

function redirectWithStatus(request: Request, status: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("settings", status);
  url.hash = "payments";
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const rawDepositAmount = String(formData.get("depositAmountGBP") ?? "").trim();
  const parsedAmount = Number.parseFloat(rawDepositAmount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return redirectWithStatus(request, "payment-error");
  }

  updateConfiguredDepositAmountPence(Math.round(parsedAmount * 100));
  return redirectWithStatus(request, "payment-saved");
}
