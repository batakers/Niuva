import React from "react";
import { MarketingLayout } from "@/components/layout/Layout";
import {
  BrandButton,
  ProcessTimeline,
  RoundedVisualFrame,
  useProfileContent,
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

const backgroundPoints = [
  "Berangkat dari kebutuhan organisasi untuk menghubungkan riset dengan realisasi produk.",
  "Menggabungkan konsultasi, design engineering, teknologi, dan prototyping dalam satu alur kerja.",
  "Beroperasi dari lingkungan makerspace Bandung Techno Park untuk mendukung eksperimen dan kolaborasi teknis.",
];

export default function AboutPage() {
  const profileContent = useProfileContent();
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="About Niuva"
          title="Mitra inovasi untuk engineering dan prototyping."
          body="Niuva membantu perusahaan, institusi, dan komunitas mengambil keputusan pengembangan produk melalui riset, konsultasi ahli, design engineering, dan prototyping yang dapat diuji."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          visual={
            <RoundedVisualFrame title="Riset, desain, dan validasi dalam satu alur kerja." kicker="Profil perusahaan">
              <div className="grid gap-3 text-sm font-semibold text-text-inverse">
                <span>Mitra pengembangan produk</span>
                <span>Berbasis Bandung Techno Park</span>
                <span>Kolaborasi bisnis dan teknis</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        <MarketingSection tone="default">
          <PageContainer>
            <div className="mb-8 grid gap-6 md:mb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-12 xl:mb-12">
              <div>
                <p className="brand-eyebrow mb-5">Peran perusahaan</p>
                <h2 className="type-heading-section max-w-3xl text-text-primary">Niuva bekerja sebagai partner strategi, bukan hanya vendor eksekusi.</h2>
              </div>
              <p className="max-w-[62ch] text-base leading-8 text-text-secondary md:text-lg">
                Setiap inisiatif dimulai dari pemahaman konteks agar riset, desain, teknologi, dan prototyping menjadi rangkaian keputusan yang saling menguatkan.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {dossierItems.map((item, index) => (
                <article
                  key={`dossier-${index}`}
                  className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-6 sm:p-7"
                >
                  <p className="text-sm font-semibold text-action-primary">{item.label}</p>
                  <h3 className="brand-heading mt-5 text-2xl leading-tight text-text-primary sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-text-secondary">{item.body}</p>
                </article>
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="page">
          <PageContainer>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-16">
              <div className="brand-reveal">
                <p className="brand-eyebrow mb-5">Latar perusahaan</p>
                <h2 className="type-heading-section text-text-primary">Menghubungkan kebutuhan organisasi dengan eksperimen yang dapat diuji.</h2>
                <p className="mt-5 max-w-[58ch] text-base leading-8 text-text-secondary md:text-lg">{profileContent.intro}</p>
              </div>
              <ol className="border-y border-border-default">
                {backgroundPoints.map((point, index) => (
                  <li key={`background-point-${index}`} className="brand-reveal grid gap-3 border-b border-border-default py-5 last:border-b-0 sm:grid-cols-[3rem_1fr] sm:gap-5">
                    <span className="font-mono-tech text-sm font-semibold text-action-primary">{String(index + 1).padStart(2, "0")}</span>
                    <p className="text-base leading-7 text-text-primary">{point}</p>
                  </li>
                ))}
              </ol>
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <SectionHeader
              eyebrow="Vision and Mission"
              title="Arah strategis Niuva: inovasi yang bisa diterapkan dan memberi nilai bisnis."
              body="Visi dan misi Niuva dirancang untuk menjaga pengembangan produk tetap berpijak pada riset, konsultasi ahli, dan realisasi teknis yang masuk akal."
              align="split"
            />
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <article className="brand-reveal relative overflow-hidden rounded-panel bg-action-primary p-6 text-text-inverse shadow-surface sm:p-8 md:p-10">
                <DecorativeMotif light className="-right-24 -top-20 h-80 w-80 opacity-45" density="sparse" />
                <div className="relative z-10">
                  <p className="font-mono-tech text-xs font-bold text-text-inverse">VISION</p>
                  <h3 className="brand-heading mt-8 max-w-2xl text-3xl leading-tight text-text-inverse md:text-4xl">
                    Menjadi mitra strategis inovasi dan pengembangan produk yang terpercaya.
                  </h3>
                  <p className="mt-6 max-w-xl text-base leading-8 text-text-inverse">
                    Visi ini menempatkan Niuva sebagai rekan kerja yang membantu organisasi membangun arah inovasi secara bertahap, terukur, dan dapat dipertanggungjawabkan.
                  </p>
                </div>
              </article>
              <article className="brand-reveal rounded-panel bg-surface-default p-6 shadow-surface ring-1 ring-border-default sm:p-8 md:p-10">
                <p className="font-mono-tech text-xs font-bold text-action-primary">MISSION</p>
                <h3 className="brand-heading mt-8 max-w-2xl text-3xl leading-tight text-text-primary md:text-4xl">
                  Menghasilkan solusi kreatif berbasis riset yang dapat diterapkan.
                </h3>
                <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary">
                  Niuva menggabungkan konsultasi ahli, pengembangan teknologi, desain, prototyping, workshop, apparel, dan merchandise untuk mendukung nilai bisnis, kapasitas tim, serta inovasi berkelanjutan.
                </p>
              </article>
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              eyebrow="Operating Model"
              title="Pendekatan kerja yang menjaga keputusan pengembangan tetap terarah."
              body="Alur kerja ini menjaga proses tetap cukup terstruktur untuk kebutuhan B2B, namun tetap adaptif terhadap ruang lingkup riset, desain, prototyping, atau workshop."
              align="split"
            />
            <ProcessTimeline items={approachSteps} />
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="page">
          <PageContainer>
            <SectionHeader eyebrow="Nilai kerja" title="Prinsip yang menjaga inovasi tetap konkret." body="Nilai ini menjadi dasar saat tim menyusun masalah, memilih pendekatan, dan mengevaluasi output bersama mitra." align="split" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {values.map((value, index) => (
                <article key={`value-${index}`} className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-5">
                  <span className="font-mono-tech text-xs font-semibold text-action-primary">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-4 text-sm font-semibold leading-6 text-text-primary">{value}</p>
                </article>
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-16">
              <div>
                <p className="brand-eyebrow mb-5">Bandung Techno Park</p>
                <h2 className="type-heading-section text-text-primary">Ekosistem untuk riset, makerspace, dan kolaborasi teknis.</h2>
                <p className="mt-5 max-w-[58ch] text-base leading-8 text-text-secondary">Niuva berada di Gedung D Lt.1, Ruang Makerspace. Konteks ini mendukung eksperimen bentuk, prototyping, workshop, dan kerja lintas disiplin.</p>
                <BrandButton to="/contact" variant="secondary" className="mt-7">Hubungi Niuva</BrandButton>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {ecosystem.map((item, index) => (
                  <article key={`ecosystem-${index}`} className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-5">
                    <div className="mb-4 h-2.5 w-2.5 rounded-full bg-brand-primary" />
                    <p className="font-semibold leading-7 text-text-primary">{item}</p>
                  </article>
                ))}
              </div>
            </div>
          </PageContainer>
        </MarketingSection>

        <CTASection
          title="Bangun arah inovasi yang relevan bagi organisasi."
          body="Ceritakan tantangan, ide, atau target pengembangan. Tim Niuva akan membantu memetakan kebutuhan riset, desain, teknologi, prototyping, atau workshop yang paling relevan."
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          contactEmphasis="Respons awal akan fokus pada konteks kebutuhan, ruang lingkup, dan output yang perlu dicapai."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
