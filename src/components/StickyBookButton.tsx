import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

export default function StickyBookButton() {
  const { ui } = clinicUltrasoundScansContent;
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-sm justify-center px-4 lg:hidden">
      <a
        href="/booking"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink-strong)] px-4 py-3 text-sm font-semibold text-white shadow-lg"
      >
        {ui.buttons.bookScan}
      </a>
    </div>
  );
}
