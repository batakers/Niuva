import React from "react";
import { Link } from "react-router-dom";
import { LogoWordmark } from "./ui/logo";
import { DotPagination, ULineMotif, profileContent } from "./brand/CompanyProfileBlocks";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const navigation = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Capabilities", to: "/capabilities" },
    { label: "Projects", to: "/projects" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[var(--brand-offwhite)]">
      <div className="mx-auto max-w-[1280px] px-4 py-[var(--brand-footer-space)] sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.65rem] bg-white p-6 shadow-[0_18px_60px_rgba(36,50,65,0.06)] sm:rounded-[2rem] sm:p-8 md:p-10">
          <ULineMotif className="absolute -right-16 -top-20 h-48 w-48 opacity-30 sm:-right-20 sm:-top-24 sm:h-64 sm:w-64" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <div>
              <LogoWordmark className="h-8 text-[var(--brand-ink)]" />
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--brand-muted)] md:text-lg">
                PT Niuva Inovasi Utama adalah mitra pengembangan inovasi dan produk untuk riset, konsultasi, teknologi, desain kreatif, prototyping, apparel, merchandise, dan workshop praktis.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {profileContent.services.map((service) => (
                  <span key={service.title} className="rounded-full bg-[var(--brand-blue-bg)] px-3 py-2 text-xs font-semibold text-[var(--brand-ink)]">
                    {service.accent}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-8 min-[520px]:grid-cols-2">
              <div>
                <h4 className="text-base font-bold text-[var(--brand-ink)]">Navigasi</h4>
                <ul className="mt-4 space-y-3 break-words text-sm leading-6 text-[var(--brand-muted)] md:text-base">
                  {navigation.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className="transition-colors duration-300 ease-snap hover:text-[var(--brand-blue)]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--brand-ink)]">Kontak</h4>
                <ul className="mt-4 space-y-3 break-words text-sm leading-6 text-[var(--brand-muted)] md:text-base">
                  <li>{profileContent.contact.location}</li>
                  <li>
                    <a href={`mailto:${profileContent.contact.email}`} className="transition-colors duration-300 ease-snap hover:text-[var(--brand-blue)]">
                      {profileContent.contact.email}
                    </a>
                  </li>
                  <li>
                    <a href={profileContent.contact.whatsappHref} className="transition-colors duration-300 ease-snap hover:text-[var(--brand-blue)]">
                      WhatsApp {profileContent.contact.whatsapp}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-8 flex flex-col gap-4 border-t border-[rgba(102,146,188,0.18)] pt-6 text-xs font-semibold leading-6 text-[var(--brand-muted)] md:mt-10 md:flex-row md:items-center md:justify-between">
            <p>(c) {currentYear} PT Niuva Inovasi Utama</p>
            <div className="flex flex-col gap-3 md:items-end">
              <p>Bandung Techno Park - Mitra inovasi dan pengembangan produk</p>
              <DotPagination count={4} active={1} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
