export const PUBLIC_LOCALES = ["id", "en"];

export const PUBLIC_ROUTE_REGISTRY = Object.freeze({
  home: {
    paths: { id: "/", en: "/en" },
    labels: { id: "Beranda", en: "Home" },
    translationReady: true,
    meta: {
      id: {
        title: "Niuva Inovasi Utama - Mitra Inovasi dan Pengembangan Produk",
        description:
          "Niuva mendampingi tim melalui riset, rekayasa, desain, prototyping, dan realisasi produk.",
      },
      en: {
        title: "Niuva Inovasi Utama - Innovation and Product Development Partner",
        description:
          "Niuva supports teams through research, engineering, design, prototyping, and product realization.",
      },
    },
  },
  about: {
    paths: { id: "/tentang", en: "/en/about" },
    labels: { id: "Tentang", en: "About" },
    translationReady: false,
    meta: {
      id: {
        title: "Tentang Niuva - Mitra Inovasi dan Pengembangan Produk",
        description:
          "Kenali PT Niuva Inovasi Utama sebagai mitra untuk riset, konsultasi, design engineering, prototyping, dan realisasi produk.",
      },
      en: {
        title: "About Niuva - Innovation and Product Development Partner",
        description:
          "Learn about PT Niuva Inovasi Utama and its research, consulting, design engineering, prototyping, and product realization work.",
      },
    },
  },
  services: {
    paths: { id: "/layanan", en: "/en/services" },
    labels: { id: "Layanan", en: "Services" },
    translationReady: false,
    meta: {
      id: {
        title: "Layanan Niuva - Riset, Konsultasi, Desain, dan Produk Kreatif",
        description:
          "Pelajari empat layanan utama Niuva: Research & Development, Consultant & Workshop, Design & Prototyping, serta Apparel & Merchandise.",
      },
      en: {
        title: "Niuva Services - Research, Consulting, Design, and Creative Products",
        description:
          "Explore Niuva's four primary services: Research & Development, Consultant & Workshop, Design & Prototyping, and Apparel & Merchandise.",
      },
    },
  },
  projects: {
    paths: { id: "/proyek", en: "/en/projects" },
    labels: { id: "Proyek", en: "Projects" },
    translationReady: false,
    meta: {
      id: {
        title: "Proyek Niuva - Mobilitas, EV, Simulator, dan Produk Teknis",
        description:
          "Lihat bukti project Niuva untuk pengembangan mobilitas, kendaraan listrik, simulator, dan produk teknis.",
      },
      en: {
        title: "Niuva Projects - Mobility, EV, Simulators, and Technical Products",
        description:
          "Explore Niuva project evidence across mobility, electric vehicles, simulators, and technical products.",
      },
    },
  },
  contact: {
    paths: { id: "/kontak", en: "/en/contact" },
    labels: { id: "Kontak", en: "Contact" },
    translationReady: true,
    meta: {
      id: {
        title: "Kontak Niuva - Diskusikan Project dan Partnership",
        description:
          "Kirim inquiry untuk kebutuhan riset, konsultasi, desain, prototyping, workshop, apparel, merchandise, dan partnership bersama Niuva.",
      },
      en: {
        title: "Contact Niuva - Discuss a Project or Partnership",
        description:
          "Send an inquiry for research, consulting, design, prototyping, workshops, apparel, merchandise, and partnership needs.",
      },
    },
  },
  retail: {
    paths: { id: "/retail", en: "/en/retail" },
    labels: { id: "Retail", en: "Retail" },
    translationReady: false,
    meta: {
      id: {
        title: "Niuva Retail - Custom 3D Print dan Ready Products",
        description:
          "Jelajahi Custom 3D Print, Ready Products, serta informasi katalog dan ketersediaan Niuva Retail.",
      },
      en: {
        title: "Niuva Retail - Custom 3D Print and Ready Products",
        description:
          "Explore Custom 3D Print, Ready Products, and Niuva Retail catalogue and availability information.",
      },
    },
  },
  faq: {
    paths: { id: "/faq", en: "/en/faq" },
    labels: { id: "FAQ", en: "FAQ" },
    translationReady: false,
    meta: {
      id: {
        title: "FAQ Niuva - Pertanyaan tentang Project dan Retail",
        description:
          "Jawaban untuk pertanyaan umum tentang riset, desain, prototyping, partnership, dan Niuva Retail.",
      },
      en: {
        title: "Niuva FAQ - Questions about Projects and Retail",
        description:
          "Answers to common questions about research, design, prototyping, partnerships, and Niuva Retail.",
      },
    },
  },
  privacy: {
    paths: { id: "/privasi", en: "/en/privacy" },
    labels: { id: "Privasi", en: "Privacy" },
    translationReady: true,
    meta: {
      id: {
        title: "Kebijakan Privasi - PT Niuva Inovasi Utama",
        description:
          "Pelajari bagaimana Niuva menggunakan dan melindungi data yang dikirim melalui inquiry, akun, dan layanan Retail.",
      },
      en: {
        title: "Privacy Policy - PT Niuva Inovasi Utama",
        description:
          "Learn how Niuva uses and protects data submitted through inquiries, accounts, and Retail services.",
      },
    },
  },
});

export const PUBLIC_ROUTE_ALIASES = Object.freeze({
  "/about": "/tentang",
  "/capabilities": "/layanan",
  "/services": "/layanan",
  "/projects": "/proyek",
  "/portfolio": "/proyek",
  "/contact": "/kontak",
  "/privacy": "/privasi",
  "/en/capabilities": "/en/services",
});

export const PUBLIC_SERVICE_ITEMS = Object.freeze([
  {
    slug: "research-development",
    labels: { id: "Research & Development", en: "Research & Development" },
    descriptions: {
      id: "Membaca masalah, menyusun eksperimen, dan mengurangi asumsi.",
      en: "Frame the problem, shape experiments, and reduce assumptions.",
    },
  },
  {
    slug: "consultant-workshop",
    labels: { id: "Consultant & Workshop", en: "Consultant & Workshop" },
    descriptions: {
      id: "Menyelaraskan keputusan melalui konsultasi dan pembelajaran praktis.",
      en: "Align decisions through consulting and practical learning.",
    },
  },
  {
    slug: "design-prototyping",
    labels: { id: "Design & Prototyping", en: "Design & Prototyping" },
    descriptions: {
      id: "Menerjemahkan keputusan menjadi bentuk yang dapat diuji.",
      en: "Turn decisions into forms that teams can test.",
    },
  },
  {
    slug: "apparel-merchandise",
    labels: { id: "Apparel & Merchandise", en: "Apparel & Merchandise" },
    descriptions: {
      id: "Mengembangkan produk kreatif untuk kebutuhan program dan brand.",
      en: "Develop creative products for programmes and brands.",
    },
  },
]);

export const PUBLIC_RETAIL_ITEMS = Object.freeze([
  {
    hash: "custom-3d-print",
    labels: { id: "Custom 3D Print", en: "Custom 3D Print" },
    descriptions: {
      id: "Mulai dari spesifikasi cetak dan validasi kebutuhan.",
      en: "Start with print specifications and requirement validation.",
    },
  },
  {
    hash: "ready-products",
    labels: { id: "Ready Products", en: "Ready Products" },
    descriptions: {
      id: "Jelajahi produk Niuva yang telah dipublikasikan.",
      en: "Explore published Niuva products.",
    },
  },
]);

function normalizePathname(pathname) {
  const path = String(pathname || "/").split(/[?#]/, 1)[0] || "/";
  if (path === "/") return path;
  return path.replace(/\/+$/, "") || "/";
}

export function getPublicPath(routeKey, locale = "id") {
  const route = PUBLIC_ROUTE_REGISTRY[routeKey];
  if (!route) throw new Error(`Unknown public route key: ${routeKey}`);
  return route.paths[locale] || route.paths.id;
}

export function resolvePublicRoute(pathname) {
  const normalized = normalizePathname(pathname);
  for (const [key, route] of Object.entries(PUBLIC_ROUTE_REGISTRY)) {
    for (const locale of PUBLIC_LOCALES) {
      if (route.paths[locale] === normalized) {
        return {
          key,
          locale,
          route,
          pathname: normalized,
          fallbackToIndonesian: locale === "en" && !route.translationReady,
        };
      }
    }
  }
  return null;
}

export function resolvePublicAlias(pathname) {
  return PUBLIC_ROUTE_ALIASES[normalizePathname(pathname)] || null;
}

export function getPublicLocale(pathname, fallback = "id") {
  const match = resolvePublicRoute(pathname);
  if (match) return match.locale;
  return normalizePathname(pathname).startsWith("/en/") ||
    normalizePathname(pathname) === "/en"
    ? "en"
    : fallback;
}

export function getLocaleSwitchPath(pathname, locale) {
  const match = resolvePublicRoute(pathname);
  return match ? getPublicPath(match.key, locale) : normalizePathname(pathname);
}

export function getPublicRouteMetadata(pathname) {
  const match = resolvePublicRoute(pathname);
  if (!match) return null;

  const { route, locale, fallbackToIndonesian } = match;
  const canonicalLocale = fallbackToIndonesian ? "id" : locale;
  const alternates = route.translationReady
    ? {
        id: route.paths.id,
        en: route.paths.en,
        "x-default": route.paths.id,
      }
    : null;

  return {
    ...route.meta[locale],
    canonical: route.paths[canonicalLocale],
    alternates,
    robots: fallbackToIndonesian ? "noindex, follow" : "index, follow",
    fallbackToIndonesian,
    contentLanguage: fallbackToIndonesian ? "id" : locale,
    routeKey: match.key,
    locale,
  };
}
