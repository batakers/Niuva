import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const profileContent = {
  intro: "Niuva Inovasi Utama hadir sebagai mitra strategis dalam bidang inovasi dan pengembangan produk, berfokus pada solusi kreatif terintegrasi berbasis ekosistem Bandung Techno Park.",
  profileFocus: [
    "Menciptakan nilai tambah dan keunggulan kompetitif bagi mitra.",
    "Menggunakan pendekatan riset mendalam dan konsultasi ahli.",
    "Mendorong kolaborasi riset-desain yang sistematis.",
    "Menghubungkan pengembangan teknologi, desain kreatif, dan penguatan kapasitas sumber daya manusia.",
  ],
  contact: {
    location: "Bandung Techno Park - Gedung D Lt.1, Ruang Makerspace",
    email: "niuvamakerspace@gmail.com",
    whatsapp: "0851-1767-8901",
    whatsappHref: "https://wa.me/6285117678901",
    mapsEmbed: "https://www.google.com/maps?q=Bandung%20Techno%20Park%20Gedung%20D%20Lt.1%20Ruang%20Makerspace&output=embed",
  },
  services: [
    {
      title: "Research & Development",
      body: "Riset untuk memetakan kebutuhan, peluang pasar, arah teknologi, dan kelayakan konsep sebelum masuk ke tahap pengembangan.",
      accent: "Riset",
      priority: "primary",
      role: "Mengubah pertanyaan awal menjadi dasar keputusan yang dapat ditelusuri.",
      output: "Peta kebutuhan, validasi konsep, rekomendasi pengembangan.",
      problem: "Mengurangi risiko proyek yang dimulai tanpa bukti kebutuhan dan arah teknologi.",
      targetUsers: "Perusahaan, instansi, tim inovasi, kampus, dan lembaga riset.",
      needs: "Validasi ide, kajian kebutuhan, riset produk, dan keputusan awal pengembangan.",
      cta: "Diskusikan Kebutuhan R&D",
      outcomes: ["Pemetaan kebutuhan", "Validasi konsep", "Rekomendasi pengembangan"],
    },
    {
      title: "Design & Prototyping",
      body: "Perancangan produk, visual, model 3D, dan prototipe agar ide dapat diuji dari sisi bentuk, fungsi, dan arah implementasi.",
      accent: "Prototipe",
      priority: "primary",
      role: "Menerjemahkan ide menjadi rancangan dan purwarupa yang bisa dievaluasi.",
      output: "Konsep desain, model 3D, mockup, dan prototipe sesuai kebutuhan proyek.",
      problem: "Mempercepat validasi bentuk, fungsi, dan pengalaman sebelum masuk produksi atau implementasi.",
      targetUsers: "Industri, startup hardware, tim produk, komunitas maker, dan institusi pelatihan.",
      needs: "Desain produk, prototype fungsional, mockup, model 3D, dan uji bentuk/fungsi.",
      cta: "Buat Prototype Produk",
      outcomes: ["Desain produk", "Model 3D", "Purwarupa uji"],
    },
    {
      title: "Consultant & Workshop",
      body: "Konsultasi ahli dan workshop praktis untuk membantu tim merumuskan strategi, mengambil keputusan, dan membangun kemampuan internal.",
      accent: "Konsultasi",
      priority: "supporting",
      role: "Mendampingi tim untuk menyelaraskan strategi, keputusan teknis, dan cara kerja.",
      output: "Sesi konsultasi, modul workshop, rangkuman arahan, dan rencana tindak lanjut.",
      problem: "Membantu organisasi mengambil keputusan inovasi dengan pemahaman yang sama antar pemangku kepentingan.",
      targetUsers: "Kampus, komunitas inovasi, training organization, startup, dan corporate innovation team.",
      needs: "Workshop praktis, pendampingan ide, pengembangan SDM, dan penyelarasan stakeholder.",
      cta: "Rancang Workshop",
      outcomes: ["Konsultasi ahli", "Workshop terapan", "Pengembangan SDM"],
    },
    {
      title: "Apparel & Merchandise",
      body: "Pengembangan apparel dan merchandise untuk kebutuhan brand, komunitas, event, dan program yang membutuhkan identitas visual konsisten.",
      accent: "Kreatif",
      priority: "supporting",
      role: "Mengembangkan produk kreatif pendukung identitas brand, program, dan aktivasi komunitas.",
      output: "Arah visual, desain apparel, desain merchandise, dan panduan produksi awal.",
      problem: "Membantu kebutuhan komunikasi brand tetap konsisten dari konsep visual sampai produk fisik.",
      targetUsers: "Brand, komunitas, event organizer, kampus, dan tim marketing perusahaan.",
      needs: "Corporate merchandise, apparel komunitas, identitas event, dan produk promosi.",
      cta: "Buat Merchandise Brand",
      outcomes: ["Arah visual", "Apparel", "Merchandise"],
    },
  ],
  goals: [
    "Menjadi mitra inovasi bagi perusahaan, institusi, dan komunitas.",
    "Membantu pengambilan keputusan melalui riset dan konsultasi yang terarah.",
    "Mewujudkan ide menjadi desain, prototipe, produk, atau program yang dapat diuji.",
    "Mendorong inovasi berkelanjutan yang memberi nilai tambah bagi bisnis.",
    "Mengembangkan kapasitas sumber daya manusia melalui workshop dan pendampingan praktis.",
  ],
  projects: [
    {
      title: "Redesain Motor Xeon",
      category: "Design engineering & prototyping",
      body: "Kajian dan perancangan ulang karakter desain motor untuk mengevaluasi proporsi, tampilan, dan arah pengembangan produk.",
      challenge: "Produk mobilitas membutuhkan pembaruan karakter visual tanpa kehilangan batasan teknis kendaraan.",
      solution: "Niuva melakukan kajian proporsi, eksplorasi desain, dan evaluasi bentuk untuk menentukan arah redesign yang realistis.",
      output: "Arah desain motor, evaluasi bentuk, dan dasar prototyping awal.",
      capability: "Riset visual, desain produk, evaluasi proporsi, dan prototyping awal.",
      cta: "Diskusikan Project Mobilitas",
    },
    {
      title: "Pengembangan Motor EV PT Pindad",
      category: "EV mobility & engineering collaboration",
      body: "Kolaborasi pengembangan motor listrik bersama PT. Pindad melalui riset, desain, dan prototyping untuk kebutuhan mobilitas berbasis teknologi.",
      challenge: "Pengembangan kendaraan listrik membutuhkan integrasi desain mobilitas, kesiapan teknologi, dan kolaborasi lintas disiplin.",
      solution: "Niuva mendukung proses riset, pengembangan konsep, desain mobilitas, dan prototyping sebagai dasar validasi.",
      output: "Konsep pengembangan motor EV, arah desain, dan dukungan prototyping.",
      capability: "R&D produk, desain mobilitas, prototyping, dan kolaborasi lintas disiplin.",
      cta: "Diskusikan Project EV",
    },
    {
      title: "Bicycle Arcade Agate",
      category: "Interactive product & simulator",
      body: "Pengembangan simulator sepeda interaktif bersama Agate, menghubungkan mekanik, sensor, dan pengalaman bermain.",
      challenge: "Pengalaman permainan membutuhkan perangkat fisik yang responsif, aman, dan selaras dengan interaksi pengguna.",
      solution: "Niuva membantu integrasi mekanik, sensor, dan prototyping perangkat untuk menghubungkan sepeda dengan pengalaman arcade.",
      output: "Prototype simulator sepeda interaktif dan validasi pengalaman pengguna.",
      capability: "Integrasi mekanik, sensor, interaksi pengguna, dan prototyping perangkat.",
      cta: "Diskusikan Simulator Interaktif",
    },
    {
      title: "Motorcycle Simulator Agate",
      category: "Simulator & safety training",
      body: "Perancangan simulator sepeda motor bersama Agate sebagai media latihan dan pengalaman interaktif berbasis perangkat fisik.",
      challenge: "Simulator memerlukan kontrol fisik yang dapat merepresentasikan pengalaman berkendara secara aman dan mudah dipahami.",
      solution: "Niuva mengembangkan desain perangkat, prototyping, dan pengujian pengalaman untuk kebutuhan simulasi interaktif.",
      output: "Prototype simulator sepeda motor untuk latihan dan edukasi interaktif.",
      capability: "Desain perangkat, prototyping, simulasi, dan pengujian pengalaman pengguna.",
      cta: "Diskusikan Project Simulator",
    },
  ],
};

export function SectionShell({ id, eyebrow, title, body, children, className, titleClassName }) {
  return (
    <section id={id} className={cn("relative overflow-hidden py-[var(--brand-section-space)]", className)}>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || body) && (
          <div className="mb-[var(--brand-section-header-gap)] max-w-5xl">
            {eyebrow && <p className="brand-eyebrow mb-5">{eyebrow}</p>}
            {title && (
              <h2 className={cn("brand-heading text-[clamp(2rem,5.8vw,4.1rem)] leading-[1.05] text-[var(--brand-ink)]", titleClassName)}>
                {title}
              </h2>
            )}
            {body && <p className="mt-5 max-w-[72ch] text-base leading-7 text-[var(--brand-muted)] md:mt-6 md:text-lg md:leading-8">{body}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function BrandButton({
  children,
  to,
  href,
  variant = "primary",
  className,
  type = "button",
  disabled = false,
  ...props
}) {
  const shared = cn(
    "group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-center text-sm font-semibold leading-none transition-all duration-500 ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-offwhite)] active:scale-[0.98] sm:w-auto sm:px-7 sm:text-[0.95rem]",
    variant === "primary"
      ? "bg-[var(--brand-blue)] text-white shadow-[0_18px_44px_rgba(102,146,188,0.24)] hover:bg-[var(--brand-ink)]"
      : "bg-white text-[var(--brand-ink)] ring-1 ring-[rgba(102,146,188,0.28)] hover:bg-[var(--brand-blue-bg)]",
    disabled && "pointer-events-none opacity-60",
    className
  );
  const content = (
    <>
      <span>{children}</span>
      <span
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full transition-transform duration-500 ease-snap group-hover:translate-x-1",
          variant === "primary" ? "bg-white/20" : "bg-[var(--brand-blue)] text-white"
        )}
      >
        <span aria-hidden="true">↗</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={shared} aria-disabled={disabled || undefined} {...props}>
        {content}
      </a>
    );
  }

  if (!to) {
    return (
      <button type={type} className={shared} disabled={disabled} {...props}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className={shared} aria-disabled={disabled || undefined} {...props}>
      {content}
    </Link>
  );
}

export function ULineMotif({ className, light = false }) {
  return (
    <div aria-hidden="true" className={cn("brand-u-motif", light && "brand-u-motif-light", className)}>
      <span />
      <span />
      <span />
    </div>
  );
}

export function DotPagination({ count = 5, active = 0, className }) {
  return (
    <div aria-hidden="true" className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-2.5 rounded-full bg-[var(--brand-soft-blue)] transition-all duration-500",
            index === active ? "w-8 bg-[var(--brand-blue)]" : "w-2.5 opacity-60"
          )}
        />
      ))}
    </div>
  );
}

export function RoundedVisualFrame({ title, kicker, className, children }) {
  return (
    <div className={cn("rounded-[1.75rem] bg-[rgba(102,146,188,0.12)] p-2 sm:rounded-[2.25rem]", className)}>
      <div className="relative min-h-[260px] overflow-hidden rounded-[1.35rem] bg-[var(--brand-blue)] p-5 text-white sm:min-h-[300px] sm:rounded-[1.75rem] sm:p-7 md:min-h-[380px] md:p-9 lg:min-h-[420px]">
        <ULineMotif light className="absolute -right-10 -top-8 h-44 w-44 opacity-30 sm:h-56 sm:w-56" />
        <div className="absolute bottom-6 right-6 h-16 w-16 rounded-full bg-white/20 sm:bottom-8 sm:right-8 sm:h-24 sm:w-24" />
        <div className="absolute bottom-16 right-20 h-6 w-6 rounded-full bg-white/40 sm:bottom-20 sm:right-24 sm:h-8 sm:w-8" />
        <div className="relative z-10 flex h-full min-h-[214px] flex-col justify-between sm:min-h-[244px] md:min-h-[302px] lg:min-h-[342px]">
          <div>
            <p className="text-sm font-semibold text-white/70">{kicker}</p>
            <h3 className="mt-4 max-w-md text-[2rem] font-extrabold leading-tight sm:text-4xl md:text-5xl">{title}</h3>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ServiceCard({ service, index, featured = false, className }) {
  const details = [
    { label: "Untuk", value: service.targetUsers },
    { label: "Kebutuhan", value: service.needs },
    { label: "Output", value: service.output },
    { label: "Masalah yang dijawab", value: service.problem },
  ].filter((item) => item.value);

  return (
    <article
      className={cn(
        "brand-reveal group rounded-[1.65rem] bg-white p-2 shadow-[0_18px_60px_rgba(36,50,65,0.08)] sm:rounded-[2rem]",
        featured ? "lg:col-span-6" : "lg:col-span-6",
        className
      )}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-[var(--brand-offwhite)] p-5 sm:rounded-[1.55rem] sm:p-7",
          featured ? "min-h-[500px] md:min-h-[560px]" : "min-h-[410px]"
        )}
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--brand-blue-light)] transition-transform duration-700 ease-snap group-hover:scale-125" />
        <div className="relative z-10 flex h-full flex-col justify-between gap-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-[var(--brand-blue)]">{service.accent}</p>
              {featured && <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-muted)]">Kapabilitas utama</p>}
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--brand-blue-bg)] text-sm font-bold text-[var(--brand-blue)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div>
            <h3 className={cn("brand-heading text-[var(--brand-ink)]", featured ? "text-3xl sm:text-4xl md:text-5xl" : "text-2xl sm:text-3xl")}>
              {service.title}
            </h3>
            <p className={cn("mt-4 leading-7 text-[var(--brand-muted)]", featured ? "max-w-2xl text-base md:text-lg" : "text-base")}>
              {service.body}
            </p>
            {details.length > 0 && (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {details.map((item) => (
                  <div key={item.label} className="rounded-[1rem] bg-white/85 p-4 ring-1 ring-[rgba(102,146,188,0.14)]">
                    <p className="text-xs font-bold text-[var(--brand-blue)]">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--brand-ink)]">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
            {service.outcomes && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {service.outcomes.map((outcome) => (
                  <li key={outcome} className="rounded-full bg-[var(--brand-blue-bg)] px-3 py-2 text-xs font-semibold text-[var(--brand-ink)]">
                    {outcome}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            to="/contact"
            className="inline-flex w-fit items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] ring-1 ring-[rgba(102,146,188,0.22)] transition-all duration-500 ease-snap hover:bg-[var(--brand-blue)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
          >
            {service.cta || "Diskusikan Project"}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ServiceGrid({ services = profileContent.services, className }) {
  return (
    <div className={cn("grid grid-flow-dense gap-5 md:grid-cols-2 lg:grid-cols-12", className)}>
      {services.map((service, index) => (
        <ServiceCard
          key={service.title}
          service={service}
          index={index}
          featured={service.priority === "primary"}
        />
      ))}
    </div>
  );
}

export function GoalItem({ children, index }) {
  return (
    <li className="brand-reveal flex gap-4 rounded-[1.25rem] bg-white/80 p-5 shadow-[0_16px_44px_rgba(36,50,65,0.06)] sm:gap-5 sm:rounded-[1.5rem]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">
        {index + 1}
      </span>
      <p className="min-w-0 self-center text-base leading-7 text-[var(--brand-ink)]">{children}</p>
    </li>
  );
}

export function ProjectCard({ project, index, onClick, className }) {
  const Component = onClick ? "button" : Link;
  const image = project.image || project.images?.[0];
  const proofItems = [
    { label: "Tantangan", value: project.challenge },
    { label: "Solusi", value: project.solution },
    { label: "Output", value: project.output },
  ].filter((item) => item.value);

  return (
    <Component
      type={onClick ? "button" : undefined}
      to={onClick ? undefined : "/projects"}
      onClick={onClick}
      className={cn(
        "brand-reveal group w-full rounded-[1.65rem] bg-[rgba(144,175,205,0.16)] p-2 text-left transition-transform duration-700 ease-snap hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 sm:rounded-[var(--brand-radius-outer)]",
        className
      )}
    >
      <div className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[1.25rem] bg-white p-5 sm:rounded-[var(--brand-radius-inner)] md:min-h-[620px] md:p-7">
        <div data-brand-visual className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[1rem] bg-[var(--brand-blue-bg)] sm:mb-7 sm:rounded-[1.25rem]">
          {image ? (
            <img
              src={image}
              alt={`Dokumentasi ${project.title}`}
              className="h-full w-full object-cover transition-transform duration-700 ease-snap group-hover:scale-105"
            />
          ) : (
            <>
              <ULineMotif className="absolute -right-6 -top-8 h-56 w-56 opacity-70" />
              <div className="absolute bottom-6 left-6 h-16 w-16 rounded-full bg-[var(--brand-blue)]" />
              <div className="absolute bottom-8 left-28 flex gap-2">
                <span className="h-2.5 w-8 rounded-full bg-[var(--brand-blue)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-soft-blue)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-soft-blue)] opacity-60" />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <div>
            <p className="text-sm font-semibold text-[var(--brand-blue)]">{project.category}</p>
            <h3 className="brand-heading mt-4 max-w-md text-2xl leading-tight text-[var(--brand-ink)] sm:mt-5 sm:text-3xl">{project.title}</h3>
          </div>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--brand-muted)]">{project.body}</p>
          <div className="mt-6 grid gap-3">
            {proofItems.map((item) => (
              <div key={item.label} className="rounded-[1rem] bg-[var(--brand-offwhite)] p-4">
                <p className="text-xs font-bold text-[var(--brand-blue)]">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--brand-ink)]">{item.value}</p>
              </div>
            ))}
            {project.capability && (
              <div className="rounded-[1rem] bg-[var(--brand-blue-bg)] p-4">
                <p className="text-xs font-bold text-[var(--brand-blue)]">Kapabilitas</p>
                <p className="mt-2 text-sm leading-6 text-[var(--brand-ink)]">{project.capability}</p>
              </div>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-[var(--brand-border)] pt-5">
            <span className="text-sm font-semibold text-[var(--brand-muted)]">{onClick ? "Lihat Detail" : project.cta || "Buka Projects"}</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-blue-bg)] text-[var(--brand-blue)] transition-transform duration-500 ease-snap group-hover:translate-x-1">
              <span aria-hidden="true">↗</span>
            </span>
          </div>
        </div>
      </div>
    </Component>
  );
}

export function ProjectGrid({ projects = profileContent.projects, onSelect, className }) {
  return (
    <div className={cn("grid gap-5 md:grid-cols-2 md:gap-6", className)}>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.title}
          project={project}
          index={index}
          onClick={onSelect ? () => onSelect(project) : undefined}
        />
      ))}
    </div>
  );
}




