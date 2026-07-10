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
    location: "Bandung Techno Park - Gedung D Lt.1, Ruang Makerspace, Jl. Telekomunikasi No.1, Sukapura",
    email: "niuvamakerspace@gmail.com",
    whatsapp: "0851-1767-8901",
    whatsappHref: "https://wa.me/6285117678901",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=Bandung%20Techno%20Park%20Gedung%20D%20Lt.1%20Ruang%20Makerspace%20Jl.%20Telekomunikasi%20No.1%20Sukapura",
    mapsEmbed: "https://www.google.com/maps?q=Bandung%20Techno%20Park%20Gedung%20D%20Lt.1%20Ruang%20Makerspace%20Jl.%20Telekomunikasi%20No.1%20Sukapura&output=embed",
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
      category: "EV conversion & body engineering",
      body: "Redesain panel bodi Yamaha Xeon untuk mengakomodasi komponen elektrikal dalam proses konversi kendaraan listrik.",
      challenge: "Komponen EV perlu terintegrasi tanpa mengorbankan fungsi dan proporsi bodi.",
      solution: "Panel bodi dirancang ulang berdasarkan kebutuhan ruang dan karakter kendaraan.",
      output: "Arah body engineering dan dasar prototype untuk konversi Yamaha Xeon.",
      capability: "Body engineering, integrasi komponen EV, dan prototyping mobilitas.",
      cta: "Diskusikan Project Mobilitas",
    },
    {
      title: "Pengembangan Motor EV PT Pindad",
      category: "EV tactical mobility & engineering collaboration",
      body: "Kolaborasi pengembangan motor listrik taktis bersama PT Pindad untuk kebutuhan operasional TNI.",
      challenge: "Kendaraan taktis membutuhkan desain adaptif dan kesiapan teknis yang dapat divalidasi.",
      solution: "Konsep mobilitas, desain, dan prototype disusun sebagai dasar evaluasi.",
      output: "Konsep motor EV taktis dan dukungan prototype untuk kebutuhan operasional.",
      capability: "R&D produk, desain mobilitas EV, dan kolaborasi engineering.",
      cta: "Diskusikan Project EV",
    },
    {
      title: "Bicycle Arcade Agate",
      category: "Interactive product & experience design",
      body: "Pengembangan pengalaman arcade interaktif bersama Agate untuk aktivasi bertema Stranger Things.",
      challenge: "Tema hiburan perlu diterjemahkan menjadi interaksi fisik yang jelas dan menarik.",
      solution: "Kebutuhan pengalaman dipetakan menjadi arah perangkat dan prototype interaksi.",
      output: "Prototype bicycle arcade sebagai dasar evaluasi pengalaman pengguna.",
      capability: "Experience design, interactive product development, dan prototyping perangkat.",
      cta: "Diskusikan Simulator Interaktif",
    },
    {
      title: "Motorcycle Simulator Agate",
      category: "Simulator & safety training",
      body: "Pengembangan simulator safety riding bersama Agate untuk pegawai PT DENSO (DMIA).",
      challenge: "Pelatihan membutuhkan media aman yang merepresentasikan situasi berkendara secara mudah dipahami.",
      solution: "Perangkat simulator dirancang dan diprototipekan untuk menguji pengalaman pelatihan.",
      output: "Prototype simulator sepeda motor untuk edukasi safety riding.",
      capability: "Desain simulator, prototyping, dan pengujian pengalaman pengguna.",
      cta: "Diskusikan Project Simulator",
    },
  ],
};

export function SectionShell({ id, eyebrow, title, body, children, className, titleClassName }) {
  return (
    <section id={id} className={cn("relative overflow-hidden py-[var(--brand-section-space)]", className)}>
      <div className="mx-auto w-full max-w-[var(--brand-container)] px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || body) && (
          <div className="mb-[var(--brand-section-header-gap)] max-w-5xl">
            {eyebrow && <p className="brand-eyebrow mb-5">{eyebrow}</p>}
            {title && (
              <h2 className={cn("brand-heading text-[clamp(1.9rem,4.4vw,3.5rem)] leading-[1.06] text-[var(--brand-ink)]", titleClassName)}>
                {title}
              </h2>
            )}
            {body && <p className="mt-5 max-w-[65ch] text-base leading-7 text-[var(--brand-muted)] md:mt-6 md:text-lg md:leading-8">{body}</p>}
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
  icon = true,
  ...props
}) {
  const variantClasses = {
    primary: "bg-[var(--brand-blue)] text-white shadow-[var(--brand-shadow-button)] hover:bg-[var(--brand-ink)]",
    secondary: "bg-white text-[var(--brand-ink)] ring-1 ring-[rgba(102,146,188,0.28)] hover:bg-[var(--brand-blue-bg)]",
    quiet: "bg-transparent text-[var(--brand-ink)] ring-1 ring-transparent hover:bg-[var(--brand-blue-bg)]",
    inverse: "bg-white text-[var(--brand-blue)] ring-1 ring-white/40 hover:bg-[var(--brand-offwhite)] hover:text-[var(--brand-ink)]",
  };
  const iconClasses = {
    primary: "bg-white/20 text-white",
    secondary: "bg-[var(--brand-blue)] text-white",
    quiet: "bg-[var(--brand-blue-bg)] text-[var(--brand-blue)]",
    inverse: "bg-[var(--brand-blue-bg)] text-[var(--brand-blue)]",
  };
  const shared = cn(
    "group inline-flex min-h-12 w-full min-w-0 cursor-pointer items-center justify-center gap-3 rounded-[var(--brand-radius-control)] px-5 py-3 text-center text-sm font-semibold leading-snug transition-all duration-300 ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-offwhite)] active:scale-[0.98] sm:w-auto sm:px-7 sm:text-[0.95rem]",
    variantClasses[variant] || variantClasses.secondary,
    disabled && "pointer-events-none opacity-60",
    className
  );
  const content = (
    <>
      <span className="min-w-0 break-words">{children}</span>
      {icon && (
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-[0.625rem] transition-transform duration-300 ease-snap group-hover:translate-x-1 group-hover:-translate-y-px",
            iconClasses[variant] || iconClasses.secondary
          )}
        >
          <span aria-hidden="true">↗</span>
        </span>
      )}
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
    <div className={cn("rounded-[var(--brand-radius-outer)] bg-[rgba(102,146,188,0.12)] p-1.5 ring-1 ring-[rgba(102,146,188,0.12)]", className)}>
      <div className="relative min-h-[220px] overflow-hidden rounded-[var(--brand-radius-inner)] bg-[var(--brand-blue)] p-5 text-white sm:min-h-[260px] sm:p-7 md:p-8 min-[1100px]:min-h-[300px]">
        <ULineMotif light className="absolute -right-10 -top-8 hidden h-44 w-44 opacity-30 sm:block sm:h-56 sm:w-56" />
        <div className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-white/20 sm:bottom-8 sm:right-8 sm:h-24 sm:w-24" />
        <div className="absolute bottom-16 right-20 h-5 w-5 rounded-full bg-white/40 sm:bottom-20 sm:right-24 sm:h-8 sm:w-8" />
        <div className="relative z-10 flex h-full min-h-[174px] flex-col justify-between sm:min-h-[208px] min-[1100px]:min-h-[236px]">
          <div>
            <p className="text-sm font-semibold text-white/70">{kicker}</p>
            <p className="mt-4 max-w-full text-[clamp(1.55rem,6vw,2.5rem)] font-extrabold leading-tight [overflow-wrap:anywhere] sm:max-w-md sm:text-3xl md:text-4xl">{title}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function CapabilityDetailRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="grid gap-2 border-t border-[var(--brand-border)] py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold text-[var(--brand-blue)]">{label}</dt>
      <dd className="text-sm leading-6 text-[var(--brand-ink)]">{value}</dd>
    </div>
  );
}

export function CapabilityPanel({
  capability,
  service,
  index = 0,
  className,
  featured = true,
  compact = false,
}) {
  const item = capability || service;
  const actionLabel = item.cta || "Diskusikan Project";

  if (compact) {
    return (
      <article className={cn("brand-reveal border-t border-[var(--brand-border)] py-6 sm:py-8 lg:col-span-6", className)}>
        <div className="flex items-start justify-between gap-5">
          <p className="text-sm font-semibold text-[var(--brand-blue)]">
            {item.accent || "Kapabilitas utama"}
          </p>
          <span className="font-mono-tech text-xs font-semibold text-[var(--brand-muted)]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className="brand-heading mt-5 max-w-xl text-3xl leading-tight text-[var(--brand-ink)]">
          {item.title}
        </h3>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--brand-muted)]">{item.body}</p>
        {item.role && (
          <p className="mt-5 max-w-xl border-l-2 border-[var(--brand-blue)] pl-4 text-sm font-semibold leading-6 text-[var(--brand-ink)]">
            {item.role}
          </p>
        )}
        <BrandButton
          to="/contact"
          variant="secondary"
          className="mt-6"
          aria-label={`${actionLabel} untuk ${item.title}`}
        >
          {actionLabel}
        </BrandButton>
      </article>
    );
  }

  const details = [
    { label: "Apa yang dilakukan", value: item.role },
    { label: "Output untuk klien", value: item.output },
    { label: "Masalah yang dijawab", value: item.problem },
    { label: "Contoh kebutuhan", value: item.needs },
    { label: "Target pengguna", value: item.targetUsers },
  ];

  return (
    <article
      className={cn(
        "brand-reveal rounded-[var(--brand-radius-card)] border border-[var(--brand-border)] bg-white p-6 sm:p-8 lg:p-10",
        className
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12">
        <div>
          <div className="flex items-start justify-between gap-5 border-b border-[var(--brand-border)] pb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--brand-blue)]">{item.accent || "Kapabilitas"}</p>
              {featured && <p className="mt-1 text-sm text-[var(--brand-muted)]">Kapabilitas utama</p>}
            </div>
            <span className="font-mono-tech text-sm font-semibold text-[var(--brand-blue)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="brand-heading mt-6 max-w-xl text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] text-[var(--brand-ink)]">
            {item.title}
          </h3>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--brand-muted)]">{item.body}</p>
          <BrandButton
            to="/contact"
            variant="secondary"
            className="mt-7"
            aria-label={`${actionLabel} untuk ${item.title}`}
          >
            {actionLabel}
          </BrandButton>
        </div>

        <dl className="border-b border-[var(--brand-border)]">
          {details.map((detail) => (
            <CapabilityDetailRow key={detail.label} label={detail.label} value={detail.value} />
          ))}
        </dl>
      </div>
    </article>
  );
}

export function ServiceCard({ service, index, featured = false, className }) {
  if (featured || service.priority === "primary") {
    return <CapabilityPanel service={service} index={index} className={className} />;
  }

  const details = [
    { label: "Output", value: service.output },
    { label: "Untuk", value: service.targetUsers },
  ];
  const actionLabel = service.cta || "Diskusikan Project";

  return (
    <article
      className={cn(
        "brand-reveal rounded-[var(--brand-radius-card)] border border-[var(--brand-border)] bg-[var(--brand-offwhite)] p-6 sm:p-7 lg:col-span-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-blue)]">{service.accent}</p>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">Kapabilitas pendukung</p>
        </div>
        <span className="font-mono-tech text-xs font-semibold text-[var(--brand-muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="brand-heading mt-6 text-2xl leading-tight text-[var(--brand-ink)] sm:text-3xl">
        {service.title}
      </h3>
      <p className="mt-4 text-base leading-7 text-[var(--brand-muted)]">{service.body}</p>
      {service.role && <p className="mt-4 text-sm font-semibold leading-6 text-[var(--brand-ink)]">{service.role}</p>}
      <dl className="mt-6 border-b border-[var(--brand-border)]">
        {details.map((detail) => (
          <CapabilityDetailRow key={detail.label} label={detail.label} value={detail.value} />
        ))}
      </dl>
      <BrandButton
        to="/contact"
        variant="secondary"
        className="mt-6"
        aria-label={`${actionLabel} untuk ${service.title}`}
      >
        {actionLabel}
      </BrandButton>
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
          className={service.priority === "primary" ? "lg:col-span-12" : "lg:col-span-6"}
        />
      ))}
    </div>
  );
}

export function ProcessTimeline({ items = [], className }) {
  return (
    <ol
      className={cn(
        "grid gap-px overflow-hidden border border-[var(--brand-border)] bg-[var(--brand-border)] md:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className="brand-reveal bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono-tech text-sm font-semibold text-[var(--brand-blue)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
          </div>
          {item.label && <p className="mt-5 text-sm font-semibold text-[var(--brand-muted)]">{item.label}</p>}
          <h3 className="brand-heading mt-3 text-xl leading-tight text-[var(--brand-ink)] sm:text-2xl">
            {item.title}
          </h3>
          {item.body && <p className="mt-3 text-sm leading-6 text-[var(--brand-muted)] sm:text-base sm:leading-7">{item.body}</p>}
        </li>
      ))}
    </ol>
  );
}

export function GoalItem({ children, index }) {
  return (
    <li className="brand-reveal flex gap-4 rounded-[var(--brand-radius-card)] bg-white/85 p-5 shadow-[var(--brand-shadow-card)] ring-1 ring-[rgba(102,146,188,0.12)] sm:gap-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">
        {index + 1}
      </span>
      <p className="min-w-0 self-center text-base leading-7 text-[var(--brand-ink)]">{children}</p>
    </li>
  );
}

function ProjectMotifFallback({ index }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-[var(--brand-blue-bg)]">
      <ULineMotif className="absolute -right-12 -top-14 hidden h-48 w-48 opacity-20 sm:block" />
      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <span className="font-mono-tech text-xs font-semibold text-[var(--brand-muted)]">PROJECT DOSSIER</span>
        <div className="flex items-end justify-between gap-6">
          <span className="font-mono-tech text-6xl font-semibold leading-none text-[rgba(102,146,188,0.24)] sm:text-7xl">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-3 w-3 rounded-full bg-[var(--brand-blue)]" />
        </div>
      </div>
    </div>
  );
}

export function ProjectCaseStudyCard({
  project,
  index = 0,
  onClick,
  className,
  to,
  ctaLabel,
}) {
  const Component = onClick ? "button" : Link;
  const image = project.image || project.images?.[0];
  const proofItems = [
    { label: "Tantangan", value: project.challenge },
    { label: "Solusi", value: project.solution },
    { label: "Output", value: project.output },
  ].filter((item) => item.value);
  const actionLabel = ctaLabel || (onClick ? "Buka Studi Kasus" : project.cta || "Lihat Projects");
  const destination = to || (project.cta ? "/contact" : "/projects");
  const reverse = index % 2 === 1;

  return (
    <Component
      type={onClick ? "button" : undefined}
      to={onClick ? undefined : destination}
      onClick={onClick}
      aria-label={`${actionLabel}: ${project.title}`}
      className={cn(
        "brand-reveal group block w-full overflow-hidden rounded-[var(--brand-radius-card)] border border-[var(--brand-border)] bg-white text-left transition-colors duration-300 ease-snap hover:border-[rgba(102,146,188,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2",
        className
      )}
    >
      <div className="grid lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)]">
        <div
          data-brand-visual
          className={cn(
            "relative min-h-[190px] overflow-hidden bg-[var(--brand-blue-bg)] sm:min-h-[240px] lg:min-h-full",
            reverse && "lg:order-2"
          )}
        >
          {image ? (
            <img
              src={image}
              alt={`Dokumentasi ${project.title}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-snap group-hover:scale-[1.03]"
            />
          ) : (
            <ProjectMotifFallback index={index} />
          )}
        </div>

        <div className={cn("flex min-w-0 flex-col p-5 sm:p-7 lg:p-8", reverse && "lg:order-1")}>
          <div className="flex items-start justify-between gap-5">
            <p className="text-sm font-semibold leading-6 text-[var(--brand-blue)]">{project.category}</p>
            <span className="shrink-0 font-mono-tech text-xs font-semibold text-[var(--brand-muted)]">
              CASE {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="brand-heading mt-4 max-w-2xl text-2xl leading-tight text-[var(--brand-ink)] sm:text-3xl">
            {project.title}
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--brand-muted)]">{project.body}</p>
          {project.capability && (
            <p className="mt-4 text-sm leading-6 text-[var(--brand-ink)]">
              <span className="font-semibold">Kapabilitas:</span> {project.capability}
            </p>
          )}

          <dl className="mt-6 divide-y divide-[var(--brand-border)] border-y border-[var(--brand-border)]">
            {proofItems.map((item) => (
              <div key={item.label} className="grid grid-cols-[5.5rem_1fr] gap-3 py-3.5 sm:grid-cols-[7rem_1fr] sm:gap-5">
                <dt className="text-sm font-semibold text-[var(--brand-blue)]">{item.label}</dt>
                <dd className="text-sm leading-6 text-[var(--brand-ink)]">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-center justify-between gap-5">
            <span className="text-sm font-semibold text-[var(--brand-ink)]">{actionLabel}</span>
            <span aria-hidden="true" className="text-lg text-[var(--brand-blue)] transition-transform duration-300 ease-snap group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </div>
    </Component>
  );
}

export function ProjectCard(props) {
  return <ProjectCaseStudyCard {...props} />;
}

export function ProjectGrid({ projects = profileContent.projects, onSelect, className }) {
  return (
    <div className={cn("grid gap-6", className)}>
      {projects.map((project, index) => (
        <ProjectCaseStudyCard
          key={project.title}
          project={project}
          index={index}
          onClick={onSelect ? () => onSelect(project) : undefined}
        />
      ))}
    </div>
  );
}




