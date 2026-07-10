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
