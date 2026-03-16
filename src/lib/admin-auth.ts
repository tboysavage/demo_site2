import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "baby-sonovue-admin-session";

type AdminSession = {
  username: string;
};

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!username || !password || !secret) {
    return null;
  }

  return { username, password, secret };
}

function signUsername(username: string, secret: string) {
  return createHmac("sha256", secret).update(username).digest("hex");
}

function parseToken(token: string) {
  const separatorIndex = token.indexOf(".");
  if (separatorIndex < 0) {
    return null;
  }

  return {
    username: token.slice(0, separatorIndex),
    signature: token.slice(separatorIndex + 1),
  };
}

export function hasAdminAuthConfig() {
  return Boolean(getAdminConfig());
}

export function validateAdminCredentials(username: string, password: string) {
  const config = getAdminConfig();
  if (!config) {
    return false;
  }

  return username === config.username && password === config.password;
}

export function createAdminSessionToken(username: string) {
  const config = getAdminConfig();
  if (!config) {
    throw new Error("Admin authentication is not configured.");
  }

  return `${username}.${signUsername(username, config.secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  const config = getAdminConfig();
  if (!config || !token) {
    return false;
  }

  const parsed = parseToken(token);
  if (!parsed || parsed.username !== config.username) {
    return false;
  }

  const expected = Buffer.from(signUsername(parsed.username, config.secret), "utf8");
  const actual = Buffer.from(parsed.signature, "utf8");

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export async function getAdminSession() {
  const config = getAdminConfig();
  if (!config) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSessionToken(token)) {
    return null;
  }

  return {
    username: config.username,
  } satisfies AdminSession;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

export function getAdminLoginErrorMessage(errorCode: string | undefined) {
  if (errorCode === "invalid") {
    return "The admin username or password was not recognised.";
  }

  if (errorCode === "not-configured") {
    return "Admin access is not configured yet. Add admin credentials to .env.local first.";
  }

  return "";
}
