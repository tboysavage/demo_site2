import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import BloodScreeningGroupPanel from "@/components/BloodScreeningGroupPanel";
import Tabs, { TabItem } from "@/components/Tabs";
import Accordion from "@/components/Accordion";
import { bloodScreeningContent, type BloodScreeningGroup } from "@/content/bloodScreening";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

const { hero, groups, preparation, faqs } = bloodScreeningContent;
const { site, brand } = clinicUltrasoundScansContent;
const typedGroups = groups as readonly BloodScreeningGroup[];
const packageGroups = typedGroups.filter((group) =>
  group.cards.some((card) => (card.kind ?? "info") === "package"),
);
const informationGroups = typedGroups.filter((group) =>
  group.cards.every((card) => (card.kind ?? "info") !== "package"),
);
const informationCallouts = typedGroups
  .filter((group) => group.callout)
  .map((group) => ({
    groupTitle: group.title,
    callout: group.callout!,
  }));

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

const faqItems = faqs.map((faq, index) => ({
  id: `blood-faq-${index}`,
  title: faq.question,
  content: <p>{faq.answer}</p>,
}));

const tabItems: TabItem[] = packageGroups.map((group) => ({
  id: group.id,
  label: group.title,
  description: group.description,
  content: <BloodScreeningGroupPanel group={group} />,
}));

export default function BloodScreeningPage() {
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mt-10 relative flex min-h-[64svh] items-center overflow-hidden rounded-[36px] border-2 border-solid border-[var(--baby-blue)] bg-white/90 px-6 py-10 shadow-sm lg:min-h-[70svh]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "url(/pregnancy-blood.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative w-full">
            <div className="mx-auto max-w-2xl rounded-[32px] bg-white/82 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                  {hero.title}
                </p>
                <h1 className="font-display text-3xl text-slate-900 sm:text-4xl">
                  {hero.headline}
                </h1>
                <p className="text-sm text-muted">{hero.intro}</p>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  href="/booking?service=blood"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
                >
                  {hero.primaryCta}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  {hero.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Options"
          title="Blood Screening Tests, Packages, and Checks"
          description="Browse pregnancy screening, fertility packages, individual blood tests, and wellbeing checks by category."
        />
        <Tabs items={tabItems} />
      </section>

      {informationGroups.length ? (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeading
            eyebrow="Information"
            title="Additional Fertility Blood Test"
            description="Reference information for the wider fertility blood tests and related screening checks."
          />
          <div className="mt-10 space-y-10">
            {informationCallouts.length ? (
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                      Additional tests
                    </p>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {informationCallouts[0].callout.title}
                    </h3>
                    <div className="space-y-3">
                      {informationCallouts[0].callout.description.map((line) => (
                        <p key={line} className="text-sm leading-6 text-muted">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-[var(--accent-soft)] p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-strong)]">
                      What to do next
                    </p>
                    {informationCallouts[0].callout.highlight ? (
                      <p className="mt-3 text-lg font-semibold text-slate-900">
                        {informationCallouts[0].callout.highlight}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm text-slate-700">
                      If you want to add extra fertility blood tests to your appointment, contact
                      the clinic before attending so the correct tests can be arranged.
                    </p>
                    {informationCallouts[0].callout.ctaLabel &&
                    informationCallouts[0].callout.ctaHref ? (
                      <div className="pt-5">
                        <a
                          href={informationCallouts[0].callout.ctaHref}
                          className="inline-flex items-center justify-center rounded-full border border-[var(--baby-blue)] bg-[var(--baby-blue)] px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:brightness-95"
                        >
                          {informationCallouts[0].callout.ctaLabel}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
            {informationGroups.map((group) => (
              <div key={group.id} className="space-y-4">
                <BloodScreeningGroupPanel group={group} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="Preparation"
          title={preparation.title}
          description={preparation.description}
        />
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ul className="space-y-3 text-sm text-slate-700">
            {preparation.steps.map((step) => (
              <li key={step} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="FAQs"
          title="Frequently Asked Questions"
          description="Quick answers to the questions patients ask most often about blood screening."
          align="center"
        />
        <div className="mt-10">
          <Accordion items={faqItems} />
        </div>
      </section>
    </div>
  );
}
