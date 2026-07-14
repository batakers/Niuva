import React from "react";
import { MarketingLayout } from "@/components/layout/Layout";
import {
  BrandButton,
  CapabilityPanel,
  ProcessTimeline,
  ProjectCaseStudyCard,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  DecorativeMotif,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";

const positioningEvidence = [
  { label: "Riset", value: "Memperjelas kebutuhan, peluang, dan batasan sebelum pengembangan dimulai." },
  { label: "Engineering", value: "Menghubungkan keputusan desain dengan fungsi, material, dan implementasi." },
  { label: "Prototyping", value: "Membawa konsep ke bentuk yang dapat diuji dan dibahas bersama stakeholder." },
  { label: "Ekosistem", value: "Memanfaatkan konteks makerspace Bandung Techno Park untuk kolaborasi teknis." },
];

const operatingModel = [
  {
    title: "Riset",
    body: "Memetakan kebutuhan, konteks pengguna, peluang, batasan teknis, dan dasar keputusan sebelum pengembangan dimulai.",
  },
  {
    title: "Desain",
    body: "Menerjemahkan temuan menjadi arah produk, visual, sistem, bentuk, atau pengalaman yang bisa dievaluasi.",
  },
  {
    title: "Engineering",
    body: "Menyusun pendekatan teknis yang realistis terhadap fungsi, material, integrasi, dan cara implementasi.",
  },
  {
    title: "Prototyping",
    body: "Membangun model awal atau purwarupa agar bentuk, fungsi, interaksi, dan risiko dapat diuji lebih cepat.",
  },
  {
    title: "Testing",
    body: "Mengevaluasi hasil bersama stakeholder untuk melihat kecocokan kebutuhan, batasan, dan arah iterasi.",
  },
  {
    title: "Implementasi",
    body: "Menyiapkan output akhir, dokumentasi, atau langkah lanjutan sesuai ruang lingkup kolaborasi.",
  },
];

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

function HeroProofPanel() {
  const proofItems = [
    "Riset kebutuhan",
    "Design engineering",
    "Validasi prototipe",
  ];

  return (
    <div className="rounded-feature bg-decoration-brand-soft p-1.5 ring-1 ring-border-default">
      <div className="relative overflow-hidden rounded-card bg-action-primary p-5 text-text-inverse sm:p-6 lg:p-7">
        <DecorativeMotif light density="sparse" className="-right-10 -top-10 h-40 w-40 opacity-30" />
        <div className="relative z-10">
          <p className="text-sm font-semibold text-text-inverse">Bukti kapabilitas</p>
          <h2 className="type-heading-subsection mt-4 max-w-sm text-text-inverse">
            Dari kebutuhan menuju prototipe yang dapat dievaluasi.
          </h2>
          <ul className="mt-6 grid gap-2.5">
            {proofItems.map((item) => (
              <li
                key={item}
                className="flex min-h-12 items-center gap-3 border-t border-white/20 px-1 py-3"
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-white/80" />
                <span className="text-sm font-semibold leading-5 text-text-inverse">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CoreCapabilitiesSection() {
  const primaryCapabilities = profileContent.services.filter((service) => service.priority === "primary");
  const supportingCapabilities = profileContent.services.filter((service) => service.priority !== "primary");

  return (
    <MarketingSection id="capabilities" tone="default" className="overflow-hidden">
      <PageContainer>
        <SectionHeader
          label="Capabilities"
          title="Kapabilitas utama untuk mengubah ide menjadi dasar produk yang dapat divalidasi."
          body="R&D dan Design & Prototyping menjadi wajah utama layanan Niuva. Konsultasi, workshop, apparel, dan merchandise mendukung kebutuhan kolaborasi, aktivasi, dan penguatan kapasitas."
          align="split"
        />

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {primaryCapabilities.map((service, index) => (
            <CapabilityPanel
              key={service.title}
              service={service}
              index={index}
              compact
              className="lg:col-span-6"
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-12 lg:gap-8">
          {supportingCapabilities.map((service, index) => (
            <article key={service.title} className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-page p-6 sm:p-7">
              <p className="text-sm font-semibold text-action-primary">Kapabilitas pendukung</p>
              <h3 className="type-heading-card mt-4 text-text-primary">{service.title}</h3>
              <p className="mt-3 max-w-xl text-base leading-7 text-text-secondary">{service.body}</p>
              <BrandButton to="/capabilities" variant="quiet" className="mt-5 px-0" aria-label={`Lihat detail ${service.title}`}>
                Lihat detail capability
              </BrandButton>
            </article>
          ))}
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

function OperatingModelSection() {
  return (
    <MarketingSection id="operating-model" tone="muted" className="overflow-hidden">
      <PageContainer>
        <SectionHeader
          label="Operating model"
          title="Alur kerja teknis yang menjaga keputusan tetap dapat ditelusuri."
          body="Proses Niuva membantu calon mitra melihat titik masuk yang tepat, dari riset awal sampai implementasi. Setiap tahap dibuat untuk mengurangi asumsi dan memperjelas output."
          align="split"
        />
        <ProcessTimeline items={operatingModel} />
      </PageContainer>
    </MarketingSection>
  );
}

function FeaturedProjectsSection() {
  return (
    <MarketingSection id="projects" tone="default" className="overflow-hidden">
      <PageContainer>
        <SectionHeader
          label="Featured projects"
          title="Project sebagai bukti kapabilitas, bukan sekadar portfolio visual."
          body="Tiga project berikut menunjukkan pengalaman Niuva pada desain produk, mobilitas EV, simulator, perangkat interaktif, dan prototyping untuk kebutuhan teknis custom."
          align="split"
        />
        <div className="grid gap-12 lg:gap-16">
          {profileContent.projects.slice(0, 3).map((project, index) => (
            <ProjectCaseStudyCard
              key={project.title}
              project={project}
              index={index}
              to="/contact"
              ctaLabel="Diskusikan Project"
            />
          ))}
        </div>
        <div className="brand-reveal mt-8 flex flex-col gap-4 rounded-card bg-surface-muted p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="max-w-2xl text-base leading-7 text-text-primary">
            Untuk kebutuhan proposal atau pitching, project dapat dibaca sebagai contoh pendekatan: konteks, tantangan, solusi, output, dan kapabilitas yang dibuktikan.
          </p>
          <BrandButton to="/projects" variant="secondary" className="shrink-0">
            Lihat Projects
          </BrandButton>
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

function WhyNiuvaSection() {
  return (
    <MarketingSection id="why-niuva" tone="page" className="overflow-hidden">
      <PageContainer>
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-stretch xl:gap-10">
          <div className="brand-reveal relative h-full overflow-hidden rounded-feature bg-action-primary p-6 text-text-inverse sm:p-8 md:p-10">
            <DecorativeMotif light density="sparse" className="-right-16 -top-14 h-72 w-72 opacity-55" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div>
                <p className="font-mono-tech text-xs font-semibold text-text-inverse">WHY NIUVA</p>
                <h2 className="brand-heading mt-5 text-3xl leading-tight text-text-inverse md:text-4xl xl:text-5xl">
                  Cukup strategis untuk bisnis, cukup teknis untuk eksekusi.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-8 text-text-inverse">
                  Niuva membantu organisasi membahas ide, risiko, bentuk produk, dan langkah realisasi dalam bahasa yang bisa dipahami tim bisnis maupun teknis.
                </p>
              </div>
              <BrandButton to="/contact" variant="inverse">
                Diskusikan Project
              </BrandButton>
            </div>
          </div>

          <div className="grid h-full auto-rows-fr gap-6 md:grid-cols-2">
            {whyNiuva.map((item) => (
              <article
                key={item.title}
                className="brand-reveal h-full overflow-hidden rounded-card border border-border-default bg-surface-default p-6 sm:p-7"
              >
                <div className="mb-6 h-3 w-3 rounded-full bg-brand-primary" />
                <h3 className="brand-heading text-2xl leading-tight text-text-primary">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-text-secondary">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </MarketingSection>
  );
}

export default function HomePage() {
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          label="PT Niuva Inovasi Utama"
          title="Mitra R&D untuk Produk Inovatif dan Prototyping."
          body="Niuva membantu perusahaan, institusi, dan tim industri mengubah ide menjadi produk tervalidasi melalui riset, desain, engineering, prototyping, testing, dan implementasi."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          proofPanel={<HeroProofPanel />}
          variant="home"
          className="bg-surface-page"
        />

        <MarketingSection id="positioning" spacing="compact" tone="muted" className="overflow-hidden">
          <PageContainer>
            <div className="grid gap-8 border-y border-border-default py-8 md:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-12">
              <div className="brand-reveal">
                <p className="text-sm font-semibold text-action-primary">Peran Niuva</p>
                <h2 className="type-heading-section mt-4 max-w-3xl text-text-primary">
                  Mitra strategis untuk kebutuhan produk yang harus diuji.
                </h2>
                <p className="mt-5 max-w-[65ch] text-base leading-8 text-text-secondary md:text-lg">
                  {profileContent.intro} Niuva menghubungkan riset, design engineering, dan prototyping agar keputusan proyek lebih jelas sejak awal.
                </p>
              </div>
              <dl className="brand-reveal border-b border-border-default">
                {positioningEvidence.map((item) => (
                  <div key={item.label} className="grid gap-2 border-t border-border-default py-4 sm:grid-cols-[8rem_1fr] sm:gap-5">
                    <dt className="text-sm font-semibold text-action-primary">{item.label}</dt>
                    <dd className="type-body-small text-text-primary sm:text-base sm:leading-[var(--type-body-leading)]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </PageContainer>
        </MarketingSection>

        <CoreCapabilitiesSection />
        <OperatingModelSection />
        <FeaturedProjectsSection />
        <WhyNiuvaSection />

        <CTASection
          label="Kolaborasi"
          title="Diskusikan kebutuhan riset, desain, atau prototyping bersama Niuva."
          body="Sampaikan konteks proyek, target hasil, batasan teknis, dan bentuk output yang dibutuhkan. Tim Niuva akan membantu menentukan titik mulai yang paling relevan."
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href={profileContent.contact.whatsappHref} variant="secondary">Hubungi Niuva</BrandButton>}
          contactEmphasis="Jalur cepat untuk kebutuhan proyek, proposal, atau kolaborasi teknis."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
