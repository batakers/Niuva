import React, { useMemo } from "react";
import { MarketingLayout } from "@/components/layout/Layout";
import {
  BrandButton,
  CapabilityPanel,
  ProcessTimeline,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { usePublicContent } from "../../lib/content";
import { usePublicSettings } from "../../lib/publicSettings";
import { useI18n } from "@/i18n";
import { getPublicPath, PUBLIC_SERVICE_ITEMS } from "@/lib/publicRoutes";

const primaryServiceOrder = new Map(
  PUBLIC_SERVICE_ITEMS.map((service, index) => [service.slug, index]),
);

function sortPrimaryServices(services) {
  return [...services].sort(
    (left, right) =>
      (primaryServiceOrder.get(left.slug) ?? Number.MAX_SAFE_INTEGER) -
      (primaryServiceOrder.get(right.slug) ?? Number.MAX_SAFE_INTEGER),
  );
}

function mergeCapabilities(cmsBlocks, status) {
  if (status === "disabled") return sortPrimaryServices(profileContent.services);
  if (status !== "ready") return [];
  const fallbackBySlug = new Map(
    profileContent.services.map((service) => [service.slug, service])
  );
  return cmsBlocks
    .map((block) => ({
      ...(fallbackBySlug.get(block.slug) || {}),
      ...block.fields,
      slug: block.slug,
    }))
    .sort(
      (left, right) =>
        Number(left.display_order || 0) - Number(right.display_order || 0) ||
        left.slug.localeCompare(right.slug)
    );
}

const engagementSteps = [
  {
    label: "Brief",
    title: "Kebutuhan dirumuskan",
    body: "Niuva membantu memperjelas konteks bisnis, target pengguna, batasan teknis, dan bentuk output.",
  },
  {
    label: "Research",
    title: "Arah divalidasi",
    body: "Riset, konsultasi, dan studi awal digunakan untuk mengurangi asumsi sebelum masuk produksi solusi.",
  },
  {
    label: "Build",
    title: "Solusi dikembangkan",
    body: "Tim menyusun desain, prototipe, perangkat, materi workshop, atau produk kreatif sesuai ruang lingkup.",
  },
  {
    label: "Review",
    title: "Hasil dievaluasi",
    body: "Output dibaca kembali bersama mitra untuk menentukan iterasi, implementasi, atau kebutuhan lanjutan.",
  },
];

export default function CapabilitiesPage() {
  const { lang, t } = useI18n();
  const { contact } = usePublicSettings();
  const { blocks: cmsBlocks, status } = usePublicContent("capability");
  const capabilities = useMemo(
    () => mergeCapabilities(cmsBlocks, status),
    [cmsBlocks, status]
  );
  const contactPath = getPublicPath("contact", lang);
  const projectsPath = getPublicPath("projects", lang);

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Layanan Niuva"
          title="Dari ide menjadi produk yang dapat diuji."
          body="Empat layanan utama Niuva memiliki hierarki yang setara. Titik masuknya mengikuti kebutuhan, bukti yang perlu dibangun, dan bentuk realisasi yang dibutuhkan."
          variant="index"
          primaryAction={<BrandButton to={contactPath}>{t("nav.discussProject")}</BrandButton>}
          secondaryAction={<BrandButton to={projectsPath} variant="secondary">{t("nav.portfolio")}</BrandButton>}
          visual={
            <div className="grid gap-6 rounded-card bg-surface-muted p-6 sm:p-8">
              {capabilities.length > 0 ? capabilities.map((service) => (
                <div key={service.slug} className="border-t-2 border-[var(--color-brand-secondary)] pt-4">
                  <p className="type-heading-card text-text-primary">{service.title}</p>
                  <p className="type-body-small mt-2 max-w-[42ch] text-text-secondary">{service.output}</p>
                </div>
              )) : (
                <p className="type-body-small text-text-secondary" role="status">
                  {status === "loading"
                    ? "Memuat kapabilitas yang dipublikasikan."
                    : "Kapabilitas publik belum tersedia."}
                </p>
              )}
            </div>
          }
        />

        <MarketingSection tone="muted">
          <PageContainer className="relative z-10">
            <SectionHeader
              title="Empat layanan utama, satu standar kerja yang setara."
              body="Research & Development, Consultant & Workshop, Design & Prototyping, serta Apparel & Merchandise dipilih berdasarkan kebutuhan project—bukan berdasarkan tingkatan layanan."
              align="stacked"
            />
            {status === "loading" && (
              <EmptyState loading>Memuat kapabilitas yang dipublikasikan.</EmptyState>
            )}
            {status === "error" && (
              <ErrorState error="Kapabilitas belum berhasil dimuat." />
            )}
            {status === "invalid" && (
              <ErrorState error="Data kapabilitas tidak dapat diverifikasi.">
                Muat ulang halaman. Jika masalah berlanjut, hubungi tim Niuva.
              </ErrorState>
            )}
            {status === "ready" && capabilities.length === 0 && (
              <EmptyState>Belum ada kapabilitas yang dipublikasikan.</EmptyState>
            )}
            <div className="grid gap-8 lg:gap-10">
              {capabilities.map((service, index) => (
                <div id={service.slug} key={service.slug} className="scroll-mt-32">
                  <CapabilityPanel service={service} index={index} />
                </div>
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="page">
          <PageContainer>
            <SectionHeader title="Empat tahap dari brief menuju evaluasi hasil." body="Setiap tahap memperjelas titik masuk, bentuk output, dan keputusan berikutnya sejak awal kerja sama." align="stacked" />
            <ProcessTimeline items={engagementSteps} className="lg:grid-cols-4" />
          </PageContainer>
        </MarketingSection>

        <CTASection
          eyebrow={null}
          title="Tentukan titik mulai yang relevan untuk kebutuhan Anda."
          body="Tim Niuva dapat masuk dari riset awal, evaluasi konsep, desain dan prototyping, penyusunan workshop, atau kebutuhan produk kreatif yang sudah siap dieksekusi."
          primaryAction={<BrandButton to={contactPath} variant="inverse">{t("nav.discussProject")}</BrandButton>}
          secondaryAction={<BrandButton href={contact.email ? `mailto:${contact.email}` : contactPath} variant="secondary">{lang === "en" ? "Send a brief" : "Kirim brief"}</BrandButton>}
          contactEmphasis="Sampaikan jenis kebutuhan, target hasil, dan perkiraan timeline agar respons awal lebih tepat."
          whatsappHref={contact.whatsappHref}
          email={contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
