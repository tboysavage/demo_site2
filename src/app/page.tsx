import Image from "next/image";
import Link from "next/link";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";
import SectionHeading from "@/components/SectionHeading";

const { hero, brand, groups, ui, images } = clinicUltrasoundScansContent;

export default function HomePage() {
  return (
    <div className="pb-20">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {ui.home.eyebrow}
          </p>
          <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
            {hero.headline}
          </h1>
          <p className="text-base text-muted sm:text-lg">{hero.intro}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/services/clinic-ultrasound-scans#booking"
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
            >
              {hero.primaryCta}
            </Link>
            <Link
              href="/services/clinic-ultrasound-scans"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              {ui.buttons.viewClinicScans}
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl" />
          <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-lg">
            <div className="relative aspect-[1041/583] w-full rounded-[36px] bg-white">
              <Image
                src="/hero.jpg"
                alt={images.heroAlt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white/80 px-8 py-16 shadow-sm">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage: "url(/welcome.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-white/40" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Welcome
              </p>
              <h2 className="font-display text-3xl text-slate-900 sm:text-4xl">
                {ui.home.welcomeTitle}
              </h2>
              <p className="text-sm text-muted sm:text-base">{ui.home.welcomeBody}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold text-slate-900">Why families choose us</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  Safe, accurate, and compassionate ultrasound care
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  2D, 3D, and 4D imaging with clear reporting
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                  Clinic, home, and flexible locations across Hampshire & The Isle of Wight
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow={ui.labels.services}
          title={ui.home.servicesTitle}
          description={ui.home.servicesDescription}
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.slice(0, 6).map((group) => {
            return (
            <div
              key={group.id}
              className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  {group.weeks}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  {group.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{group.description}</p>
              </div>
              <Link
                href={`/services/clinic-ultrasound-scans#${group.id}`}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {ui.buttons.viewPackages}
              </Link>
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
