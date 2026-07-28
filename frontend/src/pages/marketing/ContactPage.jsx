import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/layout/Layout";
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
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";
import { findBySlug, usePublicContent } from "../../lib/content";
import {
  sanitizePublicContact,
  usePublicSettings,
} from "../../lib/publicSettings";

const initialForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  needType: "Research & Development",
  timeline: "Belum ditentukan",
  message: "",
};

// Mirrors the `brief` minimum on the canonical Inquiry payload.
const MIN_BRIEF_LENGTH = 10;

// Permissive on purpose: the goal is catching a visitor's typo, not policing
// address grammar. The backend stays the authority.
const EMAIL_SHAPE = /\S+@\S+\.\S+/;
const MIN_PHONE_DIGITS = 8;

// The form carries `noValidate`, so every rule the browser used to enforce
// lives here. That buys consistent, styled, announceable messages instead of
// native bubbles that vanish and are not reachable by assistive tech.
function validateBrief(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Isi nama lengkap Anda.";
  if (!form.company.trim()) errors.company = "Isi nama perusahaan atau institusi.";

  const email = form.email.trim();
  if (!email) errors.email = "Isi alamat email yang bisa dihubungi.";
  else if (!EMAIL_SHAPE.test(email)) errors.email = "Periksa kembali format email, contoh: nama@perusahaan.com.";

  const phoneDigits = form.phone.replace(/\D/g, "");
  if (!form.phone.trim()) errors.phone = "Isi nomor WhatsApp yang aktif.";
  else if (phoneDigits.length < MIN_PHONE_DIGITS) errors.phone = "Nomor WhatsApp terlihat terlalu pendek.";

  const brief = form.message.trim();
  if (!brief) errors.message = "Jelaskan kebutuhan proyek Anda.";
  else if (brief.length < MIN_BRIEF_LENGTH) {
    errors.message = `Mohon jelaskan kebutuhan proyek minimal ${MIN_BRIEF_LENGTH} karakter.`;
  }

  return errors;
}

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
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Clearing on edit means the message disappears the moment the visitor acts
  // on it, instead of sitting there contradicting what they just typed.
  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };
  const { contact: settingsContact, status: settingsStatus } = usePublicSettings();
  const { blocks: cmsBlocks } = usePublicContent("contact");
  const cmsFields = useMemo(() => findBySlug(cmsBlocks, "primary"), [cmsBlocks]);
  const contact = sanitizePublicContact({
    ...profileContent.contact,
    ...cmsFields,
    ...(settingsStatus === "ready" ? settingsContact : {}),
  });

  const submit = async (event) => {
    event.preventDefault();

    // The canonical Inquiry requires a brief long enough to triage. Checking it
    // here keeps the visitor on a written sentence instead of a 422.
    const nextErrors = validateBrief(form);
    const firstInvalid = Object.keys(nextErrors)[0];

    if (firstInvalid) {
      setErrors(nextErrors);
      toast.error(nextErrors[firstInvalid]);
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setErrors({});
    setLoading(true);
    // Each field lands on its own Inquiry attribute. The previous flattening
    // into subject/message made the brief unqueryable and untriageable.
    const payload = {
      company: form.company.trim(),
      pic_name: form.name.trim(),
      pic_email: form.email.trim(),
      pic_phone: form.phone.trim(),
      need: form.needType,
      timeline: form.timeline,
      brief: form.message.trim(),
    };

    try {
      await api.post("/inquiries", payload);
      toast.success("Brief berhasil dikirim. Tim Niuva akan menghubungi Anda.");
      setForm(initialForm);
      setErrors({});
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
          primaryAction={<BrandButton href={contact.whatsappHref || "#form-konsultasi"}>Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href="#form-konsultasi" variant="secondary">Isi Formulir Project</BrandButton>}
          variant="contact"
          visual={
            /* Sourced from the contact object so a CMS override reaches the
               hero too; the rendered values are unchanged by default. */
            <RoundedVisualFrame motif={false} title="WhatsApp adalah jalur tercepat untuk memulai." kicker="Kanal konsultasi">
              <div className="grid gap-3 [overflow-wrap:anywhere] text-sm font-semibold text-text-inverse">
                {contact.whatsapp && <span>WhatsApp: {contact.whatsapp}</span>}
                {contact.email && <span>Email: {contact.email}</span>}
                <span>Bandung Techno Park</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        <MarketingSection tone="muted">
          <PageContainer className="relative z-10">
            <SectionHeader
              title="Pilih jalur kontak sesuai kesiapan brief Anda."
              body="Gunakan WhatsApp untuk respons awal tercepat, email untuk dokumen formal, atau formulir untuk menyampaikan konteks proyek secara terstruktur."
              align="stacked"
            />
            <ContactSummary contact={contact} showMapLink />
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
                  errors={errors}
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
              title="Tiga langkah menuju diskusi lanjutan."
              body="Respons awal difokuskan pada konteks kebutuhan, kecocokan kapabilitas, dan informasi yang masih perlu dilengkapi."
              align="stacked"
            />
            <ol className="grid gap-x-10 gap-y-8 md:grid-cols-3">
              {responseSteps.map((step) => (
                <li key={step.title} className="brand-reveal border-t-2 border-[var(--color-brand-secondary)] pt-5">
                  <h3 className="type-heading-card text-text-primary">{step.title}</h3>
                  <p className="type-body-small mt-3 max-w-[42ch] text-text-secondary">{step.body}</p>
                </li>
              ))}
            </ol>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="muted">
          <PageContainer>
            <SectionHeader
              title="Berbasis di Bandung Techno Park untuk riset dan prototyping."
              body="Alamat Niuva: Bandung Techno Park - Gedung D Lt.1, Ruang Makerspace. Pertemuan proyek dan kunjungan dilakukan berdasarkan janji."
              align="stacked"
            />
            <div className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default">
              <iframe
                title="Lokasi Niuva di Bandung Techno Park"
                src={contact.mapsEmbed}
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
