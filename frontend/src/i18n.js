import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const translations = {
  id: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Capabilities",
    "nav.portfolio": "Projects",
    "nav.ecosystem": "Ekosistem",
    "nav.internship": "Magang",
    "nav.contact": "Contact",
    "nav.order": "Pesan 3D Printing",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Keluar",
    "nav.admin": "Admin",
    "nav.primaryLabel": "Navigasi utama",
    "nav.mobileLabel": "Navigasi seluler",
    "nav.homeAria": "Niuva Inovasi Utama - Beranda",
    "nav.openMenu": "Buka menu",
    "nav.closeMenu": "Tutup menu",
    "nav.switchToEnglish": "Ganti bahasa ke English",
    "nav.switchToIndonesian": "Ganti bahasa ke Bahasa Indonesia",
    "nav.discussProject": "Diskusikan Project",
    "common.skipToContent": "Lewati ke konten",

    "common.learnMore": "Selengkapnya",
    "common.send": "Kirim",
    "common.submit": "Kirim",
    "common.cancel": "Batal",
    "common.save": "Simpan",
    "common.loading": "Memuat...",
    "common.back": "Kembali",
    "common.email": "Email",
    "common.password": "Kata Sandi",
    "common.name": "Nama",
    "common.phone": "No. Telepon",
    "common.optional": "(opsional)",

    "hero.tag": "Indie R&D Studio · Bandung",
    "hero.title": "Mewujudkan Inovasi dari Konsep ke Produk Nyata",
    "hero.subtitle": "Studio desain produk & R&D yang menggabungkan rekayasa kendaraan listrik, prototyping cepat, dan layanan 3D printing presisi.",
    "hero.cta1": "Pesan 3D Printing",
    "hero.cta2": "Lihat Portofolio",

    "home.pillarsTitle": "Empat Pilar Layanan",
    "home.pillarsSubtitle": "Solusi rekayasa terintegrasi untuk inovasi Anda.",
    "home.ecoTitle": "Ekosistem Kemitraan",
    "home.ecoSubtitle": "Tumbuh bersama institusi & industri terkemuka.",
    "home.portfolioTitle": "Proyek Unggulan",
    "home.portfolioSubtitle": "Karya nyata yang kami banggakan.",
    "home.ctaTitle": "Punya file desain 3D? Wujudkan sekarang.",
    "home.ctaSubtitle": "Unggah file STL/OBJ Anda, pilih material, dan dapatkan estimasi dari engineer kami dalam 1x24 jam.",
    "home.ctaButton": "Mulai Pesanan",
    "home.viewAll": "Lihat Semua",

    "pillar.ev.title": "EV Design",
    "pillar.ev.desc": "Desain & rekayasa kendaraan listrik dari konsep hingga prototipe fungsional.",
    "pillar.proto.title": "Prototyping",
    "pillar.proto.desc": "Iterasi cepat dari ide ke prototipe yang siap diuji.",
    "pillar.print.title": "3D Printing",
    "pillar.print.desc": "Layanan cetak 3D presisi dengan beragam material industrial.",
    "pillar.hr.title": "Pengembangan SDM",
    "pillar.hr.desc": "Program magang & pelatihan talenta engineering masa depan.",

    "about.title": "Tentang NIUVA",
    "about.intro": "PT Niuva Inovasi Utama adalah indie R&D studio berbasis di Bandung yang fokus pada desain produk, rekayasa kendaraan listrik, dan manufaktur aditif.",
    "about.visionTitle": "Visi",
    "about.vision": "Menjadi studio R&D independen terdepan di Indonesia yang mendorong lahirnya produk inovatif berdaya saing global.",
    "about.missionTitle": "Misi",
    "about.mission1": "Menyediakan layanan desain & rekayasa produk yang presisi dan terjangkau.",
    "about.mission2": "Mempercepat siklus inovasi melalui prototyping & 3D printing.",
    "about.mission3": "Membangun talenta engineering melalui kolaborasi akademik & industri.",
    "about.valueTitle": "Value Proposition",
    "about.value": "Kami menjembatani dunia riset akademik dan kebutuhan industri nyata: gesit seperti startup, presisi seperti laboratorium.",

    "services.title": "Capabilities",
    "services.subtitle": "Riset, desain, prototyping, workshop, apparel, dan merchandise untuk kebutuhan inovasi.",

    "portfolio.title": "Projects",
    "portfolio.subtitle": "Pratinjau studi kasus pengembangan produk, mobilitas, dan simulator interaktif NIUVA.",
    "portfolio.client": "Klien",
    "portfolio.empty": "Belum ada proyek.",

    "ecosystem.title": "Ekosistem & Kemitraan",
    "ecosystem.subtitle": "Kami berkembang dalam jaringan inovasi kelas dunia.",
    "ecosystem.partnersTitle": "Partner Strategis",
    "ecosystem.body": "Kolaborasi dengan institusi pendidikan dan technopark memungkinkan kami mengakses talenta, fasilitas riset, dan jaringan industri yang luas.",

    "internship.title": "Program Magang NIUVA",
    "internship.subtitle": "Bergabunglah dengan studio R&D dan kembangkan keahlian engineering Anda di proyek nyata.",
    "internship.formTitle": "Form Pendaftaran Magang",
    "internship.fullName": "Nama Lengkap",
    "internship.university": "Universitas / Institusi",
    "internship.major": "Jurusan",
    "internship.semester": "Semester",
    "internship.duration": "Durasi Magang",
    "internship.motivation": "Motivasi & Minat",
    "internship.portfolioUrl": "Link Portofolio / CV",
    "internship.submit": "Kirim Pendaftaran",
    "internship.success": "Pendaftaran berhasil dikirim! Tim HRD kami akan menghubungi Anda.",

    "contact.title": "Hubungi Kami",
    "contact.subtitle": "Punya pertanyaan atau ide proyek? Mari bicara.",
    "contact.location": "Lokasi",
    "contact.locationVal": "Bandung, Jawa Barat, Indonesia",
    "contact.formTitle": "Form Inquiry",
    "contact.subject": "Subjek",
    "contact.message": "Pesan",
    "contact.success": "Pesan berhasil dikirim. Tim Niuva akan meninjau permintaan Anda.",

    "dash.title": "Pesanan Saya",
    "dash.newOrder": "Pesanan Baru",
    "dash.noOrders": "Belum ada pesanan. Mulai pesanan 3D printing pertama Anda!",
    "dash.orderNo": "No. Pesanan",
    "dash.material": "Material",
    "dash.date": "Tanggal",
    "dash.status": "Status",
    "dash.viewDetail": "Detail",

    "order.title": "Buat Pesanan 3D Printing",
    "order.step1": "Upload File",
    "order.step2": "Pilih Material",
    "order.step3": "Catatan",
    "order.step4": "Konfirmasi",
    "order.uploadLabel": "File Desain (STL / OBJ, maks 50MB)",
    "order.uploadHint": "Tarik file ke sini atau klik untuk memilih",
    "order.materialLabel": "Pilih Material",
    "order.notesLabel": "Catatan Tambahan",
    "order.notesPlaceholder": "Jumlah, warna, skala, atau permintaan khusus...",
    "order.next": "Lanjut",
    "order.prev": "Sebelumnya",
    "order.submit": "Kirim Pesanan",
    "order.sla": "File Anda akan ditinjau oleh Engineer kami. Estimasi harga dikirim dalam maksimal 1x24 jam.",
    "order.success": "Pesanan berhasil dibuat!",

    "detail.title": "Detail Pesanan",
    "detail.designFile": "File Desain",
    "detail.download": "Unduh",
    "detail.estimate": "Estimasi Biaya",
    "detail.notEstimated": "Menunggu estimasi dari engineer",
    "detail.payTitle": "Instruksi Pembayaran",
    "detail.bank": "Bank",
    "detail.accountNo": "No. Rekening",
    "detail.accountName": "Atas Nama",
    "detail.uploadProof": "Upload Bukti Transfer",
    "detail.proofUploaded": "Bukti transfer terkirim. Menunggu verifikasi admin.",
    "detail.verified": "Pembayaran terverifikasi",
    "detail.notes": "Catatan",
    "detail.timeline": "Riwayat Status",

    "status.pending_estimate": "Menunggu Estimasi",
    "status.awaiting_payment": "Menunggu Pembayaran",
    "status.in_process": "Diproses",
    "status.completed": "Selesai",
    "status.cancelled": "Dibatalkan",

    "admin.title": "Dashboard Admin",
    "admin.overview": "Ringkasan",
    "admin.orders": "Pesanan",
    "admin.materials": "Material",
    "admin.portfolio": "Portofolio",
    "admin.internships": "Magang",
    "admin.contacts": "Inquiry",
    "admin.users": "Klien",
    "admin.settings": "Pengaturan",
    "admin.setEstimate": "Set Estimasi",
    "admin.verifyPayment": "Verifikasi Pembayaran",
    "admin.markProcess": "Tandai Diproses",
    "admin.markComplete": "Tandai Selesai",
    "admin.addMaterial": "Tambah Material",
    "admin.addProject": "Tambah Proyek",
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Capabilities",
    "nav.portfolio": "Projects",
    "nav.ecosystem": "Ecosystem",
    "nav.internship": "Internship",
    "nav.contact": "Contact",
    "nav.order": "Order 3D Printing",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Logout",
    "nav.admin": "Admin",
    "nav.primaryLabel": "Primary navigation",
    "nav.mobileLabel": "Mobile navigation",
    "nav.homeAria": "Niuva Inovasi Utama - Home",
    "nav.openMenu": "Open menu",
    "nav.closeMenu": "Close menu",
    "nav.switchToEnglish": "Switch language to English",
    "nav.switchToIndonesian": "Switch language to Bahasa Indonesia",
    "nav.discussProject": "Discuss Your Project",
    "common.skipToContent": "Skip to content",

    "common.learnMore": "Learn more",
    "common.send": "Send",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.loading": "Loading...",
    "common.back": "Back",
    "common.email": "Email",
    "common.password": "Password",
    "common.name": "Name",
    "common.phone": "Phone",
    "common.optional": "(optional)",

    "hero.tag": "Indie R&D Studio · Bandung",
    "hero.title": "Turning Innovation from Concept into Real Products",
    "hero.subtitle": "A product design & R&D studio combining electric vehicle engineering, rapid prototyping, and precision 3D printing services.",
    "hero.cta1": "Order 3D Printing",
    "hero.cta2": "View Portfolio",

    "home.pillarsTitle": "Four Service Pillars",
    "home.pillarsSubtitle": "Integrated engineering solutions for your innovation.",
    "home.ecoTitle": "Partnership Ecosystem",
    "home.ecoSubtitle": "Growing alongside leading institutions & industry.",
    "home.portfolioTitle": "Featured Projects",
    "home.portfolioSubtitle": "Real work we're proud of.",
    "home.ctaTitle": "Have a 3D design file? Make it real now.",
    "home.ctaSubtitle": "Upload your STL/OBJ file, pick a material, and get an estimate from our engineers within 24 hours.",
    "home.ctaButton": "Start an Order",
    "home.viewAll": "View All",

    "pillar.ev.title": "EV Design",
    "pillar.ev.desc": "Electric vehicle design & engineering from concept to functional prototype.",
    "pillar.proto.title": "Prototyping",
    "pillar.proto.desc": "Rapid iteration from idea to test-ready prototype.",
    "pillar.print.title": "3D Printing",
    "pillar.print.desc": "Precision 3D printing services with diverse industrial materials.",
    "pillar.hr.title": "Talent Development",
    "pillar.hr.desc": "Internship & training programs for future engineering talent.",

    "about.title": "About NIUVA",
    "about.intro": "PT Niuva Inovasi Utama is a Bandung-based indie R&D studio focused on product design, electric vehicle engineering, and additive manufacturing.",
    "about.visionTitle": "Vision",
    "about.vision": "To be Indonesia's leading independent R&D studio driving globally competitive innovative products.",
    "about.missionTitle": "Mission",
    "about.mission1": "Provide precise and affordable product design & engineering services.",
    "about.mission2": "Accelerate the innovation cycle through prototyping & 3D printing.",
    "about.mission3": "Build engineering talent through academic & industry collaboration.",
    "about.valueTitle": "Value Proposition",
    "about.value": "We bridge academic research and real industry needs: agile like a startup, precise like a lab.",

    "services.title": "Capabilities",
    "services.subtitle": "Research, design, prototyping, workshops, apparel, and merchandise for innovation needs.",

    "portfolio.title": "Projects",
    "portfolio.subtitle": "Case-study previews across product development, mobility, and interactive simulators.",
    "portfolio.client": "Client",
    "portfolio.empty": "No projects yet.",

    "ecosystem.title": "Ecosystem & Partnerships",
    "ecosystem.subtitle": "We thrive within a world-class innovation network.",
    "ecosystem.partnersTitle": "Strategic Partners",
    "ecosystem.body": "Collaboration with educational institutions and technoparks gives us access to talent, research facilities, and a broad industry network.",

    "internship.title": "NIUVA Internship Program",
    "internship.subtitle": "Join an R&D studio and grow your engineering skills on real projects.",
    "internship.formTitle": "Internship Application Form",
    "internship.fullName": "Full Name",
    "internship.university": "University / Institution",
    "internship.major": "Major",
    "internship.semester": "Semester",
    "internship.duration": "Internship Duration",
    "internship.motivation": "Motivation & Interest",
    "internship.portfolioUrl": "Portfolio / CV Link",
    "internship.submit": "Submit Application",
    "internship.success": "Application sent successfully! Our HR team will contact you.",

    "contact.title": "Contact Us",
    "contact.subtitle": "Have a question or project idea? Let's talk.",
    "contact.location": "Location",
    "contact.locationVal": "Bandung, West Java, Indonesia",
    "contact.formTitle": "Inquiry Form",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.success": "Message sent. The Niuva team will review your request.",

    "dash.title": "My Orders",
    "dash.newOrder": "New Order",
    "dash.noOrders": "No orders yet. Start your first 3D printing order!",
    "dash.orderNo": "Order No.",
    "dash.material": "Material",
    "dash.date": "Date",
    "dash.status": "Status",
    "dash.viewDetail": "Details",

    "order.title": "Create 3D Printing Order",
    "order.step1": "Upload File",
    "order.step2": "Select Material",
    "order.step3": "Notes",
    "order.step4": "Confirm",
    "order.uploadLabel": "Design File (STL / OBJ, max 50MB)",
    "order.uploadHint": "Drag a file here or click to select",
    "order.materialLabel": "Select Material",
    "order.notesLabel": "Additional Notes",
    "order.notesPlaceholder": "Quantity, color, scale, or special requests...",
    "order.next": "Next",
    "order.prev": "Previous",
    "order.submit": "Submit Order",
    "order.sla": "Your file will be reviewed by our Engineers. A price estimate will be sent within 24 hours.",
    "order.success": "Order created successfully!",

    "detail.title": "Order Details",
    "detail.designFile": "Design File",
    "detail.download": "Download",
    "detail.estimate": "Cost Estimate",
    "detail.notEstimated": "Awaiting estimate from engineer",
    "detail.payTitle": "Payment Instructions",
    "detail.bank": "Bank",
    "detail.accountNo": "Account No.",
    "detail.accountName": "Account Name",
    "detail.uploadProof": "Upload Transfer Proof",
    "detail.proofUploaded": "Transfer proof sent. Awaiting admin verification.",
    "detail.verified": "Payment verified",
    "detail.notes": "Notes",
    "detail.timeline": "Status History",

    "status.pending_estimate": "Awaiting Estimate",
    "status.awaiting_payment": "Awaiting Payment",
    "status.in_process": "In Process",
    "status.completed": "Completed",
    "status.cancelled": "Cancelled",

    "admin.title": "Admin Dashboard",
    "admin.overview": "Overview",
    "admin.orders": "Orders",
    "admin.materials": "Materials",
    "admin.portfolio": "Portfolio",
    "admin.internships": "Internships",
    "admin.contacts": "Inquiries",
    "admin.users": "Clients",
    "admin.settings": "Settings",
    "admin.setEstimate": "Set Estimate",
    "admin.verifyPayment": "Verify Payment",
    "admin.markProcess": "Mark In Process",
    "admin.markComplete": "Mark Completed",
    "admin.addMaterial": "Add Material",
    "admin.addProject": "Add Project",
  },
};

const I18nContext = createContext(null);

export const DEFAULT_LOCALE = "id";
export const SUPPORTED_LOCALES = ["id", "en"];

const missingKeyWarnings = new Set();

function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

function readTranslation(source, key) {
  if (!source || !key) return undefined;
  if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
  return key.split(".").reduce((value, segment) => value?.[segment], source);
}

function interpolate(value, variables = {}) {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : match
  );
}

export function getLocalizedField(object, fieldName, locale = DEFAULT_LOCALE) {
  if (!object) return "";
  const activeLocale = normalizeLocale(locale);
  return object[`${fieldName}_${activeLocale}`] || object[`${fieldName}_${DEFAULT_LOCALE}`] || object[fieldName] || "";
}

function intlLocale(locale) {
  return normalizeLocale(locale) === "en" ? "en-US" : "id-ID";
}

export function formatDate(value, locale = DEFAULT_LOCALE, options = {}) {
  if (!value) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), options).format(new Date(value));
}

export function formatNumber(value, locale = DEFAULT_LOCALE, options = {}) {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatCurrency(value, locale = DEFAULT_LOCALE, currency = "IDR") {
  return formatNumber(value, locale, { style: "currency", currency, maximumFractionDigits: 0 });
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const urlLocale = new URLSearchParams(window.location.search).get("lang");
    return normalizeLocale(urlLocale || localStorage.getItem("niuva_lang"));
  });
  const setLanguage = useCallback((nextLocale) => {
    const normalizedLocale = normalizeLocale(nextLocale);
    setLocale(normalizedLocale);
    localStorage.setItem("niuva_lang", normalizedLocale);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", normalizedLocale);
    window.history.replaceState({}, "", url);
  }, []);
  const t = useCallback((key, variables) => {
    const localizedValue = readTranslation(translations[locale], key);
    const fallbackValue = readTranslation(translations[DEFAULT_LOCALE], key);
    const value = localizedValue ?? fallbackValue;

    if (value == null) {
      if (process.env.NODE_ENV !== "production" && !missingKeyWarnings.has(key)) {
        missingKeyWarnings.add(key);
        console.warn(`[i18n] Missing translation key: ${key}`);
      }
      return key;
    }

    return interpolate(value, variables);
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider
      value={{ locale, setLanguage, t, lang: locale, setLang: setLanguage }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

