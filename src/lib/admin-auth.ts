import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDatabase } from "@/lib/database";

export const ADMIN_SESSION_COOKIE = "baby-sonovue-admin-session";

const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const PASSWORD_HASH_ALGORITHM = "scrypt";
const PASSWORD_KEY_LENGTH = 64;
export const MIN_ADMIN_PASSWORD_LENGTH = 12;

type AdminSession = {
  userId: number;
  username: string;
};

type AuthenticatedAdminUser = {
  id: number;
  username: string;
};

type AdminUserRow = {
  id: number;
  username: string;
  password_hash: string;
  is_active: boolean;
};

type AdminSessionRow = {
  session_id: number;
  user_id: number;
  username: string;
  expires_at: string;
};

function getBootstrapAdminConfig() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
  return `${PASSWORD_HASH_ALGORITHM}:${salt}:${derivedKey}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, derivedKeyHex] = storedHash.split(":");
  if (algorithm !== PASSWORD_HASH_ALGORITHM || !salt || !derivedKeyHex) {
    return false;
  }

  const expected = Buffer.from(derivedKeyHex, "hex");
  const actual = scryptSync(password, salt, expected.length);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

async function countAdminUsers() {
  const sql = await getDatabase();
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM admin_users
  `;

  return Number(rows[0]?.count ?? "0");
}

async function ensureBootstrapAdminUser() {
  const bootstrapConfig = getBootstrapAdminConfig();
  if (!bootstrapConfig) {
    return;
  }

  if ((await countAdminUsers()) > 0) {
    return;
  }

  const sql = await getDatabase();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO admin_users (
      username,
      password_hash,
      is_active,
      created_at,
      updated_at,
      last_login_at
    )
    VALUES (
      ${bootstrapConfig.username},
      ${hashPassword(bootstrapConfig.password)},
      TRUE,
      ${now},
      ${now},
      NULL
    )
    ON CONFLICT (username) DO NOTHING
  `;
}

export async function hasAdminAuthConfig() {
  if (getBootstrapAdminConfig()) {
    return true;
  }

  return (await countAdminUsers()) > 0;
}

export async function validateAdminCredentials(username: string, password: string) {
  await ensureBootstrapAdminUser();

  const sql = await getDatabase();
  const rows = await sql<AdminUserRow[]>`
    SELECT id, username, password_hash, is_active
    FROM admin_users
    WHERE username = ${username}
    LIMIT 1
  `;

  const user = rows[0];
  if (!user?.is_active || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
  } satisfies AuthenticatedAdminUser;
}

export async function createAdminSession(userId: number) {
  const sql = await getDatabase();
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);
  const nowIso = now.toISOString();

  await sql`
    DELETE FROM admin_sessions
    WHERE expires_at <= ${nowIso}
  `;

  await sql`
    INSERT INTO admin_sessions (
      user_id,
      session_token_hash,
      expires_at,
      created_at,
      last_seen_at
    )
    VALUES (
      ${userId},
      ${hashSessionToken(token)},
      ${expiresAt.toISOString()},
      ${nowIso},
      ${nowIso}
    )
  `;

  await sql`
    UPDATE admin_users
    SET last_login_at = ${nowIso}, updated_at = ${nowIso}
    WHERE id = ${userId}
  `;

  return token;
}

export async function updateAdminPassword(
  userId: number,
  currentPassword: string,
  nextPassword: string,
  currentSessionToken?: string,
) {
  if (nextPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return "too-short" as const;
  }

  const sql = await getDatabase();
  const rows = await sql<AdminUserRow[]>`
    SELECT id, username, password_hash, is_active
    FROM admin_users
    WHERE id = ${userId}
    LIMIT 1
  `;

  const user = rows[0];
  if (!user?.is_active) {
    return "user-not-found" as const;
  }

  if (!verifyPassword(currentPassword, user.password_hash)) {
    return "invalid-current-password" as const;
  }

  if (verifyPassword(nextPassword, user.password_hash)) {
    return "same-password" as const;
  }

  const nowIso = new Date().toISOString();
  await sql`
    UPDATE admin_users
    SET password_hash = ${hashPassword(nextPassword)}, updated_at = ${nowIso}
    WHERE id = ${userId}
  `;

  if (currentSessionToken) {
    await sql`
      DELETE FROM admin_sessions
      WHERE user_id = ${userId}
        AND session_token_hash <> ${hashSessionToken(currentSessionToken)}
    `;
  } else {
    await sql`
      DELETE FROM admin_sessions
      WHERE user_id = ${userId}
    `;
  }

  return "updated" as const;
}

export async function destroyAdminSession(token: string | undefined) {
  if (!token) {
    return;
  }

  const sql = await getDatabase();
  await sql`
    DELETE FROM admin_sessions
    WHERE session_token_hash = ${hashSessionToken(token)}
  `;
}

export async function getAdminSession() {
  await ensureBootstrapAdminUser();

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const sql = await getDatabase();
  const rows = await sql<AdminSessionRow[]>`
    SELECT
      admin_sessions.id AS session_id,
      admin_sessions.user_id,
      admin_users.username,
      admin_sessions.expires_at
    FROM admin_sessions
    INNER JOIN admin_users ON admin_users.id = admin_sessions.user_id
    WHERE admin_sessions.session_token_hash = ${hashSessionToken(token)}
      AND admin_users.is_active = TRUE
    LIMIT 1
  `;

  const session = rows[0];
  if (!session) {
    return null;
  }

  const nowIso = new Date().toISOString();
  if (session.expires_at <= nowIso) {
    await sql`
      DELETE FROM admin_sessions
      WHERE id = ${session.session_id}
    `;
    return null;
  }

  await sql`
    UPDATE admin_sessions
    SET last_seen_at = ${nowIso}
    WHERE id = ${session.session_id}
  `;

  return {
    userId: session.user_id,
    username: session.username,
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
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
}

export function getAdminLoginErrorMessage(errorCode: string | undefined) {
  if (errorCode === "invalid") {
    return "The admin username or password was not recognised.";
  }

  if (errorCode === "not-configured") {
    return "Admin access is not configured yet. Add bootstrap admin credentials or create the first admin user.";
  }

  return "";
}
