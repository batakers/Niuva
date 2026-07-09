import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/**
 * MarketingLayout
 * For public-facing pages: Home, About, Services, Portfolio, Ecosystem
 * Full-bleed capable, generous spacing, includes Navbar and Footer.
 */
export function MarketingLayout({ children, hideFooter = false }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--brand-offwhite)] selection:bg-primary/20 selection:text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[60] -translate-y-24 rounded-full bg-[var(--brand-ink)] px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 ease-snap focus:translate-y-0"
      >
        Lewati ke konten
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

/**
 * ConversionLayout
 * For focused task pages: Contact, Internship, Login, Register, Order
 * Narrow centered content, minimal distraction.
 */
export function ConversionLayout({ children, title, subtitle, hideFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <main className="flex-1 px-4 pb-[var(--brand-section-space)] pt-[var(--brand-page-start)] sm:px-6 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          {(title || subtitle) && (
            <div className="mb-10 text-center">
              {title && <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>}
              {subtitle && <p className="mt-3 text-muted-foreground text-lg">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
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
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <main className="flex-1 px-4 pb-12 pt-[var(--brand-page-start)] sm:px-6 w-full max-w-7xl mx-auto flex gap-6">
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
