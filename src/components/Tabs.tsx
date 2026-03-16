"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Accordion, { AccordionItem } from "@/components/Accordion";

export type TabItem = {
  id: string;
  label: string;
  description?: string;
  content: React.ReactNode;
};

type TabsProps = {
  items: TabItem[];
};

function resolveActiveId(
  items: TabItem[],
  packageParam?: string,
  hash?: string
) {
  const packageMatch = items.find((item) => item.id === packageParam);

  if (packageMatch) {
    return packageMatch.id;
  }

  const hashMatch = items.find((item) => item.id === hash);
  return hashMatch?.id ?? items[0]?.id ?? "";
}

export default function Tabs({ items }: TabsProps) {
  const searchParams = useSearchParams();
  const packageParam = searchParams.get("package") ?? "";

  const [activeId, setActiveId] = useState(() => {
    if (typeof window === "undefined") {
      return items[0]?.id ?? "";
    }
    const hash = window.location.hash.replace("#", "");
    const currentPackage = new URLSearchParams(window.location.search).get("package") ?? "";
    return resolveActiveId(items, currentPackage, hash);
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const nextId = resolveActiveId(items, packageParam, hash);
      setActiveId(nextId);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [items, packageParam]);

  function activateTab(nextId: string) {
    setActiveId(nextId);

    const url = new URL(window.location.href);
    url.searchParams.delete("package");
    url.hash = nextId;
    window.history.replaceState(null, "", url.toString());
  }

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  const accordionItems: AccordionItem[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.label,
        content: item.content,
      })),
    [items]
  );

  return (
    <div className="mt-10">
      <div className="hidden gap-8 lg:grid lg:grid-cols-[240px_1fr]">
        <div className="space-y-3" role="tablist" aria-orientation="vertical">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              id={`tab-${item.id}`}
              aria-controls={item.id}
              role="tab"
              aria-selected={activeId === item.id}
              tabIndex={activeId === item.id ? 0 : -1}
              onClick={() => activateTab(item.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                activeId === item.id
                  ? "border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--ink-strong)]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[var(--accent-strong)]"
              }`}
            >
              <div>{item.label}</div>
              {item.description ? (
                <div className="mt-1 text-xs text-muted">{item.description}</div>
              ) : null}
            </button>
          ))}
        </div>
        <div>
          <div
            id={activeItem?.id}
            className="rounded-3xl border border-slate-200 bg-white p-6"
            role="tabpanel"
            aria-labelledby={`tab-${activeItem?.id}`}
          >
            {activeItem?.content}
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <Accordion key={activeId} items={accordionItems} defaultOpenId={activeId} />
      </div>
    </div>
  );
}
