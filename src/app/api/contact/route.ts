import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();
  console.log("New booking submission:", payload);
  return NextResponse.json({ ok: true });
}
