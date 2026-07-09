import React from "react";
import { MarketingLayout } from "../../components/Layout";
import {
  BrandButton,
  RoundedVisualFrame,
  SectionShell,
  ServiceGrid,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import { BrandPage, CTASection, PageHero } from "../../components/brand/BrandSystem";

const process = [
  { title: "Memahami konteks", body: "Menyelaraskan kebutuhan bisnis, target pengguna, ruang lingkup, batasan, dan ukuran keberhasilan proyek." },
  { title: "Menentukan prioritas", body: "Mengolah riset dan konsultasi menjadi arah pengembangan yang realistis untuk dijalankan oleh tim." },
  { title: "Membangun hasil", body: "Mengembangkan desain, teknologi, prototipe, materi, atau program sesuai ruang lingkup yang disepakati." },
  { title: "Menguji hasil", body: "Mengevaluasi hasil bersama pemangku kepentingan sebelum keputusan implementasi atau iterasi berikutnya." },
];

export default function ServicesPage() {
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Capabilities"
          title="Kapabilitas terintegrasi untuk riset, design engineering, prototyping, dan eksekusi kreatif."
          body="Niuva membantu organisasi memahami kebutuhan, menentukan arah pengembangan, membangun hasil yang dapat diuji, dan menyiapkan eksekusi kreatif sesuai ruang lingkup proyek."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          visual={
            <RoundedVisualFrame title="Dari temuan ke hasil yang dapat diuji" kicker="Capabilities Niuva">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {profileContent.services.map((service, index) => (
                  <div key={service.title} className="rounded-[1rem] bg-white/15 p-3 sm:rounded-[1.25rem] sm:p-4">
                    <p className="text-xl font-extrabold sm:text-2xl">{String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-4 text-xs font-semibold text-white/80 sm:mt-5 sm:text-sm">{service.accent}</p>
                  </div>
                ))}
              </div>
            </RoundedVisualFrame>
          }
        />

        <SectionShell
          eyebrow="Kapabilitas Utama"
          title="R&D dan Design & Prototyping menjadi fondasi pengembangan produk."
          body="Kedua kapabilitas utama ini membantu organisasi mengambil keputusan lebih awal, memvalidasi ide, dan mengubah konsep menjadi rancangan atau purwarupa yang dapat diuji."
          className="bg-[var(--brand-blue-bg)]"
        >
          <ServiceGrid />
        </SectionShell>

        <SectionShell
          eyebrow="Proses Kolaborasi"
          title="Alur kerja yang terstruktur, tetap adaptif terhadap kebutuhan proyek."
          body="Niuva dapat masuk sejak tahap riset awal maupun saat organisasi sudah memiliki brief, konsep, atau kebutuhan produksi yang perlu divalidasi."
          className="bg-white"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {process.map((item, index) => (
              <article key={item.title} className="brand-reveal flex gap-4 rounded-[var(--brand-radius-card)] bg-[var(--brand-offwhite)] p-5 sm:gap-6 sm:p-6 md:p-8">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="brand-heading text-xl text-[var(--brand-ink)] sm:text-2xl">{item.title}</h3>
                  <p className="mt-3 leading-7 text-[var(--brand-muted)]">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>

        <CTASection
          title="Tentukan titik mulai yang paling relevan untuk proyek Anda."
          body="Tim Niuva dapat membantu sejak riset awal, konsultasi keputusan, pengembangan desain dan prototipe, sampai kebutuhan kreatif yang sudah siap dieksekusi."
          primaryAction={<BrandButton to="/contact" variant="secondary">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href={`mailto:${profileContent.contact.email}`} variant="secondary">Kirim Brief</BrandButton>}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
