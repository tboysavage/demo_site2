import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/admin-data";

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

export async function POST(request: Request) {
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
    !isNonEmptyString(payload.preferredDate)
  ) {
    return NextResponse.json({ error: "Contact request is incomplete." }, { status: 400 });
  }

  createContactMessage({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    preferredDate: payload.preferredDate,
    message: payload.message,
  });

  return NextResponse.json({ ok: true });
}
