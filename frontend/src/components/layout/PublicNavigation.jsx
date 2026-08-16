import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useI18n } from "@/i18n";
import {
  getLocaleSwitchPath,
  getPublicLocale,
  getPublicPath,
  PUBLIC_RETAIL_ITEMS,
  PUBLIC_SERVICE_ITEMS,
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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const servicesRootRef = useRef(null);
  const languageRootRef = useRef(null);
  const servicesButtonRef = useRef(null);
  const languageButtonRef = useRef(null);

  useEffect(() => {
    setServicesOpen(false);
    setLanguageOpen(false);
  }, [pathname, search, hash]);

  useEffect(() => {
    if (mobile || (!servicesOpen && !languageOpen)) return undefined;

    const handlePointerDown = (event) => {
      if (
        servicesOpen &&
        !servicesRootRef.current?.contains(event.target)
      ) {
        setServicesOpen(false);
      }
      if (
        languageOpen &&
        !languageRootRef.current?.contains(event.target)
      ) {
        setLanguageOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (languageOpen) {
        setLanguageOpen(false);
        languageButtonRef.current?.focus();
      } else if (servicesOpen) {
        setServicesOpen(false);
        servicesButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [languageOpen, mobile, servicesOpen]);

  const selectLanguage = (locale) => {
    setLang(locale);
    const target = getLocaleSwitchPath(pathname, locale);
    if (target !== pathname) {
      navigate({ pathname: target, search, hash });
    }
    setLanguageOpen(false);
    onNavigate?.();
  };

  const servicePath = getPublicPath("services", routeLocale);
  const retailPath = getPublicPath("retail", routeLocale);

  const serviceLinks = (
    <div className="grid gap-1">
      {PUBLIC_SERVICE_ITEMS.map((service) => (
        <Link
          key={service.slug}
          to={{ pathname: servicePath, hash: service.slug }}
          className="group grid min-h-11 gap-1 rounded-control px-3 py-2 text-left transition-colors duration-fast ease-standard hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          onClick={onNavigate}
        >
          <span className="font-semibold text-text-primary group-hover:text-action-primary">
            {service.labels[routeLocale]}
          </span>
          <span className="text-sm leading-6 text-text-secondary">
            {service.descriptions[routeLocale]}
          </span>
        </Link>
      ))}
    </div>
  );

  const retailLinks = (
    <div className="grid gap-1">
      {PUBLIC_RETAIL_ITEMS.map((item) => (
        <Link
          key={item.hash}
          to={{ pathname: retailPath, hash: item.hash }}
          className="group grid min-h-11 gap-1 rounded-control px-3 py-2 text-left transition-colors duration-fast ease-standard hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          onClick={onNavigate}
        >
          <span className="font-semibold text-text-primary group-hover:text-action-primary">
            {item.labels[routeLocale]}
          </span>
          <span className="text-sm leading-6 text-text-secondary">
            {item.descriptions[routeLocale]}
          </span>
        </Link>
      ))}
      <Link
        to={retailPath}
        className="mt-2 inline-flex min-h-11 items-center rounded-control px-3 py-2 font-semibold text-action-primary hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        onClick={onNavigate}
      >
        {t("nav.exploreRetail")}
      </Link>
    </div>
  );

  if (mobile) {
    return (
      <>
        <div className="rounded-control ring-1 ring-border-default">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between rounded-control px-4 py-3 text-left font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-expanded={servicesOpen}
            aria-controls="mobile-services-panel"
            onClick={() => setServicesOpen((current) => !current)}
          >
            {t("nav.services")}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-fast ease-standard ${
                servicesOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
          {servicesOpen && (
            <div
              id="mobile-services-panel"
              className="grid gap-5 border-t border-border-default p-3"
            >
              <section aria-labelledby="mobile-services-ideas">
                <h2
                  id="mobile-services-ideas"
                  className="px-3 pb-2 text-sm font-semibold text-text-secondary"
                >
                  {t("nav.developIdeas")}
                </h2>
                {serviceLinks}
                <Link
                  to={servicePath}
                  className="mt-1 inline-flex min-h-11 items-center rounded-control px-3 py-2 font-semibold text-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  onClick={onNavigate}
                >
                  {t("nav.allServices")}
                </Link>
              </section>
              <section
                aria-labelledby="mobile-services-retail"
                className="border-t border-border-default pt-4"
              >
                <h2
                  id="mobile-services-retail"
                  className="px-3 pb-2 text-sm font-semibold text-text-secondary"
                >
                  {t("nav.printAndProducts")}
                </h2>
                {retailLinks}
              </section>
            </div>
          )}
        </div>

        {["projects", "about", "contact", "retail"].map((key) => {
          const item = PUBLIC_NAVIGATION_LINKS.find((entry) => entry.key === key);
          return (
            <Link
              key={key}
              to={getPublicPath(key, routeLocale)}
              aria-current={routeIsActive(pathname, key) ? "page" : undefined}
              className={navigationLinkClass(routeIsActive(pathname, key), true)}
              onClick={onNavigate}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}

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
            <div id="mobile-language-panel" className="grid grid-cols-2 gap-2 border-t border-border-default p-3">
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
      <nav className="hidden items-center gap-1 lg:flex" aria-label={t("nav.primary")}>
        <div ref={servicesRootRef} className="relative">
          <button
            ref={servicesButtonRef}
            type="button"
            className={`${navigationLinkClass(routeIsActive(pathname, "services"))} gap-1.5`}
            aria-expanded={servicesOpen}
            aria-controls="desktop-services-panel"
            onClick={() => {
              setLanguageOpen(false);
              setServicesOpen((current) => !current);
            }}
          >
            {t("nav.services")}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-fast ease-standard ${
                servicesOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
          {servicesOpen && (
            <div
              id="desktop-services-panel"
              className="fixed left-1/2 top-[5.75rem] z-30 grid w-[min(64rem,calc(100vw-3rem))] -translate-x-1/2 grid-cols-[minmax(0,3fr)_minmax(17rem,2fr)] gap-0 overflow-hidden rounded-feature bg-surface-default shadow-overlay ring-1 ring-border-default"
            >
              <section className="p-5" aria-labelledby="desktop-services-ideas">
                <div className="mb-3 flex items-center justify-between gap-4 px-3">
                  <h2 id="desktop-services-ideas" className="text-sm font-semibold text-text-secondary">
                    {t("nav.developIdeas")}
                  </h2>
                  <Link
                    to={servicePath}
                    className="inline-flex min-h-11 items-center rounded-control px-3 text-sm font-semibold text-action-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    {t("nav.allServices")}
                  </Link>
                </div>
                {serviceLinks}
              </section>
              <section
                className="border-l border-border-default bg-surface-muted p-5"
                aria-labelledby="desktop-services-retail"
              >
                <h2 id="desktop-services-retail" className="px-3 pb-3 text-sm font-semibold text-text-secondary">
                  {t("nav.printAndProducts")}
                </h2>
                {retailLinks}
              </section>
            </div>
          )}
        </div>

        {["projects", "about", "contact", "retail"].map((key) => {
          const item = PUBLIC_NAVIGATION_LINKS.find((entry) => entry.key === key);
          return (
            <Link
              key={key}
              to={getPublicPath(key, routeLocale)}
              aria-current={routeIsActive(pathname, key) ? "page" : undefined}
              className={navigationLinkClass(routeIsActive(pathname, key))}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
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
            onClick={() => {
              setServicesOpen(false);
              setLanguageOpen((current) => !current);
            }}
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
