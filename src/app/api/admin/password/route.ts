import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  MIN_ADMIN_PASSWORD_LENGTH,
  getAdminSession,
  updateAdminPassword,
} from "@/lib/admin-auth";

function redirectWithStatus(request: Request, status: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("security", status);
  url.hash = "security";
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return redirectWithStatus(request, "password-mismatch");
  }

  if (newPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return redirectWithStatus(request, "password-too-short");
  }

  const cookieStore = await cookies();
  const currentSessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const result = await updateAdminPassword(
    session.userId,
    currentPassword,
    newPassword,
    currentSessionToken,
  );

  if (result === "updated") {
    return redirectWithStatus(request, "password-saved");
  }

  if (result === "same-password") {
    return redirectWithStatus(request, "password-same");
  }

  return redirectWithStatus(request, "password-invalid-current");
}
