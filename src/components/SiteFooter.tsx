import Link from "next/link";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

const { brand, navigation, ui } = clinicUltrasoundScansContent;

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr_1.1fr] lg:items-start">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
          <p className="font-display text-2xl text-slate-900">{brand.name}</p>
          <p className="text-sm text-muted">{brand.address}</p>
          <p className="text-sm">
            <a href={`tel:${brand.phone}`} className="font-semibold">
              {brand.phone}
            </a>
          </p>
          <p className="text-sm">
            <a href={`mailto:${brand.email}`} className="font-semibold">
              {brand.email}
            </a>
          </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <iframe
              title="Baby Sonovue LTD location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                brand.address
              )}&output=embed`}
              className="h-40 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          {navigation.menu.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="rounded-3xl bg-[var(--ink-strong)] p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">
            {ui.footer.title}
          </p>
          <p className="mt-2 text-xl font-semibold">{ui.footer.message}</p>
          <a
            href="/services/clinic-ultrasound-scans#booking"
            className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]"
          >
            {ui.footer.cta}
          </a>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {brand.name}. {ui.footer.rights}
      </div>
    </footer>
  );
}
