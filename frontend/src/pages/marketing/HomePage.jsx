import React from "react";
import { MarketingLayout } from "../../components/Layout";
import {
  BrandButton,
  CapabilityPanel,
  ProcessTimeline,
  ProjectCaseStudyCard,
  ServiceCard,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  DecorativeMotif,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";

const orientationLabels = [
  "Berbasis riset",
  "Design engineering",
  "Prototyping & testing",
  "Produk custom",
  "EV & simulator experience",
  "Bandung Techno Park ecosystem",
];

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
  {
    title: "Kolaborasi lintas stakeholder",
    body: "Output disusun agar mudah dibahas oleh tim bisnis, teknis, institusi, komunitas, dan mitra pengembangan.",
  },
  {
    title: "Ekosistem Bandung Techno Park",
    body: "Lokasi Niuva mendukung proses riset, makerspace, workshop, prototyping, dan pengembangan sumber daya manusia.",
  },
];

function HeroProofPanel() {
  const proofItems = [
    "Research-based development",
    "Design engineering",
    "Prototype validation",
    "BTP makerspace ecosystem",
  ];

  return (
    <div className="rounded-[var(--brand-radius-outer)] bg-[rgba(102,146,188,0.12)] p-1.5 ring-1 ring-[rgba(102,146,188,0.14)]">
      <div className="relative overflow-hidden rounded-[var(--brand-radius-inner)] bg-[var(--brand-blue)] p-5 text-white sm:p-6 lg:p-7">
        <DecorativeMotif light density="sparse" className="-right-10 -top-10 h-40 w-40 opacity-30" />
        <div className="relative z-10">
          <p className="font-mono-tech text-xs font-semibold text-white/70">NIUVA CAPABILITY BRIEF</p>
          <h2 className="brand-heading mt-4 max-w-sm text-[clamp(1.65rem,3vw,2.25rem)] leading-[1.12] text-white">
            Dari ide ke prototype teruji.
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-2.5">
            {proofItems.map((item) => (
              <li
                key={item}
                className="flex min-h-14 items-center gap-3 rounded-[var(--brand-radius-control)] bg-white/12 px-3.5 py-3 ring-1 ring-white/12"
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-white/80" />
                <span className="text-sm font-semibold leading-5 text-white">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function OrientationStrip() {
  return (
    <section className="relative overflow-hidden bg-[var(--brand-offwhite)] pb-[var(--brand-section-space-compact)]">
      <PageContainer>
        <div className="brand-reveal grid gap-6 rounded-[var(--brand-radius-card)] border border-[var(--brand-border)] bg-[var(--brand-blue-bg)] p-5 sm:p-6 md:grid-cols-[0.82fr_1.18fr] md:p-7 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-[var(--brand-blue)]">Domain kerja Niuva</p>
            <h2 className="brand-heading mt-3 text-2xl leading-tight text-[var(--brand-ink)] md:text-3xl">
              Fokus pada R&D, design engineering, prototyping, dan produk teknis custom.
            </h2>
          </div>
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {orientationLabels.map((label) => (
              <span
                key={label}
                className="flex items-center gap-3 border-b border-[rgba(102,146,188,0.2)] py-2 text-sm font-semibold text-[var(--brand-ink)]"
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[var(--brand-blue)]" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function CoreCapabilitiesSection() {
  const primaryCapabilities = profileContent.services.filter((service) => service.priority === "primary");
  const supportingCapabilities = profileContent.services.filter((service) => service.priority !== "primary");

  return (
    <section id="capabilities" className="relative overflow-hidden bg-white py-[var(--brand-section-space)]">
      <PageContainer>
        <SectionHeader
          label="Capabilities"
          title="Kapabilitas utama untuk mengubah ide menjadi dasar produk yang dapat divalidasi."
          body="R&D dan Design & Prototyping menjadi wajah utama layanan Niuva. Konsultasi, workshop, apparel, dan merchandise mendukung kebutuhan kolaborasi, aktivasi, dan penguatan kapasitas."
          align="split"
        />

        <div className="grid gap-5 lg:grid-cols-12">
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

        <div className="mt-5 grid gap-5 lg:grid-cols-12">
          {supportingCapabilities.map((service, index) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={primaryCapabilities.length + index}
              className="lg:col-span-6"
            />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

function OperatingModelSection() {
  return (
    <section id="operating-model" className="relative overflow-hidden bg-[var(--brand-blue-bg)] py-[var(--brand-section-space)]">
      <PageContainer>
        <SectionHeader
          label="Operating model"
          title="Alur kerja teknis yang menjaga keputusan tetap dapat ditelusuri."
          body="Proses Niuva membantu calon mitra melihat titik masuk yang tepat, dari riset awal sampai implementasi. Setiap tahap dibuat untuk mengurangi asumsi dan memperjelas output."
          align="split"
        />
        <ProcessTimeline items={operatingModel} className="lg:grid-cols-6" />
      </PageContainer>
    </section>
  );
}

function FeaturedProjectsSection() {
  return (
    <section id="projects" className="relative overflow-hidden bg-white py-[var(--brand-section-space)]">
      <PageContainer>
        <SectionHeader
          label="Featured projects"
          title="Project sebagai bukti kapabilitas, bukan sekadar portfolio visual."
          body="Tiga project berikut menunjukkan pengalaman Niuva pada desain produk, mobilitas EV, simulator, perangkat interaktif, dan prototyping untuk kebutuhan teknis custom."
          align="split"
        />
        <div className="grid gap-6">
          {profileContent.projects.slice(0, 3).map((project, index) => (
            <ProjectCaseStudyCard
              key={project.title}
              project={project}
              index={index}
              to="/contact"
              ctaLabel="Diskusikan Project Serupa"
            />
          ))}
        </div>
        <div className="brand-reveal mt-8 flex flex-col gap-4 rounded-[var(--brand-radius-card)] bg-[var(--brand-blue-bg)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="max-w-2xl text-base leading-7 text-[var(--brand-ink)]">
            Untuk kebutuhan proposal atau pitching, project dapat dibaca sebagai contoh pendekatan: konteks, tantangan, solusi, output, dan kapabilitas yang dibuktikan.
          </p>
          <BrandButton to="/projects" variant="secondary" className="shrink-0">
            Lihat Projects
          </BrandButton>
        </div>
      </PageContainer>
    </section>
  );
}

function WhyNiuvaSection() {
  return (
    <section id="why-niuva" className="relative overflow-hidden bg-[var(--brand-offwhite)] py-[var(--brand-section-space)]">
      <PageContainer>
        <div className="grid gap-6 min-[1100px]:grid-cols-[0.9fr_1.1fr] min-[1100px]:items-stretch">
          <div className="brand-reveal relative overflow-hidden rounded-[var(--brand-radius-outer)] bg-[var(--brand-blue)] p-6 text-white sm:p-8 md:p-10">
            <DecorativeMotif light density="sparse" className="-right-16 -top-14 h-72 w-72 opacity-55" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div>
                <p className="font-mono-tech text-xs font-semibold text-white/70">WHY NIUVA</p>
                <h2 className="brand-heading mt-5 text-3xl leading-tight text-white md:text-4xl min-[1100px]:text-5xl">
                  Cukup strategis untuk bisnis, cukup teknis untuk eksekusi.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-8 text-white/80">
                  Niuva membantu organisasi membahas ide, risiko, bentuk produk, dan langkah realisasi dalam bahasa yang bisa dipahami tim bisnis maupun teknis.
                </p>
              </div>
              <BrandButton to="/contact" variant="inverse">
                Diskusikan Project
              </BrandButton>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {whyNiuva.map((item) => (
              <article
                key={item.title}
                className="brand-reveal border-b border-[var(--brand-border)] py-5 first:border-t sm:px-2 sm:py-6"
              >
                <div className="mb-6 h-3 w-3 rounded-full bg-[var(--brand-blue)]" />
                <h3 className="brand-heading text-2xl leading-tight text-[var(--brand-ink)]">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-[var(--brand-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export default function HomePage() {
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          label="PT Niuva Inovasi Utama"
          title="Mitra R&D, Design Engineering, dan Prototyping untuk Produk Inovatif."
          body="Niuva membantu perusahaan, institusi, dan tim industri mengubah ide menjadi produk tervalidasi melalui riset, desain, engineering, prototyping, testing, dan implementasi."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          proofPanel={<HeroProofPanel />}
          variant="home"
          titleClassName="lg:text-[clamp(2.45rem,4.15vw,3.05rem)] xl:text-[clamp(2.6rem,3.25vw,3.35rem)]"
          className="bg-[var(--brand-offwhite)]"
        />

        <OrientationStrip />

        <section id="positioning" className="relative overflow-hidden bg-[var(--brand-offwhite)] pb-[var(--brand-section-space-compact)]">
          <PageContainer>
            <div className="grid gap-8 border-y border-[var(--brand-border)] py-[var(--brand-section-space-compact)] lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-12">
              <div className="brand-reveal">
                <p className="text-sm font-semibold text-[var(--brand-blue)]">Peran Niuva</p>
                <h2 className="brand-heading mt-4 max-w-3xl text-[clamp(2rem,4vw,3.5rem)] leading-[1.06] text-[var(--brand-ink)]">
                  Mitra strategis untuk kebutuhan produk yang harus diuji.
                </h2>
                <p className="mt-5 max-w-[65ch] text-base leading-8 text-[var(--brand-muted)] md:text-lg">
                  {profileContent.intro} Pendekatan Niuva menggabungkan riset, konsultasi ahli, pengembangan teknologi, desain kreatif, dan prototyping agar keputusan proyek lebih jelas sejak awal.
                </p>
              </div>
              <dl className="brand-reveal border-b border-[var(--brand-border)]">
                {positioningEvidence.map((item) => (
                  <div key={item.label} className="grid gap-2 border-t border-[var(--brand-border)] py-4 sm:grid-cols-[8rem_1fr] sm:gap-5">
                    <dt className="text-sm font-semibold text-[var(--brand-blue)]">{item.label}</dt>
                    <dd className="text-sm leading-6 text-[var(--brand-ink)]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </PageContainer>
        </section>

        <CoreCapabilitiesSection />
        <OperatingModelSection />
        <FeaturedProjectsSection />
        <WhyNiuvaSection />

        <CTASection
          label="Kolaborasi"
          title="Diskusikan kebutuhan riset, desain, atau prototyping bersama Niuva."
          body="Sampaikan konteks proyek, target hasil, batasan teknis, dan bentuk output yang dibutuhkan. Tim Niuva akan membantu menentukan titik mulai yang paling relevan."
          primaryAction={<BrandButton to="/contact" variant="secondary">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href={profileContent.contact.whatsappHref} variant="secondary">Hubungi Niuva</BrandButton>}
          contactEmphasis="Jalur cepat untuk kebutuhan proyek, proposal, atau kolaborasi teknis."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
