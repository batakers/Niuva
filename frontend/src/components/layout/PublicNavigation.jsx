import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useI18n } from "@/i18n";
import {
  getLocaleSwitchPath,
  getPublicLocale,
  getPublicPath,
  resolvePublicRoute,
} from "@/lib/publicRoutes";
import {
  navigationControlClass,
  quietNavigationControlClass,
} from "./navigationStyles";

export const PUBLIC_NAVIGATION_LINKS = [
  { key: "services", labelKey: "nav.services" },
  { key: "projects", labelKey: "nav.portfolio" },
  { key: "about", labelKey: "nav.about" },
  { key: "contact", labelKey: "nav.contact" },
  { key: "retail", labelKey: "nav.retail" },
];

function routeIsActive(pathname, routeKey) {
  const route = resolvePublicRoute(pathname);
  if (route?.key === routeKey) return true;
  return routeKey === "retail" && pathname.startsWith("/retail/products/");
}

function navigationLinkClass(active, mobile = false) {
  const size = mobile ? "px-4 py-3 text-base" : "px-3 py-2";
  return `inline-flex min-h-11 items-center rounded-control font-semibold ${size} transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default ${
    active
      ? "bg-surface-page text-action-primary ring-1 ring-border-default"
      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
  }`;
}

export function PublicNavigation({
  pathname,
  search = "",
  hash = "",
  mobile = false,
  onNavigate,
}) {
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const routeLocale = resolvePublicRoute(pathname)
    ? getPublicLocale(pathname)
    : lang;
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRootRef = useRef(null);
  const languageButtonRef = useRef(null);

  useEffect(() => {
    setLanguageOpen(false);
  }, [pathname, search, hash]);

  useEffect(() => {
    if (mobile || !languageOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!languageRootRef.current?.contains(event.target)) {
        setLanguageOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setLanguageOpen(false);
      languageButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [languageOpen, mobile]);

  const selectLanguage = (locale) => {
    setLang(locale);
    const target = getLocaleSwitchPath(pathname, locale);
    if (target !== pathname) {
      navigate({ pathname: target, search, hash });
    }
    setLanguageOpen(false);
    onNavigate?.();
  };

  const navigationLinks = PUBLIC_NAVIGATION_LINKS.map((item) => (
    <Link
      key={item.key}
      to={getPublicPath(item.key, routeLocale)}
      aria-current={routeIsActive(pathname, item.key) ? "page" : undefined}
      className={navigationLinkClass(
        routeIsActive(pathname, item.key),
        mobile,
      )}
      onClick={onNavigate}
    >
      {t(item.labelKey)}
    </Link>
  ));

  if (mobile) {
    return (
      <>
        {navigationLinks}

        <div className="mt-2 rounded-control border border-border-default">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between rounded-control px-4 py-3 font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-expanded={languageOpen}
            aria-controls="mobile-language-panel"
            onClick={() => setLanguageOpen((current) => !current)}
          >
            <span className="inline-flex items-center gap-2">
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              {routeLocale.toUpperCase()}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-fast ease-standard ${
                languageOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
          {languageOpen && (
            <div
              id="mobile-language-panel"
              className="grid grid-cols-2 gap-2 border-t border-border-default p-3"
            >
              {[
                ["id", "Bahasa Indonesia"],
                ["en", "English"],
              ].map(([locale, label]) => (
                <button
                  key={locale}
                  type="button"
                  className={`min-h-11 rounded-control px-3 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    routeLocale === locale
                      ? "bg-action-primary text-text-inverse"
                      : "bg-surface-muted text-text-primary hover:bg-surface-highlight"
                  }`}
                  aria-pressed={routeLocale === locale}
                  onClick={() => selectLanguage(locale)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          to="/login"
          className={navigationLinkClass(false, true)}
          onClick={onNavigate}
        >
          {t("nav.signIn")}
        </Link>
        <Link
          to={getPublicPath("contact", routeLocale)}
          className="mt-1 inline-flex min-h-11 items-center justify-center rounded-control bg-action-primary px-4 py-3 text-center text-sm font-semibold text-text-inverse transition-colors duration-fast ease-standard hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          onClick={onNavigate}
        >
          {t("nav.discussProject")}
        </Link>
      </>
    );
  }

  return (
    <>
      <nav
        className="hidden items-center gap-1 lg:flex"
        aria-label={t("nav.primary")}
      >
        {navigationLinks}
      </nav>

      <div className="hidden items-center gap-1 lg:flex">
        <div ref={languageRootRef} className="relative">
          <button
            ref={languageButtonRef}
            type="button"
            className={`${quietNavigationControlClass} gap-2 px-3`}
            aria-label={t("nav.changeLanguage")}
            aria-expanded={languageOpen}
            aria-controls="desktop-language-panel"
            onClick={() => setLanguageOpen((current) => !current)}
          >
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            {routeLocale.toUpperCase()}
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {languageOpen && (
            <div
              id="desktop-language-panel"
              className="absolute right-0 top-[calc(100%+0.75rem)] z-30 grid min-w-52 gap-1 rounded-panel bg-surface-default p-2 shadow-overlay ring-1 ring-border-default"
            >
              {[
                ["id", "Bahasa Indonesia"],
                ["en", "English"],
              ].map(([locale, label]) => (
                <button
                  key={locale}
                  type="button"
                  className={`min-h-11 rounded-control px-3 py-2 text-left font-semibold transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    routeLocale === locale
                      ? "bg-surface-highlight text-action-primary"
                      : "text-text-primary hover:bg-surface-muted"
                  }`}
                  aria-pressed={routeLocale === locale}
                  onClick={() => selectLanguage(locale)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Link to="/login" className={`${quietNavigationControlClass} px-3`}>
          {t("nav.signIn")}
        </Link>
        <Link
          to={getPublicPath("contact", routeLocale)}
          className={`${navigationControlClass} bg-action-primary px-4 text-text-inverse hover:bg-action-primary-hover`}
        >
          {t("nav.discussProject")}
        </Link>
      </div>
    </>
  );
}
