import React from "react";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { profileContent } from "@/components/brand/CompanyProfileBlocks";
import { MarketingLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
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

const services = SERVICE_ORDER.map((slug) =>
  profileContent.services.find((service) => service.slug === slug),
).filter(Boolean);

const projects = [
  profileContent.projects.find((project) => project.title.includes("Pindad")),
  profileContent.projects.find((project) => project.title.includes("Xeon")),
  profileContent.projects.find((project) =>
    project.title.includes("Motorcycle Simulator"),
  ),
].filter(Boolean);

const processStages = [
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

const chapters = [
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

const faqItems = [
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

function HeroSection() {
  return (
    <section className="home-r4-hero" aria-labelledby="home-r4-title">
      <div className="home-r4-shell home-r4-hero-inner">
        <p className="home-r4-context">Innovation &amp; product development partner</p>
        <h1 id="home-r4-title" className="home-r4-display">
          <span>Dari ide menuju</span>
          <em className="nds-expression">produk yang dapat diuji.</em>
        </h1>
        <p className="home-r4-hero-copy">
          Niuva mendampingi tim melalui riset, rekayasa, desain, prototyping,
          dan realisasi produk.
        </p>
        <div className="home-r4-actions">
          <PageLink to="/contact">Diskusikan project</PageLink>
          <PageLink to="/retail" variant="link">
            Jelajahi Retail
          </PageLink>
        </div>
      </div>
      <HomeFdmContour variant="light" />
    </section>
  );
}

function OrientationSection() {
  return (
    <section className="home-r4-section home-r4-orientation" aria-labelledby="home-r4-orientation-title">
      <div className="home-r4-shell home-r4-orientation-grid">
        <div>
          <h2 id="home-r4-orientation-title" className="home-r4-heading home-r4-heading-large">
            Mulai dari pertanyaan yang belum selesai atau kebutuhan yang sudah siap dibuat.
          </h2>
        </div>
        <div className="home-r4-orientation-paths">
          <article>
            <h3>Partnership &amp; pengembangan</h3>
            <p>
              Untuk kebutuhan yang masih perlu diteliti, dirancang, diuji, atau
              direalisasikan bersama tim Niuva.
            </p>
            <Link to="/contact">Mulai partnership <ArrowDownRight aria-hidden="true" /></Link>
          </article>
          <article>
            <h3>Retail</h3>
            <p>
              Untuk kebutuhan cetak, produk siap, atau akses perangkat dengan
              jalur konfigurasi yang lebih terstruktur.
            </p>
            <Link to="/retail">Jelajahi Retail <ArrowDownRight aria-hidden="true" /></Link>
          </article>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="home-r4-section home-r4-process" aria-labelledby="home-r4-process-title">
      <div className="home-r4-shell">
        <header className="home-r4-process-heading">
          <h2 id="home-r4-process-title" className="home-r4-heading">
            Lima tahap untuk mengurangi asumsi sebelum keputusan tumbuh lebih mahal.
          </h2>
          <p>
            Tahapnya tetap ringkas. Kedalaman riset, eksperimen, dan prototype
            mengikuti pertanyaan yang benar-benar perlu dijawab.
          </p>
        </header>
        <ol className="home-r4-process-rail" aria-label="Alur pengembangan Niuva">
          {processStages.map((stage) => (
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

function ChaptersSection() {
  return (
    <section className="home-r4-section home-r4-chapters" aria-labelledby="home-r4-chapters-title">
      <div className="home-r4-shell">
        <header className="home-r4-section-intro">
          <h2 id="home-r4-chapters-title" className="home-r4-heading">
            Memahami. Membentuk. Membuktikan.
          </h2>
          <p>
            Satu cara kerja untuk membaca kebutuhan, membangun bentuk, dan
            mengembalikan bukti ke dalam keputusan.
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

function ProjectsSection() {
  return (
    <section className="home-r4-section home-r4-projects" aria-labelledby="home-r4-projects-title">
      <div className="home-r4-shell">
        <header className="home-r4-projects-heading">
          <h2 id="home-r4-projects-title" className="home-r4-heading">
            Bentuk akhir hanya berarti ketika keputusan di belakangnya tetap terbaca.
          </h2>
          <Link to="/projects">Lihat seluruh Projects <ArrowUpRight aria-hidden="true" /></Link>
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
                  Dokumentasi project sebagaimana tercantum dalam Company Profile Niuva.
                </figcaption>
              </figure>
              <div className="home-r4-project-copy">
                <p>{project.category}</p>
                <h3>{project.title}</h3>
                <p>{project.body}</p>
                <dl>
                  <div><dt>Tantangan</dt><dd>{project.challenge}</dd></div>
                  <div><dt>Output</dt><dd>{project.output}</dd></div>
                </dl>
                <Link to="/projects">Baca project <ArrowUpRight aria-hidden="true" /></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="home-r4-section home-r4-services" aria-labelledby="home-r4-services-title">
      <div className="home-r4-shell home-r4-services-grid">
        <header>
          <h2 id="home-r4-services-title" className="home-r4-heading home-r4-heading-large">
            Kemampuan yang mengikuti pertanyaan, bukan paket yang dipaksakan sejak awal.
          </h2>
          <p>
            Empat layanan utama Niuva memiliki hierarki yang setara. Titik
            masuknya mengikuti kebutuhan project.
          </p>
        </header>
        <div className="home-r4-service-list">
          {services.map((service) => (
            <article key={service.slug} data-service-rank="primary">
              <div>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
              </div>
              <Link to="/capabilities" aria-label={`Lihat layanan ${service.title}`}>
                Lihat layanan <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RetailSection() {
  return (
    <section className="home-r4-section home-r4-retail" aria-labelledby="home-r4-retail-title">
      <div className="home-r4-shell">
        <header className="home-r4-retail-heading">
          <h2 id="home-r4-retail-title" className="home-r4-heading home-r4-heading-large">
            Ketika kebutuhannya sudah cukup jelas, mulai dari jalur yang sesuai.
          </h2>
          <p>
            Retail tetap bagian dari satu Niuva, tetapi memiliki alur
            konfigurasi, transaksi, dan tracking yang terpisah dari partnership.
          </p>
        </header>
        <div className="home-r4-retail-doors">
          <article>
            <p>Custom 3D Print</p>
            <h3>Konfigurasikan kebutuhan cetak.</h3>
            <p>
              Pilih spesifikasi, unggah file, dan lanjutkan ke checkout ketika
              kombinasi dapat dihitung serta divalidasi otomatis.
            </p>
            <Link to="/retail">Jelajahi Custom 3D Print <ArrowUpRight aria-hidden="true" /></Link>
          </article>
          <article className="home-r4-retail-ready">
            <p>Ready Products</p>
            <h3>Temukan produk yang siap dipesan.</h3>
            <p>
              Keychain, miniatur, pajangan, merchandise, dan kategori produk
              Niuva yang akan terus berkembang.
            </p>
            <Link to="/retail">Lihat Ready Products <ArrowUpRight aria-hidden="true" /></Link>
          </article>
        </div>
        <div className="home-r4-retail-support">
          <div>
            <h3>Sewa &amp; Self Service</h3>
            <p>
              Akses workstation, printer, atau membership melalui jalur
              reservasi yang tetap terpisah dari katalog produk.
            </p>
          </div>
          <Link to="/retail">Pelajari jalurnya <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <p className="home-r4-retail-boundary">
          Jumlah besar, material khusus, kapasitas yang belum pasti, atau harga
          yang tidak dapat divalidasi otomatis dialihkan ke inquiry tanpa
          membuat Order, reservasi, atau pembayaran.
        </p>
      </div>
    </section>
  );
}

function ContactSection() {
  const { status, contact } = usePublicSettings();

  return (
    <section className="home-r4-section home-r4-contact" aria-labelledby="home-r4-contact-title">
      <div className="home-r4-shell home-r4-contact-grid">
        <div>
          <h2 id="home-r4-contact-title" className="home-r4-heading home-r4-heading-large">
            Bawa kebutuhan, batas, atau pertanyaan yang sedang Anda hadapi.
          </h2>
          <p>
            Form inquiry mencatat brief agar Niuva Operations dapat
            meninjaunya. WhatsApp tersedia sebagai pilihan lanjutan setelah
            inquiry dikirim.
          </p>
          <PageLink to="/contact" className="home-r4-contact-action">
            Buka halaman Kontak
          </PageLink>
        </div>
        <aside aria-labelledby="home-r4-contact-details-title">
          <h3 id="home-r4-contact-details-title">Saat Anda membuka halaman Kontak</h3>
          <dl>
            <div><dt>Ditinjau oleh</dt><dd>Niuva Operations</dd></div>
            <div><dt>Waktu respons</dt><dd>Maksimal 1 hari kerja, Senin sampai Jumat, 09.00 sampai 17.00 WIB, hari libur dikecualikan.</dd></div>
            <div><dt>Alur lanjutan</dt><dd>Inquiry dicatat lebih dahulu. WhatsApp tersedia sebagai pilihan setelah form dikirim.</dd></div>
            {contact.email && <div><dt>Email</dt><dd>{contact.email}</dd></div>}
          </dl>
          {status === "loading" && (
            <p className="home-r4-settings-note" role="status">Memuat detail kontak publik.</p>
          )}
          {status === "error" && (
            <p className="home-r4-settings-note home-r4-settings-error" role="alert">
              Detail terbaru belum dapat dimuat. Form Kontak tetap menjadi jalur yang aman.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="home-r4-section home-r4-faq" aria-labelledby="home-r4-faq-title">
      <div className="home-r4-shell home-r4-faq-grid">
        <h2 id="home-r4-faq-title" className="home-r4-heading">Pertanyaan sebelum memulai.</h2>
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

function ClosingSection() {
  return (
    <section className="home-r4-closing" aria-labelledby="home-r4-closing-title">
      <HomeFdmContour variant="dark" />
      <div className="home-r4-shell home-r4-closing-inner">
        <h2 id="home-r4-closing-title" className="home-r4-display home-r4-closing-title">
          <span>Ide yang baik membutuhkan</span>
          <em className="nds-expression">bukti yang dapat disentuh.</em>
        </h2>
        <p>
          Mulai percakapan dengan Niuva, atau masuk ke Retail ketika
          kebutuhannya siap dikonfigurasi.
        </p>
        <div className="home-r4-actions">
          <PageLink to="/contact" variant="outline">Diskusikan project</PageLink>
          <PageLink to="/retail" variant="link" className="home-r4-closing-link">
            Jelajahi Retail
          </PageLink>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <MarketingLayout>
      <div className="home-r4 nds-public-surface" data-home-version="r4-production-pilot">
        <HeroSection />
        <OrientationSection />
        <ProcessSection />
        <ChaptersSection />
        <ProjectsSection />
        <ServicesSection />
        <RetailSection />
        <ContactSection />
        <FaqSection />
        <ClosingSection />
      </div>
    </MarketingLayout>
  );
}
