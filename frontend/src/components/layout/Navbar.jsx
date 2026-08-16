import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import { OperationalNavigation } from "@/components/layout/OperationalNavigation";
import { PublicNavigation } from "@/components/layout/PublicNavigation";
import { useI18n } from "@/i18n";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";
import {
  getPublicLocale,
  getPublicPath,
  resolvePublicRoute,
} from "@/lib/publicRoutes";

export const PUBLIC_NAVBAR_COMPACT_THRESHOLD = 96;

export function Navbar() {
  const { lang, setLang, t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const compactSentinelRef = useRef(null);
  const menuButtonRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const menuFocusTimerRef = useRef(null);
  const loc = useLocation();
  const nav = useNavigate();
  const canAccessAdmin = hasPermission(user, "admin.access");
  const matchedPublicRoute = resolvePublicRoute(loc.pathname);
  const activeLocale = matchedPublicRoute
    ? getPublicLocale(loc.pathname)
    : lang;
  const isOperationalRoute =
    loc.pathname === "/dashboard" ||
    loc.pathname === "/order" ||
    loc.pathname.startsWith("/orders/") ||
    (loc.pathname.startsWith("/admin") && loc.pathname !== "/admin/login");
  const isPublicRoute = Boolean(matchedPublicRoute);
  const compact = scrolled && isPublicRoute;
  const workspaceLabel = canAccessAdmin
    ? t("nav.adminStudio")
    : t("nav.customerOrders");

  const goDash = () => nav(canAccessAdmin ? "/admin" : "/dashboard");
  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
  };
  const signOut = async () => {
    await logout();
    window.location.replace(getPublicPath("home", lang));
  };
  useEffect(() => {
    setOpen(false);
  }, [loc.hash, loc.pathname, loc.search]);

  useEffect(() => {
    if (!isPublicRoute) {
      setScrolled(false);
      return undefined;
    }

    // Keep the capsule stable while the modal mobile menu owns focus.
    if (open) return undefined;

    const sentinel = compactSentinelRef.current;
    if (!sentinel) return undefined;

    const updateFromScroll = () => {
      setScrolled(window.scrollY > PUBLIC_NAVBAR_COMPACT_THRESHOLD);
    };

    if (typeof window.IntersectionObserver !== "function") {
      updateFromScroll();
      window.addEventListener("scroll", updateFromScroll, { passive: true });
      return () => window.removeEventListener("scroll", updateFromScroll);
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [isPublicRoute, open]);

  useEffect(() => {
    if (!open) return undefined;

    let attempts = 0;
    const focusFirstMenuItem = () => {
      const first = mobilePanelRef.current?.querySelector(
        'a[href], button:not([disabled])'
      );
      if (first) {
        first.focus();
        if (document.activeElement === first) return;
      }
      if (attempts >= 30) return;
      attempts += 1;
      menuFocusTimerRef.current = window.setTimeout(focusFirstMenuItem, 16);
    };

    menuFocusTimerRef.current = window.setTimeout(focusFirstMenuItem, 0);
    return () => window.clearTimeout(menuFocusTimerRef.current);
  }, [open]);
  useEffect(() => {
    document.documentElement.lang = activeLocale;
  }, [activeLocale]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        window.clearTimeout(menuFocusTimerRef.current);
        setOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = mobilePanelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const insidePanel = mobilePanelRef.current?.contains(active);
      if (!insidePanel) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(menuFocusTimerRef.current), []);

  return (
    <>
      {isPublicRoute && (
        <span
          ref={compactSentinelRef}
          data-testid="public-navbar-compact-sentinel"
          aria-hidden="true"
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: `${PUBLIC_NAVBAR_COMPACT_THRESHOLD}px` }}
        />
      )}
      <header
        data-compact={compact ? "true" : "false"}
        className={`fixed left-0 right-0 top-0 z-40 bg-navigation-backdrop px-4 transition-[padding] duration-deliberate ease-snap motion-reduce:transition-none sm:px-6 lg:px-8 ${
          compact ? "py-2" : "pb-3 pt-3"
        }`}
      >
      <div
        className={`relative z-10 mx-auto flex max-w-[var(--container-wide)] items-center justify-between rounded-panel bg-surface-default px-4 shadow-navigation ring-1 ring-border-default transition-[height,max-width] duration-deliberate ease-snap motion-reduce:transition-none sm:px-6 ${
          compact ? "h-14 xl:max-w-[76rem]" : "h-16"
        }`}
      >
        <Link
          to={getPublicPath("home", activeLocale)}
          className="-ml-2 flex min-h-11 items-center rounded-control px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label={
            activeLocale === "en"
              ? "Niuva Inovasi Utama - Home"
              : "Niuva Inovasi Utama - Beranda"
          }
        >
          <BrandIdentity />
        </Link>

        {isOperationalRoute ? (
          <OperationalNavigation
            lang={lang}
            languageAriaLabel={
              lang === "id"
                ? "Ganti bahasa ke English"
                : "Switch language to Bahasa Indonesia"
            }
            logoutLabel={t("nav.logout")}
            onLanguageToggle={() => setLang(lang === "id" ? "en" : "id")}
            onSignOut={signOut}
            onWorkspace={goDash}
            signedIn={Boolean(user)}
            siteLabel={t("nav.site")}
            workspaceLabel={workspaceLabel}
          />
        ) : (
          <PublicNavigation
            pathname={loc.pathname}
            search={loc.search}
            hash={loc.hash}
          />
        )}

        <button
          ref={menuButtonRef}
          className="relative h-11 w-11 cursor-pointer rounded-control bg-surface-muted transition-colors duration-emphasis ease-snap hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default lg:hidden"
          onClick={toggleMenu}
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={open}
          aria-controls="mobile-navigation-panel"
        >
          <span
            className={`absolute left-1/2 top-[17px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-text-primary transition-transform duration-emphasis ease-snap ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-1/2 top-[24px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-text-primary transition-transform duration-emphasis ease-snap ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div
          data-testid="mobile-navigation-backdrop"
          aria-hidden="true"
          className="fixed inset-0 z-0 bg-text-primary/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        ref={mobilePanelRef}
        id="mobile-navigation-panel"
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label={t("nav.mobile")}
        inert={!open}
        className={`fixed inset-x-4 top-[5.5rem] z-10 max-h-[calc(100dvh-6.5rem)] overflow-y-auto rounded-feature bg-surface-default p-5 shadow-overlay ring-1 ring-border-default transition-[opacity,transform] duration-emphasis ease-snap sm:inset-x-6 lg:hidden ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <nav className="grid gap-2" aria-label={t("nav.mobile")}>
          {isOperationalRoute ? (
            <OperationalNavigation
              lang={lang}
              languageAriaLabel={
                lang === "id"
                  ? "Ganti bahasa ke English"
                  : "Switch language to Bahasa Indonesia"
              }
              logoutLabel={t("nav.logout")}
              mobile
              onLanguageToggle={() => setLang(lang === "id" ? "en" : "id")}
              onSignOut={signOut}
              onWorkspace={goDash}
              signedIn={Boolean(user)}
              siteLabel={t("nav.site")}
              workspaceLabel={workspaceLabel}
            />
          ) : (
            <PublicNavigation
              pathname={loc.pathname}
              search={loc.search}
              hash={loc.hash}
              mobile
              onNavigate={() => setOpen(false)}
            />
          )}
        </nav>
      </div>
      </header>
    </>
  );
}
