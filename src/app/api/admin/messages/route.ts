import { NextResponse } from "next/server";
import { updateContactMessageStatus } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

function redirectWithStatus(request: Request, status: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("tab", "messages");
  url.searchParams.set("messages", status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const id = Number.parseInt(String(formData.get("id") ?? ""), 10);
  const status = String(formData.get("status") ?? "").trim();

  if (Number.isNaN(id) || !["new", "read", "archived"].includes(status)) {
    return redirectWithStatus(request, "message-invalid");
  }

  await updateContactMessageStatus({
    id,
    status: status as "new" | "read" | "archived",
    actorUserId: session.userId,
  });

  return redirectWithStatus(request, "message-saved");
}
