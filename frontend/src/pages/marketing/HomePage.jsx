import React from "react";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { profileContent } from "@/components/brand/CompanyProfileBlocks";
import { MarketingLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { getPublicPath } from "@/lib/publicRoutes";
import { usePublicSettings } from "@/lib/publicSettings";
import {
  HomeChapterIllustration,
  HomeFdmContour,
} from "@/pages/marketing/home/HomePageVisuals";
import "@/pages/marketing/home/HomePageR4.css";

// Homepage remains hardcoded. A Homepage CMS schema is a separate decision and
// this presentation slice does not create or imply one.

const SERVICE_ORDER = [
  "research-development",
  "consultant-workshop",
  "design-prototyping",
  "apparel-merchandise",
];

const baseServices = SERVICE_ORDER.map((slug) =>
  profileContent.services.find((service) => service.slug === slug),
).filter(Boolean);

const PROJECT_ORDER = [
  "Pengembangan Motor EV PT Pindad",
  "Redesain Motor Xeon",
  "Motorcycle Simulator Agate",
];

const baseProjects = PROJECT_ORDER.map((title) =>
  profileContent.projects.find((project) => project.title === title),
).filter(Boolean);

const processStagesId = [
  {
    name: "Need",
    body: "Kebutuhan, target, pengguna, dan batas dipahami sebagai titik mulai.",
  },
  {
    name: "Research",
    body: "Konteks, peluang, risiko, dan dasar keputusan dipetakan.",
  },
  {
    name: "Experiment",
    body: "Asumsi, material, dan pendekatan diuji dalam skala yang tepat.",
  },
  {
    name: "Prototype",
    body: "Konsep dibawa ke bentuk yang dapat dinilai dan diperbaiki.",
  },
  {
    name: "Output",
    body: "Bukti menjadi output atau arah realisasi berikutnya.",
  },
];

const chaptersId = [
  {
    key: "understand",
    title: "Memahami",
    body: "Kami memulai dari kebutuhan, konteks pengguna, risiko, dan bukti apa yang benar-benar perlu dibangun.",
    points: [
      "Brief dan ruang masalah",
      "Pertanyaan riset dan batas keputusan",
      "Rencana eksperimen yang proporsional",
    ],
    caption:
      "Ilustrasi konseptual: kebutuhan dan batas keputusan dipusatkan menjadi satu pertanyaan uji.",
  },
  {
    key: "shape",
    title: "Membentuk",
    body: "Keputusan mulai memiliki dimensi, material, sambungan, dan konsekuensi yang dapat diuji bersama.",
    points: [
      "Desain dan rekayasa",
      "Iterasi bentuk dan material",
      "Prototyping melalui fasilitas Niuva",
    ],
    caption:
      "Ilustrasi konseptual: lapisan, bentuk, material, dan sambungan mulai menjadi keputusan fisik.",
  },
  {
    key: "prove",
    title: "Membuktikan",
    body: "Prototype membantu tim melihat apa yang bekerja, apa yang perlu diubah, dan apakah gagasan siap bergerak lebih jauh.",
    points: [
      "Pengujian dan demonstrasi",
      "Evaluasi keputusan",
      "Realisasi satuan hingga kebutuhan skala lebih besar",
    ],
    caption:
      "Ilustrasi konseptual: prototype diuji lalu mengembalikan bukti untuk keputusan berikutnya.",
  },
];

const faqItemsId = [
  {
    question: "Apakah saya harus sudah mempunyai desain final?",
    answer:
      "Tidak. Untuk partnership, Niuva dapat mulai dari kebutuhan, masalah, referensi, atau batas yang Anda miliki. Retail Custom 3D Print membutuhkan file ketika masuk ke tahap konfigurasi.",
  },
  {
    question: "Kapan pesanan Retail berubah menjadi inquiry?",
    answer:
      "Ketika jumlah, material, kapasitas, harga, ETA, atau fulfillment tidak dapat divalidasi otomatis. Konteks dibawa ke inquiry tanpa menciptakan Order, reservasi, atau pembayaran.",
  },
  {
    question: "Apakah Niuva hanya mengerjakan 3D printing?",
    answer:
      "Tidak. 3D printing adalah salah satu cara realisasi. Niuva juga bekerja pada riset, konsultasi, workshop, desain, rekayasa, prototyping, dan realisasi produk.",
  },
];

const processStagesEn = [
  {
    name: "Need",
    body: "We frame the need, target, users, and constraints as the starting point.",
  },
  {
    name: "Research",
    body: "We map context, opportunities, risks, and the evidence needed for a decision.",
  },
  {
    name: "Experiment",
    body: "We test assumptions, materials, and approaches at an appropriate scale.",
  },
  {
    name: "Prototype",
    body: "We turn the concept into a form that teams can assess and improve.",
  },
  {
    name: "Output",
    body: "Evidence becomes an output or a clear direction for the next realization step.",
  },
];

const chaptersEn = [
  {
    key: "understand",
    title: "Understand",
    body: "We begin with the need, user context, risks, and the evidence that is genuinely worth building.",
    points: [
      "Brief and problem space",
      "Research questions and decision boundaries",
      "A proportionate experiment plan",
    ],
    caption:
      "Conceptual illustration: needs and decision boundaries converge into one testable question.",
  },
  {
    key: "shape",
    title: "Shape",
    body: "Decisions gain dimensions, materials, joints, and consequences that a team can examine together.",
    points: [
      "Design and engineering",
      "Form and material iterations",
      "Prototyping through Niuva facilities",
    ],
    caption:
      "Conceptual illustration: layers, form, material, and joints become physical decisions.",
  },
  {
    key: "prove",
    title: "Prove",
    body: "A prototype helps a team see what works, what must change, and whether the idea is ready to move further.",
    points: [
      "Testing and demonstration",
      "Decision review",
      "Realization from one-off work to larger-scale needs",
    ],
    caption:
      "Conceptual illustration: a prototype is tested and returns evidence for the next decision.",
  },
];

const faqItemsEn = [
  {
    question: "Do I need to have a final design?",
    answer:
      "No. For a partnership, Niuva can begin with a need, problem, reference, or constraint. Retail Custom 3D Print requires a file when the configuration stage begins.",
  },
  {
    question: "When does a Retail order become an inquiry?",
    answer:
      "When quantity, material, capacity, price, ETA, or fulfilment cannot be validated automatically. Context moves to an inquiry without creating an Order, reservation, or payment.",
  },
  {
    question: "Does Niuva only provide 3D printing?",
    answer:
      "No. 3D printing is one realization method. Niuva also works across research, consulting, workshops, design, engineering, prototyping, and product realization.",
  },
];

const serviceEnglish = {
  "research-development": {
    body: "Frame problems, design experiments, and reduce assumptions before larger decisions are made.",
  },
  "consultant-workshop": {
    body: "Support teams through consulting, workshops, and learning grounded in real needs.",
  },
  "design-prototyping": {
    body: "Turn decisions into designs and physical prototypes that can be tested and improved.",
  },
  "apparel-merchandise": {
    body: "Develop apparel and merchandise for programmes, brands, partnerships, and published Retail products.",
  },
};

const projectEnglish = {
  "Pengembangan Motor EV PT Pindad": {
    category: "Electric mobility",
    body: "Product-development evidence for an electric motorcycle programme with PT Pindad.",
    challenge: "Translate mobility requirements into a physical direction that could be evaluated.",
    output: "An electric-motorcycle development artefact documented in the Niuva Company Profile.",
  },
  "Redesain Motor Xeon": {
    category: "Product redesign",
    body: "A vehicle redesign exercise that made form and product decisions visible for review.",
    challenge: "Reframe an existing product while retaining a coherent use and engineering context.",
    output: "A redesigned motorcycle form documented as project evidence.",
  },
  "Motorcycle Simulator Agate": {
    category: "Interactive simulator",
    body: "A physical simulator that connects a motorcycle interface with an interactive experience.",
    challenge: "Bring physical controls, structure, and the digital experience into one testable system.",
    output: "A motorcycle simulator artefact built for Agate.",
  },
};

const homeCopy = {
  id: {
    context: "Innovation & product development partner",
    heroLead: "Dari ide menuju",
    heroExpression: "produk yang dapat diuji.",
    heroBody: "Niuva mendampingi tim melalui riset, rekayasa, desain, prototyping, dan realisasi produk.",
    discuss: "Diskusikan project",
    exploreRetail: "Jelajahi Retail",
    orientationLabel: "Satu partner, dua cara memulai",
    orientationTitle: "Mulai dari pertanyaan yang belum selesai atau kebutuhan yang sudah siap dibuat.",
    partnershipTitle: "Partnership & pengembangan",
    partnershipBody: "Untuk kebutuhan yang masih perlu diteliti, dirancang, diuji, atau direalisasikan bersama tim Niuva.",
    partnershipAction: "Mulai partnership",
    retailBody: "Untuk kebutuhan cetak, produk siap, atau akses perangkat dengan jalur konfigurasi yang lebih terstruktur.",
    processTitle: "Lima tahap untuk mengurangi asumsi sebelum keputusan tumbuh lebih mahal.",
    processHeadingLabel: "Cara kerja",
    processLabel: "Alur pengembangan Niuva",
    chaptersTitle: "Memahami. Membentuk. Membuktikan.",
    chaptersBody: "Satu cara kerja untuk membaca kebutuhan, membangun bentuk, dan mengembalikan bukti ke dalam keputusan.",
    projectsTitle: "Bentuk akhir hanya berarti ketika keputusan di belakangnya tetap terbaca.",
    allProjects: "Lihat seluruh Proyek",
    projectCaption: "Dokumentasi project sebagaimana tercantum dalam Company Profile Niuva.",
    challenge: "Tantangan",
    output: "Output",
    readProject: "Baca project",
    servicesLabel: "Layanan Niuva",
    servicesTitle: "Kemampuan yang mengikuti pertanyaan, bukan paket yang dipaksakan sejak awal.",
    servicesBody: "Empat layanan utama Niuva memiliki hierarki yang setara. Titik masuknya mengikuti kebutuhan project.",
    viewService: "Lihat layanan",
    retailTitle: "Ketika kebutuhannya sudah cukup jelas, mulai dari jalur yang sesuai.",
    retailIntro: "Retail tetap bagian dari satu Niuva, tetapi memiliki alur konfigurasi, transaksi, dan tracking yang terpisah dari partnership.",
    customTitle: "Konfigurasikan kebutuhan cetak.",
    customBody: "Pilih spesifikasi, unggah file, dan lanjutkan ke checkout ketika kombinasi dapat dihitung serta divalidasi otomatis.",
    customAction: "Jelajahi Custom 3D Print",
    readyTitle: "Temukan produk yang siap dipesan.",
    readyBody: "Keychain, miniatur, pajangan, merchandise, dan kategori produk Niuva yang akan terus berkembang.",
    readyAction: "Lihat Ready Products",
    rentalTitle: "Sewa & Self Service",
    rentalBody: "Akses workstation, printer, atau membership melalui jalur reservasi yang tetap terpisah dari katalog produk.",
    rentalAction: "Pelajari jalurnya",
    retailBoundary: "Jumlah besar, material khusus, kapasitas yang belum pasti, atau harga yang tidak dapat divalidasi otomatis dialihkan ke inquiry tanpa membuat Order, reservasi, atau pembayaran.",
    contactTitle: "Bawa kebutuhan, batas, atau pertanyaan yang sedang Anda hadapi.",
    contactBody: "Form inquiry mencatat brief agar Niuva Operations dapat meninjaunya. WhatsApp tersedia sebagai pilihan lanjutan setelah inquiry dikirim.",
    contactAction: "Buka halaman Kontak",
    contactDetailsTitle: "Saat Anda membuka halaman Kontak",
    reviewedBy: "Ditinjau oleh",
    responseTime: "Waktu respons",
    responseTimeValue: "Maksimal 1 hari kerja, Senin sampai Jumat, 09.00 sampai 17.00 WIB, hari libur dikecualikan.",
    nextFlow: "Alur lanjutan",
    nextFlowValue: "Inquiry dicatat lebih dahulu. WhatsApp tersedia sebagai pilihan setelah form dikirim.",
    loadingContact: "Memuat detail kontak publik.",
    contactError: "Detail terbaru belum dapat dimuat. Form Kontak tetap menjadi jalur yang aman.",
    faqTitle: "Pertanyaan sebelum memulai.",
    closingLead: "Ide yang baik membutuhkan",
    closingExpression: "bukti yang dapat disentuh.",
    closingBody: "Mulai percakapan dengan Niuva, atau masuk ke Retail ketika kebutuhannya siap dikonfigurasi.",
  },
  en: {
    context: "Innovation & product development partner",
    heroLead: "From an idea to",
    heroExpression: "a product you can test.",
    heroBody: "Niuva supports teams through research, engineering, design, prototyping, and product realization.",
    discuss: "Discuss a project",
    exploreRetail: "Explore Retail",
    orientationLabel: "One partner, two ways to begin",
    orientationTitle: "Start with an unresolved question or a need that is ready to be made.",
    partnershipTitle: "Partnership & development",
    partnershipBody: "For needs that still require research, design, testing, or realization with the Niuva team.",
    partnershipAction: "Start a partnership",
    retailBody: "For print needs, ready products, or equipment access through a more structured configuration path.",
    processTitle: "Five stages that reduce assumptions before decisions become more expensive.",
    processHeadingLabel: "How we work",
    processLabel: "Niuva development flow",
    chaptersTitle: "Understand. Shape. Prove.",
    chaptersBody: "One way of working to frame the need, build a form, and return evidence to the decision.",
    projectsTitle: "A final form only matters when the decisions behind it remain legible.",
    allProjects: "View all Projects",
    projectCaption: "Project documentation as presented in the Niuva Company Profile.",
    challenge: "Challenge",
    output: "Output",
    readProject: "Read project",
    servicesLabel: "Niuva services",
    servicesTitle: "Capabilities that follow the question, not a package imposed from the start.",
    servicesBody: "Niuva's four primary services have equal hierarchy. The entry point follows the project need.",
    viewService: "View service",
    retailTitle: "When the need is clear enough, begin with the appropriate path.",
    retailIntro: "Retail remains part of one Niuva, with configuration, transaction, and tracking flows separate from partnership work.",
    customTitle: "Configure your print need.",
    customBody: "Choose specifications, upload a file, and continue to checkout when the combination can be priced and validated automatically.",
    customAction: "Explore Custom 3D Print",
    readyTitle: "Find products that are ready to order.",
    readyBody: "Keychains, miniatures, display pieces, merchandise, and Niuva product categories that will continue to grow.",
    readyAction: "View Ready Products",
    rentalTitle: "Rental & Self Service",
    rentalBody: "Access workstations, printers, or membership through a reservation path separate from the product catalogue.",
    rentalAction: "Learn about the path",
    retailBoundary: "Large quantities, special materials, uncertain capacity, or prices that cannot be validated automatically move to an inquiry without creating an Order, reservation, or payment.",
    contactTitle: "Bring the need, constraint, or question you are facing.",
    contactBody: "The inquiry form records a brief for Niuva Operations to review. WhatsApp is available as an optional continuation after the inquiry is submitted.",
    contactAction: "Open the Contact page",
    contactDetailsTitle: "When you open the Contact page",
    reviewedBy: "Reviewed by",
    responseTime: "Response time",
    responseTimeValue: "Within one business day, Monday to Friday, 09:00 to 17:00 WIB, excluding public holidays.",
    nextFlow: "What happens next",
    nextFlowValue: "The inquiry is recorded first. WhatsApp is available as an option after the form is submitted.",
    loadingContact: "Loading public contact details.",
    contactError: "The latest details could not be loaded. The Contact form remains the safe channel.",
    faqTitle: "Questions before you begin.",
    closingLead: "Good ideas need",
    closingExpression: "evidence you can touch.",
    closingBody: "Start a conversation with Niuva, or enter Retail when the need is ready to configure.",
  },
};

function PageLink({ to, children, variant = "default", className = "" }) {
  return (
    <Button asChild size="lg" variant={variant} className={className}>
      <Link to={to}>
        {children}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </Button>
  );
}

function HeroSection({ copy, locale }) {
  return (
    <section className="home-r4-hero" aria-labelledby="home-r4-title">
      <div className="home-r4-shell home-r4-hero-inner">
        <p className="home-r4-context">{copy.context}</p>
        <h1 id="home-r4-title" className="home-r4-display">
          <span>{copy.heroLead}</span>
          <em className="nds-expression">{copy.heroExpression}</em>
        </h1>
        <p className="home-r4-hero-copy">
          {copy.heroBody}
        </p>
        <div className="home-r4-actions">
          <PageLink to={getPublicPath("contact", locale)}>{copy.discuss}</PageLink>
          <PageLink to={getPublicPath("retail", locale)} variant="link">
            {copy.exploreRetail}
          </PageLink>
        </div>
      </div>
      <HomeFdmContour variant="light" />
    </section>
  );
}

function OrientationSection({ copy, locale }) {
  return (
    <section className="home-r4-section home-r4-orientation" aria-labelledby="home-r4-orientation-title">
      <div className="home-r4-shell home-r4-orientation-grid">
        <header className="home-r4-editorial-intro">
          <p className="home-r4-section-label">{copy.orientationLabel}</p>
          <h2 id="home-r4-orientation-title" className="home-r4-heading home-r4-heading-large">
            {copy.orientationTitle}
          </h2>
        </header>
        <div className="home-r4-orientation-paths">
          <article>
            <h3>{copy.partnershipTitle}</h3>
            <p>{copy.partnershipBody}</p>
            <Link to={getPublicPath("contact", locale)}>{copy.partnershipAction} <ArrowDownRight aria-hidden="true" /></Link>
          </article>
          <article>
            <h3>Retail</h3>
            <p>{copy.retailBody}</p>
            <Link to={getPublicPath("retail", locale)}>{copy.exploreRetail} <ArrowDownRight aria-hidden="true" /></Link>
          </article>
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ copy, stages }) {
  return (
    <section className="home-r4-section home-r4-process" aria-labelledby="home-r4-process-title">
      <div className="home-r4-shell">
        <header className="home-r4-process-heading home-r4-editorial-intro">
          <p className="home-r4-section-label">{copy.processHeadingLabel}</p>
          <h2 id="home-r4-process-title" className="home-r4-heading">
            {copy.processTitle}
          </h2>
        </header>
        <ol className="home-r4-process-rail" aria-label={copy.processLabel}>
          {stages.map((stage) => (
            <li key={stage.name}>
              <span className="home-r4-process-dot" aria-hidden="true" />
              <h3>{stage.name}</h3>
              <p>{stage.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ChaptersSection({ copy, chapters }) {
  return (
    <section className="home-r4-section home-r4-chapters" aria-labelledby="home-r4-chapters-title">
      <div className="home-r4-shell">
        <header className="home-r4-section-intro">
          <h2 id="home-r4-chapters-title" className="home-r4-heading">
            {copy.chaptersTitle}
          </h2>
          <p>
            {copy.chaptersBody}
          </p>
        </header>

        <div className="home-r4-chapter-list">
          {chapters.map((chapter) => (
            <article className="home-r4-chapter" key={chapter.key}>
              <div className="home-r4-chapter-copy">
                <h3>{chapter.title}</h3>
                <p>{chapter.body}</p>
                <ul>
                  {chapter.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <figure className="home-r4-chapter-figure">
                <HomeChapterIllustration type={chapter.key} />
                <figcaption>{chapter.caption}</figcaption>
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ copy, locale, projects }) {
  return (
    <section className="home-r4-section home-r4-projects" aria-labelledby="home-r4-projects-title">
      <div className="home-r4-shell">
        <header className="home-r4-projects-heading">
          <h2 id="home-r4-projects-title" className="home-r4-heading">
            {copy.projectsTitle}
          </h2>
          <Link to={getPublicPath("projects", locale)}>{copy.allProjects} <ArrowUpRight aria-hidden="true" /></Link>
        </header>
        <div className="home-r4-project-list">
          {projects.map((project, index) => (
            <article className="home-r4-project" key={project.title}>
              <figure>
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  width={project.imageWidth}
                  height={project.imageHeight}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
                <figcaption>
                  {copy.projectCaption}
                </figcaption>
              </figure>
              <div className="home-r4-project-copy">
                <p>{project.category}</p>
                <h3>{project.title}</h3>
                <p>{project.body}</p>
                <dl>
                  <div><dt>{copy.challenge}</dt><dd>{project.challenge}</dd></div>
                  <div><dt>{copy.output}</dt><dd>{project.output}</dd></div>
                </dl>
                <Link to={getPublicPath("projects", locale)}>{copy.readProject} <ArrowUpRight aria-hidden="true" /></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ copy, locale, services }) {
  return (
    <section className="home-r4-section home-r4-services" aria-labelledby="home-r4-services-title">
      <div className="home-r4-shell home-r4-services-grid">
        <header className="home-r4-editorial-intro">
          <p className="home-r4-section-label">{copy.servicesLabel}</p>
          <h2 id="home-r4-services-title" className="home-r4-heading home-r4-heading-large">
            {copy.servicesTitle}
          </h2>
          <p>
            {copy.servicesBody}
          </p>
        </header>
        <div className="home-r4-service-list">
          {services.map((service) => (
            <article
              key={service.slug}
              data-service-rank="primary"
              data-service-slug={service.slug}
            >
              <div>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
              </div>
              <Link
                to={{ pathname: getPublicPath("services", locale), hash: service.slug }}
                aria-label={`${copy.viewService}: ${service.title}`}
              >
                {copy.viewService} <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RetailSection({ copy, locale }) {
  return (
    <section className="home-r4-section home-r4-retail" aria-labelledby="home-r4-retail-title">
      <div className="home-r4-shell">
        <header className="home-r4-retail-heading home-r4-editorial-intro">
          <h2 id="home-r4-retail-title" className="home-r4-heading home-r4-heading-large">
            {copy.retailTitle}
          </h2>
          <p>
            {copy.retailIntro}
          </p>
        </header>
        <div className="home-r4-retail-doors">
          <article id="custom-3d-print" className="scroll-mt-32">
            <p>Custom 3D Print</p>
            <h3>{copy.customTitle}</h3>
            <p>{copy.customBody}</p>
            <Link to={{ pathname: getPublicPath("retail", locale), hash: "custom-3d-print" }}>{copy.customAction} <ArrowUpRight aria-hidden="true" /></Link>
          </article>
          <article id="ready-products" className="home-r4-retail-ready scroll-mt-32">
            <p>Ready Products</p>
            <h3>{copy.readyTitle}</h3>
            <p>{copy.readyBody}</p>
            <Link to={{ pathname: getPublicPath("retail", locale), hash: "ready-products" }}>{copy.readyAction} <ArrowUpRight aria-hidden="true" /></Link>
          </article>
        </div>
        <div className="home-r4-retail-support">
          <div>
            <h3>{copy.rentalTitle}</h3>
            <p>{copy.rentalBody}</p>
          </div>
          <Link to={getPublicPath("retail", locale)}>{copy.rentalAction} <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <p className="home-r4-retail-boundary">
          {copy.retailBoundary}
        </p>
      </div>
    </section>
  );
}

function ContactSection({ copy, locale }) {
  const { status, contact } = usePublicSettings();

  return (
    <section className="home-r4-section home-r4-contact" aria-labelledby="home-r4-contact-title">
      <div className="home-r4-shell home-r4-contact-grid">
        <div>
          <h2 id="home-r4-contact-title" className="home-r4-heading home-r4-heading-large">
            {copy.contactTitle}
          </h2>
          <p>
            {copy.contactBody}
          </p>
          <PageLink to={getPublicPath("contact", locale)} className="home-r4-contact-action">
            {copy.contactAction}
          </PageLink>
        </div>
        <aside aria-labelledby="home-r4-contact-details-title">
          <h3 id="home-r4-contact-details-title">{copy.contactDetailsTitle}</h3>
          <dl>
            <div><dt>{copy.reviewedBy}</dt><dd>Niuva Operations</dd></div>
            <div><dt>{copy.responseTime}</dt><dd>{copy.responseTimeValue}</dd></div>
            <div><dt>{copy.nextFlow}</dt><dd>{copy.nextFlowValue}</dd></div>
            {contact.email && <div><dt>Email</dt><dd>{contact.email}</dd></div>}
          </dl>
          {status === "loading" && (
            <p className="home-r4-settings-note" role="status">{copy.loadingContact}</p>
          )}
          {status === "error" && (
            <p className="home-r4-settings-note home-r4-settings-error" role="alert">
              {copy.contactError}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

function FaqSection({ copy, faqItems }) {
  return (
    <section className="home-r4-section home-r4-faq" aria-labelledby="home-r4-faq-title">
      <div className="home-r4-shell home-r4-faq-grid">
        <h2 id="home-r4-faq-title" className="home-r4-heading">{copy.faqTitle}</h2>
        <div className="home-r4-faq-list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>
                <span>{item.question}</span>
                <Plus aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingSection({ copy, locale }) {
  return (
    <section className="home-r4-closing" aria-labelledby="home-r4-closing-title">
      <HomeFdmContour variant="dark" />
      <div className="home-r4-shell home-r4-closing-inner">
        <h2 id="home-r4-closing-title" className="home-r4-display home-r4-closing-title">
          <span>{copy.closingLead}</span>
          <em className="nds-expression">{copy.closingExpression}</em>
        </h2>
        <p>
          {copy.closingBody}
        </p>
        <div className="home-r4-actions">
          <PageLink to={getPublicPath("contact", locale)} variant="outline">{copy.discuss}</PageLink>
          <PageLink to={getPublicPath("retail", locale)} variant="link" className="home-r4-closing-link">
            {copy.exploreRetail}
          </PageLink>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { lang } = useI18n();
  const locale = lang === "en" ? "en" : "id";
  const copy = homeCopy[locale];
  const stages = locale === "en" ? processStagesEn : processStagesId;
  const chapters = locale === "en" ? chaptersEn : chaptersId;
  const faqItems = locale === "en" ? faqItemsEn : faqItemsId;
  const services = baseServices.map((service) =>
    locale === "en"
      ? { ...service, ...(serviceEnglish[service.slug] || {}) }
      : service,
  );
  const projects = baseProjects.map((project) =>
    locale === "en"
      ? { ...project, ...(projectEnglish[project.title] || {}) }
      : project,
  );

  return (
    <MarketingLayout>
      <div className="home-r4 nds-public-surface" data-home-version="r4-production-pilot">
        <HeroSection copy={copy} locale={locale} />
        <OrientationSection copy={copy} locale={locale} />
        <ProcessSection copy={copy} stages={stages} />
        <ChaptersSection copy={copy} chapters={chapters} />
        <ProjectsSection copy={copy} locale={locale} projects={projects} />
        <ServicesSection copy={copy} locale={locale} services={services} />
        <RetailSection copy={copy} locale={locale} />
        <ContactSection copy={copy} locale={locale} />
        <FaqSection copy={copy} faqItems={faqItems} />
        <ClosingSection copy={copy} locale={locale} />
      </div>
    </MarketingLayout>
  );
}
