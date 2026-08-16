import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import { useI18n } from "@/i18n";
import { usePublicSettings } from "@/lib/publicSettings";
import {
  getPublicLocale,
  getPublicPath,
  resolvePublicRoute,
} from "@/lib/publicRoutes";

function HomepageTerminalFooter({ currentYear, locale }) {
  const { t } = useI18n();
  const navigation = [
    { label: t("nav.services"), to: getPublicPath("services", locale) },
    { label: t("nav.portfolio"), to: getPublicPath("projects", locale) },
    { label: t("nav.retail"), to: getPublicPath("retail", locale) },
    { label: t("nav.contact"), to: getPublicPath("contact", locale) },
    { label: locale === "en" ? "Privacy" : "Privasi", to: getPublicPath("privacy", locale) },
  ];
  return (
    <footer
      data-footer-variant="homepage-terminal"
      className="home-r4-terminal-footer bg-transparent text-text-inverse"
    >
      <div className="home-r4-terminal-footer-inner mx-auto grid max-w-[var(--container-wide)] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-4 py-6 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-8 lg:px-8">
        <Link
          to={getPublicPath("home", locale)}
          aria-label={locale === "en" ? "Niuva - Home" : "Niuva - Beranda"}
          className="inline-flex min-h-11 items-center rounded-control px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-identity-support focus-visible:ring-offset-2 focus-visible:ring-offset-public-evidence"
        >
          <BrandIdentity className="[--color-text-primary-rgb:var(--color-text-inverse-rgb)]" />
        </Link>

        <nav
          aria-label={locale === "en" ? "Homepage footer navigation" : "Navigasi footer Homepage"}
          className="col-span-2 row-start-2 flex flex-wrap items-center gap-x-4 md:col-span-1 md:col-start-2 md:row-start-1 md:justify-center"
        >
          {navigation.map((item) => (
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

function LegacyFooter({ currentYear, locale }) {
  const { t } = useI18n();
  const { contact } = usePublicSettings();
  const navigation = [
    { label: t("nav.home"), to: getPublicPath("home", locale) },
    { label: t("nav.about"), to: getPublicPath("about", locale) },
    { label: t("nav.services"), to: getPublicPath("services", locale) },
    { label: t("nav.portfolio"), to: getPublicPath("projects", locale) },
    { label: "FAQ", to: getPublicPath("faq", locale) },
    { label: t("nav.retail"), to: getPublicPath("retail", locale) },
    { label: t("nav.contact"), to: getPublicPath("contact", locale) },
  ];
  const english = locale === "en";

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
              {english
                ? "PT Niuva Inovasi Utama is an innovation and product development partner across research, consulting, technology, creative design, prototyping, apparel, merchandise, and practical workshops."
                : "PT Niuva Inovasi Utama adalah mitra pengembangan inovasi dan produk untuk riset, konsultasi, teknologi, desain kreatif, prototyping, apparel, merchandise, dan workshop praktis."}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {english ? "Navigation" : "Navigasi"}
              </h2>
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
              <h2 className="text-base font-bold text-text-primary">
                {english ? "Contact" : "Kontak"}
              </h2>
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
          <Link to={getPublicPath("privacy", locale)} className="inline-flex min-h-11 items-center transition-colors duration-emphasis ease-snap hover:text-action-primary">
            {english ? "Privacy Policy" : "Kebijakan Privasi"}
          </Link>
          <p>
            {english
              ? "Bandung Techno Park - Innovation and product development partner"
              : "Bandung Techno Park - Mitra inovasi dan pengembangan produk"}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { pathname } = useLocation();
  const { lang } = useI18n();
  const route = resolvePublicRoute(pathname);
  const locale = route ? getPublicLocale(pathname) : lang;

  if (route?.key === "home") {
    return <HomepageTerminalFooter currentYear={currentYear} locale={locale} />;
  }

  return <LegacyFooter currentYear={currentYear} locale={locale} />;
}
