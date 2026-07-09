import React from "react";
import { MarketingLayout } from "../../components/Layout";
import {
  BrandButton,
  DotPagination,
  GoalItem,
  ProjectGrid,
  RoundedVisualFrame,
  SectionShell,
  ServiceGrid,
  ULineMotif,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import { BrandPage, CTASection, PageHero } from "../../components/brand/BrandSystem";

const visionMission = [
  {
    title: "Visi",
    body: "Menjadi mitra strategis inovasi dan pengembangan produk bagi perusahaan, institusi, dan komunitas yang membutuhkan solusi terarah.",
  },
  {
    title: "Misi",
    body: "Menggabungkan riset, konsultasi ahli, teknologi, desain kreatif, prototyping, dan pelatihan praktis untuk menghasilkan hasil kerja yang dapat diuji dan diterapkan.",
  },
];

const workSteps = [
  { title: "Riset", body: "Memetakan kebutuhan, konteks pengguna, peluang, batasan, dan dasar keputusan." },
  { title: "Desain", body: "Menerjemahkan temuan menjadi arah visual, produk, sistem, atau pengalaman." },
  { title: "Engineering", body: "Menyusun solusi teknis yang realistis terhadap fungsi, material, dan cara implementasi." },
  { title: "Prototyping", body: "Membangun purwarupa atau model awal untuk menguji bentuk, fungsi, dan interaksi." },
  { title: "Testing", body: "Mengevaluasi hasil bersama pemangku kepentingan sebelum keputusan lanjutan." },
  { title: "Implementasi", body: "Menyiapkan output proyek, dokumentasi, atau program lanjutan sesuai ruang lingkup." },
];

const whyNiuva = [
  {
    title: "Berbasis riset",
    body: "Keputusan pengembangan dimulai dari kebutuhan, peluang, dan batasan yang dipahami sejak awal.",
  },
  {
    title: "Desain dan prototyping terhubung",
    body: "Ide tidak berhenti di visual; Niuva membantu membawanya ke bentuk yang dapat diuji.",
  },
  {
    title: "Praktis untuk tim bisnis dan teknis",
    body: "Konsultasi, workshop, dan output proyek disusun agar mudah dibahas lintas stakeholder.",
  },
  {
    title: "Berakar di ekosistem Bandung Techno Park",
    body: "Lokasi kerja Niuva mendukung kolaborasi inovasi, maker, teknologi, dan pengembangan SDM.",
  },
];

const operatingFocus = [
  { title: "Riset", body: "Memahami kebutuhan, peluang, dan batasan sejak awal." },
  { title: "Konsultasi", body: "Menyelaraskan keputusan teknis dengan tujuan bisnis." },
  { title: "Realisasi produk", body: "Mengubah konsep menjadi desain, purwarupa, atau program." },
];

export default function HomePage() {
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="PT Niuva Inovasi Utama"
          title="Mitra R&D, design engineering, dan prototyping untuk pengembangan produk inovatif."
          body="Niuva membantu perusahaan, institusi, dan komunitas merumuskan kebutuhan, mengembangkan konsep, membangun prototipe, dan menciptakan nilai tambah melalui riset mendalam, konsultasi ahli, teknologi, dan desain kreatif."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href="#capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          visual={
            <RoundedVisualFrame title="Dari riset ke produk yang dapat diuji" kicker="Riset, desain, teknologi">
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                {["Validasi kebutuhan", "Konsultasi ahli", "Design engineering", "Prototype terarah"].map((item) => (
                  <div key={item} className="rounded-[1rem] bg-white/15 px-3 py-3 text-sm font-semibold text-white sm:rounded-[1.25rem] sm:px-4 sm:py-4">
                    {item}
                  </div>
                ))}
              </div>
            </RoundedVisualFrame>
          }
        />

        <SectionShell
          id="about"
          eyebrow="Tentang Niuva"
          title="Partner strategis dari pemahaman kebutuhan sampai produk yang dapat diuji."
          body={profileContent.intro + " Pendekatannya menghubungkan riset mendalam, konsultasi ahli, teknologi, desain kreatif, prototyping, dan penguatan kapasitas SDM."}
          className="bg-white"
        >
          <div className="grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
            <div className="brand-reveal rounded-[var(--brand-radius-outer)] bg-[var(--brand-blue-bg)] p-6 sm:p-8 md:p-10">
              <p className="text-sm font-semibold text-[var(--brand-blue)]">Cara kerja</p>
              <h3 className="brand-heading mt-4 text-3xl leading-tight text-[var(--brand-ink)] md:text-4xl">
                Riset memberi arah, desain memberi bentuk, prototipe memberi dasar evaluasi.
              </h3>
              <p className="mt-6 text-base leading-8 text-[var(--brand-muted)]">
                Alur ini membantu keputusan proyek lebih mudah dipertanggungjawabkan, terutama saat ide masih perlu dipahami, diuji, dan diterjemahkan menjadi hasil nyata.
              </p>
            </div>
            <div className="brand-reveal relative overflow-hidden rounded-[var(--brand-radius-outer)] bg-[var(--brand-blue)] p-6 text-white sm:p-8 md:p-10">
              <ULineMotif light className="absolute -right-12 -top-12 h-52 w-52 opacity-30 sm:-right-16 sm:-top-16 sm:h-72 sm:w-72" />
              <div className="relative z-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
                {operatingFocus.map((item, index) => (
                  <div key={item.title} className="rounded-[1.15rem] bg-white/15 p-4 sm:rounded-[var(--brand-radius-card)] sm:p-5">
                    <p className="text-2xl font-extrabold sm:text-3xl">{String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-5 text-base font-semibold text-white sm:mt-8">{item.title}</p>
                    <p className="mt-3 text-sm leading-6 text-white/75">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="workflow"
          eyebrow="How We Work"
          title="Proses kerja yang menyambungkan riset, desain, engineering, dan validasi."
          body="Setiap tahap menjaga agar ide tetap terhubung dengan kebutuhan, kemampuan teknis, dan output yang dapat dievaluasi oleh pemangku kepentingan."
          className="bg-[var(--brand-blue-bg)]"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workSteps.map((step, index) => (
              <article key={step.title} className="brand-reveal rounded-[var(--brand-radius-card)] bg-white p-5 shadow-[var(--brand-shadow-card)] sm:p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="brand-heading mt-6 text-2xl leading-tight text-[var(--brand-ink)]">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-[var(--brand-muted)]">{step.body}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="visi-misi"
          eyebrow="Visi & Misi"
          title="Arah kerja yang fokus pada inovasi berkelanjutan."
          className="bg-white"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {visionMission.map((item) => (
              <article key={item.title} className="brand-reveal rounded-[var(--brand-radius-outer)] bg-[var(--brand-blue-bg)] p-6 shadow-[var(--brand-shadow-card)] sm:p-8 md:p-10">
                <div className="mb-8 h-14 w-14 rounded-full bg-[var(--brand-blue)] sm:mb-10 sm:h-16 sm:w-16" />
                <h3 className="brand-heading text-3xl text-[var(--brand-ink)] md:text-4xl">{item.title}</h3>
                <p className="mt-5 max-w-xl leading-8 text-[var(--brand-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="goals" eyebrow="Tujuan" title="Membangun inovasi yang bernilai bagi bisnis dan tim." className="bg-[var(--brand-blue-bg)]">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:gap-10">
            <RoundedVisualFrame title="Ekosistem inovasi berkelanjutan" kicker="Tujuan">
              <p className="max-w-sm text-base leading-7 text-white/80">
                Pendekatan Niuva menghubungkan kebutuhan bisnis, pengembangan sumber daya manusia, dan realisasi produk melalui proses yang dapat dievaluasi.
              </p>
            </RoundedVisualFrame>
            <ul className="grid gap-4">
              {profileContent.goals.map((goal, index) => (
                <GoalItem key={goal} index={index}>{goal}</GoalItem>
              ))}
            </ul>
          </div>
        </SectionShell>

        <SectionShell
          id="capabilities"
          eyebrow="Capabilities"
          title="Kapabilitas untuk bergerak dari ide ke hasil yang dapat dievaluasi."
          body="R&D dan Design & Prototyping menjadi kapabilitas utama, didukung konsultasi, workshop, apparel, dan merchandise sesuai kebutuhan proyek."
          className="bg-white"
        >
          <ServiceGrid />
        </SectionShell>

        <SectionShell
          id="why-niuva"
          eyebrow="Why Niuva"
          title="Pendekatan yang cukup strategis untuk bisnis, cukup praktis untuk eksekusi."
          className="bg-[var(--brand-blue-bg)]"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {whyNiuva.map((item) => (
              <article key={item.title} className="brand-reveal rounded-[var(--brand-radius-card)] bg-white p-6 shadow-[var(--brand-shadow-card)] md:p-8">
                <div className="mb-7 h-4 w-4 rounded-full bg-[var(--brand-blue)]" />
                <h3 className="brand-heading text-2xl leading-tight text-[var(--brand-ink)] md:text-3xl">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--brand-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="projects"
          eyebrow="Projects"
          title="Proyek sebagai bukti kapabilitas lintas riset, desain, dan teknologi fisik."
          body="Kartu proyek disusun sebagai pratinjau studi kasus: tantangan, solusi, output, dan kapabilitas yang ditunjukkan."
          className="bg-white"
        >
          <ProjectGrid />
          <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <DotPagination active={2} />
            <BrandButton to="/projects" variant="secondary">Lihat Semua Projects</BrandButton>
          </div>
        </SectionShell>

        <CTASection
          eyebrow="Kolaborasi"
          title="Diskusikan kebutuhan riset, desain, atau prototyping Anda bersama Niuva."
          body="Sampaikan konteks proyek, target hasil, dan batasan yang perlu diperhatikan. Tim Niuva akan membantu menentukan langkah awal yang relevan."
          primaryAction={<BrandButton to="/contact" variant="secondary">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href={`mailto:${profileContent.contact.email}`} variant="secondary">Kirim Email</BrandButton>}
        />
      </BrandPage>
    </MarketingLayout>
  );
}

