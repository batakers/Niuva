import React from "react";
import { MarketingLayout } from "../../components/Layout";
import {
  BrandButton,
  ProcessTimeline,
  RoundedVisualFrame,
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

const dossierItems = [
  {
    label: "Positioning",
    title: "Mitra strategis inovasi dan pengembangan produk",
    body: "Niuva membantu organisasi merumuskan kebutuhan, menilai peluang, lalu mengubah ide menjadi desain, prototipe, atau program yang dapat diuji.",
  },
  {
    label: "Basis kerja",
    title: "Riset mendalam dan konsultasi ahli",
    body: "Keputusan proyek dibangun dari konteks pengguna, arah teknologi, batasan bisnis, dan masukan ahli agar proses pengembangan lebih terarah.",
  },
  {
    label: "Output",
    title: "Solusi kreatif yang bisa direalisasikan",
    body: "Riset, design engineering, teknologi, workshop, apparel, dan merchandise dirangkai sebagai layanan terintegrasi sesuai kebutuhan proyek.",
  },
];

const approachSteps = [
  {
    label: "Discover",
    title: "Memahami konteks",
    body: "Menggali tujuan, pengguna, batasan teknis, peluang pasar, dan kebutuhan pemangku kepentingan.",
  },
  {
    label: "Define",
    title: "Merumuskan arah",
    body: "Menyusun prioritas pengembangan, ruang lingkup, dan bentuk output yang paling relevan.",
  },
  {
    label: "Develop",
    title: "Membangun solusi",
    body: "Mengembangkan desain, teknologi, prototipe, materi workshop, atau produk kreatif sesuai brief.",
  },
  {
    label: "Validate",
    title: "Menguji keputusan",
    body: "Mengevaluasi hasil bersama mitra sebelum masuk ke iterasi, produksi, atau implementasi lanjutan.",
  },
];

const values = [
  "Berbasis riset dan konteks nyata.",
  "Presisi dalam merumuskan masalah dan output.",
  "Kolaboratif dengan mitra, ahli, dan pemangku kepentingan.",
  "Praktis dalam menghubungkan ide dengan realisasi.",
  "Adaptif terhadap kebutuhan teknologi, produk, dan bisnis.",
];

const ecosystem = [
  "Riset dan konsultasi awal",
  "Design engineering dan prototyping",
  "Workshop praktis dan pengembangan SDM",
  "Kolaborasi di lingkungan Bandung Techno Park",
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="About Niuva"
          title="Mitra inovasi berbasis riset, engineering, dan prototyping."
          body="Niuva membantu perusahaan, institusi, dan komunitas mengambil keputusan pengembangan produk melalui riset, konsultasi ahli, design engineering, dan prototyping yang dapat diuji."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          visual={
            <RoundedVisualFrame title="Research, design, prototype, validate." kicker="Company dossier">
              <div className="grid gap-3 text-sm font-semibold text-white/82">
                <span>Riset berbasis kebutuhan</span>
                <span>Konsultasi dan workshop praktis</span>
                <span>Desain produk dan purwarupa</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        <section className="relative bg-white py-[var(--brand-section-space)]">
          <PageContainer>
            <SectionHeader
              eyebrow="Company Role"
              title="Niuva bekerja sebagai partner strategi, bukan hanya vendor eksekusi."
              body="Setiap inisiatif dimulai dari pemahaman konteks. Dengan cara ini, riset, desain, teknologi, dan prototyping tidak berjalan sebagai aktivitas terpisah, tetapi sebagai rangkaian keputusan yang saling menguatkan."
              align="split"
            />
            <div className="grid border-y border-[var(--brand-border)] lg:grid-cols-3">
              {dossierItems.map((item) => (
                <article
                  key={item.title}
                  className="brand-reveal border-b border-[var(--brand-border)] py-6 last:border-b-0 lg:border-b-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
                >
                  <p className="text-sm font-semibold text-[var(--brand-blue)]">{item.label}</p>
                  <h3 className="brand-heading mt-5 text-2xl leading-tight text-[var(--brand-ink)] sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[var(--brand-muted)]">{item.body}</p>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>

        <section className="bg-[var(--brand-blue-bg)] py-[var(--brand-section-space)]">
          <PageContainer>
            <SectionHeader
              eyebrow="Vision and Mission"
              title="Arah strategis Niuva: inovasi yang bisa diterapkan dan memberi nilai bisnis."
              body="Visi dan misi Niuva dirancang untuk menjaga pengembangan produk tetap berpijak pada riset, konsultasi ahli, dan realisasi teknis yang masuk akal."
              align="split"
            />
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <article className="brand-reveal relative overflow-hidden rounded-[var(--brand-radius-panel)] bg-[var(--brand-blue)] p-6 text-white shadow-[var(--brand-shadow-card)] sm:p-8 md:p-10">
                <DecorativeMotif light className="-right-24 -top-20 h-80 w-80 opacity-45" density="sparse" />
                <div className="relative z-10">
                  <p className="font-mono-tech text-xs font-bold text-white/70">VISION</p>
                  <h3 className="brand-heading mt-8 max-w-2xl text-3xl leading-tight text-white md:text-4xl">
                    Menjadi mitra strategis inovasi dan pengembangan produk yang terpercaya.
                  </h3>
                  <p className="mt-6 max-w-xl text-base leading-8 text-white/82">
                    Visi ini menempatkan Niuva sebagai rekan kerja yang membantu organisasi membangun arah inovasi secara bertahap, terukur, dan dapat dipertanggungjawabkan.
                  </p>
                </div>
              </article>
              <article className="brand-reveal rounded-[var(--brand-radius-panel)] bg-white p-6 shadow-[var(--brand-shadow-card)] ring-1 ring-[rgba(102,146,188,0.14)] sm:p-8 md:p-10">
                <p className="font-mono-tech text-xs font-bold text-[var(--brand-blue)]">MISSION</p>
                <h3 className="brand-heading mt-8 max-w-2xl text-3xl leading-tight text-[var(--brand-ink)] md:text-4xl">
                  Menghasilkan solusi kreatif berbasis riset yang dapat diterapkan.
                </h3>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--brand-muted)]">
                  Niuva menggabungkan konsultasi ahli, pengembangan teknologi, desain, prototyping, workshop, apparel, dan merchandise untuk mendukung nilai bisnis, kapasitas tim, serta inovasi berkelanjutan.
                </p>
              </article>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-[var(--brand-section-space)]">
          <PageContainer>
            <SectionHeader
              eyebrow="Operating Model"
              title="Pendekatan kerja yang menjaga keputusan pengembangan tetap terarah."
              body="Alur kerja ini menjaga proses tetap cukup terstruktur untuk kebutuhan B2B, namun tetap adaptif terhadap ruang lingkup riset, desain, prototyping, atau workshop."
              align="split"
            />
            <ProcessTimeline items={approachSteps} />
          </PageContainer>
        </section>

        <section className="bg-[var(--brand-offwhite)] py-[var(--brand-section-space)]">
          <PageContainer>
            <div className="grid gap-8 min-[1100px]:grid-cols-[0.85fr_1.15fr] min-[1100px]:items-start">
              <div>
                <SectionHeader
                  eyebrow="Values and Ecosystem"
                  title="Nilai kerja yang menahan inovasi agar tetap konkret."
                  body="Niuva berada di lingkungan Bandung Techno Park, Gedung D Lt.1, Ruang Makerspace. Konteks ini mendukung riset, eksperimen bentuk, prototyping, workshop, dan kolaborasi lintas disiplin."
                  className="mb-0"
                />
                <BrandButton to="/contact" className="mt-8">Diskusikan Kolaborasi</BrandButton>
              </div>
              <div className="grid gap-5">
                <article className="brand-reveal border-y border-[var(--brand-border)] bg-white py-6 sm:px-2 sm:py-7">
                  <p className="font-mono-tech text-xs font-bold text-[var(--brand-blue)]">WORK VALUES</p>
                  <ul className="mt-7 grid gap-4">
                    {values.map((value) => (
                      <li key={value} className="flex gap-4">
                        <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand-blue)]" />
                        <p className="text-base leading-7 text-[var(--brand-ink)]">{value}</p>
                      </li>
                    ))}
                  </ul>
                </article>
                <div className="grid border-y border-[var(--brand-border)] sm:grid-cols-2">
                  {ecosystem.map((item) => (
                    <article key={item} className="brand-reveal border-b border-[var(--brand-border)] py-5 sm:px-5 sm:odd:border-r">
                      <div className="mb-4 h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
                      <p className="font-semibold leading-7 text-[var(--brand-ink)]">{item}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        <CTASection
          title="Bangun arah inovasi yang relevan bagi organisasi."
          body="Ceritakan tantangan, ide, atau target pengembangan. Tim Niuva akan membantu memetakan kebutuhan riset, desain, teknologi, prototyping, atau workshop yang paling relevan."
          primaryAction={<BrandButton to="/contact" variant="inverse">Mulai Konsultasi</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          contactEmphasis="Respons awal akan fokus pada konteks kebutuhan, ruang lingkup, dan output yang perlu dicapai."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
