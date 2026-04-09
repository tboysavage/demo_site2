"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Package, type PackageGroup, clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

function getPreviewLines(packageItem: Package) {
  const lines: string[] = [];

  if (packageItem.scanFor) {
    lines.push(packageItem.scanFor);
  }

  if (packageItem.includes[0]) {
    lines.push(packageItem.includes[0]);
  }

  return lines.slice(0, 2);
}

function renderList(title: string, items?: readonly string[], markerClassName?: string) {
  if (!items?.length) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <ul className="mt-2 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-1 h-2 w-2 rounded-full ${markerClassName ?? "bg-[var(--accent-strong)]"}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceBadge({ packageItem }: { packageItem: Package }) {
  if (packageItem.price) {
    return (
      <span className="rounded-full bg-[var(--ink-strong)] px-3 py-1 text-xs font-semibold text-white">
        {packageItem.price}
      </span>
    );
  }

  if (packageItem.pricingOptions?.length) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        {packageItem.pricingOptions.length} pricing options
      </span>
    );
  }

  return null;
}

function getBookingHref(packageItem: Package, pricingOptionLabel?: string) {
  return {
    pathname: "/booking",
    query: {
      package: packageItem.id,
      ...(pricingOptionLabel ? { pricingOption: pricingOptionLabel } : {}),
    },
  };
}

function PackagePreviewCard({
  packageItem,
  selected,
  onReadMore,
}: {
  packageItem: Package;
  selected: boolean;
  onReadMore: () => void;
}) {
  const { ui } = clinicUltrasoundScansContent;
  const previewLines = getPreviewLines(packageItem);

  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm transition ${
        selected
          ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]/40"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            {packageItem.weeks}
          </p>
          <PriceBadge packageItem={packageItem} />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">{packageItem.name}</p>
          {previewLines.length ? (
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              {previewLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReadMore}
          className="inline-flex items-center justify-center rounded-full border border-[var(--baby-blue)] bg-[var(--baby-blue)] px-4 py-2 text-xs font-semibold text-slate-900 transition hover:brightness-95"
        >
          Read More
        </button>
        <Link
          href={getBookingHref(packageItem)}
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--ink-strong)]"
        >
          {ui.buttons.bookScan}
        </Link>
      </div>
    </div>
  );
}

function PackageDetailsPanel({
  packageItem,
}: {
  packageItem: Package;
}) {
  const { ui } = clinicUltrasoundScansContent;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Package details
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {packageItem.name}
            </h3>
            <p className="mt-2 text-sm font-semibold text-[var(--accent-strong)]">
              {packageItem.weeks}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PriceBadge packageItem={packageItem} />
            <Link
              href={getBookingHref(packageItem)}
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
            >
              {ui.buttons.bookScan}
            </Link>
          </div>
        </div>

        {packageItem.scanFor ? (
          <div>
            <p className="text-sm font-semibold text-slate-800">Scan focus</p>
            <p className="mt-2 text-sm text-muted">{packageItem.scanFor}</p>
          </div>
        ) : null}

        {renderList(ui.cardLabels.included, packageItem.includes)}
        {renderList(
          ui.cardLabels.growthMeasurements,
          packageItem.provides,
          "bg-[var(--ink-strong)]",
        )}
        {renderList(
          ui.cardLabels.additionalNotes,
          packageItem.notes,
          "bg-[var(--accent)]",
        )}

        {packageItem.pricingOptions?.length ? (
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {ui.cardLabels.pricingOptions}
            </p>
            <div className="mt-3 space-y-2">
              {packageItem.pricingOptions.map((option) => (
                <div
                  key={option.label}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p>{option.label}</p>
                    <p className="font-semibold text-slate-900">{option.price}</p>
                  </div>
                  <Link
                    href={getBookingHref(packageItem, option.label)}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--ink-strong)]"
                  >
                    {ui.buttons.bookScan}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function PackageGroupPanel({ group }: { group: PackageGroup }) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const selectedPackage = useMemo(
    () => group.packages.find((packageItem) => packageItem.id === selectedPackageId) ?? null,
    [group.packages, selectedPackageId],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2c7f78]">
          {group.weeks}
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">{group.title}</h3>
        <p className="mt-2 text-sm text-muted">{group.description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="space-y-4">
          {group.packages.map((packageItem) => (
            <div key={packageItem.id} className="space-y-4">
              <PackagePreviewCard
                packageItem={packageItem}
                selected={packageItem.id === selectedPackage?.id}
                onReadMore={() => setSelectedPackageId(packageItem.id)}
              />
              {packageItem.id === selectedPackage?.id ? (
                <div className="xl:hidden">
                  <PackageDetailsPanel packageItem={packageItem} />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="hidden xl:block">
          {selectedPackage ? (
            <PackageDetailsPanel packageItem={selectedPackage} />
          ) : (
            <div className="flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
              <div className="max-w-md space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                  More information
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  Select Read More on a package to view the full details here.
                </p>
                <p className="text-sm text-muted">
                  Package inclusions, notes, and pricing details will appear in this panel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
