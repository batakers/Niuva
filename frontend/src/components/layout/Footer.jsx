import React from "react";
import { Link } from "react-router-dom";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import { profileContent } from "@/components/brand/CompanyProfileBlocks";

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
    <footer className="border-t border-border-default bg-surface-page">
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
                <li>{profileContent.contact.location}</li>
                <li>
                  <a href={`mailto:${profileContent.contact.email}`} className="inline-flex min-h-11 items-center transition-colors duration-emphasis ease-snap hover:text-action-primary">
                    {profileContent.contact.email}
                  </a>
                </li>
                <li>
                  <a href={profileContent.contact.whatsappHref} className="inline-flex min-h-11 items-center transition-colors duration-emphasis ease-snap hover:text-action-primary">
                    WhatsApp {profileContent.contact.whatsapp}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border-default pt-6 text-xs font-semibold leading-6 text-text-secondary md:flex-row md:items-center md:justify-between">
          <p>(c) {currentYear} PT Niuva Inovasi Utama</p>
          <p>Bandung Techno Park - Mitra inovasi dan pengembangan produk</p>
        </div>
      </div>
    </footer>
  );
}
