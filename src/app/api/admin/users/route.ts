import { NextResponse } from "next/server";
import { addAdminActivityLog } from "@/lib/admin-data";
import {
  createAdminUserAccount,
  getAdminSession,
  updateAdminUserActiveState,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

function redirectWithStatus(request: Request, status: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("tab", "users");
  url.searchParams.set("users", status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const action = String(formData.get("action") ?? "").trim();

  if (action === "create") {
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await createAdminUserAccount(username, password);
    if (result !== "created") {
      const statusMap: Record<string, string> = {
        "invalid-username": "user-invalid-username",
        "username-taken": "user-username-taken",
        "too-short": "user-password-too-short",
      };
      return redirectWithStatus(request, statusMap[result] ?? "user-error");
    }

    await addAdminActivityLog({
      actorUserId: session.userId,
      actionType: "admin_user_created",
      targetType: "admin_user",
      targetId: username.toLowerCase(),
      message: `Created admin user ${username.toLowerCase()}.`,
    });

    return redirectWithStatus(request, "user-created");
  }

  if (action === "set-active-state") {
    const userId = Number.parseInt(String(formData.get("userId") ?? ""), 10);
    const activeState = String(formData.get("isActive") ?? "").trim();
    const isActive = activeState === "true";

    if (Number.isNaN(userId)) {
      return redirectWithStatus(request, "user-error");
    }

    if (!isActive && userId === session.userId) {
      return redirectWithStatus(request, "user-cannot-disable-self");
    }

    const result = await updateAdminUserActiveState(userId, isActive);
    if (result !== "updated") {
      return redirectWithStatus(request, "user-error");
    }

    await addAdminActivityLog({
      actorUserId: session.userId,
      actionType: isActive ? "admin_user_reactivated" : "admin_user_deactivated",
      targetType: "admin_user",
      targetId: String(userId),
      message: `${isActive ? "Reactivated" : "Deactivated"} admin user ${userId}.`,
    });

    return redirectWithStatus(request, isActive ? "user-reactivated" : "user-deactivated");
  }

  return redirectWithStatus(request, "user-error");
}
