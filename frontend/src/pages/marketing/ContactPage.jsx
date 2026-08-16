import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/layout/Layout";
import { useI18n } from "@/i18n";
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
function validateBrief(form, messages) {
  const errors = {};

  if (!form.name.trim()) errors.name = messages.name;
  if (!form.company.trim()) errors.company = messages.company;

  const email = form.email.trim();
  if (!email) errors.email = messages.emailRequired;
  else if (!EMAIL_SHAPE.test(email)) errors.email = messages.emailInvalid;

  const phoneDigits = form.phone.replace(/\D/g, "");
  if (!form.phone.trim()) errors.phone = messages.phoneRequired;
  else if (phoneDigits.length < MIN_PHONE_DIGITS) errors.phone = messages.phoneInvalid;

  const brief = form.message.trim();
  if (!brief) errors.message = messages.briefRequired;
  else if (brief.length < MIN_BRIEF_LENGTH) {
    errors.message = messages.briefShort(MIN_BRIEF_LENGTH);
  }

  // The backend refuses an inquiry without consent, so catching it here keeps
  // the visitor on the checkbox instead of on a 422.
  if (!form.consent) {
    errors.consent = "Centang persetujuan penggunaan data sebelum mengirim brief.";
  }

  return errors;
}

const responseStepsId = [
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

const CONTACT_COPY = {
  id: {
    errors: {
      name: "Isi nama lengkap Anda.",
      company: "Isi nama perusahaan atau institusi.",
      emailRequired: "Isi alamat email yang bisa dihubungi.",
      emailInvalid: "Periksa kembali format email, contoh: nama@perusahaan.com.",
      phoneRequired: "Isi nomor WhatsApp yang aktif.",
      phoneInvalid: "Nomor WhatsApp terlihat terlalu pendek.",
      briefRequired: "Jelaskan kebutuhan proyek Anda.",
      briefShort: (length) => `Mohon jelaskan kebutuhan proyek minimal ${length} karakter.`,
    },
    needOptions: [
      "Research & Development",
      "Design & Prototyping",
      "Consultant & Workshop",
      "Apparel & Merchandise",
      "Kolaborasi lainnya",
    ],
    timelineOptions: [
      "Belum ditentukan",
      "Kurang dari 1 bulan",
      "1-3 bulan",
      "3-6 bulan",
      "Lebih dari 6 bulan",
    ],
    responseSteps: responseStepsId,
    sentLabel: "Brief terkirim",
    sentTitle: "Brief Anda sudah diterima.",
    sentBody: "Tim Niuva akan meninjau konteks awal dan menghubungi Anda melalui kontak yang diberikan. Target respons pertama adalah satu hari kerja (Senin–Jumat, 09.00–17.00 WIB, di luar hari libur nasional). Ini bukan penawaran harga atau jaminan pengiriman.",
    reference: "Nomor referensi inquiry",
    another: "Kirim brief lain",
    whatsappContinue: "Ingin melanjutkan percakapan lebih cepat? Anda dapat meneruskan nomor referensi di atas melalui WhatsApp. Langkah ini opsional.",
    whatsappContinueButton: "Lanjutkan lewat WhatsApp",
    heroLabel: "Kontak",
    heroTitle: "Mulai diskusi proyek dengan brief yang siap.",
    heroBody: "Sampaikan kebutuhan riset, design engineering, prototyping, EV/product development, simulator, workshop, atau produk kreatif. Tim Niuva akan meninjau konteks awal sebelum diskusi lanjutan.",
    discuss: "Diskusikan project",
    formAction: "Isi formulir project",
    // DEC-UX-003: form-first flow, so the visual reinforces the form, not WhatsApp.
    visualTitle: "Brief tertulis mempercepat peninjauan tim.",
    visualLabel: "Kanal konsultasi",
    invalidContent: "Konten Kontak terbaru tidak dapat diverifikasi. Muat ulang halaman atau hubungi tim Niuva.",
    pathsTitle: "Pilih jalur kontak sesuai kesiapan brief Anda.",
    pathsBody: "Formulir adalah jalur utama: brief tersimpan dengan nomor referensi dan masuk antrean peninjauan tim. Gunakan WhatsApp atau email bila Anda belum siap menyusun brief.",
    summaryLabels: { location: "Lokasi", email: "Email", whatsapp: "WhatsApp" },
    formLabel: "Form konsultasi",
    formTitle: "Form konsultasi untuk riset, desain, dan prototyping.",
    formBody: "Semakin jelas konteks awal, semakin mudah tim Niuva menentukan pendekatan pertama dan pertanyaan lanjutan yang perlu dijawab.",
    formNote: "Semua field dipertahankan agar tim menerima nama, organisasi, kontak, jenis kebutuhan, timeline, dan pesan dalam satu brief awal.",
    submit: "Kirim brief project",
    sending: "Mengirim brief",
    formCopy: {
      privacy: "Target respons pertama dari tim: satu hari kerja (Senin–Jumat, 09.00–17.00 WIB, di luar hari libur nasional). Ini bukan penawaran harga atau jaminan pengiriman.",
    },
    responseTitle: "Tiga langkah menuju diskusi lanjutan.",
    responseBody: "Respons awal difokuskan pada konteks kebutuhan, kecocokan kapabilitas, dan informasi yang masih perlu dilengkapi.",
    locationTitle: "Berbasis di Bandung Techno Park untuk riset dan prototyping.",
    locationBody: "Alamat Niuva: Bandung Techno Park - Gedung D Lt.1, Ruang Makerspace. Pertemuan proyek dan kunjungan dilakukan berdasarkan janji.",
    mapTitle: "Lokasi Niuva di Bandung Techno Park",
  },
  en: {
    errors: {
      name: "Enter your full name.",
      company: "Enter your company or institution.",
      emailRequired: "Enter an email address where we can reach you.",
      emailInvalid: "Check the email format, for example: name@company.com.",
      phoneRequired: "Enter an active WhatsApp number.",
      phoneInvalid: "The WhatsApp number appears to be too short.",
      briefRequired: "Describe your project need.",
      briefShort: (length) => `Describe your project need in at least ${length} characters.`,
    },
    needOptions: [
      "Research & Development",
      "Design & Prototyping",
      "Consultant & Workshop",
      "Apparel & Merchandise",
      { value: "Kolaborasi lainnya", label: "Other collaboration" },
    ],
    timelineOptions: [
      { value: "Belum ditentukan", label: "Not decided yet" },
      { value: "Kurang dari 1 bulan", label: "Less than 1 month" },
      { value: "1-3 bulan", label: "1-3 months" },
      { value: "3-6 bulan", label: "3-6 months" },
      { value: "Lebih dari 6 bulan", label: "More than 6 months" },
    ],
    responseSteps: [
      { title: "Context received", body: "The team reads the need, goal, scope, timeline, and contact details." },
      { title: "Need mapped", body: "Niuva identifies whether research, consulting, design, prototyping, a workshop, or a creative product is the right starting point." },
      { title: "Follow-up discussion", body: "The next conversation clarifies the brief, constraints, outputs, and form of collaboration." },
    ],
    sentLabel: "Brief submitted",
    sentTitle: "We have received your brief.",
    sentBody: "The Niuva team will review the initial context and contact you using the details provided. The initial response target is one business day (Monday-Friday, 09:00-17:00 WIB, excluding national holidays). This is not a price quotation or a delivery guarantee.",
    reference: "Inquiry reference",
    another: "Send another brief",
    whatsappContinue: "Want to continue the conversation faster? You can forward the reference number above via WhatsApp. This step is optional.",
    whatsappContinueButton: "Continue via WhatsApp",
    heroLabel: "Contact",
    heroTitle: "Start a project discussion with a useful brief.",
    heroBody: "Share a research, design engineering, prototyping, EV/product development, simulator, workshop, or creative-product need. Niuva will review the initial context before a follow-up discussion.",
    discuss: "Discuss a project",
    formAction: "Complete the project form",
    // DEC-UX-003: form-first flow, so the visual reinforces the form, not WhatsApp.
    visualTitle: "A written brief speeds up team review.",
    visualLabel: "Consultation channel",
    invalidContent: "The latest Contact content could not be verified. Reload the page or contact Niuva.",
    pathsTitle: "Choose a contact path that matches the readiness of your brief.",
    pathsBody: "The form is the main path: your brief is stored with a reference number and enters the team's review queue. Use WhatsApp or email if you are not yet ready to write a brief.",
    summaryLabels: { location: "Location", email: "Email", whatsapp: "WhatsApp" },
    formLabel: "Consultation form",
    formTitle: "A consultation form for research, design, and prototyping.",
    formBody: "Clear initial context helps Niuva identify the right first approach and the follow-up questions that matter.",
    formNote: "Every field is retained so the team receives a name, organization, contact details, need, timeline, and message in one initial brief.",
    submit: "Send project brief",
    sending: "Sending brief",
    formCopy: {
      requiredNote: "Complete every field so Niuva can review the initial brief with enough context.",
      errorSummary: (count) => `${count} ${count === 1 ? "field needs" : "fields need"} attention.`,
      required: "required",
      name: "Name",
      namePlaceholder: "Full name",
      company: "Company / Institution",
      companyPlaceholder: "Company or institution name",
      email: "Email",
      emailPlaceholder: "name@company.com",
      phone: "WhatsApp number",
      phonePlaceholder: "+62 ...",
      need: "Type of need",
      timeline: "Estimated timeline",
      message: "Additional message",
      messagePlaceholder: "Describe the context, goal, scope, target users, expected output, or project constraints.",
      privacy: "Target first response from the team: one business day (Monday-Friday, 09:00-17:00 WIB, excluding national holidays). This is not a price quotation or delivery guarantee.",
    },
    responseTitle: "Three steps toward a follow-up discussion.",
    responseBody: "The initial response focuses on your context, the relevant capability, and the information that still needs clarification.",
    locationTitle: "Based at Bandung Techno Park for research and prototyping.",
    locationBody: "Niuva address: Bandung Techno Park - Building D, 1st Floor, Makerspace. Project meetings and visits are by appointment.",
    mapTitle: "Niuva location at Bandung Techno Park",
  },
};

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

function InquiryAcknowledgement({ reference, onReset, acknowledgementRef, whatsappHref, copy }) {
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
      <p className="brand-eyebrow">{copy.sentLabel}</p>
      <h3 id="contact-success-title" className="type-heading-card mt-4 text-text-primary">
        {copy.sentTitle}
      </h3>
      <p className="mt-4 text-base leading-7 text-text-secondary">
        {copy.sentBody}
      </p>
      {reference && (
        <p className="mt-6 border-y border-border-default py-4 text-sm leading-6 text-text-secondary">
          {copy.reference}:{" "}
          <span className="break-all font-mono-tech font-semibold text-text-primary">{reference}</span>
        </p>
      )}
      {/* Offered only now that the brief is durably stored: the form is the
          record, WhatsApp is an optional continuation the visitor chooses. */}
      {whatsappHref && (
        <p className="mt-6 text-sm leading-6 text-text-secondary">
          {copy.whatsappContinue}
        </p>
      )}
      <div className="mt-7 flex flex-wrap gap-3">
        {whatsappHref && (
          <BrandButton href={whatsappHref} data-testid="contact-success-whatsapp">
            {copy.whatsappContinueButton}
          </BrandButton>
        )}
        <BrandButton
          type="button"
          onClick={onReset}
          variant="secondary"
          data-testid="contact-new-submission"
        >
          {copy.another}
        </BrandButton>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { lang } = useI18n();
  const copy = CONTACT_COPY[lang === "en" ? "en" : "id"];
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
    const nextErrors = validateBrief(form, copy.errors);
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
          eyebrow={copy.heroLabel}
          title={copy.heroTitle}
          body={copy.heroBody}
          /* DEC-UX-003 makes this flow form-first: the primary CTA enters the
             brief, and WhatsApp stays a secondary path for a visitor who is
             not ready to submit one. */
          primaryAction={<BrandButton href="#form-konsultasi">{copy.formAction}</BrandButton>}
          secondaryAction={
            contact.whatsappHref ? (
              <BrandButton href={contact.whatsappHref} variant="secondary">
                {copy.discuss}
              </BrandButton>
            ) : null
          }
          variant="contact"
          visual={
            /* Sourced from the contact object so a CMS override reaches the
               hero too; the rendered values are unchanged by default. */
            <RoundedVisualFrame motif={false} title={copy.visualTitle} kicker={copy.visualLabel}>
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
                error={copy.invalidContent}
              />
            </PageContainer>
          </MarketingSection>
        )}

        <MarketingSection tone="muted">
          <PageContainer className="relative z-10">
            <SectionHeader
              title={copy.pathsTitle}
              body={copy.pathsBody}
              align="stacked"
            />
            <ContactSummary contact={contact} labels={copy.summaryLabels} showMapLink />
          </PageContainer>
        </MarketingSection>

        <MarketingSection id="form-konsultasi" tone="default">
          <PageContainer>
            <div className="grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
              <div>
                <SectionHeader
                  eyebrow={copy.formLabel}
                  title={copy.formTitle}
                  body={copy.formBody}
                  className="mb-0"
                />
                <p className="brand-reveal mt-8 border-y border-border-default py-5 text-sm leading-7 text-text-secondary">{copy.formNote}</p>
              </div>

              <div className="brand-reveal">
                {submission ? (
                  <InquiryAcknowledgement
                    reference={submission.reference}
                    onReset={startNewSubmission}
                    acknowledgementRef={acknowledgementRef}
                    whatsappHref={contact.whatsappHref}
                    copy={copy}
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
                    needOptions={copy.needOptions}
                    timelineOptions={copy.timelineOptions}
                    submitLabel={copy.submit}
                    loadingLabel={copy.sending}
                    copy={copy.formCopy}
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
              title={copy.responseTitle}
              body={copy.responseBody}
              align="stacked"
            />
            <ol className="grid gap-x-10 gap-y-8 md:grid-cols-3">
              {copy.responseSteps.map((step) => (
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
              title={copy.locationTitle}
              body={copy.locationBody}
              align="stacked"
            />
            <div className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default">
              <iframe
                title={copy.mapTitle}
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
