import { Package, clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

type PricingCardProps = {
  packageItem: Package;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function PricingCard({
  packageItem,
  ctaHref,
  ctaLabel,
}: PricingCardProps) {
  const { ui } = clinicUltrasoundScansContent;
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            {packageItem.weeks}
          </p>
          {packageItem.price ? (
            <span className="rounded-full bg-[var(--ink-strong)] px-3 py-1 text-xs font-semibold text-white">
              {packageItem.price}
            </span>
          ) : null}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{packageItem.name}</h3>
          {packageItem.scanFor ? (
            <p className="mt-2 text-sm text-muted">{packageItem.scanFor}</p>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{ui.cardLabels.included}</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {packageItem.includes.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {packageItem.provides && packageItem.provides.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {ui.cardLabels.growthMeasurements}
            </p>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {packageItem.provides.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--ink-strong)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {packageItem.notes && packageItem.notes.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {ui.cardLabels.additionalNotes}
            </p>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {packageItem.notes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {packageItem.pricingOptions && packageItem.pricingOptions.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {ui.cardLabels.pricingOptions}
            </p>
            <div className="mt-3 space-y-2">
              {packageItem.pricingOptions.map((option) => (
                <div
                  key={option.label}
                  className="flex items-center justify-between rounded-2xl bg-[var(--accent-soft)] px-4 py-2 text-sm"
                >
                  <span>{option.label}</span>
                  <span className="font-semibold text-slate-900">{option.price}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-6">
        <a
          href={ctaHref ?? `/booking?package=${packageItem.id}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
        >
          {ctaLabel ?? ui.buttons.bookScan}
        </a>
      </div>
    </div>
  );
}
