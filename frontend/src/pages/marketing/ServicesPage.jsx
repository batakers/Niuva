import React from "react";
import { MarketingLayout } from "../../components/Layout";
import {
  BrandButton,
  CapabilityPanel,
  ProcessTimeline,
  RoundedVisualFrame,
  ServiceCard,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";

const primaryCapabilities = profileContent.services.filter((service) => service.priority === "primary");
const supportingCapabilities = profileContent.services.filter((service) => service.priority === "supporting");

const engagementSteps = [
  {
    label: "Brief",
    title: "Kebutuhan dirumuskan",
    body: "Niuva membantu memperjelas konteks bisnis, target pengguna, batasan teknis, dan bentuk output.",
  },
  {
    label: "Research",
    title: "Arah divalidasi",
    body: "Riset, konsultasi, dan studi awal digunakan untuk mengurangi asumsi sebelum masuk produksi solusi.",
  },
  {
    label: "Build",
    title: "Solusi dikembangkan",
    body: "Tim menyusun desain, prototipe, perangkat, materi workshop, atau produk kreatif sesuai ruang lingkup.",
  },
  {
    label: "Review",
    title: "Hasil dievaluasi",
    body: "Output dibaca kembali bersama mitra untuk menentukan iterasi, implementasi, atau kebutuhan lanjutan.",
  },
];

const capabilityNotes = [
  "R&D dan Design & Prototyping diposisikan sebagai kapabilitas inti karena menjadi dasar keputusan produk.",
  "Consultant & Workshop membantu penyelarasan tim, pemahaman teknis, dan pengembangan kapasitas SDM.",
  "Apparel & Merchandise mendukung kebutuhan identitas program, komunitas, event, dan aktivasi brand.",
];

export default function ServicesPage() {
  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Capabilities"
          title="Kapabilitas untuk mengubah ide menjadi produk yang dapat diuji."
          body="Research & Development serta Design & Prototyping menjadi kapabilitas utama Niuva. Konsultasi, workshop, apparel, dan merchandise mendukung ekosistem inovasi yang lebih luas."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/projects" variant="secondary">Lihat Projects</BrandButton>}
          visual={
            <RoundedVisualFrame title="From research brief to validated prototype." kicker="Capability deck">
              <div className="grid gap-3">
                {profileContent.services.map((service, index) => (
                  <div key={service.title} className="flex items-center justify-between rounded-[var(--brand-radius-control)] bg-white/14 px-4 py-3">
                    <span className="text-sm font-semibold text-white/84">{service.title}</span>
                    <span className="font-mono-tech text-xs font-bold text-white/70">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                ))}
              </div>
            </RoundedVisualFrame>
          }
        />

        <section className="relative bg-[var(--brand-blue-bg)] py-[var(--brand-section-space)]">
          <PageContainer className="relative z-10">
            <SectionHeader
              eyebrow="Primary Capabilities"
              title="R&D serta Design & Prototyping menjadi pusat pengembangan produk."
              body="Dua kapabilitas utama ini membantu mitra memahami masalah, menentukan arah teknologi, memvalidasi konsep, dan menyiapkan hasil yang dapat diuji sebelum keputusan implementasi lebih besar."
              align="split"
            />
            <div className="grid gap-6">
              {primaryCapabilities.map((service, index) => (
                <CapabilityPanel key={service.title} service={service} index={index} />
              ))}
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-[var(--brand-section-space)]">
          <PageContainer>
            <SectionHeader
              eyebrow="Supporting Capabilities"
              title="Konsultasi, workshop, apparel, dan merchandise sebagai penguat eksekusi."
              body="Tidak semua kebutuhan dimulai dari prototipe. Sebagian mitra membutuhkan penyelarasan strategi, pelatihan praktis, atau produk kreatif pendukung identitas program."
              align="split"
            />
            <div className="grid gap-5 lg:grid-cols-12">
              {supportingCapabilities.map((service, index) => (
                <ServiceCard key={service.title} service={service} index={index + primaryCapabilities.length} />
              ))}
            </div>
          </PageContainer>
        </section>

        <section className="bg-[var(--brand-offwhite)] py-[var(--brand-section-space)]">
          <PageContainer>
            <div className="grid gap-8 min-[1100px]:grid-cols-[0.86fr_1.14fr] min-[1100px]:items-start">
              <div>
                <SectionHeader
                  eyebrow="Engagement Model"
                  title="Alur kolaborasi untuk kebutuhan teknis dan kreatif."
                  body="Proses kerja dibuat ringkas agar mitra memahami titik masuk, hasil sementara, dan keputusan berikutnya sejak awal."
                  className="mb-0"
                />
                <div className="brand-reveal mt-7 border-y border-[var(--brand-border)] py-5 sm:py-6">
                  <p className="text-sm font-semibold text-[var(--brand-blue)]">Posisi kapabilitas</p>
                  <ul className="mt-5 grid gap-4">
                    {capabilityNotes.map((note) => (
                      <li key={note} className="flex gap-4">
                        <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand-blue)]" />
                        <p className="text-sm leading-7 text-[var(--brand-ink)] sm:text-base">{note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <ProcessTimeline items={engagementSteps} />
            </div>
          </PageContainer>
        </section>

        <CTASection
          title="Tentukan titik mulai yang relevan untuk kebutuhan Anda."
          body="Tim Niuva dapat masuk dari riset awal, evaluasi konsep, desain dan prototyping, penyusunan workshop, atau kebutuhan produk kreatif yang sudah siap dieksekusi."
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href={`mailto:${profileContent.contact.email}`} variant="secondary">Kirim Brief</BrandButton>}
          contactEmphasis="Sampaikan jenis kebutuhan, target hasil, dan perkiraan timeline agar respons awal lebih tepat."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
