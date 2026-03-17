import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { updateConfiguredDepositAmountPence } from "@/lib/payment-settings";

function redirectWithStatus(request: Request, status: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("settings", status);
  url.hash = "payments";
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const rawDepositAmount = String(formData.get("depositAmountGBP") ?? "").trim();
  const parsedAmount = Number.parseFloat(rawDepositAmount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return redirectWithStatus(request, "payment-error");
  }

  await updateConfiguredDepositAmountPence(Math.round(parsedAmount * 100));
  return redirectWithStatus(request, "payment-saved");
}
