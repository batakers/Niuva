import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/Layout";
import { BrandButton, RoundedVisualFrame } from "../../components/brand/CompanyProfileBlocks";
import { BrandPage, PageHero } from "../../components/brand/BrandSystem";
import { useI18n } from "@/i18n";
import { getPublicLocale, getPublicPath } from "@/lib/publicRoutes";

export default function NotFoundPage() {
  const location = useLocation();
  const { lang } = useI18n();
  const locale = getPublicLocale(location.pathname, lang);
  const english = locale === "en";
  const title = english
    ? "Page not found - Niuva Inovasi Utama"
    : "Halaman tidak ditemukan - Niuva Inovasi Utama";
  const description = english
    ? "The requested Niuva page is unavailable. Return home or use the main navigation."
    : "Halaman Niuva yang diminta tidak tersedia. Kembali ke Beranda atau gunakan navigasi utama.";

  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [description, title]);
  const helpfulLinks = [
    {
      key: "home",
      label: english ? "Home" : "Beranda",
      desc: english ? "Return to the Niuva homepage." : "Kembali ke halaman utama Niuva.",
    },
    {
      key: "services",
      label: english ? "Services" : "Layanan",
      desc: english ? "Research, consulting, design, and creative products." : "Riset, konsultasi, desain, dan produk kreatif.",
    },
    {
      key: "projects",
      label: english ? "Projects" : "Proyek",
      desc: english ? "Product and mobility project evidence." : "Bukti project produk dan mobilitas.",
    },
    {
      key: "contact",
      label: english ? "Contact" : "Kontak",
      desc: english ? "Discuss your project need." : "Diskusikan kebutuhan proyek Anda.",
    },
  ];

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          label="Error 404"
          title={english ? "The page you are looking for was not found." : "Halaman yang Anda cari tidak ditemukan."}
          body={english
            ? `The address "${location.pathname}" is unavailable or may have moved. Use the links below to return to a main Niuva page.`
            : `Alamat "${location.pathname}" tidak tersedia atau mungkin sudah dipindahkan. Gunakan tautan di bawah untuk kembali ke bagian utama situs Niuva.`}
          variant="standard"
          primaryAction={<BrandButton to={getPublicPath("home", locale)}>{english ? "Return home" : "Kembali ke Beranda"}</BrandButton>}
          secondaryAction={<BrandButton to={getPublicPath("contact", locale)} variant="secondary">{english ? "Contact Niuva" : "Hubungi Niuva"}</BrandButton>}
          visual={
            <RoundedVisualFrame title={english ? "Let's return to a useful path." : "Mari kembali ke jalur yang benar."} kicker={english ? "404 code" : "Kode 404"}>
              <nav aria-label={english ? "Helpful links" : "Tautan bantuan"} className="grid gap-2">
                {helpfulLinks.map((item) => (
                  <Link
                    key={item.key}
                    to={getPublicPath(item.key, locale)}
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
