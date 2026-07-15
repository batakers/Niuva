import React from "react";
import { useI18n } from "@/i18n";
import { MarketingLayout } from "@/components/layout/Layout";
import {
  BrandPage,
  PageContainer,
  PageHero,
  SectionHeader,
  MarketingSection,
} from "@/components/brand/BrandSystem";
import MerchandiseCalculator from "@/components/brand/MerchandiseCalculator";

function MerchandisePage() {
  const { locale } = useI18n();

  return (
    <BrandPage>
      <MarketingLayout>
        <PageContainer>
          {/* Hero Section */}
          <PageHero>
            <div className="space-y-4">
              <p className="font-mono-tech text-sm font-semibold text-action-primary">
                MERCHANDISE & APPAREL
              </p>
              <h1 className="text-display font-display font-extrabold text-text-primary">
                Buat Merchandise Brand Anda
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl">
                Koleksi apparel dan merchandise berkualitas premium dengan berbagai metode
                cetak/sablon. Hitung harga secara real-time dan pesan langsung melalui WhatsApp.
              </p>
            </div>
          </PageHero>

          {/* Calculator Section */}
          <MarketingSection>
            <div className="space-y-8">
              <SectionHeader
                superheading="KALKULATOR HARGA REAL-TIME"
                heading="Rancang & Hitung Pesanan Anda"
                description="Pilih produk, warna, metode cetak, dan jumlah untuk mendapatkan estimasi harga otomatis"
              />

              {/* Calculator Component */}
              <MerchandiseCalculator />

              {/* Features Section */}
              <div className="mt-20 rounded-panel bg-surface-elevated p-8">
                <h3 className="text-2xl font-bold text-text-primary mb-8">
                  Mengapa Memilih Merchandise NIUVA?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      icon: "✓",
                      title: "Material Premium",
                      desc: "Bahan berkualitas tinggi yang tahan lama dan nyaman digunakan",
                    },
                    {
                      icon: "✓",
                      title: "Metode Cetak Beragam",
                      desc: "Screen print, embroidery, direct print - pilih sesuai kebutuhan",
                    },
                    {
                      icon: "✓",
                      title: "Custom Design",
                      desc: "Desain custom sesuai brand identity dan requirement Anda",
                    },
                    {
                      icon: "✓",
                      title: "Quantity Fleksibel",
                      desc: "Mulai dari 1 unit hingga ribuan - sesuaikan kebutuhan Anda",
                    },
                    {
                      icon: "✓",
                      title: "Diskon Volume",
                      desc: "Dapatkan diskon 10% untuk order 50+ unit",
                    },
                    {
                      icon: "✓",
                      title: "Quick Turnaround",
                      desc: "Proses produksi cepat dengan timeline yang jelas",
                    },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-action-primary text-text-inverse flex items-center justify-center font-bold">
                          {feature.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-text-secondary">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Section */}
              <div className="mt-16 rounded-panel bg-gradient-to-r from-niuva-blue/10 to-sky-blue/10 p-8">
                <h3 className="text-2xl font-bold text-text-primary mb-8">
                  Proses Pemesanan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      num: "1",
                      title: "Pilih Produk",
                      desc: "Tentukan jenis produk, warna, dan metode cetak",
                    },
                    {
                      num: "2",
                      title: "Hitung Harga",
                      desc: "Masukkan jumlah dan lihat total harga secara real-time",
                    },
                    {
                      num: "3",
                      title: "Hubungi Kami",
                      desc: "Kirim pesanan & desain melalui WhatsApp",
                    },
                    {
                      num: "4",
                      title: "Terima Pesanan",
                      desc: "Konfirmasi desain, produksi, & pengiriman sesuai timeline",
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="text-center">
                      <div className="w-14 h-14 rounded-full bg-action-primary text-text-inverse font-bold flex items-center justify-center mx-auto mb-4 text-lg">
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

              {/* FAQ Section */}
              <div className="mt-16 rounded-panel bg-surface-elevated p-8">
                <h3 className="text-2xl font-bold text-text-primary mb-8">
                  Pertanyaan Umum
                </h3>
                <div className="space-y-4 max-w-2xl">
                  {[
                    {
                      q: "Berapa minimum order untuk setiap produk?",
                      a: "Minimum order tergantung metode cetak yang dipilih. Screen print biasanya 10 unit, embroidery 5 unit, dan direct print 1 unit. Lihat detail di setiap metode cetak.",
                    },
                    {
                      q: "Bisakah saya custom design dengan logo saya?",
                      a: "Ya, tentu saja! Kirim file desain Anda dalam format vector (AI, EPS) atau resolusi tinggi (300 DPI). Tim kami akan membantu optimasi desain untuk cetak yang sempurna.",
                    },
                    {
                      q: "Berapa lama proses produksi?",
                      a: "Proses produksi biasanya 2-3 minggu dari konfirmasi desain. Untuk urgent bisa dibicarakan, tergantung kompleksitas dan jumlah unit.",
                    },
                    {
                      q: "Apakah ada biaya setup atau desain?",
                      a: "Setup fee tergantung kompleksitas. Konsultasikan dengan tim kami untuk penawaran terbaik sesuai kebutuhan Anda.",
                    },
                    {
                      q: "Bagaimana dengan pengiriman?",
                      a: "Kami melayani pengiriman ke seluruh Indonesia dengan berbagai pilihan kurir. Biaya pengiriman akan dihitung sesuai lokasi dan jumlah barang.",
                    },
                  ].map((item, idx) => (
                    <details
                      key={idx}
                      className="border border-surface-border rounded-control p-4 cursor-pointer group"
                    >
                      <summary className="font-semibold text-text-primary group-open:text-action-primary">
                        {item.q}
                      </summary>
                      <p className="text-text-secondary mt-3 text-sm">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div className="mt-16 rounded-panel bg-action-primary text-text-inverse p-8 text-center">
                <h3 className="text-2xl font-bold mb-3">Ada Pertanyaan?</h3>
                <p className="text-text-inverse/90 mb-6 max-w-xl mx-auto">
                  Hubungi tim NIUVA untuk konsultasi gratis tentang merchandise, metode
                  cetak, atau design custom Anda.
                </p>
                <a
                  href="https://wa.me/62812345678"
                  className="inline-flex min-h-11 items-center justify-center rounded-control bg-text-inverse text-action-primary px-6 py-3 text-sm font-semibold hover:bg-text-inverse/90 transition-colors"
                >
                  💬 Chat via WhatsApp
                </a>
              </div>
            </div>
          </MarketingSection>
        </PageContainer>
      </MarketingLayout>
    </BrandPage>
  );
}

export default MerchandisePage;
