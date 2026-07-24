import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const DEFAULT_PUBLIC_META = {
  title: "Niuva Inovasi Utama - Mitra R&D, Design Engineering, dan Prototyping",
  description:
    "PT Niuva Inovasi Utama membantu organisasi mengembangkan inovasi, riset produk, design engineering, prototyping, EV/product development, simulator, workshop, apparel, dan merchandise.",
  canonical: "/",
};

const PUBLIC_ROUTE_META = {
  "/": DEFAULT_PUBLIC_META,
  "/about": {
    title: "Tentang Niuva - Mitra Inovasi dan Pengembangan Produk",
    description:
      "Kenali PT Niuva Inovasi Utama sebagai mitra strategis untuk inovasi, riset berbasis kebutuhan, konsultasi ahli, design engineering, prototyping, dan pertumbuhan bisnis berkelanjutan.",
    canonical: "/about",
  },
  "/capabilities": {
    title: "Capabilities Niuva - R&D, Design Engineering, dan Prototyping",
    description:
      "Pelajari kapabilitas Niuva untuk Research & Development, Design & Prototyping, Consultant & Workshop, serta Apparel & Merchandise.",
    canonical: "/capabilities",
  },
  "/services": {
    title: "Capabilities Niuva - R&D, Design Engineering, dan Prototyping",
    description:
      "Pelajari kapabilitas Niuva untuk Research & Development, Design & Prototyping, Consultant & Workshop, serta Apparel & Merchandise.",
    canonical: "/capabilities",
  },
  "/projects": {
    title: "Projects Niuva - Mobilitas, EV, Simulator, dan Produk Teknis",
    description:
      "Lihat mini case study Niuva untuk Redesain Motor Xeon, Pengembangan Motor EV PT Pindad, Bicycle Arcade Agate, dan Motorcycle Simulator Agate.",
    canonical: "/projects",
  },
  "/portfolio": {
    title: "Projects Niuva - Mobilitas, EV, Simulator, dan Produk Teknis",
    description:
      "Lihat mini case study Niuva untuk Redesain Motor Xeon, Pengembangan Motor EV PT Pindad, Bicycle Arcade Agate, dan Motorcycle Simulator Agate.",
    canonical: "/projects",
  },
  "/contact": {
    title: "Contact Niuva - Diskusikan Project R&D dan Prototyping",
    description:
      "Hubungi Niuva melalui WhatsApp, email, atau form project intake untuk kebutuhan riset, desain, prototyping, EV/product development, simulator, workshop, apparel, dan merchandise.",
    canonical: "/contact",
  },
};

const configuredPublicSiteUrl = (process.env.REACT_APP_PUBLIC_SITE_URL || "").replace(/\/$/, "");

function getCanonicalOrigin() {
  try {
    const configuredUrl = new URL(configuredPublicSiteUrl);
    if (/^https?:$/.test(configuredUrl.protocol) && !/^(localhost|127\.0\.0\.1)$/i.test(configuredUrl.hostname)) {
      return configuredUrl.origin;
    }
  } catch {
    // Runtime origin is the safe fallback when no confirmed public origin is configured.
  }

  return window.location.origin;
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

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", `${getCanonicalOrigin()}${pathname}`);
}

/**
 * MarketingLayout
 * For public-facing pages: Home, About, Capabilities, Projects, Contact
 * Full-bleed capable, generous spacing, includes Navbar and Footer.
 */
export function MarketingLayout({ children, hideFooter = false }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const routeMeta = PUBLIC_ROUTE_META[location.pathname] || {
      ...DEFAULT_PUBLIC_META,
      canonical: location.pathname,
    };
    document.title = routeMeta.title;
    ensureMetaDescription(routeMeta.description);
    ensureCanonical(routeMeta.canonical || location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-page selection:bg-primary/20 selection:text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[60] inline-flex min-h-11 -translate-y-24 items-center rounded-full bg-[var(--color-text-primary)] px-4 py-2 text-sm font-semibold text-text-inverse transition-transform duration-emphasis ease-snap focus:translate-y-0"
      >
        Lewati ke konten
      </a>
      <Navbar />
      <main id="main-content" tabIndex="-1" className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
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
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <main className="flex-1 px-4 pb-12 pt-[var(--space-page-start)] sm:px-6 w-full max-w-7xl mx-auto flex gap-6">
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
