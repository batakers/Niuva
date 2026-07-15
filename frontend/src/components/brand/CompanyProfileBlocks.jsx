import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import xeonRedesignImage from "@/assets/projects/xeon-redesign.webp";
import pindadEvImage from "@/assets/projects/pindad-ev-motor.webp";
import bicycleArcadeImage from "@/assets/projects/agate-bicycle-arcade.webp";
import motorcycleSimulatorImage from "@/assets/projects/agate-motorcycle-simulator.webp";
import { useI18n } from "@/i18n";
import { publicCopyEn } from "@/i18n/publicCopy";

const copy = (locale, value) => locale === "en" ? (publicCopyEn[value] || value) : value;

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

const profileContentEn = {
  ...profileContent,
  intro: "Niuva Inovasi Utama is a strategic innovation and product development partner focused on integrated creative solutions within the Bandung Techno Park ecosystem.",
  profileFocus: [
    "Creating added value and competitive advantages for partners.",
    "Applying in-depth research and expert consultation.",
    "Enabling systematic research and design collaboration.",
    "Connecting technology development, creative design, and talent development.",
  ],
  services: [
    {
      ...profileContent.services[0], accent: "Research",
      body: "Research to map needs, market opportunities, technology directions, and concept feasibility before development begins.",
      role: "Turning initial questions into a traceable basis for decisions.",
      output: "Needs map, concept validation, and development recommendations.",
      problem: "Reducing the risk of projects starting without evidence of demand or a clear technology direction.",
      targetUsers: "Companies, institutions, innovation teams, universities, and research organizations.",
      needs: "Idea validation, needs assessment, product research, and early development decisions.",
      cta: "Discuss Your R&D Needs",
      outcomes: ["Needs mapping", "Concept validation", "Development recommendations"],
    },
    {
      ...profileContent.services[1], accent: "Prototype",
      body: "Product, visual, and 3D design plus prototyping so ideas can be tested for form, function, and implementation direction.",
      role: "Turning ideas into designs and prototypes that stakeholders can evaluate.",
      output: "Design concepts, 3D models, mockups, and prototypes tailored to project needs.",
      problem: "Accelerating validation of form, function, and experience before production or implementation.",
      targetUsers: "Industry, hardware startups, product teams, maker communities, and training institutions.",
      needs: "Product design, functional prototypes, mockups, 3D models, and form or function testing.",
      cta: "Build a Product Prototype",
      outcomes: ["Product design", "3D models", "Test prototypes"],
    },
    {
      ...profileContent.services[2], accent: "Consulting",
      body: "Expert consulting and practical workshops that help teams define strategy, make decisions, and build internal capabilities.",
      role: "Helping teams align strategy, technical decisions, and ways of working.",
      output: "Consulting sessions, workshop modules, direction summaries, and follow-up plans.",
      problem: "Helping organizations make innovation decisions with shared understanding across stakeholders.",
      targetUsers: "Universities, innovation communities, training organizations, startups, and corporate innovation teams.",
      needs: "Practical workshops, idea mentoring, talent development, and stakeholder alignment.",
      cta: "Plan a Workshop",
      outcomes: ["Expert consulting", "Applied workshops", "Talent development"],
    },
    {
      ...profileContent.services[3], accent: "Creative",
      body: "Apparel and merchandise development for brands, communities, events, and programs that require a consistent visual identity.",
      role: "Developing creative products that support brand identity, programs, and community activations.",
      output: "Visual direction, apparel design, merchandise design, and initial production guidance.",
      problem: "Keeping brand communication consistent from visual concept through physical products.",
      targetUsers: "Brands, communities, event organizers, universities, and corporate marketing teams.",
      needs: "Corporate merchandise, community apparel, event identity, and promotional products.",
      cta: "Create Brand Merchandise",
      outcomes: ["Visual direction", "Apparel", "Merchandise"],
    },
  ],
  goals: [
    "Become an innovation partner for companies, institutions, and communities.",
    "Support decision-making through focused research and consulting.",
    "Turn ideas into testable designs, prototypes, products, or programs.",
    "Enable sustainable innovation that creates business value.",
    "Develop talent through practical workshops and mentoring.",
  ],
  projects: profileContent.projects.map((project, index) => ({
    ...project,
    ...[
      { title: "Yamaha Xeon Redesign", body: "Redesigning Yamaha Xeon body panels to accommodate electrical components for an EV conversion.", challenge: "EV components had to be integrated without compromising body function or proportions.", solution: "The body panels were redesigned around spatial requirements and the vehicle's character.", output: "A body-engineering direction and prototype basis for the Yamaha Xeon conversion.", capability: "Body engineering, EV component integration, and mobility prototyping.", cta: "Discuss a Mobility Project", imageAlt: "Side view of the redesigned blue Yamaha Xeon for an electric vehicle conversion." },
      { title: "PT Pindad EV Motorcycle Development", body: "Collaborative development of a tactical electric motorcycle with PT Pindad for Indonesian military operations.", challenge: "A tactical vehicle requires adaptable design and technical readiness that can be validated.", solution: "The mobility concept, design, and prototype were prepared as a basis for evaluation.", output: "A tactical EV motorcycle concept and prototype support for operational requirements.", capability: "Product R&D, EV mobility design, and engineering collaboration.", cta: "Discuss an EV Project", imageAlt: "Green tactical electric motorcycle prototype developed with PT Pindad." },
      { title: "Agate Bicycle Arcade", body: "Developing an interactive arcade experience with Agate for a Stranger Things-themed activation.", challenge: "The entertainment theme had to become a clear and engaging physical interaction.", solution: "Experience requirements were translated into device direction and an interaction prototype.", output: "A bicycle arcade prototype for user-experience evaluation.", capability: "Experience design, interactive product development, and device prototyping.", cta: "Discuss an Interactive Simulator", imageAlt: "Agate bicycle arcade prototype with a bicycle mounted on the simulator frame." },
      { title: "Agate Motorcycle Simulator", body: "Developing a safety-riding simulator with Agate for PT DENSO (DMIA) employees.", challenge: "Training required a safe medium that represented riding situations clearly.", solution: "The simulator was designed and prototyped to test the training experience.", output: "A motorcycle simulator prototype for safety-riding education.", capability: "Simulator design, prototyping, and user-experience testing.", cta: "Discuss a Simulator Project", imageAlt: "Agate motorcycle simulator prototype on its testing frame." },
    ][index],
  })),
};

export function useProfileContent() {
  const { locale } = useI18n();
  return locale === "en" ? profileContentEn : profileContent;
}

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

export function RoundedVisualFrame({ title, kicker, className, children }) {
  return (
    <div className={cn("rounded-feature bg-decoration-brand-soft p-1.5 ring-1 ring-border-default", className)}>
      <div className="relative min-h-[210px] overflow-hidden rounded-card bg-action-primary p-5 text-text-inverse sm:min-h-[240px] sm:p-7 md:p-8 xl:min-h-[260px]">
        <ULineMotif light className="absolute -right-10 -top-8 hidden h-44 w-44 opacity-30 sm:block sm:h-56 sm:w-56" />
        <div className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-white/20 sm:bottom-8 sm:right-8 sm:h-24 sm:w-24" />
        <div className="absolute bottom-16 right-20 h-5 w-5 rounded-full bg-white/40 sm:bottom-20 sm:right-24 sm:h-8 sm:w-8" />
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

function CapabilityDetailRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="grid gap-3 border-t border-border-default py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold text-action-primary">{label}</dt>
      <dd className="type-body text-text-primary">{value}</dd>
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
  const { locale } = useI18n();
  const item = capability || service;
  const actionLabel = item.cta || (locale === "en" ? "Discuss Your Project" : "Diskusikan Project");

  if (compact) {
    return (
      <article className={cn("brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-6 sm:p-8 lg:col-span-6", className)}>
        <div className="flex items-start justify-between gap-5">
          <p className="text-sm font-semibold text-action-primary">
            {item.accent || copy(locale, "Kapabilitas utama")}
          </p>
          <span className="font-mono-tech text-xs font-semibold text-text-secondary">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
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
          aria-label={`${actionLabel} ${locale === "en" ? "for" : "untuk"} ${item.title}`}
        >
          {actionLabel}
        </BrandButton>
      </article>
    );
  }

  const details = [
    { label: copy(locale, "Apa yang dilakukan"), value: item.role },
    { label: copy(locale, "Output untuk klien"), value: item.output },
    { label: copy(locale, "Masalah yang dijawab"), value: item.problem },
    { label: copy(locale, "Contoh kebutuhan"), value: item.needs },
    { label: locale === "en" ? "Target users" : "Target pengguna", value: item.targetUsers },
  ];

  return (
    <article
      className={cn(
        "brand-reveal rounded-card border border-border-default bg-surface-default p-6 md:p-8",
        className
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10">
        <div>
          <div className="flex items-start justify-between gap-5 border-b border-border-default pb-4">
            <div>
              <p className="text-sm font-semibold text-action-primary">{item.accent || (locale === "en" ? "Capability" : "Kapabilitas")}</p>
              {featured && <p className="mt-1 text-sm text-text-secondary">{copy(locale, "Kapabilitas utama")}</p>}
            </div>
            <span className="font-mono-tech text-sm font-semibold text-action-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="type-heading-section mt-6 max-w-xl text-text-primary">
            {item.title}
          </h3>
          <p className="mt-5 max-w-xl text-base leading-8 text-text-secondary">{item.body}</p>
          <BrandButton
            to="/contact"
            variant="secondary"
            className="mt-6"
            aria-label={`${actionLabel} ${locale === "en" ? "for" : "untuk"} ${item.title}`}
          >
            {actionLabel}
          </BrandButton>
        </div>

        <dl className="border-b border-border-default">
          {details.map((detail, index) => (
            <CapabilityDetailRow key={`capability-detail-${index}`} label={detail.label} value={detail.value} />
          ))}
        </dl>
      </div>
    </article>
  );
}

export function ServiceCard({ service, index, featured = false, className }) {
  const { locale } = useI18n();
  if (featured || service.priority === "primary") {
    return <CapabilityPanel service={service} index={index} className={className} />;
  }

  const details = [
    { label: "Output", value: service.output },
    { label: copy(locale, "Untuk"), value: service.targetUsers },
  ];
  const actionLabel = service.cta || (locale === "en" ? "Discuss Your Project" : "Diskusikan Project");

  return (
    <article
      className={cn(
        "brand-reveal rounded-card border border-border-default bg-surface-page p-6 lg:col-span-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-action-primary">{service.accent}</p>
          <p className="mt-1 text-sm text-text-secondary">{copy(locale, "Kapabilitas pendukung")}</p>
        </div>
        <span className="font-mono-tech text-xs font-semibold text-text-secondary">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="brand-heading mt-6 text-2xl leading-tight text-text-primary sm:text-3xl">
        {service.title}
      </h3>
      <p className="mt-4 text-base leading-7 text-text-secondary">{service.body}</p>
      {service.role && <p className="mt-4 text-sm font-semibold leading-6 text-text-primary">{service.role}</p>}
      <dl className="mt-6 border-b border-border-default">
        {details.map((detail, index) => (
          <CapabilityDetailRow key={`service-detail-${index}`} label={detail.label} value={detail.value} />
        ))}
      </dl>
      <BrandButton
        to="/contact"
        variant="secondary"
        className="mt-6"
        aria-label={`${actionLabel} ${locale === "en" ? "for" : "untuk"} ${service.title}`}
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
          key={`service-${index}`}
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
        "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, index) => (
        <li key={`process-step-${index}`} className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono-tech text-sm font-semibold text-action-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-primary" />
          </div>
          {item.label && <p className="mt-5 text-sm font-semibold text-text-secondary">{item.label}</p>}
          <h3 className="type-heading-card mt-3 text-text-primary">
            {item.title}
          </h3>
          {item.body && <p className="type-body-small mt-3 text-text-secondary sm:text-base sm:leading-[var(--type-body-leading)]">{item.body}</p>}
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

function ProjectMotifFallback({ index }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-surface-muted">
      <ULineMotif className="absolute -right-12 -top-14 hidden h-48 w-48 opacity-20 sm:block" />
      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <span className="font-mono-tech text-xs font-semibold text-text-secondary">PROJECT DOSSIER</span>
        <div className="flex items-end justify-between gap-6">
          <span className="font-mono-tech text-6xl font-semibold leading-none text-decoration-brand-line sm:text-7xl">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-3 w-3 rounded-full bg-brand-primary" />
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
  const { locale } = useI18n();
  const Component = onClick ? "button" : Link;
  const image = project.image || project.images?.[0];
  const proofItems = [
    { label: locale === "en" ? "Challenge" : "Tantangan", value: project.challenge },
    { label: locale === "en" ? "Solution" : "Solusi", value: project.solution },
    { label: "Output", value: project.output },
  ].filter((item) => item.value);
  const actionLabel = ctaLabel || (onClick ? (locale === "en" ? "Open Case Study" : "Buka Studi Kasus") : project.cta || (locale === "en" ? "View Projects" : "Lihat Projects"));
  const destination = to || (project.cta ? "/contact" : "/projects");
  const reverse = index % 2 === 1;

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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:gap-10">
        <div
          data-brand-visual
          className={cn(
            "relative aspect-[4/3] min-h-0 overflow-hidden bg-surface-muted sm:aspect-[16/10] lg:aspect-auto lg:min-h-full",
            reverse && "lg:order-2"
          )}
        >
          {image ? (
            <img
              src={image}
              alt={project.imageAlt || `${locale === "en" ? "Documentation of" : "Dokumentasi"} ${project.title}`}
              width={project.imageWidth}
              height={project.imageHeight}
              loading="lazy"
              decoding="async"
              className={cn("h-full w-full transition-transform duration-emphasis ease-snap group-hover:scale-[1.03]", project.imageFit === "contain" ? "object-contain" : "object-cover")}
            />
          ) : (
            <ProjectMotifFallback index={index} />
          )}
        </div>

        <div className={cn("flex min-w-0 flex-col px-5 pb-6 sm:px-7 sm:pb-8 lg:p-8", reverse && "lg:order-1")}>
          <div className="flex items-start justify-between gap-5">
            <p className="text-sm font-semibold leading-6 text-action-primary">{project.category}</p>
            <span className="shrink-0 font-mono-tech text-xs font-semibold text-text-secondary">
              CASE {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="type-heading-subsection mt-4 max-w-2xl text-text-primary">
            {project.title}
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{project.body}</p>
          {project.capability && (
            <p className="type-body-small mt-4 text-text-primary">
              <span className="font-semibold">{locale === "en" ? "Capabilities:" : "Kapabilitas:"}</span> {project.capability}
            </p>
          )}

          <dl className="mt-6 divide-y divide-[var(--color-border-default)] border-y border-border-default">
            {proofItems.map((item, index) => (
              <div key={`project-proof-${index}`} className="grid gap-3 py-4 sm:grid-cols-[7rem_1fr] sm:gap-5">
                <dt className="text-sm font-semibold text-action-primary">{item.label}</dt>
                <dd className="type-body-small text-text-primary">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 border-t border-border-default pt-5">
            <span className="text-sm font-semibold text-action-primary group-hover:text-text-primary">{actionLabel}</span>
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
    <div className={cn("grid gap-12 lg:gap-16", className)}>
      {projects.map((project, index) => (
        <ProjectCaseStudyCard
          key={`project-${index}`}
          project={project}
          index={index}
          onClick={onSelect ? () => onSelect(project) : undefined}
        />
      ))}
    </div>
  );
}




