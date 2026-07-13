import React from "react";
import { useI18n } from "@/i18n";
import { MarketingLayout } from "@/components/layout/Layout";
import {
  BrandButton,
  CapabilityPanel,
  ProcessTimeline,
  RoundedVisualFrame,
  useProfileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";

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
  const { locale } = useI18n();
  const profileContent = useProfileContent();
  const primaryCapabilities = profileContent.services.filter((service) => service.priority === "primary");
  const supportingCapabilities = profileContent.services.filter((service) => service.priority === "supporting");
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Capabilities"
          title="Dari ide menjadi produk yang dapat diuji."
          body="Research & Development serta Design & Prototyping menjadi kapabilitas utama Niuva. Konsultasi, workshop, apparel, dan merchandise mendukung ekosistem inovasi yang lebih luas."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          visual={
            <RoundedVisualFrame title="Riset menuju prototipe yang dapat divalidasi." kicker="Kapabilitas inti">
              <div className="grid gap-3 text-sm font-semibold text-text-inverse">
                <span>Research & Development</span>
                <span>Design & Prototyping</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        <MarketingSection tone="muted">
          <PageContainer className="relative z-10">
            <SectionHeader
              eyebrow="Primary Capabilities"
              title="R&D serta Design & Prototyping menjadi pusat pengembangan produk."
              body="Dua kapabilitas utama ini membantu mitra memahami masalah, menentukan arah teknologi, memvalidasi konsep, dan menyiapkan hasil yang dapat diuji sebelum keputusan implementasi lebih besar."
              align="split"
            />
            <div className="grid gap-8 lg:gap-10">
              {primaryCapabilities.map((service, index) => (
                <CapabilityPanel key={`primary-capability-${index}`} service={service} index={index} />
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              eyebrow="Supporting Capabilities"
              title="Konsultasi, workshop, apparel, dan merchandise sebagai penguat eksekusi."
              body="Tidak semua kebutuhan dimulai dari prototipe. Sebagian mitra membutuhkan penyelarasan strategi, pelatihan praktis, atau produk kreatif pendukung identitas program."
              align="split"
            />
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              {supportingCapabilities.map((service, index) => (
                <article key={`supporting-capability-${index}`} className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-6">
                    <p className="text-sm font-semibold text-action-primary">Kapabilitas pendukung</p>
                    <span className="font-mono-tech text-xs font-semibold text-text-secondary">{String(index + 3).padStart(2, "0")}</span>
                  </div>
                  <h3 className="type-heading-subsection mt-5 text-text-primary">{service.title}</h3>
                  <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">{service.body}</p>
                  <dl className="mt-6 border-t border-border-default">
                    <div className="grid gap-2 border-b border-border-default py-4 sm:grid-cols-[7rem_1fr] sm:gap-5">
                      <dt className="text-sm font-semibold text-action-primary">Output</dt>
                      <dd className="text-sm leading-6 text-text-primary">{service.output}</dd>
                    </div>
                    <div className="grid gap-2 border-b border-border-default py-4 sm:grid-cols-[7rem_1fr] sm:gap-5">
                      <dt className="text-sm font-semibold text-action-primary">Untuk</dt>
                      <dd className="text-sm leading-6 text-text-primary">{service.targetUsers}</dd>
                    </div>
                  </dl>
                  <BrandButton to="/contact" variant="secondary" className="mt-6" aria-label={`${service.cta} ${locale === "en" ? "for" : "untuk"} ${service.title}`}>{service.cta}</BrandButton>
                </article>
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="page">
          <PageContainer>
            <SectionHeader eyebrow="Model kolaborasi" title="Empat tahap dari brief menuju evaluasi hasil." body="Setiap tahap memperjelas titik masuk, bentuk output, dan keputusan berikutnya sejak awal kerja sama." align="split" />
            <ProcessTimeline items={engagementSteps} className="lg:grid-cols-4" />
          </PageContainer>
        </MarketingSection>

        <CTASection
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
