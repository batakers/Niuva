import React, { useMemo } from "react";
import { MarketingLayout } from "@/components/layout/Layout";
import {
  BrandButton,
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
import { findBySlug, usePublicContent } from "../../lib/content";
import { usePublicSettings } from "../../lib/publicSettings";

const fallbackDossierItems = [
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

const fallbackApproachSteps = [
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

const fallbackValues = [
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
  const { contact } = usePublicSettings();
  const { blocks: cmsBlocks } = usePublicContent("about");
  const cmsFields = useMemo(() => findBySlug(cmsBlocks, "company-profile"), [cmsBlocks]);
  const dossierItems = cmsFields?.dossierItems || fallbackDossierItems;
  const approachSteps = cmsFields?.approachSteps || fallbackApproachSteps;
  const values = cmsFields?.values || fallbackValues;
  const intro = cmsFields?.intro || profileContent.intro;

  return (
    <MarketingLayout>
      <BrandPage>
        {/* Single column. The old right-hand panel was a blue box holding three
            short strings, which read as filler next to the headline. */}
        <PageHero
          eyebrow="About Niuva"
          title="Mitra inovasi untuk engineering dan prototyping."
          body="Niuva membantu perusahaan, institusi, dan komunitas mengambil keputusan pengembangan produk melalui riset, konsultasi ahli, design engineering, dan prototyping yang dapat diuji."
          variant="stack"
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
        />

        <MarketingSection tone="default">
          <PageContainer>
            <div className="mb-10 max-w-3xl xl:mb-12">
              <h2 className="type-heading-section text-text-primary">Niuva bekerja sebagai partner strategi, bukan hanya vendor eksekusi.</h2>
              <p className="type-body mt-5 max-w-[62ch] text-text-secondary md:text-lg md:leading-8">
                Setiap inisiatif dimulai dari pemahaman konteks agar riset, desain, teknologi, dan prototyping menjadi rangkaian keputusan yang saling menguatkan.
              </p>
            </div>
            {/* Three equal columns was the most generic shape available. The
                first item now leads at double width and the pair stacks beside
                it. */}
            <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[1.55fr_1fr]">
              {dossierItems.map((item, index) => (
                <article
                  key={item.title}
                  className={
                    index === 0
                      ? "brand-reveal rounded-card bg-surface-muted p-6 sm:p-8 lg:row-span-2"
                      : "brand-reveal border-t border-border-default pt-5"
                  }
                >
                  <p className="type-label text-text-secondary">{item.label}</p>
                  <h3
                    className={
                      index === 0
                        ? "brand-heading mt-4 max-w-[24ch] text-3xl leading-tight text-text-primary sm:text-4xl"
                        : "brand-heading mt-3 text-2xl leading-tight text-text-primary"
                    }
                  >
                    {item.title}
                  </h3>
                  <p className="type-body-small mt-3 max-w-[52ch] text-text-secondary">{item.body}</p>
                </article>
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="page">
          <PageContainer>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-16">
              <div className="brand-reveal">
                <h2 className="type-heading-section text-text-primary">Menghubungkan kebutuhan organisasi dengan eksperimen yang dapat diuji.</h2>
                <p className="mt-5 max-w-[58ch] text-base leading-8 text-text-secondary md:text-lg">{intro}</p>
              </div>
              <ol className="border-y border-border-default">
                {backgroundPoints.map((point, index) => (
                  <li key={point} className="brand-reveal grid gap-3 border-b border-border-default py-5 last:border-b-0 sm:grid-cols-[3rem_1fr] sm:gap-5">
                    <span className="font-heading text-sm font-semibold text-text-secondary">{String(index + 1).padStart(2, "0")}</span>
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
              align="stacked"
            />
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <article className="brand-reveal relative overflow-hidden rounded-panel bg-action-primary p-6 text-text-inverse shadow-surface sm:p-8 md:p-10">
                <div className="relative z-10">
                  <p className="type-label text-text-inverse">Visi</p>
                  <h3 className="brand-heading mt-6 max-w-2xl text-3xl leading-tight text-text-inverse md:text-4xl">
                    Menjadi mitra strategis inovasi dan pengembangan produk yang terpercaya.
                  </h3>
                  <p className="mt-6 max-w-[46ch] text-base leading-8 text-text-inverse">
                    Visi ini menempatkan Niuva sebagai rekan kerja yang membantu organisasi membangun arah inovasi secara bertahap, terukur, dan dapat dipertanggungjawabkan.
                  </p>
                </div>
              </article>
              <article className="brand-reveal rounded-panel bg-surface-default p-6 shadow-surface ring-1 ring-border-default sm:p-8 md:p-10">
                <p className="type-label text-text-secondary">Misi</p>
                <h3 className="brand-heading mt-6 max-w-2xl text-3xl leading-tight text-text-primary md:text-4xl">
                  Menghasilkan solusi kreatif berbasis riset yang dapat diterapkan.
                </h3>
                <p className="mt-6 max-w-[54ch] text-base leading-8 text-text-secondary">
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
              align="stacked"
            />
            <ProcessTimeline items={approachSteps} />
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="page">
          <PageContainer>
            <SectionHeader title="Prinsip yang menjaga inovasi tetap konkret." body="Nilai ini menjadi dasar saat tim menyusun masalah, memilih pendekatan, dan mengevaluasi output bersama mitra." align="stacked" />
            {/* Five short principles do not need five boxes and five counters.
                A divided list reads faster and drops the numbering tell. */}
            <ul className="grid gap-x-10 border-t border-border-default sm:grid-cols-2 xl:grid-cols-3">
              {values.map((value) => (
                <li key={value} className="brand-reveal border-b border-border-default py-5">
                  <p className="max-w-[38ch] font-semibold leading-7 text-text-primary">{value}</p>
                </li>
              ))}
            </ul>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-16">
              <div>
                <h2 className="type-heading-section text-text-primary">Ekosistem untuk riset, makerspace, dan kolaborasi teknis.</h2>
                <p className="mt-5 max-w-[58ch] text-base leading-8 text-text-secondary">Niuva berada di Gedung D Lt.1, Ruang Makerspace. Konteks ini mendukung eksperimen bentuk, prototyping, workshop, dan kerja lintas disiplin.</p>
                <BrandButton to="/contact" variant="secondary" className="mt-7">Hubungi Niuva</BrandButton>
              </div>
              <ul className="grid border-t border-border-default sm:grid-cols-2 sm:gap-x-10">
                {ecosystem.map((item) => (
                  <li key={item} className="brand-reveal border-b border-border-default py-5">
                    <p className="max-w-[34ch] font-semibold leading-7 text-text-primary">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </PageContainer>
        </MarketingSection>

        <CTASection
          eyebrow={null}
          title="Bangun arah inovasi yang relevan bagi organisasi."
          body="Ceritakan tantangan, ide, atau target pengembangan. Tim Niuva akan membantu memetakan kebutuhan riset, desain, teknologi, prototyping, atau workshop yang paling relevan."
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          contactEmphasis="Respons awal akan fokus pada konteks kebutuhan, ruang lingkup, dan output yang perlu dicapai."
          whatsappHref={contact.whatsappHref}
          email={contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
