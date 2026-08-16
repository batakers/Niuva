import React from "react";
import { MarketingLayout } from "@/components/layout/Layout";
import { BrandButton } from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";
import { usePublicSettings } from "../../lib/publicSettings";
import { useI18n } from "@/i18n";
import { getPublicPath } from "@/lib/publicRoutes";

const dataCollected = [
  {
    title: "Formulir Kontak",
    body: "Nama, alamat email, subjek, dan isi pesan yang Anda kirimkan melalui halaman Contact.",
  },
  {
    title: "Data Pemesanan (Order)",
    body: "Nama, email, file desain yang diunggah, dan catatan pesanan untuk pengguna yang memiliki akun aktif.",
  },
  {
    title: "Data Akun",
    body: "Email dan kredensial login untuk pengguna dengan akun yang disediakan oleh tim Niuva. Saat Anda meminta reset password, sistem membuat token reset sekali pakai yang berlaku 30 menit dan otomatis kedaluwarsa atau tidak berlaku lagi setelah digunakan.",
  },
  {
    title: "Preferensi Lokal",
    body: "Pilihan bahasa antarmuka disimpan di penyimpanan lokal (localStorage) perangkat Anda, bukan di server.",
  },
];

const usagePurposes = [
  "Merespons pertanyaan, permintaan kolaborasi, dan brief proyek yang Anda kirimkan.",
  "Mengelola pesanan, estimasi, status produksi, dan komunikasi terkait pesanan Anda.",
  "Jika layanan email dikonfigurasi secara eksternal, mengirim notifikasi terkait aktivitas akun atau pesanan secara best-effort.",
];

const thirdParties = [
  {
    title: "Penyedia Layanan Email (jika dikonfigurasi)",
    body: "Jika layanan email dikonfigurasi secara eksternal, data yang diteruskan dibatasi pada nama, alamat email, dan isi notifikasi yang relevan. Email bersifat opsional dan best-effort; tidak ada penyedia tertentu yang dinyatakan aktif oleh kebijakan ini.",
  },
];

const userRights = [
  "Meminta informasi mengenai data apa saja yang Niuva simpan terkait Anda.",
  "Meminta koreksi atas data yang tidak akurat.",
  "Meminta penghapusan data yang tidak lagi diperlukan, sepanjang tidak bertentangan dengan kewajiban penyimpanan catatan bisnis.",
  "Menghubungi Niuva melalui kanal resmi untuk pertanyaan privasi lainnya.",
];

const PRIVACY_COPY = {
  id: {
    lastUpdated: "30 Juli 2026",
    dataCollected,
    usagePurposes,
    thirdParties,
    userRights,
    heroLabel: "Kebijakan Privasi",
    heroTitle: "Kebijakan Privasi PT Niuva Inovasi Utama.",
    heroBody: (date) => `Terakhir diperbarui: ${date}. Halaman ini menjelaskan data apa yang Niuva kumpulkan, bagaimana data tersebut digunakan, dan hak Anda sebagai pengguna.`,
    contactAction: "Hubungi Niuva",
    draftLabel: "Status: Draft",
    draftBody: "Dokumen ini disusun berdasarkan data yang benar-benar diproses oleh sistem Niuva saat ini. Isi kebijakan belum ditinjau oleh tim legal dan belum menjadi pernyataan hukum resmi. Jangan mengandalkan halaman ini sebagai kepatuhan hukum final sebelum ditinjau.",
    collectedLabel: "Data yang Dikumpulkan",
    collectedTitle: "Jenis data yang Niuva proses melalui website dan sistem operasional.",
    purposeLabel: "Tujuan Penggunaan",
    purposeTitle: "Data digunakan hanya untuk kebutuhan operasional yang relevan.",
    storageLabel: "Penyimpanan & Keamanan",
    storageTitle: "Data tersimpan di sistem operasional Niuva dengan akses terbatas.",
    storageBody: "Data pesan, akun, dan pesanan disimpan di sistem operasional Niuva. Akses internal dibatasi berdasarkan izin yang sesuai. Jika notifikasi email dikonfigurasi secara eksternal, data yang relevan dapat diteruskan secara terbatas sebagaimana dijelaskan pada bagian Berbagi dengan Pihak Ketiga. Niuva tidak menjual data pribadi kepada pihak ketiga.",
    sharingLabel: "Berbagi dengan Pihak Ketiga",
    sharingTitle: "Data hanya diteruskan ke penyedia layanan yang mendukung operasional Niuva.",
    cookieLabel: "Cookie & Penyimpanan Lokal",
    cookieTitle: "Niuva tidak menggunakan cookie pelacakan atau analitik pihak ketiga.",
    cookieBody: "Website ini hanya menyimpan preferensi bahasa di penyimpanan lokal browser (localStorage). Untuk akun pelanggan dan Admin yang didukung, kredensial akses dan refresh sesi dikirim melalui cookie fungsional HttpOnly dan tidak disimpan di localStorage; cookie CSRF yang diperlukan untuk perlindungan permintaan dapat dibaca JavaScript. Pilihan 'Ingat saya' hanya menentukan masa berlaku sesi Admin. Tidak ada cookie pelacakan iklan atau analitik pihak ketiga yang dipasang.",
    rightsLabel: "Hak Anda",
    rightsTitle: "Anda dapat menghubungi Niuva terkait data yang tersimpan.",
    changeLabel: "Perubahan Kebijakan",
    changeTitle: "Kebijakan ini dapat diperbarui sewaktu-waktu.",
    changeBody: "Perubahan signifikan akan tercermin melalui tanggal 'Terakhir diperbarui' di bagian atas halaman ini.",
    privacyContact: "Kontak Privasi",
    contactPrefix: "Pertanyaan mengenai kebijakan ini dapat disampaikan melalui email",
    contactMiddle: "atau WhatsApp",
    contactPage: "halaman Kontak",
    whatsappPage: "melalui halaman Kontak",
  },
  en: {
    lastUpdated: "30 July 2026",
    dataCollected: [
      { title: "Contact form", body: "Your name, email address, subject, and message submitted through the Contact page." },
      { title: "Order data", body: "Name, email, uploaded design file, and order notes for users with an active account." },
      { title: "Account data", body: "Email and login credentials for users with an account provided by Niuva. A password-reset request creates a single-use token that expires after 30 minutes or immediately after use." },
      { title: "Local preference", body: "Your interface-language preference is stored in your device's local storage, not on the server." },
    ],
    usagePurposes: [
      "Respond to questions, collaboration requests, and project briefs you submit.",
      "Manage orders, estimates, production status, and communication related to your orders.",
      "When an external email service is configured, send best-effort account or order notifications.",
    ],
    thirdParties: [
      { title: "Email service provider (when configured)", body: "When an external email service is configured, shared data is limited to the name, email address, and relevant notification content. Email is optional and best-effort; this policy does not claim that any specific provider is active." },
    ],
    userRights: [
      "Ask what information Niuva stores about you.",
      "Request correction of inaccurate information.",
      "Request deletion of information that is no longer needed, unless business-record retention obligations apply.",
      "Contact Niuva through an official channel with other privacy questions.",
    ],
    heroLabel: "Privacy Policy",
    heroTitle: "PT Niuva Inovasi Utama Privacy Policy.",
    heroBody: (date) => `Last updated: ${date}. This page explains what information Niuva collects, how it is used, and your rights as a user.`,
    contactAction: "Contact Niuva",
    draftLabel: "Status: Draft",
    draftBody: "This document reflects information actually processed by the current Niuva system. It has not been reviewed by legal counsel and is not yet an official legal statement. Do not rely on it as final legal compliance before review.",
    collectedLabel: "Information collected",
    collectedTitle: "Information Niuva processes through the website and operational system.",
    purposeLabel: "How information is used",
    purposeTitle: "Information is used only for relevant operational needs.",
    storageLabel: "Storage & security",
    storageTitle: "Information is stored in Niuva's operational system with restricted access.",
    storageBody: "Messages, accounts, and orders are stored in Niuva's operational system. Internal access is restricted according to permission. If an external email notification service is configured, relevant information may be shared on a limited basis as described under Third-party sharing. Niuva does not sell personal information.",
    sharingLabel: "Third-party sharing",
    sharingTitle: "Information is shared only with providers that support Niuva operations.",
    cookieLabel: "Cookies & local storage",
    cookieTitle: "Niuva does not use advertising-tracking or third-party analytics cookies.",
    cookieBody: "The website stores only the interface-language preference in browser local storage. For supported customer and Admin accounts, access and refresh credentials are delivered through functional HttpOnly cookies and are not stored in localStorage; the CSRF cookie required for request protection can be read by JavaScript. 'Remember me' only determines the Admin session lifetime. No advertising-tracking or third-party analytics cookies are installed.",
    rightsLabel: "Your rights",
    rightsTitle: "You can contact Niuva about information that is stored.",
    changeLabel: "Policy changes",
    changeTitle: "This policy may be updated.",
    changeBody: "Significant changes will be reflected in the 'Last updated' date at the top of this page.",
    privacyContact: "Privacy contact",
    contactPrefix: "Questions about this policy can be sent by email to",
    contactMiddle: "or by WhatsApp",
    contactPage: "the Contact page",
    whatsappPage: "through the Contact page",
  },
};

export default function PrivacyPolicyPage() {
  const { lang } = useI18n();
  const locale = lang === "en" ? "en" : "id";
  const copy = PRIVACY_COPY[locale];
  const { contact } = usePublicSettings();
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow={copy.heroLabel}
          title={copy.heroTitle}
          body={copy.heroBody(copy.lastUpdated)}
          primaryAction={<BrandButton to={getPublicPath("contact", locale)}>{copy.contactAction}</BrandButton>}
          showMotif={false}
        />

        <MarketingSection tone="muted" spacing="compact">
          <PageContainer>
            <div className="brand-reveal rounded-card border border-border-strong bg-surface-default p-5 sm:p-6">
              <p className="text-sm font-semibold text-action-primary-hover">{copy.draftLabel}</p>
              <p className="mt-2 max-w-[70ch] text-sm leading-7 text-text-secondary">
                {copy.draftBody}
              </p>
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              eyebrow={copy.collectedLabel}
              title={copy.collectedTitle}
              align="split"
            />
            <dl className="grid gap-6 md:grid-cols-2">
              {copy.dataCollected.map((item) => (
                <div key={item.title} className="brand-reveal rounded-card border border-border-default bg-surface-page p-6">
                  <dt className="text-sm font-semibold text-action-primary-hover">{item.title}</dt>
                  <dd className="mt-3 text-sm leading-7 text-text-secondary">{item.body}</dd>
                </div>
              ))}
            </dl>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <SectionHeader
              eyebrow={copy.purposeLabel}
              title={copy.purposeTitle}
              align="split"
            />
            <ul className="grid gap-4 md:grid-cols-2">
              {copy.usagePurposes.map((item) => (
                <li key={item} className="brand-reveal flex gap-3 rounded-card border border-border-default bg-surface-default p-5 text-sm leading-7 text-text-primary">
                  <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              eyebrow={copy.storageLabel}
              title={copy.storageTitle}
              body={copy.storageBody}
              align="split"
            />
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <SectionHeader
              eyebrow={copy.sharingLabel}
              title={copy.sharingTitle}
              align="split"
            />
            <div className="grid gap-6">
              {copy.thirdParties.map((item) => (
                <div key={item.title} className="brand-reveal rounded-card border border-border-default bg-surface-default p-6">
                  <p className="text-sm font-semibold text-action-primary-hover">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{item.body}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              eyebrow={copy.cookieLabel}
              title={copy.cookieTitle}
              body={copy.cookieBody}
              align="split"
            />
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <SectionHeader
              eyebrow={copy.rightsLabel}
              title={copy.rightsTitle}
              align="split"
            />
            <ul className="grid gap-4 md:grid-cols-2">
              {copy.userRights.map((item) => (
                <li key={item} className="brand-reveal flex gap-3 rounded-card border border-border-default bg-surface-default p-5 text-sm leading-7 text-text-primary">
                  <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              eyebrow={copy.changeLabel}
              title={copy.changeTitle}
              body={copy.changeBody}
              align="split"
            />
            <div className="brand-reveal rounded-card border border-border-default bg-surface-muted p-6">
              <p className="text-sm font-semibold text-action-primary-hover">{copy.privacyContact}</p>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                {copy.contactPrefix}{" "}
                <a
                  href={contact.email ? `mailto:${contact.email}` : getPublicPath("contact", locale)}
                  className="inline-flex min-h-11 items-center rounded-control px-1 font-semibold text-action-primary-hover underline underline-offset-4 hover:text-action-primary"
                >
                  {contact.email || copy.contactPage}
                </a>{" "}
                {copy.contactMiddle}{" "}
                <a
                  href={contact.whatsappHref || getPublicPath("contact", locale)}
                  className="inline-flex min-h-11 items-center rounded-control px-1 font-semibold text-action-primary-hover underline underline-offset-4 hover:text-action-primary"
                >
                  {contact.whatsapp || copy.whatsappPage}
                </a>.
              </p>
            </div>
          </PageContainer>
        </MarketingSection>
      </BrandPage>
    </MarketingLayout>
  );
}
