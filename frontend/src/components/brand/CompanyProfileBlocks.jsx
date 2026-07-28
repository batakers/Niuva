import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import xeonRedesignImage from "@/assets/projects/xeon-redesign.webp";
import pindadEvImage from "@/assets/projects/pindad-ev-motor.webp";
import bicycleArcadeImage from "@/assets/projects/agate-bicycle-arcade.webp";
import motorcycleSimulatorImage from "@/assets/projects/agate-motorcycle-simulator.webp";

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
      slug: "research-development",
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
      slug: "design-prototyping",
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
      slug: "consultant-workshop",
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
      slug: "apparel-merchandise",
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
      image: xeonRedesignImage,
      imageWidth: 553,
      imageHeight: 383,
      imageAlt: "Tampak samping rancangan ulang Yamaha Xeon berwarna biru untuk konversi kendaraan listrik.",
      imageFit: "contain",
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
      image: pindadEvImage,
      imageWidth: 555,
      imageHeight: 414,
      imageAlt: "Prototipe motor listrik taktis berwarna hijau hasil pengembangan bersama PT Pindad.",
      imageFit: "contain",
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
      image: bicycleArcadeImage,
      imageWidth: 385,
      imageHeight: 546,
      imageAlt: "Prototipe bicycle arcade Agate dengan sepeda terpasang pada rangka simulator.",
      imageFit: "contain",
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
      image: motorcycleSimulatorImage,
      imageWidth: 387,
      imageHeight: 553,
      imageAlt: "Prototipe motorcycle simulator Agate pada rangka pengujian.",
      imageFit: "contain",
    },
  ],
};

export function SectionShell({ id, eyebrow, title, body, children, className, titleClassName }) {
  return (
    <section id={id} className={cn("marketing-section-standard relative overflow-hidden", className)} data-marketing-section="true" data-spacing="standard">
      <div className="mx-auto w-full max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || body) && (
          <div className="mb-[var(--space-section-header)] max-w-5xl">
            {eyebrow && <p className="brand-eyebrow mb-5">{eyebrow}</p>}
            {title && (
              <h2 className={cn("type-heading-section text-text-primary", titleClassName)}>
                {title}
              </h2>
            )}
            {body && <p className="mt-5 max-w-[65ch] text-base leading-7 text-text-secondary md:mt-6 md:text-lg md:leading-8">{body}</p>}
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
  icon = false,
  ...props
}) {
  const variantClasses = {
    primary: "bg-action-primary text-text-inverse hover:bg-action-primary-hover",
    secondary: "bg-surface-default text-text-primary ring-1 ring-border-strong hover:bg-surface-muted",
    quiet: "bg-transparent text-text-primary ring-1 ring-transparent hover:bg-surface-muted",
    inverse: "bg-surface-default text-action-primary ring-1 ring-white/40 hover:bg-surface-page hover:text-text-primary",
  };
  const iconClasses = {
    primary: "bg-white/20 text-text-inverse",
    secondary: "bg-action-primary text-text-inverse",
    quiet: "bg-surface-muted text-action-primary",
    inverse: "bg-surface-muted text-action-primary",
  };
  const shared = cn(
    "type-button group inline-flex min-h-12 w-full min-w-0 cursor-pointer items-center justify-center gap-3 rounded-control px-5 py-3 text-center transition-all duration-emphasis ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page active:scale-[0.98] sm:w-auto sm:px-7",
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
            "grid h-7 w-7 shrink-0 place-items-center rounded-[0.625rem] transition-transform duration-emphasis ease-snap group-hover:translate-x-1 group-hover:-translate-y-px",
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
            "h-2.5 rounded-full bg-[var(--color-brand-secondary)] transition-all duration-emphasis",
            index === active ? "w-8 bg-brand-primary" : "w-2.5 opacity-60"
          )}
        />
      ))}
    </div>
  );
}

// `motif` defaults to true because NotFoundPage and the `standard` hero
// fallback still render the original treatment. In-scope pages opt out, which
// is how the repeated U-curve ornament comes down without touching them.
export function RoundedVisualFrame({ title, kicker, className, children, motif = true }) {
  return (
    <div className={cn("rounded-feature bg-decoration-brand-soft p-1.5 ring-1 ring-border-default", className)}>
      <div className="relative min-h-[210px] overflow-hidden rounded-card bg-action-primary p-5 text-text-inverse sm:min-h-[240px] sm:p-7 md:p-8 xl:min-h-[260px]">
        {motif && (
          <>
            <ULineMotif light className="absolute -right-10 -top-8 hidden h-44 w-44 opacity-30 sm:block sm:h-56 sm:w-56" />
            <div className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-white/20 sm:bottom-8 sm:right-8 sm:h-24 sm:w-24" />
            <div className="absolute bottom-16 right-20 h-5 w-5 rounded-full bg-white/40 sm:bottom-20 sm:right-24 sm:h-8 sm:w-8" />
          </>
        )}
        <div className="relative z-10 flex h-full min-h-[164px] flex-col justify-between sm:min-h-[188px] xl:min-h-[196px]">
          <div>
            <p className="text-sm font-semibold text-text-inverse">{kicker}</p>
            <p className="type-heading-subsection mt-4 max-w-full [overflow-wrap:anywhere] sm:max-w-sm">{title}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// A hairline under every row turned this into a spec table. Pairs now sit in a
// two-column grid with whitespace doing the separating; a lone final row spans
// the full width so an odd count never leaves a hole.
function CapabilityDetailRow({ label, value, spanFull = false }) {
  if (!value) return null;

  return (
    <div className={spanFull ? "sm:col-span-2" : undefined}>
      <dt className="type-label text-text-secondary">{label}</dt>
      <dd className="type-body-small mt-2 max-w-[52ch] text-text-primary">{value}</dd>
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
      <article className={cn("brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-6 sm:p-8 lg:col-span-6", className)}>
        <p className="type-label text-text-secondary">
          {item.accent || "Kapabilitas utama"}
        </p>
        <h3 className="brand-heading mt-5 max-w-xl text-3xl leading-tight text-text-primary">
          {item.title}
        </h3>
        <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">{item.body}</p>
        {item.role && (
          <p className="mt-5 max-w-xl border-l-2 border-[var(--color-brand-primary)] pl-4 text-sm font-semibold leading-6 text-text-primary">
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
  const visibleDetails = details.filter((detail) => detail.value);

  return (
    <article
      className={cn(
        "brand-reveal rounded-card border border-border-default bg-surface-default p-6 md:p-8",
        className
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10">
        <div>
          <p className="type-label text-text-secondary">{item.accent || "Kapabilitas"}</p>
          <h3 className="type-heading-section mt-4 max-w-xl text-text-primary">
            {item.title}
          </h3>
          <p className="type-body mt-5 max-w-[54ch] text-text-secondary">{item.body}</p>
          <BrandButton
            to="/contact"
            variant="secondary"
            className="mt-7"
            aria-label={`${actionLabel} untuk ${item.title}`}
          >
            {actionLabel}
          </BrandButton>
        </div>

        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {visibleDetails.map((detail, detailIndex) => (
            <CapabilityDetailRow
              key={detail.label}
              label={detail.label}
              value={detail.value}
              spanFull={visibleDetails.length % 2 === 1 && detailIndex === visibleDetails.length - 1}
            />
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
        "brand-reveal rounded-card border border-border-default bg-surface-page p-6 lg:col-span-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-text-secondary">{service.accent}</p>
          <p className="mt-1 text-sm text-text-secondary">Kapabilitas pendukung</p>
        </div>
        <span className="font-heading text-xs font-semibold text-text-secondary">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="brand-heading mt-6 text-2xl leading-tight text-text-primary sm:text-3xl">
        {service.title}
      </h3>
      <p className="mt-4 text-base leading-7 text-text-secondary">{service.body}</p>
      {service.role && <p className="mt-4 text-sm font-semibold leading-6 text-text-primary">{service.role}</p>}
      <dl className="mt-6 border-b border-border-default">
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
    <div className={cn("grid grid-flow-dense gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8", className)}>
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

// Steps are grouped by a rule rather than boxed. The card frame added no
// hierarchy here, and the visible "01/02/03" counters were redundant with the
// ordered list that already carries sequence.
export function ProcessTimeline({ items = [], className }) {
  return (
    <ol
      className={cn(
        "grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className="brand-reveal border-t-2 border-[var(--color-brand-secondary)] pt-5"
        >
          {item.label && <p className="type-label text-text-secondary">{item.label}</p>}
          <h3 className={cn("type-heading-card text-text-primary", item.label && "mt-2")}>
            {item.title}
          </h3>
          {item.body && (
            <p className="type-body-small mt-3 max-w-[44ch] text-text-secondary">{item.body}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function GoalItem({ children, index }) {
  return (
    <li className="brand-reveal flex gap-4 rounded-card bg-surface-default p-5 shadow-surface ring-1 ring-border-default sm:gap-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-action-primary text-sm font-bold text-text-inverse">
        {index + 1}
      </span>
      <p className="min-w-0 self-center text-base leading-7 text-text-primary">{children}</p>
    </li>
  );
}

// A quiet surface when a case has no photography yet. The previous version
// simulated a dossier with a fake label and an oversized plate number, which
// DEC-UX-002 rules out as fabricated evidence.
function ProjectMotifFallback() {
  return <div aria-hidden="true" className="absolute inset-0 bg-surface-muted" />;
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
  // Pure index%2 mirroring produced an unbroken run of image-and-text splits.
  // Every third case switches to a full-width band instead, so no more than two
  // neighbours ever share a layout family.
  const wide = index % 3 === 2;
  const reverse = !wide && index % 2 === 1;

  return (
    <Component
      type={onClick ? "button" : undefined}
      to={onClick ? undefined : destination}
      onClick={onClick}
      aria-label={`${actionLabel}: ${project.title}`}
      className={cn(
        "brand-reveal group block w-full overflow-hidden rounded-card border border-border-default bg-surface-default text-left transition-colors duration-emphasis ease-snap hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2",
        className
      )}
    >
      <div
        className={cn(
          "grid gap-6",
          wide
            ? "lg:grid-cols-1 lg:gap-8"
            : "lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:gap-10"
        )}
      >
        <div
          data-brand-visual
          className={cn(
            "relative min-h-0 overflow-hidden bg-surface-muted",
            wide
              ? "aspect-[16/9] lg:aspect-[21/9]"
              : "aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-full",
            reverse && "lg:order-2"
          )}
        >
          {image ? (
            <img
              src={image}
              alt={project.imageAlt || `Dokumentasi ${project.title}`}
              width={project.imageWidth}
              height={project.imageHeight}
              loading="lazy"
              decoding="async"
              className={cn("h-full w-full transition-transform duration-emphasis ease-snap group-hover:scale-[1.03]", project.imageFit === "contain" ? "object-contain" : "object-cover")}
            />
          ) : (
            <ProjectMotifFallback />
          )}
        </div>

        <div className={cn("flex min-w-0 flex-col px-5 pb-6 sm:px-7 sm:pb-8 lg:p-8", reverse && "lg:order-1")}>
          <p className="type-label text-text-secondary">{project.category}</p>
          <h3 className="type-heading-subsection mt-4 max-w-2xl text-text-primary">
            {project.title}
          </h3>
          <p className="type-body mt-4 max-w-[58ch] text-text-secondary">{project.body}</p>
          {project.capability && (
            <p className="type-body-small mt-4 max-w-[58ch] text-text-primary">
              <span className="font-semibold">Kapabilitas:</span> {project.capability}
            </p>
          )}

          {/* Three short proofs read faster as parallel columns than as a
              hairline-per-row spec table. */}
          <dl
            className={cn(
              "mt-7 grid gap-x-8 gap-y-5 border-t border-border-default pt-6",
              wide ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {proofItems.map((item) => (
              <div key={item.label}>
                <dt className="type-label text-text-secondary">{item.label}</dt>
                <dd className="type-body-small mt-2 text-text-primary">{item.value}</dd>
              </div>
            ))}
          </dl>

          <span className="type-label mt-7 text-action-primary group-hover:text-text-primary">
            {actionLabel}
          </span>
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
    <div className={cn("grid gap-12 lg:gap-16", className)}>
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



