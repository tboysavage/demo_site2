import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Tabs, { TabItem } from "@/components/Tabs";
import PackageGroupPanel from "@/components/PackageGroupPanel";
import SectionHeading from "@/components/SectionHeading";
import Accordion from "@/components/Accordion";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";
import { homeScansContent } from "@/content/homeScans";
import { getResolvedHomePackageGroups } from "@/lib/package-catalog";

const { brand, site, seo, ui, images } = clinicUltrasoundScansContent;
const { hero, intro, compare, whatToExpect, trust, faqs, faqSection, packagesSection } =
  homeScansContent;

export const metadata: Metadata = {
  title: hero.title,
  description:
    "Home-based pregnancy scans at Baby Sonovue LTD. Explore reassurance, wellbeing, growth, gender, 3D/4D, second opinion, and anatomy review options.",
  alternates: {
    canonical: `${site.canonicalBaseUrl}/services/home-scans`,
  },
  openGraph: {
    title: `${hero.title} | ${brand.name}`,
    description:
      "Explore home-based scan options for reassurance, growth, gender discovery, 3D/4D bonding, second opinion support, and anatomy review.",
    url: `${site.canonicalBaseUrl}/services/home-scans`,
    images: [
      {
        url: "/clinic-3.jpg",
        width: 1200,
        height: 630,
        alt: "Home-based pregnancy scan support",
      },
    ],
  },
};

const faqItems = faqs.map((faq, index) => ({
  id: `home-scan-faq-${index}`,
  title: faq.question,
  content: <p>{faq.answer}</p>,
}));

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomeScansPage() {
  const groups = await getResolvedHomePackageGroups();
  const tabItems: TabItem[] = groups.map((group) => ({
    id: group.id,
    label: group.title,
    description: group.weeks,
    content: <PackageGroupPanel group={group} />,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: brand.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.address,
      addressLocality: seo.addressLocality,
      postalCode: brand.postalCode,
      addressCountry: brand.countryCode,
    },
    telephone: brand.phone,
    email: brand.email,
    url: `${site.canonicalBaseUrl}/services/home-scans`,
    priceRange: seo.priceRange,
    areaServed: seo.areaServed,
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Home-Based Pregnancy Scans",
    provider: {
      "@type": "MedicalClinic",
      name: brand.name,
    },
    areaServed: seo.areaServed,
    serviceType: "Home-based pregnancy ultrasound scans",
  };

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([schema, serviceSchema]),
        }}
      />

      <section className="mx-auto max-w-6xl px-4">
        <div className="mt-10 relative flex min-h-[64svh] items-center overflow-hidden rounded-[36px] border-2 border-solid border-[var(--baby-blue)] bg-white/90 px-6 py-10 shadow-sm lg:min-h-[70svh]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "url(/pexels-shkrabaanthony-5215001.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative grid w-full gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="rounded-[32px] bg-white/82 p-6 shadow-sm backdrop-blur-sm">
              <div className="space-y-4">
                <SectionHeading
                  eyebrow={ui.labels.service}
                  title={hero.headline}
                  description={hero.intro}
                />
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
                  >
                    Enquire about home scans
                  </Link>
                  <Link
                    href="/services/clinic-ultrasound-scans"
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
                  >
                    View clinic scan page
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
              {compare.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl bg-[var(--accent-soft)] p-4 transition hover:-translate-y-0.5 hover:bg-[color:rgba(242,181,98,0.34)]"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-muted">{item.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Guidance
            </p>
            <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">
              {intro.title}
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {intro.bullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">{intro.closing}</p>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Trust
            </p>
            <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">
              {intro.whyChooseTitle}
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {intro.whyChooseBullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow={ui.labels.packages}
          title={packagesSection.title}
          description={packagesSection.description}
        />
        <Tabs items={tabItems} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow={ui.labels.experience}
          title={whatToExpect.title}
          description="Home-based scanning keeps the same focus on clarity and reassurance, with the added convenience of being seen where you feel most comfortable."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {whatToExpect.steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-slate-200 bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                {ui.labels.step} {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <SectionHeading
              eyebrow={ui.labels.trust}
              title={trust.title}
              description="A home-based appointment changes the setting, not the standard of care."
            />
            <div className="space-y-4">
              {trust.items.map((item) => (
                <div key={item.title} className="rounded-3xl bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-[var(--accent-soft)] p-5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Need to decide between home and clinic?</p>
              <p className="mt-2">
                Second opinion scans can be arranged either at home or in clinic,
                depending on what works best for you.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white"
              >
                Contact the team
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[32px] border-2 border-solid border-[var(--baby-blue)] bg-white shadow-lg">
            <div className="relative aspect-[16/10] w-full rounded-[32px] bg-white">
              <Image
                src="/clinic-3.jpg"
                alt={images.comfortAlt}
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow={ui.labels.faqs}
          title={faqSection.title}
          description={faqSection.description}
          align="center"
        />
        <div className="mt-10">
          <Accordion items={faqItems} />
        </div>
      </section>
    </div>
  );
}
