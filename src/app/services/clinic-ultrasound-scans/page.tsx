import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Tabs, { TabItem } from "@/components/Tabs";
import PackageGroupPanel from "@/components/PackageGroupPanel";
import SectionHeading from "@/components/SectionHeading";
import Accordion from "@/components/Accordion";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";
import { getResolvedClinicPackageGroups } from "@/lib/package-catalog";

const {
  hero,
  compare,
  whatToExpect,
  trust,
  faqs,
  brand,
  site,
  ui,
  seo,
  images,
} = clinicUltrasoundScansContent;

export const metadata: Metadata = {
  title: hero.title,
  description: seo.clinicDescription,
  alternates: {
    canonical: `${site.canonicalBaseUrl}/services/clinic-ultrasound-scans`,
  },
  openGraph: {
    title: `${hero.title} | ${brand.name}`,
    description: seo.clinicOgDescription,
    url: `${site.canonicalBaseUrl}/services/clinic-ultrasound-scans`,
        images: [
      {
        url: "/hero.jpg",
        width: 1200,
        height: 630,
        alt: images.ogAlt,
      },
    ],
  },
};

const faqItems = faqs.map((faq, index) => ({
  id: `faq-${index}`,
  title: faq.question,
  content: <p>{faq.answer}</p>,
}));

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ClinicUltrasoundScansPage() {
  const groups = await getResolvedClinicPackageGroups();
  const tabItems: TabItem[] = groups.map((group) => ({
    id: group.id,
    label: group.title,
    description: `${group.weeks}`,
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
    url: `${site.canonicalBaseUrl}/services/clinic-ultrasound-scans`,
    priceRange: seo.priceRange,
    areaServed: seo.areaServed,
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Clinic Ultrasound Scans",
    provider: {
      "@type": "MedicalClinic",
      name: brand.name,
    },
    areaServed: seo.areaServed,
    serviceType: seo.serviceType,
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
              backgroundImage: "url(/welcome.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative grid w-full gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="rounded-[32px] bg-white/82 p-6 shadow-sm backdrop-blur-sm">
              <SectionHeading
                eyebrow={compare.eyebrow}
                title={compare.title}
                description={compare.subtitle}
              />
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

      <section id="packages" className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow={ui.labels.packages}
          title={ui.packagesSection.title}
          description={ui.packagesSection.description}
        />
        <Tabs items={tabItems} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow={ui.labels.experience}
          title={whatToExpect.title}
          description={ui.experienceSection.description}
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
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
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
              description={ui.trustSection.description}
            />
            <div className="space-y-4">
              {trust.items.map((item) => (
                <div key={item.title} className="rounded-3xl bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[32px] border-2 border-solid border-[var(--baby-blue)] bg-white shadow-lg">
            <div className="relative aspect-[16/10] w-full rounded-[32px] bg-white">
              <Image
                src="/clinic-2.jpg"
                alt={images.comfortAlt}
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="rounded-[32px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow={ui.labels.faqs}
          title={ui.faqSection.title}
          description={ui.faqSection.description}
          align="center"
        />
        <div className="mt-10">
          <Accordion items={faqItems} />
        </div>
      </section>
    </div>
  );
}
