import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { ErrorState } from "@/components/ui/error-state";
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
  consent: false,
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

  // The backend refuses an inquiry without consent, so catching it here keeps
  // the visitor on the checkbox instead of on a 422.
  if (!form.consent) {
    errors.consent = "Centang persetujuan penggunaan data sebelum mengirim brief.";
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

function readInquiryReference(response) {
  const reference = response?.data?.id;
  return typeof reference === "string" && reference.trim() ? reference.trim() : "";
}

// A dependency failure is not a field mistake, so it never marks a valid field
// invalid. It stays on screen until the visitor acts, because a toast that
// fades takes the only record of a lost brief with it.
function InquiryDependencyError({ message, dependencyErrorRef, whatsappHref, email }) {
  return (
    <div
      ref={dependencyErrorRef}
      role="alert"
      tabIndex={-1}
      data-testid="contact-dependency-error"
      className="mb-6 rounded-card border border-status-error/40 bg-status-error/5 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 sm:p-6"
    >
      <p className="brand-eyebrow text-status-error">Brief belum tersimpan</p>
      <h3 className="type-heading-card mt-3 text-text-primary">
        Kami tidak dapat menyimpan brief Anda saat ini.
      </h3>
      <p className="mt-3 text-base leading-7 text-text-secondary">{message}</p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Isian Anda masih tersimpan di formulir di bawah. Tekan{" "}
        <span className="font-semibold text-text-primary">Kirim Brief Project</span>{" "}
        sekali lagi untuk mencoba ulang. Jika masih gagal, hubungi tim Niuva
        melalui kanal di bawah ini.
      </p>
      {(whatsappHref || email) && (
        <div className="mt-5 flex flex-wrap gap-3">
          {whatsappHref && (
            <BrandButton href={whatsappHref} variant="secondary" data-testid="contact-error-whatsapp">
              Hubungi lewat WhatsApp
            </BrandButton>
          )}
          {email && (
            <BrandButton href={`mailto:${email}`} variant="secondary" data-testid="contact-error-email">
              Kirim lewat email
            </BrandButton>
          )}
        </div>
      )}
    </div>
  );
}

function InquiryAcknowledgement({ reference, onReset, acknowledgementRef, whatsappHref }) {
  return (
    <div
      ref={acknowledgementRef}
      role="status"
      aria-live="polite"
      aria-labelledby="contact-success-title"
      tabIndex={-1}
      data-testid="contact-success"
      className="rounded-card bg-surface-muted p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 sm:p-6 md:p-9"
    >
      <p className="brand-eyebrow">Brief terkirim</p>
      <h3 id="contact-success-title" className="type-heading-card mt-4 text-text-primary">
        Brief Anda sudah diterima.
      </h3>
      <p className="mt-4 text-base leading-7 text-text-secondary">
        Tim Niuva akan meninjau konteks awal dan menghubungi Anda melalui kontak
        yang diberikan. Target respons pertama adalah satu hari kerja
        (Senin&ndash;Jumat, 09.00&ndash;17.00 WIB, di luar hari libur nasional).
        Ini bukan penawaran harga atau jaminan pengiriman.
      </p>
      {reference && (
        <p className="mt-6 border-y border-border-default py-4 text-sm leading-6 text-text-secondary">
          Nomor referensi inquiry:{" "}
          <span className="break-all font-mono-tech font-semibold text-text-primary">{reference}</span>
        </p>
      )}
      {/* Offered only now that the brief is durably stored: the form is the
          record, WhatsApp is an optional continuation the visitor chooses. */}
      {whatsappHref && (
        <p className="mt-6 text-sm leading-6 text-text-secondary">
          Ingin melanjutkan percakapan lebih cepat? Anda dapat meneruskan nomor
          referensi di atas melalui WhatsApp. Langkah ini opsional.
        </p>
      )}
      <div className="mt-7 flex flex-wrap gap-3">
        {whatsappHref && (
          <BrandButton href={whatsappHref} data-testid="contact-success-whatsapp">
            Lanjutkan lewat WhatsApp
          </BrandButton>
        )}
        <BrandButton
          type="button"
          onClick={onReset}
          variant="secondary"
          data-testid="contact-new-submission"
        >
          Kirim brief lain
        </BrandButton>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [dependencyError, setDependencyError] = useState("");
  const acknowledgementRef = useRef(null);
  const dependencyErrorRef = useRef(null);
  const hadSubmission = useRef(false);

  useEffect(() => {
    if (submission) {
      acknowledgementRef.current?.focus();
    } else if (hadSubmission.current) {
      document.getElementById("contact-name")?.focus();
    }
    hadSubmission.current = Boolean(submission);
  }, [submission]);

  // Move to the failure, not past it: the visitor needs to read why the brief
  // was not stored before deciding whether to resend it.
  useEffect(() => {
    if (dependencyError) {
      dependencyErrorRef.current?.focus();
    }
  }, [dependencyError]);

  // Clearing on edit means the message disappears the moment the visitor acts
  // on it, instead of sitting there contradicting what they just typed.
  const set = (key) => (event) => {
    const { type, value, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    setForm((current) => ({ ...current, [key]: nextValue }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };
  const { contact: settingsContact, status: settingsStatus } = usePublicSettings();
  const { blocks: cmsBlocks, status: contentStatus } = usePublicContent("contact");
  const cmsFields = useMemo(() => findBySlug(cmsBlocks, "primary"), [cmsBlocks]);
  const contact = sanitizePublicContact({
    ...(contentStatus === "invalid" ? {} : profileContent.contact),
    ...(contentStatus === "ready" ? cmsFields : {}),
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
    setDependencyError("");
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
      consent: form.consent,
    };

    try {
      const response = await api.post("/inquiries", payload);
      setSubmission({ reference: readInquiryReference(response) });
      setForm(initialForm);
      setErrors({});
    } catch (error) {
      // Deliberately not a toast and deliberately not a field error: the brief
      // is intact, the dependency is not. `POST /inquiries` carries no
      // idempotency key, so resending stays a visitor decision rather than an
      // automatic retry that could store the same lead twice.
      setDependencyError(formatApiError(error.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const startNewSubmission = () => {
    setSubmission(null);
    setErrors({});
    setDependencyError("");
  };

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Contact"
          title="Mulai diskusi proyek dengan brief yang siap."
          body="Sampaikan kebutuhan riset, design engineering, prototyping, EV/product development, simulator, workshop, atau produk kreatif. Tim Niuva akan meninjau konteks awal sebelum diskusi lanjutan."
          /* DEC-UX-003 makes this flow form-first: the primary CTA enters the
             brief, and WhatsApp stays a secondary path for a visitor who is
             not ready to submit one. */
          primaryAction={<BrandButton href="#form-konsultasi">Diskusikan Project</BrandButton>}
          secondaryAction={
            contact.whatsappHref ? (
              <BrandButton href={contact.whatsappHref} variant="secondary">
                Tanya lewat WhatsApp
              </BrandButton>
            ) : null
          }
          variant="contact"
          visual={
            /* Sourced from the contact object so a CMS override reaches the
               hero too; the rendered values are unchanged by default. */
            <RoundedVisualFrame motif={false} title="Brief tertulis mempercepat peninjauan tim." kicker="Kanal konsultasi">
              <div className="grid gap-3 [overflow-wrap:anywhere] text-sm font-semibold text-text-inverse">
                {contact.whatsapp && <span>WhatsApp: {contact.whatsapp}</span>}
                {contact.email && <span>Email: {contact.email}</span>}
                <span>Bandung Techno Park</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        {contentStatus === "invalid" && (
          <MarketingSection tone="muted" spacing="compact">
            <PageContainer>
              <ErrorState
                compact
                error="Konten Contact terbaru tidak dapat diverifikasi. Muat ulang halaman atau hubungi tim Niuva."
              />
            </PageContainer>
          </MarketingSection>
        )}

        <MarketingSection tone="muted">
          <PageContainer className="relative z-10">
            <SectionHeader
              title="Pilih jalur kontak sesuai kesiapan brief Anda."
              body="Formulir adalah jalur utama: brief tersimpan dengan nomor referensi dan masuk antrean peninjauan tim. Gunakan WhatsApp atau email bila Anda belum siap menyusun brief."
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
                {submission ? (
                  <InquiryAcknowledgement
                    reference={submission.reference}
                    onReset={startNewSubmission}
                    acknowledgementRef={acknowledgementRef}
                    whatsappHref={contact.whatsappHref}
                  />
                ) : (
                  <>
                  {dependencyError && (
                    <InquiryDependencyError
                      message={dependencyError}
                      dependencyErrorRef={dependencyErrorRef}
                      whatsappHref={contact.whatsappHref}
                      email={contact.email}
                    />
                  )}
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
                  </>
                )}
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
