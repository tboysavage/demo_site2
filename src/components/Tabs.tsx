"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function Tabs({ items }: TabsProps) {
  const [activeId, setActiveId] = useState(() => {
    if (typeof window === "undefined") {
      return items[0]?.id ?? "";
    }
    const hash = window.location.hash.replace("#", "");
    const match = items.find((item) => item.id === hash);
    return match?.id ?? items[0]?.id ?? "";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const match = items.find((item) => item.id === hash);
      if (match) {
        setActiveId(match.id);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [items]);

  useEffect(() => {
    if (!activeId) return;
    const url = new URL(window.location.href);
    url.hash = activeId;
    window.history.replaceState(null, "", url.toString());
  }, [activeId]);

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
              onClick={() => setActiveId(item.id)}
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
        <Accordion items={accordionItems} defaultOpenId={activeId} />
      </div>
    </div>
  );
}
