"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BloodScreeningCard, BloodScreeningGroup } from "@/content/bloodScreening";

const INITIAL_INFO_CARD_COUNT = 6;

function normalizeCard(card: BloodScreeningCard) {
  return {
    id: card.id,
    kind: card.kind ?? "info",
    title: card.title,
    subtitle: card.subtitle,
    description: card.description ?? [],
    description2: card.description2,
    bullets: card.bullets ?? [],
    price: card.price,
    relatedInfoIds: card.relatedInfoIds ?? [],
  };
}

function renderCardContent(card: BloodScreeningCard) {
  const normalized = normalizeCard(card);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{normalized.title}</h3>
        {normalized.subtitle ? (
          <p className="mt-2 text-sm font-semibold text-[var(--accent-strong)]">
            {normalized.subtitle}
          </p>
        ) : null}
      </div>
      {normalized.description.length ? (
        <div className="space-y-2 text-sm text-muted">
          {normalized.description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
      {normalized.bullets.length ? (
        <ul className="space-y-2 text-sm text-slate-600">
          {normalized.bullets.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {normalized.description2 ? <p className="text-sm text-muted">{normalized.description2}</p> : null}
    </div>
  );
}

function InfoSummaryCard({ card }: { card: BloodScreeningCard }) {
  const normalized = normalizeCard(card);
  const previewDescription =
    normalized.description[0] ?? normalized.description2 ?? "";
  const previewBullets = normalized.bullets.slice(0, 2);
  const hiddenDetailCount =
    Math.max(0, normalized.description.length - (normalized.description[0] ? 1 : 0)) +
    Math.max(0, normalized.bullets.length - previewBullets.length) +
    (normalized.description2 && normalized.description2 !== previewDescription ? 1 : 0);

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-strong)]">
            Blood test info
          </p>
          {hiddenDetailCount > 0 ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
              +{hiddenDetailCount} more details
            </span>
          ) : null}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{normalized.title}</h3>
        {previewDescription ? (
          <p className="text-sm leading-6 text-muted">{previewDescription}</p>
        ) : null}
        {previewBullets.length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {previewBullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

function PackagePreviewCard({
  card,
  selected,
  onReadMore,
}: {
  card: BloodScreeningCard;
  selected: boolean;
  onReadMore: () => void;
}) {
  const normalized = normalizeCard(card);
  const previewLines =
    normalized.description.length > 0
      ? normalized.description.slice(0, 2)
      : normalized.bullets.slice(0, 2);

  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm transition ${
        selected
          ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]/40"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Package
            </p>
          </div>
          {normalized.price ? (
            <span className="rounded-full bg-[var(--ink-strong)] px-3 py-1 text-xs font-semibold text-white">
              {normalized.price}
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Package
            </span>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">{normalized.title}</p>
          {normalized.subtitle ? (
            <p className="mt-2 text-sm font-semibold text-[var(--accent-strong)]">
              {normalized.subtitle}
            </p>
          ) : null}
        </div>
        {previewLines.length ? (
          <div className="space-y-2 text-sm text-slate-600">
            {previewLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
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
          href={`/booking?package=${normalized.id}`}
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--ink-strong)]"
        >
          Book a Test
        </Link>
      </div>
    </div>
  );
}

function BloodPackageDetailsPanel({
  selectedPackage,
  relatedInfoCards,
}: {
  selectedPackage: BloodScreeningCard;
  relatedInfoCards: readonly BloodScreeningCard[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Package details
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {selectedPackage.title}
            </h3>
            {selectedPackage.subtitle ? (
              <p className="mt-2 text-sm font-semibold text-[var(--accent-strong)]">
                {selectedPackage.subtitle}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {selectedPackage.price ? (
              <span className="rounded-full bg-[var(--ink-strong)] px-4 py-2 text-sm font-semibold text-white">
                {selectedPackage.price}
              </span>
            ) : null}
            <Link
              href={`/booking?package=${selectedPackage.id}`}
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
            >
              Book a Test
            </Link>
          </div>
        </div>

        {renderCardContent(selectedPackage)}

        {relatedInfoCards.length ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Related information
            </p>
            <div className="grid gap-4">
              {relatedInfoCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5"
                >
                  {renderCardContent(card)}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function BloodScreeningGroupPanel({ group }: { group: BloodScreeningGroup }) {
  const packageCards = useMemo(
    () => group.cards.filter((card) => (card.kind ?? "info") === "package"),
    [group.cards],
  );
  const infoCards = useMemo(
    () => group.cards.filter((card) => (card.kind ?? "info") !== "package"),
    [group.cards],
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showAllInfoCards, setShowAllInfoCards] = useState(false);

  const selectedPackage =
    packageCards.find((card) => card.id === selectedPackageId) ?? null;

  const relatedInfoCards = useMemo(() => {
    if (!selectedPackage) {
      return [];
    }

    const normalized = normalizeCard(selectedPackage);
    if (normalized.relatedInfoIds.length) {
      return normalized.relatedInfoIds
        .map((id) => infoCards.find((card) => card.id === id))
        .filter((card): card is BloodScreeningCard => Boolean(card));
    }

    return infoCards;
  }, [infoCards, selectedPackage]);

  if (!packageCards.length) {
    const visibleCards = showAllInfoCards
      ? group.cards
      : group.cards.slice(0, INITIAL_INFO_CARD_COUNT);
    const hiddenCardCount = Math.max(0, group.cards.length - visibleCards.length);

    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleCards.map((card) => (
              <InfoSummaryCard key={card.id} card={card} />
            ))}
          </div>
          {!showAllInfoCards && hiddenCardCount > 0 ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-[rgba(255,255,255,0.92)] to-transparent" />
          ) : null}
        </div>
        {group.cards.length > INITIAL_INFO_CARD_COUNT ? (
          <div className="flex flex-col items-center gap-3 pt-2 text-center">
            <p className="text-sm text-muted">
              Showing {visibleCards.length} of {group.cards.length} information cards.
            </p>
            <button
              type="button"
              onClick={() => setShowAllInfoCards((current) => !current)}
              className="inline-flex items-center justify-center rounded-full border border-[var(--baby-blue)] bg-[var(--baby-blue)] px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:brightness-95"
            >
              {showAllInfoCards ? "Show fewer cards" : `Show ${hiddenCardCount} more cards`}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {group.description ? <p className="text-sm text-muted">{group.description}</p> : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="space-y-4">
          {packageCards.map((card) => (
            <div key={card.id} className="space-y-4">
              <PackagePreviewCard
                card={card}
                selected={card.id === selectedPackage?.id}
                onReadMore={() => setSelectedPackageId(card.id)}
              />
              {card.id === selectedPackage?.id ? (
                <div className="xl:hidden">
                  <BloodPackageDetailsPanel
                    selectedPackage={card}
                    relatedInfoCards={relatedInfoCards}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="hidden xl:block">
          {selectedPackage ? (
            <BloodPackageDetailsPanel
              selectedPackage={selectedPackage}
              relatedInfoCards={relatedInfoCards}
            />
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
                  Package details and the related blood test information will appear in this panel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
