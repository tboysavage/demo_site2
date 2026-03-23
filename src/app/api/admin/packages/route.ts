import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { addAdminActivityLog } from "@/lib/admin-data";
import {
  createManagedPackage,
  deleteManagedPackage,
  generateManagedPackageId,
  getManagedPackageGroupDefinition,
  listManagedPackages,
  updateManagedPackage,
  type ManagedPackageService,
} from "@/lib/package-catalog";

export const runtime = "nodejs";

function redirectWithStatus(request: Request, status: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("tab", "packages");
  url.searchParams.set("packages", status);
  return NextResponse.redirect(url, { status: 303 });
}

function parseLines(rawValue: FormDataEntryValue | null) {
  return String(rawValue ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parsePricingOptions(rawValue: FormDataEntryValue | null) {
  return parseLines(rawValue)
    .map((line) => {
      const [label, price] = line.split("|").map((part) => part?.trim() ?? "");
      if (!label || !price) {
        return null;
      }

      return { label, price };
    })
    .filter((item): item is { label: string; price: string } => Boolean(item));
}

function isManagedPackageService(value: string): value is ManagedPackageService {
  return value === "clinic" || value === "home" || value === "blood";
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const action = String(formData.get("action") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const weeks = String(formData.get("weeks") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const description = parseLines(formData.get("descriptionLines"));
  const includes = parseLines(formData.get("includesLines"));
  const provides = parseLines(formData.get("providesLines"));
  const notes = parseLines(formData.get("notesLines"));
  const descriptionSecondary = String(formData.get("descriptionSecondary") ?? "").trim();
  const priceLabel = String(formData.get("priceLabel") ?? "").trim();
  const pricingOptions = parsePricingOptions(formData.get("pricingOptionLines"));
  const packageId = String(formData.get("packageId") ?? "").trim();

  if (action === "delete") {
    if (!packageId) {
      return redirectWithStatus(request, "package-invalid");
    }

    try {
      await deleteManagedPackage(packageId);
      await addAdminActivityLog({
        actorUserId: session.userId,
        actionType: "package_deleted",
        targetType: "managed_package",
        targetId: packageId,
        message: `Removed package ${packageId}.`,
      });
      return redirectWithStatus(request, "package-deleted");
    } catch {
      return redirectWithStatus(request, "package-error");
    }
  }

  if (!isManagedPackageService(service) || !groupId || !title || !weeks) {
    return redirectWithStatus(request, "package-invalid");
  }

  if (!getManagedPackageGroupDefinition(service, groupId)) {
    return redirectWithStatus(request, "package-invalid");
  }

  try {
    if (action === "create") {
      const existingPackages = await listManagedPackages();
      const nextPackageId = generateManagedPackageId(
        title,
        service,
        existingPackages.map((item) => item.packageId),
      );

      await createManagedPackage({
        packageId: nextPackageId,
        service,
        groupId,
        title,
        weeks,
        summary,
        description,
        includes,
        provides,
        notes,
        descriptionSecondary,
        priceLabel,
        pricingOptions,
      });

      await addAdminActivityLog({
        actorUserId: session.userId,
        actionType: "package_created",
        targetType: "managed_package",
        targetId: nextPackageId,
        message: `Added package ${title}.`,
        details: JSON.stringify({ service, groupId, title, weeks, priceLabel, pricingOptions }),
      });

      return redirectWithStatus(request, "package-created");
    }

    if (action === "update") {
      if (!packageId) {
        return redirectWithStatus(request, "package-invalid");
      }

      await updateManagedPackage({
        packageId,
        service,
        groupId,
        title,
        weeks,
        summary,
        description,
        includes,
        provides,
        notes,
        descriptionSecondary,
        priceLabel,
        pricingOptions,
      });

      await addAdminActivityLog({
        actorUserId: session.userId,
        actionType: "package_updated",
        targetType: "managed_package",
        targetId: packageId,
        message: `Updated package ${title}.`,
        details: JSON.stringify({ service, groupId, title, weeks, priceLabel, pricingOptions }),
      });

      return redirectWithStatus(request, "package-updated");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return redirectWithStatus(request, "package-duplicate");
    }

    return redirectWithStatus(request, "package-error");
  }

  return redirectWithStatus(request, "package-invalid");
}
