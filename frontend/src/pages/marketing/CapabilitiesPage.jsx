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
import { usePublicContent } from "../../lib/content";

function mergeCapabilities(cmsBlocks, status) {
  if (status !== "ready") return profileContent.services;
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
  const { blocks: cmsBlocks, status } = usePublicContent("capability");
  const capabilities = useMemo(
    () => mergeCapabilities(cmsBlocks, status),
    [cmsBlocks, status]
  );
  const primaryCapabilities = capabilities.filter((service) => service.priority === "primary");
  const supportingCapabilities = capabilities.filter((service) => service.priority === "supporting");

  return (
    <MarketingLayout>
      <BrandPage>
        {/* The panel now carries the two primary capabilities and what each one
            hands back, instead of a blue box repeating their names. */}
        <PageHero
          eyebrow="Capabilities"
          title="Dari ide menjadi produk yang dapat diuji."
          body="Research & Development serta Design & Prototyping menjadi kapabilitas utama Niuva. Konsultasi, workshop, apparel, dan merchandise mendukung ekosistem inovasi yang lebih luas."
          variant="index"
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          visual={
            <div className="grid gap-6 rounded-card bg-surface-muted p-6 sm:p-8">
              {primaryCapabilities.map((service) => (
                <div key={service.slug} className="border-t-2 border-[var(--color-brand-secondary)] pt-4">
                  <p className="type-heading-card text-text-primary">{service.title}</p>
                  <p className="type-body-small mt-2 max-w-[42ch] text-text-secondary">{service.output}</p>
                </div>
              ))}
            </div>
          }
        />

        <MarketingSection tone="muted">
          <PageContainer className="relative z-10">
            <SectionHeader
              eyebrow="Primary Capabilities"
              title="R&D serta Design & Prototyping menjadi pusat pengembangan produk."
              body="Dua kapabilitas utama ini membantu mitra memahami masalah, menentukan arah teknologi, memvalidasi konsep, dan menyiapkan hasil yang dapat diuji sebelum keputusan implementasi lebih besar."
              align="stacked"
            />
            <div className="grid gap-8 lg:gap-10">
              {primaryCapabilities.map((service, index) => (
                <CapabilityPanel key={service.slug} service={service} index={index} />
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              title="Konsultasi, workshop, apparel, dan merchandise sebagai penguat eksekusi."
              body="Tidak semua kebutuhan dimulai dari prototipe. Sebagian mitra membutuhkan penyelarasan strategi, pelatihan praktis, atau produk kreatif pendukung identitas program."
              align="stacked"
            />
            <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
              {supportingCapabilities.map((service) => (
                <article key={service.slug} className="brand-reveal border-t border-border-default pt-6">
                  <p className="type-label text-text-secondary">Kapabilitas pendukung</p>
                  <h3 className="type-heading-subsection mt-4 text-text-primary">{service.title}</h3>
                  <p className="type-body mt-4 max-w-[52ch] text-text-secondary">{service.body}</p>
                  <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    <div>
                      <dt className="type-label text-text-secondary">Output</dt>
                      <dd className="type-body-small mt-2 text-text-primary">{service.output}</dd>
                    </div>
                    <div>
                      <dt className="type-label text-text-secondary">Untuk</dt>
                      <dd className="type-body-small mt-2 text-text-primary">{service.targetUsers}</dd>
                    </div>
                  </dl>
                  <BrandButton to="/contact" variant="secondary" className="mt-7" aria-label={`${service.cta} untuk ${service.title}`}>{service.cta}</BrandButton>
                </article>
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
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href={`mailto:${profileContent.contact.email}`} variant="secondary">Kirim Brief</BrandButton>}
          contactEmphasis="Sampaikan jenis kebutuhan, target hasil, dan perkiraan timeline agar respons awal lebih tepat."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
