import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import { usePublicSettings } from "@/lib/publicSettings";

const HOMEPAGE_TERMINAL_NAVIGATION = [
  { label: "Layanan", to: "/capabilities" },
  { label: "Projects", to: "/projects" },
  { label: "Retail", to: "/retail" },
  { label: "Kontak", to: "/contact" },
  { label: "Privasi", to: "/privacy" },
];

function HomepageTerminalFooter({ currentYear }) {
  return (
    <footer
      data-footer-variant="homepage-terminal"
      className="bg-public-evidence text-text-inverse"
    >
      <div className="mx-auto grid max-w-[var(--container-wide)] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-4 py-6 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-8 lg:px-8">
        <Link
          to="/"
          aria-label="Niuva - Beranda"
          className="inline-flex min-h-11 items-center rounded-control px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-identity-support focus-visible:ring-offset-2 focus-visible:ring-offset-public-evidence"
        >
          <BrandIdentity className="[--color-text-primary-rgb:var(--color-text-inverse-rgb)]" />
        </Link>

        <nav
          aria-label="Navigasi footer Homepage"
          className="col-span-2 row-start-2 flex flex-wrap items-center gap-x-4 md:col-span-1 md:col-start-2 md:row-start-1 md:justify-center"
        >
          {HOMEPAGE_TERMINAL_NAVIGATION.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="inline-flex min-h-11 items-center rounded-control px-2 text-sm font-semibold text-text-inverse transition-colors duration-fast ease-standard hover:text-identity-support focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-identity-support focus-visible:ring-offset-2 focus-visible:ring-offset-public-evidence"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="col-start-2 row-start-1 justify-self-end text-right text-xs font-semibold leading-6 text-identity-support md:col-start-3">
          &copy; {currentYear} Niuva
        </p>
      </div>
    </footer>
  );
}

function LegacyFooter({ currentYear }) {
  const { contact } = usePublicSettings();
  const navigation = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Capabilities", to: "/capabilities" },
    { label: "Projects", to: "/projects" },
    { label: "FAQ", to: "/faq" },
    { label: "Retail", to: "/retail" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <footer
      data-footer-variant="legacy"
      className="border-t border-border-default bg-surface-page"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:gap-12">
          <div>
            <BrandIdentity variant="footer" />
            <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary md:text-lg">
              PT Niuva Inovasi Utama adalah mitra pengembangan inovasi dan produk untuk riset, konsultasi, teknologi, desain kreatif, prototyping, apparel, merchandise, dan workshop praktis.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
            <div>
              <h2 className="text-base font-bold text-text-primary">Navigasi</h2>
              <ul className="mt-4 space-y-2 break-words text-sm leading-6 text-text-secondary md:text-base">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="inline-flex min-h-11 min-w-11 items-center transition-colors duration-emphasis ease-snap hover:text-action-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Kontak</h2>
              <ul className="mt-4 space-y-3 break-words text-sm leading-6 text-text-secondary md:text-base">
                {contact.location && <li>{contact.location}</li>}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center transition-colors duration-emphasis ease-snap hover:text-action-primary">
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.whatsappHref && contact.whatsapp && (
                  <li>
                    <a href={contact.whatsappHref} className="inline-flex min-h-11 items-center transition-colors duration-emphasis ease-snap hover:text-action-primary">
                      WhatsApp {contact.whatsapp}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border-default pt-6 text-xs font-semibold leading-6 text-text-secondary md:flex-row md:items-center md:justify-between">
          <p>(c) {currentYear} PT Niuva Inovasi Utama</p>
          <Link to="/privacy" className="inline-flex min-h-11 items-center transition-colors duration-emphasis ease-snap hover:text-action-primary">
            Privacy Policy
          </Link>
          <p>Bandung Techno Park - Mitra inovasi dan pengembangan produk</p>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { pathname } = useLocation();

  if (pathname === "/") {
    return <HomepageTerminalFooter currentYear={currentYear} />;
  }

  return <LegacyFooter currentYear={currentYear} />;
}
