import React, { useState } from "react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/layout/Layout";
import { api, formatApiError } from "../../lib/api";
import { useI18n } from "@/i18n";
import {
  BrandButton,
  RoundedVisualFrame,
  useProfileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  ContactForm,
  ContactSummary,
  DecorativeMotif,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";

const initialForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  needType: "Research & Development",
  timeline: "Belum ditentukan",
  message: "",
};

const needOptions = [
  "Research & Development",
  "Design & Prototyping",
  "Consultant & Workshop",
  "Apparel & Merchandise",
  "Kolaborasi lainnya",
];

const timelineOptions = [
  "Belum ditentukan",
  "Kurang dari 1 bulan",
  "1-3 bulan",
  "3-6 bulan",
  "Lebih dari 6 bulan",
];

const responseSteps = [
  {
    title: "Konteks diterima",
    body: "Tim membaca jenis kebutuhan, tujuan, ruang lingkup, timeline, dan kontak yang dapat dihubungi.",
  },
  {
    title: "Kebutuhan dipetakan",
    body: "Niuva menilai apakah titik masuk paling tepat adalah riset, konsultasi, desain, prototyping, workshop, atau produk kreatif.",
  },
  {
    title: "Diskusi lanjutan",
    body: "Percakapan berikutnya digunakan untuk memperjelas brief, batasan, output, dan bentuk kolaborasi.",
  },
];

export default function ContactPage() {
  const { locale } = useI18n();
  const profileContent = useProfileContent();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      email: form.email,
      subject: `${form.needType} - ${form.company || (locale === "en" ? "No company" : "Tanpa perusahaan")}`,
      message: [
        `${locale === "en" ? "Company / Institution" : "Perusahaan / Instansi"}: ${form.company || "-"}`,
        `${locale === "en" ? "WhatsApp number" : "Nomor WhatsApp"}: ${form.phone || "-"}`,
        `${locale === "en" ? "Type of need" : "Jenis kebutuhan"}: ${form.needType}`,
        `${locale === "en" ? "Estimated timeline" : "Estimasi timeline"}: ${form.timeline}`,
        "",
        locale === "en" ? "Additional message:" : "Pesan tambahan:",
        form.message,
      ].join("\n"),
    };

    try {
      await api.post("/contact", payload);
      toast.success(locale === "en" ? "Your message has been sent. The Niuva team will contact you." : "Pesan berhasil dikirim. Tim Niuva akan menghubungi Anda.");
      setForm(initialForm);
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Contact"
          title="Mulai diskusi proyek dengan brief yang siap."
          body="Sampaikan kebutuhan riset, design engineering, prototyping, EV/product development, simulator, workshop, atau produk kreatif. Tim Niuva akan meninjau konteks awal sebelum diskusi lanjutan."
          primaryAction={<BrandButton href={profileContent.contact.whatsappHref}>Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href="#form-konsultasi" variant="secondary">Isi Formulir Project</BrandButton>}
          variant="contact"
          visual={
            <RoundedVisualFrame title="WhatsApp adalah jalur tercepat untuk memulai." kicker="Kanal konsultasi">
              <div className="grid gap-3 text-sm font-semibold text-text-inverse">
                <span>WhatsApp: 0851-1767-8901</span>
                <span>Email: niuvamakerspace@gmail.com</span>
                <span>Bandung Techno Park</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        <MarketingSection tone="muted">
          <DecorativeMotif className="-right-24 top-10 h-72 w-72 opacity-35" density="sparse" />
          <PageContainer className="relative z-10">
            <SectionHeader
              eyebrow="Kanal resmi"
              title="Pilih jalur kontak sesuai kesiapan brief Anda."
              body="Gunakan WhatsApp untuk respons awal tercepat, email untuk dokumen formal, atau formulir untuk menyampaikan konteks proyek secara terstruktur."
              align="split"
            />
            <ContactSummary contact={profileContent.contact} showMapLink />
          </PageContainer>
        </MarketingSection>

        <MarketingSection id="form-konsultasi" tone="default">
          <PageContainer>
            <div className="grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
              <div>
                <SectionHeader
                  eyebrow="Form konsultasi"
                  title="Form konsultasi untuk riset, desain, dan prototyping."
                  body="Semakin jelas konteks awal, semakin mudah tim Niuva menentukan pendekatan pertama dan pertanyaan lanjutan yang perlu dijawab."
                  className="mb-0"
                />
                <p className="brand-reveal mt-8 border-y border-border-default py-5 text-sm leading-7 text-text-secondary">Semua field dipertahankan agar tim menerima nama, organisasi, kontak, jenis kebutuhan, timeline, dan pesan dalam satu brief awal.</p>
              </div>

              <div className="brand-reveal">
                <ContactForm
                  form={form}
                  onChange={set}
                  onSubmit={submit}
                  loading={loading}
                  needOptions={needOptions}
                  timelineOptions={timelineOptions}
                  submitLabel="Kirim Brief Project"
                  className="bg-surface-muted"
                />
              </div>
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="page">
          <PageContainer>
            <SectionHeader
              eyebrow="Setelah brief dikirim"
              title="Tiga langkah menuju diskusi lanjutan."
              body="Respons awal difokuskan pada konteks kebutuhan, kecocokan kapabilitas, dan informasi yang masih perlu dilengkapi."
              align="split"
            />
            <ol className="grid gap-5 md:grid-cols-3">
              {responseSteps.map((step, index) => (
                <li key={`response-step-${index}`} className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-6">
                  <span className="font-mono-tech text-sm font-semibold text-action-primary">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="type-heading-card mt-5 text-text-primary">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{step.body}</p>
                </li>
              ))}
            </ol>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <SectionHeader
              eyebrow="Lokasi"
              title="Berbasis di Bandung Techno Park untuk riset dan prototyping."
              body="Alamat Niuva: Bandung Techno Park - Gedung D Lt.1, Ruang Makerspace. Pertemuan proyek dan kunjungan dilakukan berdasarkan janji."
              align="split"
            />
            <div className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default">
              <iframe
                title="Lokasi Niuva di Bandung Techno Park"
                src={profileContent.contact.mapsEmbed}
                className="h-[320px] w-full border-0 md:h-[430px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </PageContainer>
        </MarketingSection>
      </BrandPage>
    </MarketingLayout>
  );
}
