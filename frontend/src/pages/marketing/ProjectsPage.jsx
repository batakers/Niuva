import React, { useEffect, useState } from "react";
import { MarketingLayout } from "../../components/Layout";
import {
  BrandButton,
  ProjectGrid,
  RoundedVisualFrame,
  SectionShell,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import { BrandPage, CTASection, PageHero } from "../../components/brand/BrandSystem";

function DetailBlock({ label, value, tone = "soft" }) {
  if (!value) return null;
  return (
    <div className={`rounded-[1rem] p-4 ${tone === "blue" ? "bg-[var(--brand-blue-bg)]" : "bg-[var(--brand-offwhite)]"}`}>
      <p className="text-xs font-bold text-[var(--brand-blue)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--brand-ink)]">{value}</p>
    </div>
  );
}

export default function ProjectsPage() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [active]);

  const projects = profileContent.projects;

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Projects"
          title="Pratinjau studi kasus untuk produk, mobilitas, dan simulator interaktif."
          body="Projects Niuva menunjukkan bagaimana riset, desain, engineering, dan prototyping digunakan untuk menjawab kebutuhan pengembangan produk dan pengalaman fisik."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          visual={
            <RoundedVisualFrame title="Karya pengembangan terpilih" kicker="Mobilitas, simulator, produk">
              <p className="max-w-sm text-base leading-7 text-white/80">
                Ruang kerja Niuva mencakup pengembangan kendaraan, simulator interaktif, desain produk, dan prototipe untuk kolaborasi industri.
              </p>
            </RoundedVisualFrame>
          }
        />

        <SectionShell
          eyebrow="Project Terpilih"
          title="Empat proyek dengan tantangan, solusi, output, dan kapabilitas berbeda."
          body="Setiap kartu menampilkan konteks pekerjaan dan kapabilitas yang dibuktikan. Dokumentasi visual resmi digunakan saat tersedia; jika belum tersedia, kartu memakai motif company profile agar tetap sesuai identitas Niuva."
          className="bg-white"
        >
          <ProjectGrid projects={projects} onSelect={setActive} />
        </SectionShell>

        <CTASection
          title="Punya kebutuhan produk atau pengalaman yang perlu dikembangkan?"
          body="Mulai dari konteks masalah, target pengguna, dan hasil yang dibutuhkan. Tim Niuva dapat membantu memetakan riset, desain, teknologi, dan prototyping."
          primaryAction={<BrandButton to="/contact" variant="secondary">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
        />

        {active && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-[rgba(36,50,65,0.78)] p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActive(null);
            }}
          >
            <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[1.65rem] bg-[var(--brand-blue-bg)] p-2 shadow-[0_28px_90px_rgba(36,50,65,0.28)] sm:rounded-[var(--brand-radius-outer)] md:max-h-[90dvh]">
              <div className="grid overflow-hidden rounded-[1.25rem] bg-white sm:rounded-[var(--brand-radius-inner)] lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[220px] bg-[var(--brand-blue-bg)] sm:min-h-[280px] lg:min-h-[300px]">
                  {active.image ? (
                    <img src={active.image} alt={`Dokumentasi ${active.title}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full min-h-[220px] place-items-center p-8 sm:min-h-[280px] sm:p-10 lg:min-h-[360px]">
                      <div className="h-28 w-28 rounded-b-full border-[14px] border-t-0 border-[var(--brand-blue)] opacity-70 sm:h-40 sm:w-40 sm:border-[18px]" />
                    </div>
                  )}
                </div>
                <div className="relative p-6 sm:p-8 md:p-10">
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-blue-bg)] text-xl text-[var(--brand-ink)] transition-transform duration-300 ease-snap hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
                    aria-label="Tutup detail proyek"
                    title="Tutup"
                  >
                    ×
                  </button>
                  <p className="pr-12 text-sm font-semibold text-[var(--brand-blue)]">{active.category}</p>
                  <h2 id="project-dialog-title" className="brand-heading mt-5 pr-10 text-3xl leading-tight text-[var(--brand-ink)] md:text-4xl">
                    {active.title}
                  </h2>
                  {active.client && <p className="mt-4 text-sm font-semibold text-[var(--brand-muted)]">{active.client}</p>}
                  <p className="mt-7 leading-8 text-[var(--brand-muted)]">{active.body}</p>
                  <div className="mt-7 grid gap-3">
                    <DetailBlock label="Tantangan" value={active.challenge} />
                    <DetailBlock label="Solusi" value={active.solution} />
                    <DetailBlock label="Output" value={active.output} />
                    <DetailBlock label="Kapabilitas" value={active.capability} tone="blue" />
                  </div>
                  <BrandButton to="/contact" className="mt-10">{active.cta || "Diskusikan Project Serupa"}</BrandButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </BrandPage>
    </MarketingLayout>
  );
}
