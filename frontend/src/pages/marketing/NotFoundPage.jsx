import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/Layout";
import { BrandButton, RoundedVisualFrame } from "../../components/brand/CompanyProfileBlocks";
import { BrandPage, PageHero } from "../../components/brand/BrandSystem";

const HELPFUL_LINKS = [
  { to: "/", label: "Home", desc: "Kembali ke halaman utama Niuva." },
  { to: "/capabilities", label: "Capabilities", desc: "R&D, design engineering, dan prototyping." },
  { to: "/projects", label: "Projects", desc: "Mini case study produk dan mobilitas." },
  { to: "/contact", label: "Contact", desc: "Diskusikan kebutuhan proyek Anda." },
];

export default function NotFoundPage() {
  const location = useLocation();

  // 404 pages must not be indexed. MarketingLayout adds a canonical for the
  // (nonexistent) path, so mark noindex here and restore on unmount.
  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    const previous = robots.getAttribute("content");
    robots.setAttribute("content", "noindex, follow");
    return () => {
      if (created) robots.remove();
      else if (previous !== null) robots.setAttribute("content", previous);
    };
  }, []);

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          label="Error 404"
          title="Halaman yang Anda cari tidak ditemukan."
          body={`Alamat "${location.pathname}" tidak tersedia atau mungkin sudah dipindahkan. Gunakan tautan di bawah untuk kembali ke bagian utama situs Niuva.`}
          variant="standard"
          primaryAction={<BrandButton to="/">Kembali ke Home</BrandButton>}
          secondaryAction={<BrandButton to="/contact" variant="secondary">Hubungi Niuva</BrandButton>}
          visual={
            <RoundedVisualFrame title="Mari kembali ke jalur yang benar." kicker="Kode 404">
              <nav aria-label="Tautan bantuan" className="grid gap-2">
                {HELPFUL_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex min-h-12 flex-col justify-center rounded-control px-4 py-2 text-text-inverse transition-colors duration-emphasis ease-snap hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-xs leading-5 text-text-inverse/80">{item.desc}</span>
                  </Link>
                ))}
              </nav>
            </RoundedVisualFrame>
          }
        />
      </BrandPage>
    </MarketingLayout>
  );
}
