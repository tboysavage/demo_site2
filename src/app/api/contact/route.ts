import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/admin-data";
import { checkRateLimit, getRequestIpAddress } from "@/lib/rate-limit";

export const runtime = "nodejs";

type ContactRequestBody = {
  name?: string;
  email?: string;
  phone?: string;
  preferredDate?: string;
  message?: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: unknown): value is string {
  return isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPreferredDate(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

export async function POST(request: Request) {
  const requestIp = getRequestIpAddress(request);
  const rateLimit = checkRateLimit({
    key: `contact:${requestIp}`,
    limit: 6,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many contact requests were sent. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let payload: ContactRequestBody;

  try {
    payload = (await request.json()) as ContactRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (
    !isNonEmptyString(payload.name) ||
    !isValidEmail(payload.email) ||
    !isNonEmptyString(payload.phone) ||
    !isValidPreferredDate(payload.preferredDate)
  ) {
    return NextResponse.json({ error: "Contact request is incomplete." }, { status: 400 });
  }

  await createContactMessage({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    preferredDate: payload.preferredDate,
    message: payload.message,
  });

  return NextResponse.json({ ok: true });
}
