import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogoWordmark } from "./ui/logo";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { lang, setLang, t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const isOperationalRoute =
    loc.pathname === "/dashboard" ||
    loc.pathname === "/order" ||
    loc.pathname.startsWith("/orders/") ||
    (loc.pathname.startsWith("/admin") && loc.pathname !== "/admin/login");
  const primaryLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/capabilities", label: "Capabilities", aliases: ["/services"] },
    { to: "/projects", label: "Projects", aliases: ["/portfolio"] },
    { to: "/contact", label: "Contact" },
  ];

  const goDash = () => nav(user?.role === "admin" ? "/admin" : "/dashboard");
  const signOut = () => {
    logout();
    window.location.replace("/");
  };
  const isActive = (item) => loc.pathname === item.to || item.aliases?.includes(loc.pathname);
  const smallPillClass = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--brand-radius-control)] px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] xl:text-[0.95rem]";
  const outlinePillClass = `${smallPillClass} bg-white text-[var(--brand-ink)] ring-1 ring-[rgba(102,146,188,0.28)] hover:bg-[var(--brand-blue-bg)]`;
  const quietPillClass = `${smallPillClass} text-[var(--brand-muted)] hover:bg-[var(--brand-blue-bg)] hover:text-[var(--brand-ink)]`;

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
    <header className="fixed left-0 right-0 top-0 z-40 bg-[rgba(248,250,252,0.96)] px-4 pb-3 pt-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-[var(--brand-container)] items-center justify-between rounded-[var(--brand-radius-panel)] bg-white px-4 shadow-[var(--brand-shadow-nav)] ring-1 ring-[rgba(102,146,188,0.18)] sm:px-6">
        <Link to="/" className="-ml-2 flex min-h-11 items-center gap-2 rounded-[var(--brand-radius-control)] px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]" aria-label="Niuva Home">
          <LogoWordmark className="h-6 text-[var(--brand-ink)]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {primaryLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-[var(--brand-radius-control)] px-4 py-2 text-sm font-semibold transition-all duration-300 ease-snap xl:text-[0.95rem] ${
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
            aria-label={lang === "id" ? "Ganti bahasa ke English" : "Switch language to Bahasa Indonesia"}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-[var(--brand-radius-control)] bg-[var(--brand-blue-bg)] px-3 py-2 text-xs font-bold uppercase text-[var(--brand-blue)] transition-colors duration-300 ease-snap hover:bg-[rgba(144,175,205,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {lang}
          </button>

          {isOperationalRoute && user ? (
            <>
              <button onClick={goDash} type="button" className={outlinePillClass}>
                {user.role === "admin" ? t("nav.admin") : t("nav.dashboard")}
              </button>
              <button
                onClick={signOut}
                type="button"
                className={quietPillClass}
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link
              to="/contact"
              className={`${smallPillClass} bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-ink)]`}
            >
              Diskusikan Project
            </Link>
          )}
        </div>

        <button
          className="relative h-11 w-11 cursor-pointer rounded-[var(--brand-radius-control)] bg-[var(--brand-blue-bg)] transition-colors duration-300 ease-snap hover:bg-[rgba(144,175,205,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          <span
            className={`absolute left-1/2 top-[17px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-[var(--brand-ink)] transition-transform duration-500 ease-snap ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-1/2 top-[24px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-[var(--brand-ink)] transition-transform duration-500 ease-snap ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`fixed inset-x-4 top-[5.5rem] max-h-[calc(100dvh-6.5rem)] overflow-y-auto rounded-[var(--brand-radius-outer)] bg-white p-5 shadow-[var(--brand-shadow-dialog)] ring-1 ring-[rgba(102,146,188,0.18)] transition-all duration-300 ease-snap sm:inset-x-6 lg:hidden ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <nav className="grid gap-2" aria-label="Mobile navigation">
          {primaryLinks.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item) ? "page" : undefined}
              className={`rounded-[var(--brand-radius-control)] px-4 py-4 text-lg font-semibold transition-all duration-300 ease-snap ${
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
              aria-label={lang === "id" ? "Ganti bahasa ke English" : "Switch language to Bahasa Indonesia"}
              className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-[var(--brand-radius-control)] bg-[var(--brand-blue-bg)] px-4 py-3 text-sm font-bold uppercase text-[var(--brand-blue)] transition-colors duration-300 ease-snap hover:bg-[rgba(144,175,205,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
            >
              {lang === "id" ? "English" : "Indonesia"}
            </button>
            {isOperationalRoute && user ? (
              <button onClick={goDash} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--brand-radius-control)] bg-[var(--brand-blue)] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ease-snap hover:bg-[var(--brand-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]">
                Dashboard
              </button>
            ) : (
              <Link to="/contact" className="inline-flex min-h-11 items-center justify-center rounded-[var(--brand-radius-control)] bg-[var(--brand-blue)] px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-300 ease-snap hover:bg-[var(--brand-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]">
                Diskusikan Project
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
