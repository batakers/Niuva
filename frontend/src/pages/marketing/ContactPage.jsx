import React, { useState } from "react";
import { toast } from "sonner";
import { MarketingLayout } from "../../components/Layout";
import { useI18n } from "../../i18n";
import { api, formatApiError } from "../../lib/api";
import {
  BrandButton,
  RoundedVisualFrame,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  ContactForm,
  ContactSummary,
  CTASection,
  DecorativeMotif,
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
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      email: form.email,
      subject: `${form.needType} - ${form.company || "Tanpa perusahaan"}`,
      message: [
        `Perusahaan / Instansi: ${form.company || "-"}`,
        `Nomor WhatsApp: ${form.phone || "-"}`,
        `Jenis kebutuhan: ${form.needType}`,
        `Estimasi timeline: ${form.timeline}`,
        "",
        "Pesan tambahan:",
        form.message,
      ].join("\n"),
    };

    try {
      await api.post("/contact", payload);
      toast.success(t("contact.success"));
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
          title="Mulai diskusi proyek dengan brief yang dapat ditindaklanjuti."
          body="Sampaikan kebutuhan riset, design engineering, prototyping, EV/product development, simulator, workshop, atau produk kreatif. Tim Niuva akan meninjau konteks awal sebelum diskusi lanjutan."
          primaryAction={<BrandButton href={profileContent.contact.whatsappHref}>WhatsApp Niuva</BrandButton>}
          secondaryAction={<BrandButton href="#form-konsultasi" variant="secondary">Isi Formulir Project</BrandButton>}
          variant="contact"
          visual={
            <RoundedVisualFrame title="Project intake for technical and creative work." kicker="Consultation channel">
              <div className="grid gap-3 text-sm font-semibold text-white/82">
                <span>Research and development</span>
                <span>Design and prototyping</span>
                <span>Simulator, EV, workshop, merchandise</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        <section className="relative bg-[var(--brand-blue-bg)] py-[var(--brand-section-space)]">
          <DecorativeMotif className="-right-24 top-10 h-72 w-72 opacity-35" density="sparse" />
          <PageContainer className="relative z-10">
            <SectionHeader
              eyebrow="Contact Summary"
              title="Hubungi Niuva melalui kanal resmi atau kirim brief singkat."
              body="Informasi kontak dibuat mudah ditemukan agar calon mitra dapat langsung memilih jalur yang paling sesuai: WhatsApp untuk percakapan cepat, email untuk brief formal, atau formulir untuk konteks proyek yang lebih lengkap."
              align="split"
            />
            <ContactSummary contact={profileContent.contact} showMapLink />
          </PageContainer>
        </section>

        <section id="form-konsultasi" className="bg-white py-[var(--brand-section-space)]">
          <PageContainer>
            <div className="grid gap-8 min-[1100px]:grid-cols-[0.86fr_1.14fr] min-[1100px]:items-start">
              <div>
                <SectionHeader
                  eyebrow="Project Intake"
                  title="Form konsultasi untuk riset, desain, dan prototyping."
                  body="Semakin jelas konteks awal, semakin mudah tim Niuva menentukan pendekatan pertama dan pertanyaan lanjutan yang perlu dijawab."
                  className="mb-0"
                />
                <div className="brand-reveal mt-8 grid gap-4">
                  {responseSteps.map((step, index) => (
                    <article key={step.title} className="rounded-[var(--brand-radius-card)] bg-[var(--brand-offwhite)] p-5 ring-1 ring-[rgba(102,146,188,0.14)]">
                      <div className="flex items-start gap-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--brand-radius-control)] bg-white font-mono-tech text-xs font-bold text-[var(--brand-blue)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="brand-heading text-xl leading-tight text-[var(--brand-ink)]">{step.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">{step.body}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="brand-reveal rounded-[var(--brand-radius-panel)] bg-[var(--brand-blue-bg)] p-1.5 shadow-[var(--brand-shadow-card)] ring-1 ring-[rgba(102,146,188,0.14)]">
                <ContactForm
                  form={form}
                  onChange={set}
                  onSubmit={submit}
                  loading={loading}
                  needOptions={needOptions}
                  timelineOptions={timelineOptions}
                  submitLabel="Kirim Brief Project"
                />
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-[var(--brand-offwhite)] py-[var(--brand-section-space)]">
          <PageContainer>
            <SectionHeader
              eyebrow="Location"
              title="Berbasis di Bandung Techno Park untuk riset dan prototyping."
              body="Alamat Niuva: Bandung Techno Park - Gedung D Lt.1, Ruang Makerspace. Pertemuan proyek dan kunjungan dilakukan berdasarkan janji."
              align="split"
            />
            <div className="brand-reveal overflow-hidden rounded-[var(--brand-radius-panel)] bg-white p-1.5 shadow-[var(--brand-shadow-card)] ring-1 ring-[rgba(102,146,188,0.14)]">
              <iframe
                title="Lokasi Niuva di Bandung Techno Park"
                src={profileContent.contact.mapsEmbed}
                className="h-[320px] w-full rounded-[var(--brand-radius-inner)] border-0 md:h-[430px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </PageContainer>
        </section>

        <CTASection
          title="Diskusikan kebutuhan riset, desain, atau prototyping bersama Niuva."
          body="Hubungi Niuva melalui WhatsApp, email resmi, atau formulir. Tim akan meninjau konteks awal sebelum mengatur percakapan lanjutan."
          primaryAction={<BrandButton href={profileContent.contact.whatsappHref} variant="inverse">WhatsApp Niuva</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          contactEmphasis="Kanal resmi: WhatsApp, email, dan formulir project intake."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
