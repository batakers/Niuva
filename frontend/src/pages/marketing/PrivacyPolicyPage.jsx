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

const LAST_UPDATED = "30 Juli 2026";

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

export default function PrivacyPolicyPage() {
  const { contact } = usePublicSettings();
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Privacy Policy"
          title="Kebijakan Privasi PT Niuva Inovasi Utama."
          body={`Terakhir diperbarui: ${LAST_UPDATED}. Halaman ini menjelaskan data apa yang Niuva kumpulkan, bagaimana data tersebut digunakan, dan hak Anda sebagai pengguna.`}
          primaryAction={<BrandButton to="/contact">Hubungi Niuva</BrandButton>}
          showMotif={false}
        />

        <MarketingSection tone="muted" spacing="compact">
          <PageContainer>
            <div className="brand-reveal rounded-card border border-border-strong bg-surface-default p-5 sm:p-6">
              <p className="text-sm font-semibold text-action-primary-hover">Status: Draft</p>
              <p className="mt-2 max-w-[70ch] text-sm leading-7 text-text-secondary">
                Dokumen ini disusun berdasarkan data yang benar-benar diproses oleh sistem Niuva saat ini.
                Isi kebijakan belum ditinjau oleh tim legal dan belum menjadi pernyataan hukum resmi.
                Jangan mengandalkan halaman ini sebagai kepatuhan hukum final sebelum ditinjau.
              </p>
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              eyebrow="Data yang Dikumpulkan"
              title="Jenis data yang Niuva proses melalui website dan sistem operasional."
              align="split"
            />
            <dl className="grid gap-6 md:grid-cols-2">
              {dataCollected.map((item) => (
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
              eyebrow="Tujuan Penggunaan"
              title="Data digunakan hanya untuk kebutuhan operasional yang relevan."
              align="split"
            />
            <ul className="grid gap-4 md:grid-cols-2">
              {usagePurposes.map((item) => (
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
              eyebrow="Penyimpanan & Keamanan"
              title="Data tersimpan di sistem operasional Niuva dengan akses terbatas."
              body="Data pesan, akun, dan pesanan disimpan di sistem operasional Niuva dan hanya dapat diakses oleh tim internal dengan izin yang sesuai. Niuva tidak menjual data pribadi kepada pihak ketiga."
              align="split"
            />
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <SectionHeader
              eyebrow="Berbagi dengan Pihak Ketiga"
              title="Data hanya diteruskan ke penyedia layanan yang mendukung operasional Niuva."
              align="split"
            />
            <div className="grid gap-6">
              {thirdParties.map((item) => (
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
              eyebrow="Cookie & Penyimpanan Lokal"
              title="Niuva tidak menggunakan cookie pelacakan atau analitik pihak ketiga."
              body="Website ini hanya menyimpan preferensi bahasa di penyimpanan lokal browser (localStorage). Untuk akun pelanggan dan Admin yang didukung, kredensial akses dan refresh sesi dikirim melalui cookie fungsional HttpOnly dan tidak disimpan di localStorage; cookie CSRF yang diperlukan untuk perlindungan permintaan dapat dibaca JavaScript. Pilihan 'Ingat saya' hanya menentukan masa berlaku sesi Admin. Tidak ada cookie pelacakan iklan atau analitik pihak ketiga yang dipasang."
              align="split"
            />
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <SectionHeader
              eyebrow="Hak Anda"
              title="Anda dapat menghubungi Niuva terkait data yang tersimpan."
              align="split"
            />
            <ul className="grid gap-4 md:grid-cols-2">
              {userRights.map((item) => (
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
              eyebrow="Perubahan Kebijakan"
              title="Kebijakan ini dapat diperbarui sewaktu-waktu."
              body="Perubahan signifikan akan tercermin melalui tanggal 'Terakhir diperbarui' di bagian atas halaman ini."
              align="split"
            />
            <div className="brand-reveal rounded-card border border-border-default bg-surface-muted p-6">
              <p className="text-sm font-semibold text-action-primary-hover">Kontak Privasi</p>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                Pertanyaan mengenai kebijakan ini dapat disampaikan melalui email{" "}
                <a
                  href={contact.email ? `mailto:${contact.email}` : "/contact"}
                  className="inline-flex min-h-11 items-center rounded-control px-1 font-semibold text-action-primary-hover underline underline-offset-4 hover:text-action-primary"
                >
                  {contact.email || "halaman Contact"}
                </a>{" "}
                atau WhatsApp{" "}
                <a
                  href={contact.whatsappHref || "/contact"}
                  className="inline-flex min-h-11 items-center rounded-control px-1 font-semibold text-action-primary-hover underline underline-offset-4 hover:text-action-primary"
                >
                  {contact.whatsapp || "melalui halaman Contact"}
                </a>.
              </p>
            </div>
          </PageContainer>
        </MarketingSection>
      </BrandPage>
    </MarketingLayout>
  );
}
