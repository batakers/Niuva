import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useI18n } from "@/i18n";
import { getPublicRouteMetadata } from "@/lib/publicRoutes";

const configuredPublicSiteUrl = (process.env.REACT_APP_PUBLIC_SITE_URL || "").replace(/\/$/, "");

export function resolveCanonicalOrigin(configuredUrlValue, runtimeOrigin) {
  const normalized = String(configuredUrlValue || "").replace(/\/$/, "");
  try {
    const configuredUrl = new URL(normalized);
    if (
      /^https?:$/.test(configuredUrl.protocol) &&
      !/^(localhost|127\.0\.0\.1)$/i.test(configuredUrl.hostname) &&
      !configuredUrl.username &&
      !configuredUrl.password &&
      configuredUrl.pathname === "/" &&
      !configuredUrl.search &&
      !configuredUrl.hash
    ) {
      return configuredUrl.origin;
    }
  } catch {
    // Runtime origin is the safe fallback when no confirmed public origin is configured.
  }

  return runtimeOrigin;
}

function getCanonicalOrigin() {
  return resolveCanonicalOrigin(configuredPublicSiteUrl, window.location.origin);
}

function getHashTargetId(hash) {
  const encoded = String(hash || "").replace(/^#/, "");
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

function ensureMetaDescription(content) {
  let tag = document.querySelector('meta[name="description"]');

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function ensureCanonical(pathname) {
  let tag = document.querySelector('link[rel="canonical"]');

  if (!pathname) {
    tag?.remove();
    return;
  }

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", `${getCanonicalOrigin()}${pathname}`);
}

function ensureRobots(content) {
  let tag = document.querySelector('meta[name="robots"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "robots");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function replaceLanguageAlternates(alternates) {
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((tag) => tag.remove());

  if (!alternates) return;
  Object.entries(alternates).forEach(([locale, pathname]) => {
    const tag = document.createElement("link");
    tag.setAttribute("rel", "alternate");
    tag.setAttribute("hreflang", locale);
    tag.setAttribute("href", `${getCanonicalOrigin()}${pathname}`);
    document.head.appendChild(tag);
  });
}

/**
 * MarketingLayout
 * For public-facing pages: Home, About, Capabilities, Projects, Contact
 * Full-bleed capable, generous spacing, includes Navbar and Footer.
 */
export function MarketingLayout({ children, hideFooter = false }) {
  const location = useLocation();
  const { lang, t } = useI18n();
  const routeMeta = useMemo(
    () => getPublicRouteMetadata(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    if (location.hash) {
      const targetId = getHashTargetId(location.hash);
      const target = document.getElementById(targetId);
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (routeMeta) {
      document.title = routeMeta.title;
      ensureMetaDescription(routeMeta.description);
      ensureCanonical(routeMeta.canonical);
      ensureRobots(routeMeta.robots);
      replaceLanguageAlternates(routeMeta.alternates);
      return;
    }

    const isRetailDetail = location.pathname.startsWith("/retail/products/");
    ensureCanonical(isRetailDetail ? location.pathname : null);
    ensureRobots(isRetailDetail ? "index, follow" : "noindex, follow");
    replaceLanguageAlternates(null);
  }, [location.pathname, routeMeta]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-page selection:bg-primary/20 selection:text-text-primary">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[60] inline-flex min-h-11 -translate-y-24 items-center rounded-full bg-action-primary-hover px-4 py-2 text-sm font-semibold text-text-inverse transition-transform duration-emphasis ease-snap focus:translate-y-0"
      >
        {lang === "en" ? "Skip to content" : "Lewati ke konten"}
      </a>
      <Navbar />
      <main id="main-content" tabIndex="-1" className="flex-1 w-full max-w-full overflow-x-hidden">
        {routeMeta?.fallbackToIndonesian && (
          <div
            className="border-b border-border-default bg-surface-muted px-4 py-3 text-sm text-text-secondary sm:px-6"
            role="status"
          >
            <p className="mx-auto max-w-[var(--container-wide)]">
              {t("nav.translationUnavailable")}
            </p>
          </div>
        )}
        <div lang={routeMeta?.contentLanguage || lang}>{children}</div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

/**
 * OperationalLayout
 * For dense, data-rich views: Dashboard, Order Detail, Admin
 * Max-width, compact spacing.
 */
export function OperationalLayout({ children, sidebar }) {
  useEffect(() => {
    document.querySelector('link[rel="canonical"]')?.remove();

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");

    return () => robots.remove();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-page selection:bg-primary/20 selection:text-text-primary">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[60] inline-flex min-h-11 -translate-y-24 items-center rounded-control bg-action-primary-hover px-4 py-2 text-sm font-semibold text-text-inverse transition-transform duration-emphasis ease-snap focus:translate-y-0"
      >
        Lewati ke konten
      </a>
      <Navbar />
      <main
        id="main-content"
        tabIndex="-1"
        className="flex-1 px-4 pb-12 pt-[var(--space-page-start)] sm:px-6 w-full max-w-7xl mx-auto flex gap-6"
      >
        {sidebar && (
          <aside className="hidden lg:block w-64 shrink-0">
            {sidebar}
          </aside>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
