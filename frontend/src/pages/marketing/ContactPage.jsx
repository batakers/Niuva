import React, { useState } from "react";
import { toast } from "sonner";
import { MarketingLayout } from "../../components/Layout";
import { useI18n } from "../../i18n";
import { api, formatApiError } from "../../lib/api";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  BrandButton,
  RoundedVisualFrame,
  SectionShell,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  ContactSummary,
  CTASection,
  PageHero,
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
          title="Mulai konsultasi proyek dengan konteks yang jelas."
          body="Sampaikan kebutuhan, tujuan, ruang lingkup, target hasil, dan batasan proyek. Tim Niuva akan meninjau permintaan untuk menentukan langkah awal yang relevan."
          primaryAction={<BrandButton href={profileContent.contact.whatsappHref}>Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href="#form-konsultasi" variant="secondary">Isi Formulir</BrandButton>}
          visual={
            <RoundedVisualFrame title="Rumuskan langkah awal yang tepat" kicker="Konsultasi proyek">
              <p className="max-w-sm text-base leading-7 text-white/80">
                Permintaan dapat mencakup riset, konsultasi, workshop, desain produk, prototyping, apparel, merchandise, atau kolaborasi lintas disiplin.
              </p>
            </RoundedVisualFrame>
          }
        />

        <SectionShell
          eyebrow="Informasi Kontak"
          title="Hubungi tim Niuva."
          body="Gunakan WhatsApp, email, atau formulir untuk menjelaskan kebutuhan riset, desain, prototyping, workshop, apparel, atau merchandise. Kunjungan dan pertemuan proyek dilakukan berdasarkan janji."
          className="bg-[var(--brand-blue-bg)]"
        >
          <ContactSummary contact={profileContent.contact} />
          <div className="brand-reveal mt-6 overflow-hidden rounded-[var(--brand-radius-outer)] bg-white p-2 shadow-[var(--brand-shadow-card)]">
            <iframe
              title="Lokasi Niuva di Bandung Techno Park"
              src={profileContent.contact.mapsEmbed}
              className="h-[320px] w-full rounded-[var(--brand-radius-inner)] border-0 md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </SectionShell>

        <SectionShell
          id="form-konsultasi"
          eyebrow="Formulir Konsultasi"
          title="Berikan konteks singkat agar respons awal lebih tepat."
          body="Informasi mengenai tujuan, ruang lingkup, bentuk hasil, target pengguna, dan batasan waktu membantu tim memahami kebutuhan sebelum percakapan lanjutan."
          className="bg-white"
        >
          <div className="grid gap-6 md:gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <RoundedVisualFrame
              title="Konteks awal untuk permintaan proyek"
              kicker="Konsultasi awal"
              className="brand-reveal"
            >
              <p className="max-w-sm text-base leading-7 text-white/80">
                Sertakan tujuan, ruang lingkup, target pengguna, bentuk hasil, dan batasan waktu bila sudah tersedia.
              </p>
            </RoundedVisualFrame>

            <div className="brand-reveal rounded-[var(--brand-radius-outer)] bg-[var(--brand-blue-bg)] p-2">
              <form
                onSubmit={submit}
                className="rounded-[var(--brand-radius-inner)] bg-[var(--brand-offwhite)] p-5 sm:p-6 md:p-9"
                data-testid="contact-form"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-sm font-semibold text-[var(--brand-ink)]">Nama</Label>
                    <Input
                      id="contact-name"
                      data-testid="contact-name"
                      value={form.name}
                      onChange={set("name")}
                      required
                      autoComplete="name"
                      className="brand-field"
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-company" className="text-sm font-semibold text-[var(--brand-ink)]">Perusahaan / Instansi</Label>
                    <Input
                      id="contact-company"
                      data-testid="contact-company"
                      value={form.company}
                      onChange={set("company")}
                      required
                      autoComplete="organization"
                      className="brand-field"
                      placeholder="Nama perusahaan atau institusi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-sm font-semibold text-[var(--brand-ink)]">Email</Label>
                    <Input
                      id="contact-email"
                      data-testid="contact-email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      required
                      autoComplete="email"
                      className="brand-field"
                      placeholder="nama@perusahaan.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone" className="text-sm font-semibold text-[var(--brand-ink)]">Nomor WhatsApp</Label>
                    <Input
                      id="contact-phone"
                      data-testid="contact-phone"
                      value={form.phone}
                      onChange={set("phone")}
                      required
                      autoComplete="tel"
                      className="brand-field"
                      placeholder="08xx xxxx xxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-need" className="text-sm font-semibold text-[var(--brand-ink)]">Jenis kebutuhan</Label>
                    <select
                      id="contact-need"
                      data-testid="contact-need"
                      value={form.needType}
                      onChange={set("needType")}
                      required
                      className="brand-field flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[var(--brand-ink)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2"
                    >
                      {needOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-timeline" className="text-sm font-semibold text-[var(--brand-ink)]">Estimasi timeline</Label>
                    <select
                      id="contact-timeline"
                      data-testid="contact-timeline"
                      value={form.timeline}
                      onChange={set("timeline")}
                      required
                      className="brand-field flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[var(--brand-ink)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2"
                    >
                      {timelineOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="contact-message" className="text-sm font-semibold text-[var(--brand-ink)]">Pesan tambahan</Label>
                  <Textarea
                    id="contact-message"
                    data-testid="contact-message"
                    value={form.message}
                    onChange={set("message")}
                    required
                    rows={7}
                    className="brand-field min-h-[190px] resize-y py-4"
                    placeholder="Jelaskan konteks, tujuan, ruang lingkup, target pengguna, bentuk hasil, atau batasan proyek."
                  />
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-[var(--brand-border)] pt-7 md:flex-row md:items-center md:justify-between">
                  <p className="max-w-sm text-sm leading-6 text-[var(--brand-muted)]">
                    Tim Niuva akan menggunakan informasi ini hanya untuk menanggapi permintaan proyek.
                  </p>
                  <BrandButton type="submit" disabled={loading} data-testid="contact-submit">
                    {loading ? "Mengirim" : "Kirim Permintaan"}
                  </BrandButton>
                </div>
              </form>
            </div>
          </div>
        </SectionShell>

        <CTASection
          eyebrow="Kolaborasi"
          title="Diskusikan kebutuhan riset, desain, atau prototyping Anda bersama Niuva."
          body="Hubungi Niuva melalui WhatsApp atau email resmi. Tim akan meninjau konteks awal sebelum mengatur percakapan lanjutan."
          primaryAction={<BrandButton href={profileContent.contact.whatsappHref} variant="secondary">WhatsApp Niuva</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
