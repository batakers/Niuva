import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import { useI18n } from "@/i18n";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { lang, setLang, t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const menuFocusTimerRef = useRef(null);
  const loc = useLocation();
  const nav = useNavigate();
  const isOperationalRoute =
    loc.pathname === "/dashboard" ||
    loc.pathname === "/order" ||
    loc.pathname.startsWith("/orders/") ||
    (loc.pathname.startsWith("/admin") && loc.pathname !== "/admin/login");
  const primaryLinks = [
    { to: "/", labelKey: "nav.home" },
    { to: "/about", labelKey: "nav.about" },
    { to: "/capabilities", labelKey: "nav.services", aliases: ["/services"] },
    { to: "/projects", labelKey: "nav.portfolio", aliases: ["/portfolio"] },
    { to: "/contact", labelKey: "nav.contact" },
  ];

  const goDash = () => nav(user?.role === "admin" ? "/admin" : "/dashboard");
  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    window.clearTimeout(menuFocusTimerRef.current);
    menuFocusTimerRef.current = window.setTimeout(
      () => mobilePanelRef.current?.querySelector("a")?.focus(),
      50
    );
  };
  const signOut = () => {
    logout();
    window.location.replace("/");
  };
  const isActive = (item) => loc.pathname === item.to || item.aliases?.includes(loc.pathname);
  const smallPillClass = "type-navigation inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control px-4 py-2.5 transition-all duration-emphasis ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98]";
  const outlinePillClass = `${smallPillClass} bg-surface-default text-text-primary ring-1 ring-border-strong hover:bg-surface-muted`;
  const quietPillClass = `${smallPillClass} text-text-secondary hover:bg-surface-muted hover:text-text-primary`;

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      window.clearTimeout(menuFocusTimerRef.current);
      setOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(menuFocusTimerRef.current), []);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 bg-navigation-backdrop px-4 pb-3 pt-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-[var(--container-wide)] items-center justify-between rounded-panel bg-surface-default px-4 shadow-navigation ring-1 ring-border-default sm:px-6">
        <Link to="/" className="-ml-2 flex min-h-11 items-center rounded-control px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" aria-label={t("nav.homeAria")}>
          <BrandIdentity />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("nav.primaryLabel")}>
          {primaryLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item) ? "page" : undefined}
              className={`type-navigation inline-flex min-h-11 items-center rounded-control px-4 py-2 transition-all duration-emphasis ease-snap ${
                isActive(item)
                  ? "bg-surface-page text-action-primary ring-1 ring-[var(--color-border-default)]"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            data-testid="language-toggle"
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            aria-label={lang === "id" ? t("nav.switchToEnglish") : t("nav.switchToIndonesian")}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-control bg-surface-muted px-3 py-2 text-xs font-bold uppercase text-text-primary transition-colors duration-emphasis ease-snap hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
              className={`${smallPillClass} bg-action-primary text-text-inverse hover:bg-action-primary-hover`}
            >
              {t("nav.discussProject")}
            </Link>
          )}
        </div>

        <button
          ref={menuButtonRef}
          className="relative h-11 w-11 cursor-pointer rounded-control bg-surface-muted transition-colors duration-emphasis ease-snap hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden"
          onClick={toggleMenu}
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={open}
          aria-controls="mobile-navigation-panel"
        >
          <span
            className={`absolute left-1/2 top-[17px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-[var(--color-text-primary)] transition-transform duration-emphasis ease-snap ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-1/2 top-[24px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-[var(--color-text-primary)] transition-transform duration-emphasis ease-snap ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        ref={mobilePanelRef}
        id="mobile-navigation-panel"
        aria-hidden={!open}
        className={`fixed inset-x-4 top-[5.5rem] max-h-[calc(100dvh-6.5rem)] overflow-y-auto rounded-feature bg-surface-default p-5 shadow-overlay ring-1 ring-border-default transition-[opacity,transform] duration-emphasis ease-snap sm:inset-x-6 lg:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <nav className="grid gap-2" aria-label={t("nav.mobileLabel")}>
          {primaryLinks.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item) ? "page" : undefined}
              className={`rounded-control px-4 py-4 text-lg font-semibold transition-all duration-emphasis ease-snap ${
                isActive(item)
                  ? "bg-surface-page text-action-primary ring-1 ring-[var(--color-border-default)]"
                  : "text-text-primary hover:bg-surface-muted"
              }`}
              style={{ transitionDelay: open ? `${index * 36}ms` : "0ms" }}
            >
              {t(item.labelKey)}
            </Link>
          ))}
          {/* 380px is retained only for the two compact operational actions. */}
          <div className={`mt-4 grid gap-3 border-t border-border-default pt-4 ${isOperationalRoute ? "min-[380px]:grid-cols-2" : ""}`}>
            <button
              type="button"
              onClick={() => setLang(lang === "id" ? "en" : "id")}
              aria-label={lang === "id" ? t("nav.switchToEnglish") : t("nav.switchToIndonesian")}
              className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-control bg-surface-muted px-4 py-3 text-sm font-bold uppercase text-text-primary transition-colors duration-emphasis ease-snap hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              {lang === "id" ? "English" : "Indonesia"}
            </button>
            {isOperationalRoute && user ? (
              <button type="button" onClick={goDash} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control bg-action-primary px-4 py-3 text-sm font-semibold text-text-inverse transition-all duration-emphasis ease-snap hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                {t("nav.dashboard")}
              </button>
            ) : (
              <Link to="/contact" className="inline-flex min-h-11 items-center justify-center rounded-control bg-action-primary px-4 py-3 text-center text-sm font-semibold text-text-inverse transition-all duration-emphasis ease-snap hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                {t("nav.discussProject")}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
