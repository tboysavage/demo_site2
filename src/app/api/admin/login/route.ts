import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminSessionCookieOptions,
  hasAdminAuthConfig,
  validateAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const loginUrl = new URL("/admin/login", request.url);

  if (!(await hasAdminAuthConfig())) {
    loginUrl.searchParams.set("error", "not-configured");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const user = await validateAdminCredentials(username, password);
  if (!user) {
    loginUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createAdminSession(user.id),
    getAdminSessionCookieOptions(),
  );
  return response;
}
