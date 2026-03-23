import Image from "next/image";
import Link from "next/link";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";
import SectionHeading from "@/components/SectionHeading";

const { hero, ui, images } = clinicUltrasoundScansContent;

const serviceCards = [
  {
    title: "Clinic Ultrasound Scans",
    href: "/services/clinic-ultrasound-scans",
    imageSrc: "/clinical.jpg",
    imageAlt: "Clinic ultrasound scans",
  },
  {
    title: "Second Opinion Scans",
    href: "/services/clinic-ultrasound-scans?package=second-opinion#packages",
    imageSrc: "/pexels-mart-production-7088526.jpg",
    imageAlt: "Second opinion scans",
  },
  {
    title: "Pregnancy-Related Blood Test",
    href: "/blood-screening?package=pregnancy-screening#packages",
    imageSrc: "/pregnancy-blood.jpg",
    imageAlt: "Pregnancy-related blood tests",
  },
  {
    title: "Fertility Blood Tests (Men and women)",
    href: "/blood-screening?package=fertility-wellbeing#packages",
    imageSrc: "/pexels-cristian-rojas-8460340.jpg",
    imageAlt: "Fertility blood tests for men and women",
  },
  {
    title: "General Health and Wellness Checks",
    href: "/blood-screening?package=blood-pressure-diabetes#packages",
    imageSrc: "/welcome.jpg",
    imageAlt: "General health and wellness checks",
  },
  {
    title: "Home-Based Scans",
    href: "/services/home-scans",
    imageSrc: "/pexels-shkrabaanthony-5215001.jpg",
    imageAlt: "Home-based scans",
  },
  {
    title: "Pre-eclampsia and Gestational Diabetes Health Checks",
    href: "/blood-screening?package=blood-pressure-diabetes#packages",
    imageSrc: "/welcome.png",
    imageAlt: "Pre-eclampsia and gestational diabetes health checks",
  },
] as const;

export default function HomePage() {
  return (
    <div className="pb-20">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:items-center">
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
              href="/services/clinic-ultrasound-scans"
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white"
            >
              Book a Scan
            </Link>
            <Link
              href="/blood-screening"
              className="rounded-full bg-[#c7e7fb] px-6 py-3 text-sm font-semibold text-slate-800"
            >
              Book a Blood Test
            </Link>
            <Link
              href="/clinic"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Our Salisbury Clinic
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl" />
          <div className="overflow-hidden rounded-[36px] border-2 border-solid border-[var(--baby-blue)] bg-white shadow-lg">
            <div className="relative aspect-[1041/640] w-full rounded-[36px] bg-white">
              <Image
                src="/hero.jpg"
                alt={images.heroAlt}
                fill
                sizes="(min-width: 1024px) 65vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-[36px] border-2 border-solid border-[var(--baby-blue)] bg-white/80 px-8 py-16 shadow-sm">
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

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow={ui.labels.services}
          title={ui.home.servicesTitle}
          description={ui.home.servicesDescription}
        />
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {serviceCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group w-full max-w-[22rem] overflow-hidden rounded-[30px] bg-white p-4 shadow-sm transition hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-[24px] border-2 border-solid border-[var(--baby-blue)] bg-white">
                <div className="relative aspect-[300/222]">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
              <h3 className="mt-4 text-center text-lg font-semibold text-slate-900">
                {card.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
