"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

const { brand, navigation } = clinicUltrasoundScansContent;
const activeNavigationItems = navigation.menu.filter((item) => item.href && item.href !== "#");
const activeSocialLinks = brand.socials.filter((social) => social.href && social.href !== "#");

const socialIcons: Record<string, React.ReactElement> = {
  Facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M13.5 9.5H16l.5-3h-3v-1.5c0-1 .3-1.5 1.6-1.5H16V1.1C15.7 1 14.7 1 13.5 1c-2.5 0-4.2 1.5-4.2 4.3v2.2H7v3h2.3V23h3.2V12.5h2.7l.4-3h-3.1V9.5Z"
      />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5Zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5Zm5.2-3.4a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"
      />
    </svg>
  ),
  WhatsApp: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M12 2a9.9 9.9 0 0 0-8.6 14.7L2 22l5.5-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 20Zm4.6-5.7c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.2-.2.2-.7.7-.8.8-.1.1-.3.2-.5.1a6.6 6.6 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.3 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4H8.3c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.7 4.3 3.7.6.3 1.1.4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.2-.1-.4-.2Z"
      />
    </svg>
  ),
  "Twitter/X": (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M18.2 2H22l-8.3 9.6L23 22h-6.7l-5.3-6.3L5.3 22H1.5l8.9-10.2L1 2h6.9l4.9 5.8L18.2 2Zm-1.2 18h2.2L8 4H5.7l11.3 16Z"
      />
    </svg>
  ),
};

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function isActiveNavItem(href: string) {
    const baseHref = href.split("#")[0];

    if (!baseHref || baseHref === "#") {
      return false;
    }

    if (baseHref === "/") {
      return pathname === "/";
    }

    return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
  }

  return (
    <header className="relative z-30">
      <div className="bg-[var(--ink-strong)] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="w-full opacity-80 sm:w-auto">{brand.address}</span>
            <a
              href={`tel:${brand.phone}`}
              className="font-semibold tracking-wide"
            >
              {brand.phone}
            </a>
            <a
              href={`mailto:${brand.email}`}
              className="font-semibold tracking-wide text-white/90 transition hover:text-white"
            >
              {brand.email}
            </a>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {activeSocialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-white/80 transition hover:text-white"
              >
                {socialIcons[social.label]}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#c7e7fb]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-4 rounded-2xl border-2 border-solid border-[var(--accent-strong)] bg-white/92 px-3 py-2 shadow-sm"
          >
            <Image
              src="/logo.png"
              alt="Baby Sonovue LTD"
              width={150}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            {activeNavigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActiveNavItem(item.href) ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActiveNavItem(item.href)
                    ? "bg-white text-[var(--accent-strong)] shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="/booking"
              className="rounded-full bg-[var(--accent-strong)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--ink-strong)]"
            >
              {navigation.bookButtonLabel}
            </a>
          </div>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-site-menu"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white lg:hidden"
            onClick={() => setIsMenuOpen((currentState) => !currentState)}
          >
            <span>{isMenuOpen ? "Close" : "Menu"}</span>
            <span className="flex h-4 w-5 flex-col justify-between" aria-hidden="true">
              <span
                className={`block h-0.5 w-full rounded-full bg-current transition ${
                  isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full rounded-full bg-current transition ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full rounded-full bg-current transition ${
                  isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
        <div
          className={`border-t border-slate-200/80 lg:hidden ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <div className="mx-auto max-w-6xl px-4 py-4">
            <nav
              id="mobile-site-menu"
              className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-2 shadow-lg"
            >
              <div className="flex flex-col gap-1">
                {activeNavigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={isActiveNavItem(item.href) ? "page" : undefined}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActiveNavItem(item.href)
                        ? "bg-[var(--baby-blue)] text-slate-900 ring-1 ring-slate-200/80"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 border-t border-slate-200 pt-3">
                <a
                  href="/booking"
                  className="block rounded-full bg-[var(--accent-strong)] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--ink-strong)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {navigation.bookButtonLabel}
                </a>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
