import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminSessionCookieOptions,
  hasAdminAuthConfig,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import { checkRateLimit, getRequestIpAddress } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const loginUrl = new URL("/admin/login", request.url);
  const requestIp = getRequestIpAddress(request);
  const rateLimit = checkRateLimit({
    key: `admin-login:${requestIp}:${username || "unknown"}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    loginUrl.searchParams.set("error", "rate-limited");
    return NextResponse.redirect(loginUrl, {
      status: 303,
      headers: {
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    });
  }

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
