import React from "react";

import {
  BrandButton,
  HOME_TRANSFORMATION_STAGES,
  ProjectCaseStudyCard,
  TransformationPath,
  profileContent,
} from "@/components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "@/components/brand/BrandSystem";
import { MarketingLayout } from "@/components/layout/Layout";
import { usePublicSettings } from "@/lib/publicSettings";

// Homepage remains hardcoded. A Homepage CMS schema is a separate decision and
// this presentation slice does not create or imply one.

const primaryCapabilities = profileContent.services.filter(
  (service) => service.priority === "primary"
);
const supportingCapabilities = profileContent.services.filter(
  (service) => service.priority !== "primary"
);
const researchCapability = primaryCapabilities.find(
  (service) => service.slug === "research-development"
);
const designCapability = primaryCapabilities.find(
  (service) => service.slug === "design-prototyping"
);
const flagshipProject = profileContent.projects.find((project) =>
  project.title.includes("Pindad")
);
const xeonProject = profileContent.projects.find((project) =>
  project.title.includes("Xeon")
);
const bicycleProject = profileContent.projects.find((project) =>
  project.title.includes("Bicycle Arcade")
);
const selectedProjects = [xeonProject, bicycleProject].filter(Boolean);

const whyNiuva = [
  {
    title: "Riset sebagai dasar keputusan",
    body: "Setiap pengembangan dimulai dari kebutuhan, konteks, peluang, dan batasan yang dipahami sejak awal.",
  },
  {
    title: "Cara pikir engineering",
    body: "Rancangan dinilai dari kemungkinan implementasi, integrasi komponen, fungsi, dan kesiapan untuk diuji.",
  },
  {
    title: "Prototyping untuk validasi",
    body: "Ide dibawa ke bentuk yang dapat dievaluasi agar keputusan tidak berhenti di presentasi konsep.",
  },
  {
    title: "Eksekusi produk custom",
    body: "Niuva dapat mendukung kebutuhan mobilitas, simulator, perangkat interaktif, apparel, dan merchandise sesuai konteks proyek.",
  },
];

function HomeHeroArtifact() {
  if (!flagshipProject) return null;

  return (
    <figure data-testid="home-hero-artifact">
      <div className="overflow-hidden rounded-feature border border-border-default bg-surface-muted">
        <img
          src={flagshipProject.image}
          alt={flagshipProject.imageAlt}
          width={flagshipProject.imageWidth}
          height={flagshipProject.imageHeight}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="aspect-[4/3] h-full w-full object-contain"
        />
      </div>
      <figcaption className="mt-4 flex flex-col gap-1 border-b border-border-default pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <span className="font-heading text-sm font-semibold text-text-primary">
          {flagshipProject.title}
        </span>
        <span className="text-xs leading-5 text-text-secondary">
          Artefak pengembangan · {flagshipProject.category}
        </span>
      </figcaption>
      <TransformationPath compact className="mt-6" />
    </figure>
  );
}

function FlagshipProofSection() {
  if (!flagshipProject) return null;

  const evidence = [
    { label: "Konteks", value: flagshipProject.body },
    { label: "Tantangan", value: flagshipProject.challenge },
    { label: "Metode", value: flagshipProject.solution },
    { label: "Output", value: flagshipProject.output },
    { label: "Kapabilitas", value: flagshipProject.capability },
  ];

  return (
    <MarketingSection id="flagship-proof" tone="default" data-home-section="flagship-proof">
      <PageContainer>
        <div className="grid gap-9 lg:grid-cols-[minmax(0,1.14fr)_minmax(340px,0.86fr)] lg:items-center lg:gap-14">
          <figure>
            <div className="overflow-hidden rounded-feature border border-border-default bg-surface-muted">
              <img
                src={flagshipProject.image}
                alt={flagshipProject.imageAlt}
                width={flagshipProject.imageWidth}
                height={flagshipProject.imageHeight}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] h-full w-full object-contain"
              />
            </div>
            <figcaption className="mt-3 text-sm leading-6 text-text-secondary">
              Bukti project yang digunakan sesuai peran artefak yang telah disetujui.
            </figcaption>
          </figure>

          <div className="border-t border-border-default pt-6">
            <p className="type-label text-action-primary">Flagship project proof</p>
            <h2 className="type-heading-section mt-4 text-text-primary">
              Project nyata sebagai bukti cara kerja R&D dan engineering.
            </h2>
            <dl className="mt-7 border-b border-border-default">
              {evidence.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-2 border-t border-border-default py-4 sm:grid-cols-[7rem_1fr] sm:gap-5"
                >
                  <dt className="text-sm font-semibold text-text-secondary">
                    {item.label}
                  </dt>
                  <dd className="text-sm leading-7 text-text-primary">{item.value}</dd>
                </div>
              ))}
            </dl>
            <BrandButton to="/projects" variant="quiet" className="mt-5 px-0">
              Lihat project lainnya
            </BrandButton>
          </div>
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

function PrimaryCapabilitiesSection() {
  if (!researchCapability || !designCapability || !xeonProject) return null;

  return (
    <MarketingSection id="capabilities" tone="page" data-home-section="primary-capabilities">
      <PageContainer>
        <SectionHeader
          title="Dua cara utama untuk mengubah ketidakpastian menjadi keputusan produk."
          body="R&D menjelaskan pertanyaan yang perlu dijawab. Design & Prototyping membuat artefak yang dapat dinilai. Keduanya saling terhubung, tetapi tidak dipresentasikan sebagai layanan yang identik."
          align="stacked"
        />

        <div className="grid border-y border-border-default lg:grid-cols-2">
          <article className="py-8 lg:pr-12 lg:py-12">
            <p className="type-label text-action-primary">Pertanyaan yang perlu dijawab</p>
            <h3 className="type-heading-subsection mt-4 text-text-primary">
              Apa yang perlu dibuktikan sebelum pengembangan dimulai?
            </h3>
            <p className="mt-5 max-w-[54ch] text-base leading-8 text-text-secondary">
              {researchCapability.body}
            </p>
            <p className="mt-5 max-w-[54ch] border-l-2 border-action-primary pl-4 text-sm font-semibold leading-7 text-text-primary">
              {researchCapability.role}
            </p>
            <ul className="mt-7 border-b border-border-default">
              {researchCapability.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="border-t border-border-default py-3 text-sm font-semibold text-text-primary"
                >
                  {outcome}
                </li>
              ))}
            </ul>
            <BrandButton to="/capabilities" variant="quiet" className="mt-5 px-0">
              Pelajari Research & Development
            </BrandButton>
          </article>

          <article className="border-t border-border-default py-8 lg:border-l lg:border-t-0 lg:py-12 lg:pl-12">
            <figure className="overflow-hidden rounded-feature border border-border-default bg-surface-muted">
              <img
                src={xeonProject.image}
                alt={xeonProject.imageAlt}
                width={xeonProject.imageWidth}
                height={xeonProject.imageHeight}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] h-full w-full object-contain"
              />
            </figure>
            <p className="type-label mt-6 text-action-primary">Artefak yang dapat dievaluasi</p>
            <h3 className="type-heading-subsection mt-4 text-text-primary">
              {designCapability.title}
            </h3>
            <p className="mt-4 max-w-[54ch] text-base leading-8 text-text-secondary">
              {designCapability.body}
            </p>
            <p className="mt-4 text-sm font-semibold leading-7 text-text-primary">
              Output: {designCapability.output}
            </p>
            <BrandButton to="/capabilities" variant="quiet" className="mt-5 px-0">
              Pelajari Design & Prototyping
            </BrandButton>
          </article>
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

function TransformationProcessSection() {
  return (
    <MarketingSection
      id="transformation-process"
      tone="default"
      className="bg-action-primary"
      data-home-section="transformation-process"
    >
      <PageContainer>
        <header className="max-w-3xl">
          <h2 className="type-heading-section text-text-inverse">
            Satu alur transformasi dari kebutuhan menuju output.
          </h2>
          <p className="mt-5 max-w-[62ch] text-base leading-8 text-text-inverse md:text-lg">
            Setiap tahap memperjelas bukti, keputusan, dan bentuk evaluasi yang
            dibutuhkan sebelum pekerjaan bergerak lebih jauh.
          </p>
        </header>
        <TransformationPath
          items={HOME_TRANSFORMATION_STAGES}
          tone="dark"
          className="mt-10 md:mt-12"
        />
      </PageContainer>
    </MarketingSection>
  );
}

function SupportingCapabilitiesSection() {
  return (
    <MarketingSection tone="muted" spacing="compact" data-home-section="supporting-capabilities">
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          <div>
            <h2 className="type-heading-subsection text-text-primary">
              Kapabilitas pendukung untuk konteks kolaborasi yang lebih luas.
            </h2>
            <p className="mt-4 max-w-[42ch] text-sm leading-7 text-text-secondary">
              Perannya tetap sekunder terhadap R&D dan Design & Prototyping.
            </p>
          </div>
          <div className="border-b border-border-default">
            {supportingCapabilities.map((service) => (
              <article
                key={service.title}
                className="grid gap-3 border-t border-border-default py-5 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:gap-7"
              >
                <h3 className="font-heading text-lg font-semibold text-text-primary">
                  {service.title}
                </h3>
                <div>
                  <p className="text-sm leading-7 text-text-secondary">{service.body}</p>
                  <BrandButton to="/capabilities" variant="quiet" className="mt-2 px-0">
                    Lihat detail capability
                  </BrandButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

function SelectedProjectsSection() {
  return (
    <MarketingSection id="projects" tone="default" data-home-section="selected-projects">
      <PageContainer>
        <SectionHeader
          label="Selected project evidence"
          title="Bukti lintas mobilitas dan produk interaktif."
          body="Project ditampilkan sebagai konteks, tantangan, metode, dan output—bukan sebagai galeri visual atau klaim tanpa bukti."
          align="stacked"
        />
        <div className="grid gap-14 lg:gap-20">
          {selectedProjects.map((project, index) => (
            <ProjectCaseStudyCard
              key={project.title}
              project={project}
              index={index}
              to="/projects"
              ctaLabel="Baca konteks project"
              variant="editorial"
            />
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-border-default pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-base leading-7 text-text-secondary">
            Project index mempertahankan seluruh nama dan fakta project yang telah disetujui.
          </p>
          <BrandButton to="/projects" variant="secondary" className="shrink-0">
            Lihat semua Projects
          </BrandButton>
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

function RetailDiscoverySection() {
  return (
    <MarketingSection
      id="retail-discovery"
      tone="page"
      spacing="compact"
      dividerTop
      data-home-section="retail-discovery"
    >
      <PageContainer>
        <div
          className="grid gap-6 border-y border-border-default py-7 md:grid-cols-[1fr_auto] md:items-center md:py-9"
          data-testid="home-retail-discovery"
        >
          <div>
            <p className="type-label text-text-secondary">Jalur sekunder · Retail discovery</p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-text-primary md:text-3xl">
              Jelajahi produk terpublikasi tanpa checkout.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
              Katalog Retail menampilkan pilihan produk, harga yang disetujui, dan status ketersediaan aman. Transaksi dan pembayaran belum diaktifkan.
            </p>
          </div>
          <BrandButton to="/retail" variant="secondary">
            Jelajahi Retail
          </BrandButton>
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

function WhyNiuvaSection() {
  return (
    <MarketingSection
      id="why-niuva"
      tone="default"
      className="bg-action-primary"
      data-home-section="why-niuva"
    >
      <PageContainer>
        <div className="grid gap-10 xl:grid-cols-[0.78fr_1.22fr] xl:gap-14">
          <div>
            <h2 className="type-heading-section text-text-inverse">
              Cukup strategis untuk bisnis, cukup teknis untuk eksekusi.
            </h2>
            <p className="mt-5 max-w-[44ch] text-base leading-8 text-text-inverse">
              Niuva membantu organisasi membahas ide, risiko, bentuk produk, dan
              langkah realisasi dalam bahasa yang dapat dipahami tim bisnis dan teknis.
            </p>
          </div>
          <div className="border-b border-decoration-inverse-line">
            {whyNiuva.map((item) => (
              <article
                key={item.title}
                className="grid gap-2 border-t border-decoration-inverse-line py-5 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:gap-7"
              >
                <h3 className="font-heading text-lg font-semibold text-text-inverse">
                  {item.title}
                </h3>
                <p className="text-sm leading-7 text-text-inverse">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

export default function HomePage() {
  const { contact } = usePublicSettings();

  return (
    <MarketingLayout>
      <BrandPage revealSections={false}>
        <PageHero
          label="PT Niuva Inovasi Utama"
          title="Mitra R&D untuk Produk Inovatif dan Prototyping."
          body="Niuva membantu perusahaan, institusi, dan tim industri mengubah ide menjadi produk tervalidasi melalui riset, desain, engineering, prototyping, testing, dan implementasi."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={
            <BrandButton to="/projects" variant="secondary">
              Lihat Projects
            </BrandButton>
          }
          proofPanel={<HomeHeroArtifact />}
          variant="home"
          className="bg-surface-page"
        />

        <FlagshipProofSection />
        <PrimaryCapabilitiesSection />
        <TransformationProcessSection />
        <SupportingCapabilitiesSection />
        <SelectedProjectsSection />
        <RetailDiscoverySection />
        <WhyNiuvaSection />

        <CTASection
          variant="open"
          eyebrow={null}
          title="Diskusikan kebutuhan riset, desain, atau prototyping bersama Niuva."
          body="Sampaikan konteks proyek, target hasil, batasan teknis, dan bentuk output yang dibutuhkan. Tim Niuva akan membantu menentukan titik mulai yang paling relevan."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={
            contact.whatsappHref ? (
              <BrandButton href={contact.whatsappHref} variant="secondary">
                Hubungi Niuva
              </BrandButton>
            ) : (
              <BrandButton to="/contact" variant="secondary">
                Hubungi Niuva
              </BrandButton>
            )
          }
          contactEmphasis="Jalur cepat untuk kebutuhan proyek, proposal, atau kolaborasi teknis."
          whatsappHref={contact.whatsappHref}
          email={contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
