import Link from "next/link";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

export default function SecondOpinionScansPage() {
  const { groups, ui } = clinicUltrasoundScansContent;
  const group = groups.find(
    (item) => item.id === "second-opinion"
  );

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {ui.labels.service}
          </p>
          <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
            {ui.pageTitles.secondOpinion}
          </h1>
          <p className="text-sm text-muted">{ui.stub.description}</p>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-muted">
          <p className="font-semibold text-slate-900">{group?.title}</p>
          <p className="mt-2">{group?.description}</p>
          <Link
            href="/services/clinic-ultrasound-scans#second-opinion"
            className="mt-4 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {ui.buttons.viewSecondOpinion}
          </Link>
        </div>
      </section>
    </div>
  );
}
