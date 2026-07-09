import React from "react";
import { MarketingLayout } from "../../components/Layout";
import {
  BrandButton,
  GoalItem,
  RoundedVisualFrame,
  SectionShell,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import { BrandPage, CTASection, PageHero } from "../../components/brand/BrandSystem";

const principles = [
  {
    title: "Riset sebagai fondasi",
    body: "Arah pengembangan dimulai dari pemahaman kebutuhan, konteks pengguna, peluang pasar, dan kesiapan teknologi agar keputusan tidak hanya berbasis asumsi.",
  },
  {
    title: "Konsultasi yang relevan",
    body: "Keputusan proyek dibangun bersama tenaga ahli agar strategi, desain, dan implementasi tetap realistis terhadap sumber daya dan tujuan organisasi.",
  },
  {
    title: "Solusi kreatif terintegrasi",
    body: "Riset, teknologi, desain, prototyping, dan eksekusi kreatif dikelola sebagai proses yang saling terhubung dari brief sampai evaluasi.",
  },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Tentang Niuva"
          title="Mitra strategis untuk riset berbasis inovasi dan pengembangan produk."
          body={profileContent.intro + " Niuva membantu organisasi membangun solusi nyata yang inovatif dan adaptif melalui riset, konsultasi ahli, desain, teknologi, dan prototyping."}
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          visual={
            <RoundedVisualFrame title="Riset, konsultasi, kreasi, validasi." kicker="Pendekatan Niuva">
              <p className="max-w-sm text-base leading-7 text-white/80">
                Dari pertanyaan awal hingga produk yang dapat diuji, setiap tahap memberi dasar keputusan yang lebih jelas.
              </p>
            </RoundedVisualFrame>
          }
        />

        <SectionShell
          eyebrow="Peran Niuva"
          title="Mitra berpikir untuk merumuskan arah, mengurangi risiko, dan membangun solusi."
          body="Niuva bekerja bersama bisnis, institusi, dan komunitas untuk memahami tantangan, menentukan prioritas, lalu mengembangkan ide menjadi produk, prototipe, atau program praktis yang dapat dievaluasi dan memberi nilai tambah."
          className="bg-white"
        >
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
            <article className="brand-reveal relative overflow-hidden rounded-[var(--brand-radius-outer)] bg-[var(--brand-blue)] p-6 text-white sm:p-8 md:p-10">
              <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10" />
              <div className="relative z-10">
                <p className="text-sm font-semibold text-white/70">Strategic partner</p>
                <h3 className="brand-heading mt-4 text-3xl leading-tight text-white md:text-4xl">
                  Fokus pada keputusan yang bisa diuji, bukan sekadar ide yang terlihat menarik.
                </h3>
                <p className="mt-6 text-base leading-8 text-white/80">
                  Pendekatan Niuva menggabungkan pemahaman bisnis, riset mendalam, konsultasi ahli, dan kemampuan teknis agar pengembangan produk memiliki arah yang jelas sejak awal.
                </p>
              </div>
            </article>
            <div className="grid gap-4">
              {principles.map((item, index) => (
                <article key={item.title} className="brand-reveal flex gap-5 rounded-[var(--brand-radius-outer)] bg-[var(--brand-offwhite)] p-5 sm:p-6 md:p-7">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="brand-heading text-2xl leading-tight text-[var(--brand-ink)]">{item.title}</h3>
                    <p className="mt-3 text-base leading-8 text-[var(--brand-muted)]">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {profileContent.profileFocus.map((item) => (
              <article key={item} className="brand-reveal rounded-[var(--brand-radius-card)] bg-[var(--brand-blue-bg)] p-5 shadow-[var(--brand-shadow-card)] sm:p-6">
                <div className="mb-5 h-3 w-3 rounded-full bg-[var(--brand-blue)]" />
                <p className="text-base font-semibold leading-7 text-[var(--brand-ink)]">{item}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Visi & Misi"
          title="Pertumbuhan bisnis yang ditopang inovasi berkelanjutan."
          className="bg-[var(--brand-blue-bg)]"
        >
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="brand-reveal rounded-[var(--brand-radius-outer)] bg-[var(--brand-blue)] p-6 text-white sm:p-8 md:p-10">
              <div className="mb-8 h-14 w-14 rounded-full bg-white/20 sm:mb-12 sm:h-16 sm:w-16" />
              <p className="text-sm font-semibold text-white/70">Visi</p>
              <h3 className="brand-heading mt-4 text-3xl leading-tight text-white md:text-4xl">
                Menjadi mitra strategis inovasi dan pengembangan produk yang terpercaya.
              </h3>
              <p className="mt-6 text-base leading-8 text-white/78">
                Visi ini menempatkan Niuva sebagai rekan yang membantu organisasi membangun arah inovasi secara bertahap dan terukur.
              </p>
            </article>
            <article className="brand-reveal rounded-[var(--brand-radius-outer)] bg-white p-6 shadow-[var(--brand-shadow-card)] sm:p-8 md:p-10">
              <p className="text-sm font-semibold text-[var(--brand-blue)]">Misi</p>
              <h3 className="brand-heading mt-4 text-3xl leading-tight text-[var(--brand-ink)] md:text-4xl">
                Menghasilkan solusi kreatif berbasis riset yang dapat diterapkan.
              </h3>
              <p className="mt-6 max-w-2xl leading-8 text-[var(--brand-muted)]">
                Niuva menggabungkan konsultasi ahli, pengembangan teknologi, desain, prototyping, dan pembelajaran praktis untuk mendukung nilai bisnis, kapasitas tim, dan keberlanjutan inovasi.
              </p>
            </article>
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Tujuan"
          title="Lima fokus untuk menjaga inovasi tetap bernilai."
          className="bg-white"
        >
          <ul className="grid gap-4 md:grid-cols-2">
            {profileContent.goals.map((goal, index) => (
              <GoalItem key={goal} index={index}>{goal}</GoalItem>
            ))}
          </ul>
        </SectionShell>

        <SectionShell
          eyebrow="Ekosistem"
          title="Berbasis di Bandung Techno Park untuk mendukung kolaborasi inovasi dan pengembangan SDM."
          body="Lokasi Niuva di Bandung Techno Park - Gedung D Lt.1, Ruang Makerspace menempatkan kegiatan riset, prototyping, workshop, dan kolaborasi kreatif dalam lingkungan yang dekat dengan teknologi, pendidikan, dan komunitas maker."
          className="bg-[var(--brand-blue-bg)]"
        >
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <RoundedVisualFrame title="Makerspace sebagai ruang realisasi" kicker="Bandung Techno Park">
              <p className="max-w-sm text-base leading-7 text-white/80">
                Ekosistem ini membantu proses dari konsultasi awal, pengembangan konsep, eksperimen bentuk, sampai workshop praktis.
              </p>
            </RoundedVisualFrame>
            <div className="brand-reveal grid gap-4 sm:grid-cols-2">
              {["Riset dan konsultasi", "Design engineering", "Prototyping dan testing", "Workshop dan pengembangan SDM"].map((item) => (
                <div key={item} className="rounded-[var(--brand-radius-card)] bg-white p-6 shadow-[var(--brand-shadow-card)]">
                  <div className="mb-6 h-3 w-3 rounded-full bg-[var(--brand-blue)]" />
                  <p className="font-semibold leading-7 text-[var(--brand-ink)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>
        <CTASection
          title="Bangun arah inovasi yang sesuai dengan kebutuhan organisasi."
          body="Ceritakan tantangan, ide, atau target pengembangan. Tim Niuva akan membantu memetakan kebutuhan riset, desain, teknologi, atau prototyping yang relevan."
          primaryAction={<BrandButton to="/contact" variant="secondary">Mulai Konsultasi</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
        />
      </BrandPage>
    </MarketingLayout>
  );
}


