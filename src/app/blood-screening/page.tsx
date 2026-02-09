import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import Tabs, { TabItem } from "@/components/Tabs";
import Accordion from "@/components/Accordion";
import { bloodScreeningContent } from "@/content/bloodScreening";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

const { hero, groups } = bloodScreeningContent;
const { site, brand } = clinicUltrasoundScansContent;

export const metadata: Metadata = {
  title: hero.title,
  description:
    "Blood Screening at Baby Sonovue LTD. Explore pregnancy screening, fertility packages, and wellbeing checks.",
  alternates: {
    canonical: `${site.canonicalBaseUrl}/blood-screening`,
  },
  openGraph: {
    title: `${hero.title} | ${brand.name}`,
    description:
      "Explore blood screening options, fertility packages, and wellbeing checks with clear pricing and guidance.",
    url: `${site.canonicalBaseUrl}/blood-screening`,
  },
};

type CardProps = (typeof groups)[number]["cards"][number];

function BloodScreeningCard({ card }: { card: CardProps }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
          {card.subtitle ? (
            <p className="mt-2 text-sm font-semibold text-[var(--accent-strong)]">
              {card.subtitle}
            </p>
          ) : null}
        </div>
        {card.description?.length ? (
          <div className="space-y-2 text-sm text-muted">
            {card.description.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        {card.bullets?.length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {card.bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {card.description2 ? <p className="text-sm text-muted">{card.description2}</p> : null}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {card.price ? (
          <span className="rounded-full bg-[var(--ink-strong)] px-3 py-1 text-xs font-semibold text-white">
            {card.price}
          </span>
        ) : null}
        {card.ctaLabel ? (
          <a
            href={card.ctaHref ?? "/contact"}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
          >
            {card.ctaLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}

const faqItems = groups
  .find((group) => group.id === "faqs")
  ?.cards.map((card, index) => ({
    id: `blood-faq-${index}`,
    title: card.title,
    content: (
      <div className="space-y-2">
        {card.description?.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    ),
  }));

const tabItems: TabItem[] = groups.map((group) => ({
  id: group.id,
  label: group.title,
  description: group.description,
  content:
    group.id === "faqs" ? (
      <div className="space-y-6">
        <p className="text-sm text-muted">{group.description}</p>
        {faqItems ? <Accordion items={faqItems} /> : null}
      </div>
    ) : (
      <div className="space-y-6">
        {group.description ? <p className="text-sm text-muted">{group.description}</p> : null}
        <div className="grid gap-6 lg:grid-cols-2">
          {group.cards.map((card) => (
            <BloodScreeningCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    ),
}));

export default function BloodScreeningPage() {
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {hero.title}
          </p>
          <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">{hero.headline}</h1>
          <p className="text-base text-muted sm:text-lg">{hero.intro}</p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/services/clinic-ultrasound-scans#booking"
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
            >
              {hero.primaryCta}
            </a>
            <a
              href="/contact"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              {hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Packages"
          title="Blood Screening Packages"
          description="Browse the blood screening options and packages by category."
        />
        <Tabs items={tabItems} />
      </section>
    </div>
  );
}
