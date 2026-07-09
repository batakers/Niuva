import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MarketingLayout } from "../components/Layout";
import {
  BrandButton,
  DotPagination,
  GoalItem,
  ProjectCard,
  RoundedVisualFrame,
  SectionShell,
  ServiceCard,
  ULineMotif,
  profileContent,
} from "../components/brand/CompanyProfileBlocks";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const visionMission = [
  {
    title: "Visi",
    body: "Menjadi mitra strategis inovasi dan pengembangan produk yang membantu perusahaan, institusi, dan komunitas mewujudkan solusi kreatif berkelanjutan.",
  },
  {
    title: "Misi",
    body: "Menggabungkan riset, konsultasi ahli, teknologi, desain kreatif, prototyping, dan pelatihan praktis untuk menghasilkan nilai bisnis yang nyata.",
  },
];

export default function Home() {
  const pageRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray(".brand-reveal").forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              once: true,
            },
          }
        );
      });
    },
    { scope: pageRef }
  );

  return (
    <MarketingLayout>
      <main ref={pageRef} className="w-full overflow-x-hidden bg-[var(--brand-offwhite)] text-[var(--brand-ink)]">
        <section className="relative overflow-hidden pt-12 md:pt-16">
          <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-[rgba(144,175,205,0.26)]" />
          <div className="absolute left-4 top-48 h-24 w-24 rounded-full bg-[rgba(102,146,188,0.22)] md:left-16" />
          <ULineMotif className="absolute -bottom-24 -left-20 h-80 w-80 opacity-65" />

          <div className="mx-auto grid min-h-[calc(100dvh-7rem)] w-full max-w-[1180px] items-center gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
            <div className="brand-reveal relative z-10">
              <p className="brand-eyebrow mb-6">PT Niuva Inovasi Utama</p>
              <h1 className="brand-heading max-w-5xl text-[clamp(3rem,6vw,5.75rem)] leading-[0.98] text-[var(--brand-ink)]">
                Mitra strategis untuk inovasi, riset, desain, dan prototyping.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--brand-muted)] md:text-xl">
                Niuva membantu ide berkembang menjadi solusi kreatif, produk nyata, dan pengalaman yang dapat diuji melalui riset mendalam, konsultasi ahli, pengembangan teknologi, dan eksekusi desain yang terarah.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <BrandButton to="/contact">Konsultasi Proyek</BrandButton>
                <BrandButton href="#layanan" variant="secondary">Lihat Layanan</BrandButton>
              </div>
            </div>

            <div className="brand-reveal relative z-10">
              <RoundedVisualFrame title="Integrated creative solutions" kicker="Research · Design · Technology">
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Deep research", "Expert consultation", "Technology development", "Creative execution"].map((item) => (
                    <div key={item} className="rounded-3xl bg-white/16 px-4 py-4 text-sm font-semibold text-white">
                      {item}
                    </div>
                  ))}
                </div>
              </RoundedVisualFrame>
              <DotPagination active={1} className="mt-7 justify-center" />
            </div>
          </div>
        </section>

        <SectionShell
          id="tentang"
          eyebrow="Tentang Niuva"
          title="Partner inovasi dan pengembangan produk yang bekerja dari riset sampai realisasi."
          body="Niuva Inovasi Utama hadir sebagai strategic partner untuk membantu bisnis, institusi, dan komunitas mengembangkan solusi kreatif berbasis riset. Fokusnya bukan sekadar membuat output visual, tetapi membangun arah produk, konsultasi, prototipe, dan program yang mendukung pertumbuhan bisnis berkelanjutan."
          className="bg-white"
        >
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="brand-reveal rounded-[2rem] bg-[var(--brand-blue-bg)] p-8 md:p-10">
              <p className="text-sm font-semibold text-[var(--brand-blue)]">Cara kerja</p>
              <h3 className="brand-heading mt-4 text-4xl leading-tight text-[var(--brand-ink)]">
                Riset memberi arah. Desain memberi bentuk. Prototipe memberi bukti.
              </h3>
            </div>
            <div className="brand-reveal relative overflow-hidden rounded-[2rem] bg-[var(--brand-blue)] p-8 text-white md:p-10">
              <ULineMotif light className="absolute -right-16 -top-16 h-72 w-72 opacity-30" />
              <div className="relative z-10 grid gap-6 sm:grid-cols-3">
                {["Research", "Consultation", "Product realization"].map((item, index) => (
                  <div key={item} className="rounded-[1.4rem] bg-white/14 p-5">
                    <p className="text-3xl font-extrabold">{String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-8 text-sm font-semibold text-white/82">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        <SectionShell id="visi-misi" eyebrow="Visi & Misi" title="Arah besar yang sederhana, jelas, dan bisa dieksekusi." className="bg-[var(--brand-blue-bg)]">
          <div className="grid gap-6 md:grid-cols-2">
            {visionMission.map((item) => (
              <article key={item.title} className="brand-reveal rounded-[2rem] bg-white p-8 shadow-[0_18px_60px_rgba(36,50,65,0.07)] md:p-10">
                <div className="mb-10 h-16 w-16 rounded-full bg-[var(--brand-blue)]" />
                <h3 className="brand-heading text-4xl text-[var(--brand-ink)]">{item.title}</h3>
                <p className="mt-5 max-w-xl leading-8 text-[var(--brand-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="tujuan"
          eyebrow="Tujuan"
          title="Membantu organisasi mengubah potensi inovasi menjadi nilai yang terasa."
          className="bg-white"
        >
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <RoundedVisualFrame title="Sustainable innovation ecosystem" kicker="Goals">
              <p className="max-w-sm text-base leading-7 text-white/78">
                Pendekatan Niuva menghubungkan kebutuhan bisnis, pengembangan sumber daya manusia, dan realisasi produk melalui proses yang terukur.
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
          id="layanan"
          eyebrow="Services"
          title="Empat area layanan yang saling melengkapi dalam satu ekosistem inovasi."
          body="Struktur layanan mengikuti company profile Niuva: riset, konsultasi dan workshop, desain dan prototyping, serta kebutuhan apparel dan merchandise."
          className="bg-[var(--brand-blue-bg)]"
        >
          <div className="grid-flow-dense grid gap-5 lg:grid-cols-12 lg:auto-rows-[250px]">
            {profileContent.services.map((service, index) => (
              <ServiceCard key={service.title} service={service} index={index} featured={index === 0} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="projects"
          eyebrow="Projects"
          title="Contoh pekerjaan yang menunjukkan jangkauan riset, teknologi, dan desain fisik."
          className="bg-white"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {profileContent.projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
        </SectionShell>

        <SectionShell id="kontak" className="bg-[var(--brand-blue)] text-white">
          <div className="relative overflow-hidden rounded-[2.4rem] bg-white p-2">
            <div className="relative overflow-hidden rounded-[1.9rem] bg-[var(--brand-blue)] p-8 md:p-12">
              <ULineMotif light className="absolute -right-24 -top-20 h-96 w-96 opacity-25" />
              <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                  <p className="brand-eyebrow mb-6 bg-white/18 text-white">Contact</p>
                  <h2 className="brand-heading max-w-4xl text-[clamp(2.7rem,5vw,5.4rem)] leading-none text-white">
                    Diskusikan ide, produk, atau kolaborasi berikutnya.
                  </h2>
                  <p className="mt-7 max-w-2xl text-lg leading-8 text-white/76">
                    Untuk project discussion, konsultasi, workshop, atau kebutuhan prototyping, hubungi tim Niuva melalui email atau WhatsApp.
                  </p>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <BrandButton to="/contact" variant="secondary">Konsultasi Proyek</BrandButton>
                    <BrandButton href={`mailto:${profileContent.contact.email}`} variant="secondary">Kirim Email</BrandButton>
                  </div>
                </div>
                <div className="rounded-[1.6rem] bg-white/14 p-6">
                  <div className="space-y-6 text-white">
                    <div>
                      <p className="text-sm font-semibold text-white/58">Location</p>
                      <p className="mt-2 text-lg font-semibold">{profileContent.contact.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/58">Email</p>
                      <a href={`mailto:${profileContent.contact.email}`} className="mt-2 block text-lg font-semibold hover:underline">
                        {profileContent.contact.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/58">Phone / WhatsApp</p>
                      <a href={`tel:${profileContent.contact.phone.replaceAll(" ", "")}`} className="mt-2 block text-lg font-semibold hover:underline">
                        {profileContent.contact.whatsapp}
                      </a>
                    </div>
                  </div>
                  <DotPagination active={3} className="mt-10" />
                </div>
              </div>
            </div>
          </div>
        </SectionShell>
      </main>
    </MarketingLayout>
  );
}
