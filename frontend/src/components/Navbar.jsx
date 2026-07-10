import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogoWordmark } from "./ui/logo";
import { useI18n } from "../i18n";

export function Navbar() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const primaryLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/capabilities", label: "Capabilities", aliases: ["/services"] },
    { to: "/projects", label: "Projects", aliases: ["/portfolio"] },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (item) => loc.pathname === item.to || item.aliases?.includes(loc.pathname);
  const smallPillClass = "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-500 ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] xl:text-[0.95rem]";

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between rounded-full bg-white px-4 shadow-[0_14px_44px_rgba(36,50,65,0.10)] ring-1 ring-[rgba(102,146,188,0.18)] sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="Niuva Home">
          <LogoWordmark className="h-6 text-[var(--brand-ink)]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {primaryLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-500 ease-snap xl:text-[0.95rem] ${
                isActive(item)
                  ? "bg-[var(--brand-blue-bg)] text-[var(--brand-blue)]"
                  : "text-[var(--brand-muted)] hover:bg-[var(--brand-blue-bg)] hover:text-[var(--brand-ink)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            data-testid="language-toggle"
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="rounded-full bg-[var(--brand-blue-bg)] px-3 py-2 text-xs font-bold uppercase text-[var(--brand-blue)] transition-colors duration-300 ease-snap hover:bg-[rgba(144,175,205,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {lang}
          </button>

          <Link
            to="/contact"
            className={`${smallPillClass} bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-ink)]`}
          >
            Diskusikan Project
          </Link>
        </div>

        <button
          className="relative h-10 w-10 rounded-full bg-[var(--brand-blue-bg)] transition-colors duration-300 ease-snap hover:bg-[rgba(144,175,205,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          <span
            className={`absolute left-1/2 top-[16px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-[var(--brand-ink)] transition-transform duration-500 ease-snap ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-1/2 top-[23px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-[var(--brand-ink)] transition-transform duration-500 ease-snap ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`fixed inset-x-4 top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[2rem] bg-white p-5 shadow-[0_22px_70px_rgba(36,50,65,0.16)] ring-1 ring-[rgba(102,146,188,0.18)] transition-all duration-500 ease-snap sm:inset-x-6 lg:hidden ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <nav className="grid gap-2" aria-label="Mobile navigation">
          {primaryLinks.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-2xl px-4 py-4 text-lg font-semibold transition-all duration-500 ease-snap ${
                isActive(item)
                  ? "bg-[var(--brand-blue-bg)] text-[var(--brand-blue)]"
                  : "text-[var(--brand-ink)] hover:bg-[var(--brand-blue-bg)]"
              }`}
              style={{ transitionDelay: open ? `${index * 36}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 grid gap-3 border-t border-[rgba(102,146,188,0.2)] pt-4 min-[380px]:grid-cols-2">
            <button
              onClick={() => setLang(lang === "id" ? "en" : "id")}
              className="rounded-full bg-[var(--brand-blue-bg)] px-4 py-3 text-sm font-bold uppercase text-[var(--brand-blue)] transition-colors duration-300 ease-snap hover:bg-[rgba(144,175,205,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
            >
              {lang === "id" ? "English" : "Indonesia"}
            </button>
            <Link to="/contact" className="rounded-full bg-[var(--brand-blue)] px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-500 ease-snap hover:bg-[var(--brand-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]">
              Diskusikan Project
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
