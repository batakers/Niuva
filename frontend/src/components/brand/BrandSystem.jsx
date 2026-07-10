import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BrandButton,
  DotPagination,
  RoundedVisualFrame,
  ULineMotif,
} from "./CompanyProfileBlocks";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function BrandPage({ children, className }) {
  const pageRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray(".brand-reveal").forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
          }
        );
      });

      gsap.utils.toArray("[data-brand-visual]").forEach((visual) => {
        gsap.fromTo(
          visual,
          { scale: 0.96 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: visual,
              start: "top 92%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          }
        );
      });
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className={cn("brand-page w-full overflow-x-hidden", className)}>
      {children}
    </div>
  );
}

export function PageContainer({ as: Component = "div", className, children }) {
  return (
    <Component className={cn("mx-auto w-full max-w-[var(--brand-container)] min-w-0 px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Component>
  );
}

export function DecorativeMotif({ className, light = false, density = "standard" }) {
  const isSparse = density === "sparse";
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute hidden sm:block", className)}>
      <ULineMotif light={light} className={cn("absolute inset-0", isSparse && "opacity-70")} />
      <span
        className={cn(
          "absolute bottom-[12%] right-[10%] rounded-full",
          isSparse ? "h-10 w-10" : "h-16 w-16",
          light ? "bg-white/20" : "bg-[var(--brand-blue-light)]"
        )}
      />
      <span
        className={cn(
          "absolute bottom-[28%] right-[28%] rounded-full",
          isSparse ? "h-3 w-3" : "h-5 w-5",
          light ? "bg-white/40" : "bg-[rgba(102,146,188,0.35)]"
        )}
      />
    </div>
  );
}

export function PageHero({
  label,
  eyebrow,
  title,
  body,
  primaryAction,
  secondaryAction,
  visual,
  proofPanel,
  variant = "standard",
  showMotif = true,
  className,
  contentClassName,
  titleClassName,
}) {
  const labelText = label ?? eyebrow;
  const visualContent = proofPanel ?? visual;
  const variantGrid = {
    home: "min-[1100px]:grid-cols-[minmax(0,1.62fr)_minmax(320px,0.94fr)] xl:grid-cols-[minmax(0,1.66fr)_minmax(360px,0.94fr)]",
    standard: "min-[1100px]:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]",
    contact: "min-[1100px]:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.85fr)]",
  };
  const variantAlignment = {
    home: "min-[1100px]:items-center",
    standard: "min-[1100px]:items-center",
    contact: "min-[1100px]:items-center",
  };

  return (
    <section className={cn("relative overflow-hidden pb-[var(--brand-page-hero-bottom)] pt-[var(--brand-page-start)]", className)}>
      {showMotif && (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -right-20 top-12 hidden h-40 w-40 rounded-full bg-[var(--brand-blue-light)] sm:block sm:h-56 sm:w-56",
              variant === "home"
                ? "lg:-right-16 lg:top-24 lg:h-56 lg:w-56 lg:opacity-60"
                : "lg:-right-24 lg:top-20 lg:h-72 lg:w-72"
            )}
          />
          <ULineMotif
            className={cn(
              "pointer-events-none absolute -bottom-20 -left-16 hidden h-52 w-52 opacity-40 sm:block sm:-bottom-28 sm:-left-20 sm:h-64 sm:w-64",
              variant === "home"
                ? "lg:-bottom-24 lg:-left-20 lg:h-64 lg:w-64 lg:opacity-30"
                : "lg:-bottom-32 lg:-left-24 lg:h-80 lg:w-80 lg:opacity-50"
            )}
          />
        </>
      )}
      <PageContainer
        className={cn(
          "relative grid min-w-0 gap-9 md:gap-10",
          variantGrid[variant] || variantGrid.standard,
          variantAlignment[variant] || variantAlignment.standard
        )}
      >
        <div className={cn("brand-reveal relative z-10 min-w-0", contentClassName)}>
          {labelText && <p className="brand-eyebrow mb-6">{labelText}</p>}
          <h1
            className={cn(
              "brand-heading max-w-5xl text-[clamp(2.05rem,4.8vw,4rem)] leading-[1.06] text-[var(--brand-ink)] xl:leading-[1.02]",
              titleClassName
            )}
          >
            {title}
          </h1>
          {body && (
            <p className="mt-5 max-w-[64ch] text-base leading-7 text-[var(--brand-muted)] md:mt-6 md:text-lg md:leading-8">
              {body}
            </p>
          )}
          {(primaryAction || secondaryAction) && (
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4">
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
        <div className="brand-reveal relative z-10 min-w-0">
          {visualContent || (
            <RoundedVisualFrame title="Dari riset ke realisasi" kicker="Niuva Inovasi Utama">
              <DotPagination active={1} className="[&_span]:bg-white" />
            </RoundedVisualFrame>
          )}
        </div>
      </PageContainer>
    </section>
  );
}

export function SectionHeader({
  label,
  eyebrow,
  title,
  body,
  align = "left",
  metadata,
  note,
  className,
  titleClassName,
}) {
  const labelText = label ?? eyebrow;
  const alignment = {
    left: "text-left",
    center: "mx-auto text-center",
    split: "grid gap-5 min-[1100px]:max-w-none min-[1100px]:grid-cols-[1.12fr_0.88fr] min-[1100px]:items-start min-[1100px]:gap-10",
  };
  const copyAlignment = align === "center" ? "mx-auto" : "";

  return (
    <header className={cn("mb-[var(--brand-section-header-gap)] max-w-5xl", alignment[align] || alignment.left, className)}>
      <div>
        {labelText && <p className="brand-eyebrow mb-5">{labelText}</p>}
        {title && (
          <h2
            className={cn(
              "brand-heading text-[clamp(1.9rem,4.4vw,3.5rem)] leading-[1.06] text-[var(--brand-ink)]",
              align === "split" && "min-[1100px]:text-[clamp(2rem,3.4vw,3rem)]",
              titleClassName
            )}
          >
            {title}
          </h2>
        )}
      </div>
      {(body || metadata || note) && (
        <div className={cn(align === "split" && "min-[1100px]:pt-5")}>
          {metadata && <div className="mb-4 text-sm font-semibold text-[var(--brand-blue)]">{metadata}</div>}
          {body && (
            <p className={cn("mt-5 max-w-[65ch] text-base leading-8 text-[var(--brand-muted)] md:text-lg", copyAlignment, align === "split" && "mt-0")}>
              {body}
            </p>
          )}
          {note && <p className={cn("mt-4 max-w-[65ch] text-sm leading-7 text-[var(--brand-muted)]", copyAlignment)}>{note}</p>}
        </div>
      )}
    </header>
  );
}

export function CTASection({
  label,
  eyebrow = "Kolaborasi",
  title,
  body,
  primaryAction,
  secondaryAction,
  contactEmphasis,
  whatsappHref,
  email,
  showMotif = true,
  className,
}) {
  const labelText = label ?? eyebrow;
  return (
    <section className={cn("bg-[var(--brand-blue)] py-[var(--brand-cta-space)] text-white", className)}>
      <PageContainer>
        <div className="brand-reveal relative overflow-hidden rounded-[var(--brand-radius-outer)] bg-white p-1.5 shadow-[var(--brand-shadow-card)] ring-1 ring-white/40">
          <div className="relative overflow-hidden rounded-[var(--brand-radius-inner)] bg-[var(--brand-blue)] p-6 sm:p-8 md:p-12">
            {showMotif && <DecorativeMotif light density="sparse" className="-right-20 -top-16 h-64 w-64 opacity-50 md:-right-24 md:-top-20 md:h-96 md:w-96 md:opacity-70" />}
            <div className="relative z-10 grid gap-8 min-[1100px]:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.55fr)] min-[1100px]:items-end">
              <div className="max-w-4xl">
                {labelText && <p className="brand-eyebrow mb-6 bg-white/20 text-white">{labelText}</p>}
                <h2 className="brand-heading text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.05] text-white">
                  {title}
                </h2>
                {body && <p className="mt-6 max-w-[72ch] text-base leading-7 text-white/85 md:mt-7 md:text-lg md:leading-8">{body}</p>}
                <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4">
                  {primaryAction}
                  {secondaryAction}
                </div>
              </div>
              {(contactEmphasis || whatsappHref || email) && (
                <div className="rounded-[var(--brand-radius-card)] bg-white/12 p-5 ring-1 ring-white/18">
                  {contactEmphasis && <p className="text-sm font-semibold leading-6 text-white">{contactEmphasis}</p>}
                  <div className="mt-4 grid gap-3 text-sm font-semibold text-white/84">
                    {whatsappHref && <a href={whatsappHref} className="inline-flex min-h-11 items-center transition-colors hover:text-white">WhatsApp Niuva</a>}
                    {email && <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center break-words transition-colors hover:text-white">{email}</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export function ContactSummary({ className, contact, showMapLink = false }) {
  const items = [
    { label: "Lokasi", value: contact.location, href: showMapLink ? contact.mapsHref : undefined },
    { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { label: "WhatsApp", value: contact.whatsapp, href: contact.whatsappHref },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="brand-reveal rounded-[var(--brand-radius-panel)] bg-white p-1.5 shadow-[var(--brand-shadow-card)] ring-1 ring-[rgba(102,146,188,0.14)]">
          <div className="relative min-h-[170px] overflow-hidden rounded-[var(--brand-radius-inner)] bg-[var(--brand-offwhite)] p-5 sm:p-6">
            <span aria-hidden="true" className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--brand-blue-light)]" />
            <div className="relative z-10">
              <div className="mb-5 h-3 w-3 rounded-full bg-[var(--brand-blue)]" />
              <p className="text-sm font-semibold text-[var(--brand-blue)]">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-3 inline-flex min-h-11 items-center break-words font-semibold leading-7 text-[var(--brand-ink)] transition-colors duration-300 ease-snap hover:text-[var(--brand-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-3 leading-7 text-[var(--brand-ink)]">{item.value}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RequiredLabel({ children }) {
  return (
    <>
      {children} <span className="font-normal text-[var(--brand-muted)]">(wajib)</span>
    </>
  );
}

export function ContactForm({
  form,
  onChange,
  onSubmit,
  loading = false,
  needOptions = [],
  timelineOptions = [],
  className,
  submitLabel = "Kirim Permintaan",
  loadingLabel = "Mengirim",
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn("rounded-[var(--brand-radius-inner)] bg-[var(--brand-offwhite)] p-5 sm:p-6 md:p-9", className)}
      data-testid="contact-form"
      aria-describedby="contact-required-note contact-privacy-note"
    >
      <p id="contact-required-note" className="mb-6 text-sm leading-6 text-[var(--brand-muted)]">
        Semua field wajib diisi agar tim Niuva dapat meninjau brief awal dengan konteks yang cukup.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-sm font-semibold text-[var(--brand-ink)]">
            <RequiredLabel>Nama</RequiredLabel>
          </Label>
          <Input
            id="contact-name"
            data-testid="contact-name"
            value={form.name}
            onChange={onChange("name")}
            required
            aria-required="true"
            autoComplete="name"
            className="brand-field"
            placeholder="Nama lengkap"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-company" className="text-sm font-semibold text-[var(--brand-ink)]">
            <RequiredLabel>Perusahaan / Instansi</RequiredLabel>
          </Label>
          <Input
            id="contact-company"
            data-testid="contact-company"
            value={form.company}
            onChange={onChange("company")}
            required
            aria-required="true"
            autoComplete="organization"
            className="brand-field"
            placeholder="Nama perusahaan atau institusi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-sm font-semibold text-[var(--brand-ink)]">
            <RequiredLabel>Email</RequiredLabel>
          </Label>
          <Input
            id="contact-email"
            data-testid="contact-email"
            type="email"
            value={form.email}
            onChange={onChange("email")}
            required
            aria-required="true"
            autoComplete="email"
            className="brand-field"
            placeholder="nama@perusahaan.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone" className="text-sm font-semibold text-[var(--brand-ink)]">
            <RequiredLabel>Nomor WhatsApp</RequiredLabel>
          </Label>
          <Input
            id="contact-phone"
            data-testid="contact-phone"
            value={form.phone}
            onChange={onChange("phone")}
            required
            aria-required="true"
            autoComplete="tel"
            className="brand-field"
            placeholder="08xx xxxx xxxx"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-need" className="text-sm font-semibold text-[var(--brand-ink)]">
            <RequiredLabel>Jenis kebutuhan</RequiredLabel>
          </Label>
          <select
            id="contact-need"
            data-testid="contact-need"
            value={form.needType}
            onChange={onChange("needType")}
            required
            aria-required="true"
            className="brand-field h-12 w-full px-3 py-2 text-sm text-[var(--brand-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2"
          >
            {needOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-timeline" className="text-sm font-semibold text-[var(--brand-ink)]">
            <RequiredLabel>Estimasi timeline</RequiredLabel>
          </Label>
          <select
            id="contact-timeline"
            data-testid="contact-timeline"
            value={form.timeline}
            onChange={onChange("timeline")}
            required
            aria-required="true"
            className="brand-field h-12 w-full px-3 py-2 text-sm text-[var(--brand-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2"
          >
            {timelineOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Label htmlFor="contact-message" className="text-sm font-semibold text-[var(--brand-ink)]">
          <RequiredLabel>Pesan tambahan</RequiredLabel>
        </Label>
        <Textarea
          id="contact-message"
          data-testid="contact-message"
          value={form.message}
          onChange={onChange("message")}
          required
          aria-required="true"
          rows={7}
          className="brand-field min-h-[190px] resize-y py-4"
          placeholder="Jelaskan konteks, tujuan, ruang lingkup, target pengguna, bentuk hasil, atau batasan proyek."
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-[var(--brand-border)] pt-7 md:flex-row md:items-center md:justify-between">
        <p id="contact-privacy-note" className="max-w-sm text-sm leading-6 text-[var(--brand-muted)]">
          Tim Niuva akan menggunakan informasi ini hanya untuk menanggapi permintaan proyek.
        </p>
        <BrandButton type="submit" disabled={loading} aria-busy={loading} data-testid="contact-submit">
          {loading ? loadingLabel : submitLabel}
        </BrandButton>
      </div>
    </form>
  );
}
export { BrandButton };

