import React, { useState } from "react";
import { useI18n } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/Layout";
import {
  BrandPage,
  PageContainer,
  PageHero,
  SectionHeader,
  MarketingSection,
} from "@/components/brand/BrandSystem";
import ServiceCard from "@/components/brand/ServiceCard";
import { Button } from "@/components/ui/button";

const SERVICES = [
  {
    id: 1,
    category: "Research & Development",
    title: "Diskusikan Kebutuhan R&D",
    subtitle: "Riset Mendalam untuk Inovasi",
    icon: "🔬",
    bgColor: "#6390BB",
    description:
      "Layanan riset mendalam untuk memahami kebutuhan, peluang, batasan teknis, dan dasar keputusan pengembangan produk Anda.",
    benefits: [
      "Pemetaan kebutuhan & peluang pasar",
      "Analisis konteks pengguna mendalam",
      "Rekomendasi teknologi & approach",
      "Dokumentasi riset terstruktur",
    ],
    ctaText: "Diskusikan Kebutuhan R&D",
    whatsappMessage: "Halo Niuva, saya ingin diskusikan kebutuhan R&D untuk proyek kami.",
    action: "whatsapp",
  },
  {
    id: 2,
    category: "Design & Prototyping",
    title: "Buat Prototype Produk",
    subtitle: "Validasi Konsep dengan Prototipe",
    icon: "🛠️",
    bgColor: "#8AAECF",
    description:
      "Dari desain konsep hingga prototipe fungsional yang dapat diuji. Kami membantu Anda membawa ide menjadi bentuk yang terukur.",
    benefits: [
      "Design engineering profesional",
      "Iterasi cepat & feedback loop",
      "Prototyping dengan teknologi presisi",
      "Dokumentasi teknis lengkap",
    ],
    ctaText: "Buat Prototype Produk",
    whatsappMessage: "Halo Niuva, saya ingin membahas tentang design & prototyping untuk produk kami.",
    action: "whatsapp",
  },
  {
    id: 3,
    category: "Consultant & Workshop",
    title: "Rancang Workshop",
    subtitle: "Program Pelatihan & Capacity Building",
    icon: "👥",
    bgColor: "#4A72A0",
    description:
      "Workshop interaktif dan program pelatihan untuk membangun kapabilitas tim dalam riset, desain, engineering, dan inovasi.",
    benefits: [
      "Kurikulum disesuaikan kebutuhan",
      "Hands-on praktik dengan expert",
      "Sertifikat & dokumentasi program",
      "Mentoring berkelanjutan tersedia",
    ],
    ctaText: "Rancang Workshop",
    whatsappMessage: "Halo Niuva, kami ingin mengadakan workshop untuk tim kami.",
    action: "whatsapp",
  },
  {
    id: 4,
    category: "Apparel & Merchandise",
    title: "Buat Merchandise Brand",
    subtitle: "Produk Kreatif Untuk Branding",
    icon: "👕",
    bgColor: "#3D5266",
    description:
      "Koleksi apparel dan merchandise berkualitas dengan desain custom untuk brand activation, event, atau merchandise official Anda.",
    benefits: [
      "Design custom sesuai brand identity",
      "Material berkualitas premium",
      "Produksi dalam jumlah fleksibel",
      "Packaging profesional & branded",
    ],
    ctaText: "Buat Merchandise Brand",
    action: "navigate",
    navigateTo: "/merchandise",
  },
];

function ShopPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();

  const handleServiceCTA = (service) => {
    if (service.action === "navigate") {
      navigate(service.navigateTo);
    } else if (service.action === "whatsapp") {
      const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp Niuva
      const message = encodeURIComponent(service.whatsappMessage);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <BrandPage>
      <MarketingLayout>
        <PageContainer>
          {/* Hero Section */}
          <PageHero>
            <div className="space-y-4">
              <p className="font-mono-tech text-sm font-semibold text-action-primary">
                NIUVA SERVICES
              </p>
              <h1 className="text-display font-display font-extrabold text-text-primary">
                Layanan Inovasi & Pengembangan Produk
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl">
                Dari riset mendalam hingga validasi prototipe, kami menyediakan solusi
                terintegrasi untuk mengubah ide menjadi produk nyata yang dapat diuji dan
                diimplementasikan.
              </p>
            </div>
          </PageHero>

          {/* Services Section */}
          <MarketingSection>
            <div className="space-y-8">
              <SectionHeader
                superheading="EMPAT LAYANAN UTAMA"
                heading="Solusi Lengkap untuk Inovasi"
                description="Pilih layanan yang sesuai dengan kebutuhan proyek Anda atau kombinasikan untuk pendekatan holistik"
              />

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {SERVICES.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onCTA={handleServiceCTA}
                  />
                ))}
              </div>

              {/* How It Works Section */}
              <div className="mt-16 rounded-panel bg-gradient-to-br from-niuva-blue/10 to-sky-blue/10 p-8">
                <h3 className="text-2xl font-bold text-text-primary mb-6">
                  Bagaimana Proses Kerjanya?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { num: "1", title: "Brief Awal", desc: "Sampaikan konteks & kebutuhan proyek" },
                    { num: "2", title: "Diskusi", desc: "Kami meninjau & mengajukan pertanyaan" },
                    { num: "3", title: "Proposal", desc: "Rencana kerja, timeline & estimasi" },
                    { num: "4", title: "Eksekusi", desc: "Kolaborasi & delivery terstruktur" },
                  ].map((step, idx) => (
                    <div key={idx} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-action-primary text-text-inverse font-bold flex items-center justify-center mx-auto mb-3">
                        {step.num}
                      </div>
                      <h4 className="font-semibold text-text-primary mb-2">
                        {step.title}
                      </h4>
                      <p className="text-sm text-text-secondary">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-16 rounded-panel bg-surface-elevated p-8 text-center">
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  Siap Memulai Proyek?
                </h3>
                <p className="text-text-secondary mb-6 max-w-xl mx-auto">
                  Hubungi tim NIUVA melalui WhatsApp untuk konsultasi awal gratis atau
                  diskusikan kebutuhan spesifik proyek Anda.
                </p>
                <a
                  href="https://wa.me/62812345678"
                  className="inline-flex min-h-11 items-center justify-center rounded-control bg-action-primary px-6 py-3 text-sm font-semibold text-text-inverse hover:bg-action-primary-hover"
                >
                  💬 Hubungi via WhatsApp
                </a>
              </div>

              {/* FAQ Section */}
              <div className="mt-16 rounded-panel bg-surface-elevated p-8">
                <h3 className="text-2xl font-bold text-text-primary mb-6">
                  Pertanyaan Umum
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      q: "Berapa durasi tipis untuk satu project?",
                      a: "Tergantung ruang lingkup. Riset bisa 2-4 minggu, prototyping 4-8 minggu, workshop 1-3 hari.",
                    },
                    {
                      q: "Apakah Niuva bisa melayani proyek skala kecil?",
                      a: "Ya, kami melayani dari startup hingga enterprise. Konsultasikan kebutuhan spesifik Anda.",
                    },
                    {
                      q: "Bagaimana dengan budget dan pricing?",
                      a: "Pricing disesuaikan dengan scope, durasi, dan kompleksitas. Kami memberikan proposal terperinci setelah diskusi awal.",
                    },
                  ].map((item, idx) => (
                    <details key={idx} className="border border-surface-border rounded-control p-4 cursor-pointer group">
                      <summary className="font-semibold text-text-primary group-open:text-action-primary">
                        {item.q}
                      </summary>
                      <p className="text-text-secondary mt-3 text-sm">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </MarketingSection>
        </PageContainer>
      </MarketingLayout>
    </BrandPage>
  );
}

export default ShopPage;
