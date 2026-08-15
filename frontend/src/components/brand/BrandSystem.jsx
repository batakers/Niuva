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

export function BrandPage({ children, className, revealSections = true }) {
  const pageRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      pageRef.current?.classList.add("brand-motion-ready");

      // Hero copy resolves on mount rather than on scroll: it is already in the
      // viewport, so a scroll trigger would either fire instantly with no
      // sequence or not at all.
      const heroEntry = pageRef.current?.querySelectorAll("[data-hero-entry]");
      if (heroEntry?.length) {
        gsap.fromTo(
          heroEntry,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09 }
        );
      }

      if (revealSections) {
        // Legacy public routes retain their current reveal contract. Home opts
        // out because the approved composition permits a concise hero entrance,
        // not an animation repeated on every section.
        ScrollTrigger.batch(".brand-reveal", {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 28 },
              {
                opacity: 1,
                y: 0,
                duration: 0.75,
                ease: "power3.out",
                stagger: 0.08,
                overwrite: true,
              }
            ),
        });
      }

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

      return () => pageRef.current?.classList.remove("brand-motion-ready");
    },
    { scope: pageRef }
  );

  return (
    <div
      ref={pageRef}
      className={cn(
        "brand-page w-full overflow-x-hidden",
        !revealSections && "brand-static-reveal",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageContainer({ as: Component = "div", className, children }) {
  return (
    <Component className={cn("mx-auto w-full max-w-[var(--container-wide)] min-w-0 px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Component>
  );
}

const marketingSectionSpacing = {
  standard: "marketing-section-standard",
  compact: "marketing-section-compact",
  none: "marketing-section-none",
};

const marketingSectionTone = {
  page: "bg-surface-page",
  default: "bg-surface-default",
  muted: "bg-surface-muted",
};

export function MarketingSection({
  spacing = "standard",
  tone = "default",
  dividerTop = false,
  noTop = false,
  noBottom = false,
  className,
  children,
  ...props
}) {
  return (
    <section
      className={cn(
        "relative",
        marketingSectionSpacing[spacing] || marketingSectionSpacing.standard,
        marketingSectionTone[tone] || marketingSectionTone.default,
        dividerTop && "border-t border-border-default",
        noTop && "pt-0",
        noBottom && "pb-0",
        className
      )}
      data-marketing-section="true"
      data-spacing={spacing}
      data-tone={tone}
      {...props}
    >
      {children}
    </section>
  );
}

// DecorativeMotif was removed. It was the vehicle for nine repeated U-curve
// placements across the public pages, which DEC-UX-002 rules out as ornament.
// The U-curve returns only when it is built as the semantic
// Need -> Research -> Experiment -> Prototype -> Output path, under its own
// authorization.

// `standard` is frozen: PrivacyPolicyPage and NotFoundPage render through it,
// and both sit outside the approved redesign scope. Every new public
// composition gets its own name so those two pages cannot shift. The previous
// home/standard/contact trio all mapped to identical geometry, which is why the
// six public heroes looked the same; each entry below now differs for real.
const heroVariants = {
  standard: {
    grid: "xl:grid-cols-[minmax(0,1.62fr)_minmax(320px,1fr)]",
    alignment: "xl:items-center",
    title: "type-heading-page",
    titleWidth: "max-w-5xl",
    bodyWidth: "max-w-[64ch]",
    visual: "side",
    entry: "wrapper",
  },
  home: {
    grid: "xl:grid-cols-[minmax(0,1.42fr)_minmax(340px,1fr)]",
    alignment: "xl:items-end",
    title: "type-display-home",
    titleWidth: "max-w-[26ch]",
    bodyWidth: "max-w-[58ch]",
    visual: "side",
    entry: "children",
  },
  // Contact leads with the copy; the channel panel is the smaller partner.
  contact: {
    grid: "xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)]",
    alignment: "xl:items-start",
    title: "type-heading-page",
    titleWidth: "max-w-[24ch]",
    bodyWidth: "max-w-[54ch]",
    visual: "side",
    entry: "children",
  },
  // Capabilities: near-even pair. The copy column has to stay wide enough to
  // hold the headline to two lines, which is what sets the ratio.
  index: {
    grid: "xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
    alignment: "xl:items-center",
    title: "type-heading-page",
    titleWidth: "max-w-[30ch]",
    bodyWidth: "max-w-[56ch]",
    visual: "side",
    entry: "children",
  },
  // Projects: the evidence still leads, but not at the cost of a third line.
  showcase: {
    grid: "xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
    alignment: "xl:items-end",
    title: "type-heading-page",
    titleWidth: "max-w-[30ch]",
    bodyWidth: "max-w-[52ch]",
    visual: "side",
    entry: "children",
  },
  // About and FAQ: one column, no visual slot. FAQ previously fell through to a
  // placeholder panel it never asked for. The measure is set by About's
  // headline, whose best two-line split needs roughly 714px to avoid a third.
  stack: {
    grid: "",
    alignment: "",
    title: "type-heading-page",
    titleWidth: "max-w-[28ch]",
    bodyWidth: "max-w-[62ch]",
    visual: "none",
    entry: "children",
  },
};

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
  const config = heroVariants[variant] || heroVariants.standard;
  const staggered = config.entry === "children";
  // Legacy path reveals the whole column at once; new variants cascade their
  // own children on mount, so the wrapper must not also animate.
  const entryProps = staggered ? { "data-hero-entry": "" } : {};

  const visualSlot =
    config.visual === "none" ? null : (
      <div className={cn("relative z-10 min-w-0", staggered ? "" : "brand-reveal")} {...entryProps}>
        {visualContent || (
          <RoundedVisualFrame title="Dari riset ke realisasi" kicker="Niuva Inovasi Utama">
            <DotPagination active={1} className="[&_span]:bg-surface-default" />
          </RoundedVisualFrame>
        )}
      </div>
    );

  return (
    <section className={cn("marketing-page-hero relative overflow-hidden", className)} data-marketing-section="hero">
      {showMotif && (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -right-20 top-12 hidden h-40 w-40 rounded-full bg-decoration-brand-soft sm:block sm:h-56 sm:w-56",
              variant === "home"
                ? "lg:-right-16 lg:top-24 lg:h-56 lg:w-56 lg:opacity-60"
                : "lg:-right-24 lg:top-20 lg:h-72 lg:w-72"
            )}
          />
          {/* DEC-UX-002 forbids repeating the U-curve as ornament, so the new
              public variants drop it. `standard` keeps it because NotFoundPage
              renders through that path and must not change. */}
          {variant === "standard" && (
            <ULineMotif className="pointer-events-none absolute -bottom-20 -left-16 hidden h-52 w-52 opacity-40 sm:block sm:-bottom-28 sm:-left-20 sm:h-64 sm:w-64 lg:-bottom-32 lg:-left-24 lg:h-80 lg:w-80 lg:opacity-50" />
          )}
        </>
      )}
      <PageContainer
        className={cn(
          "relative grid min-w-0 gap-9 md:gap-10",
          config.grid,
          config.alignment
        )}
      >
        <div className={cn("relative z-10 min-w-0", staggered ? "" : "brand-reveal", contentClassName)}>
          {labelText && (
            <p className="brand-eyebrow mb-6" {...entryProps}>
              {labelText}
            </p>
          )}
          <h1
            className={cn(config.titleWidth, "text-text-primary", config.title, titleClassName)}
            {...entryProps}
          >
            {title}
          </h1>
          {body && (
            <p
              className={cn(
                "mt-5 text-base leading-7 text-text-secondary md:mt-6 md:text-lg md:leading-8",
                config.bodyWidth
              )}
              {...entryProps}
            >
              {body}
            </p>
          )}
          {(primaryAction || secondaryAction) && (
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4" {...entryProps}>
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
        {visualSlot}
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
    // `split` is the "big headline left, small explainer right" pattern. It is
    // frozen rather than fixed because PrivacyPolicyPage uses it seven times.
    // In-scope pages move to `stacked`, which keeps one focused column.
    split: "grid gap-5 xl:max-w-none xl:grid-cols-[1.12fr_0.88fr] xl:items-start xl:gap-10",
    stacked: "max-w-3xl",
  };
  const copyAlignment = align === "center" ? "mx-auto" : "";

  return (
    <header className={cn("mb-8 max-w-5xl md:mb-10 xl:mb-12", alignment[align] || alignment.left, className)}>
      {align === "split" && labelText && (
        <p className="brand-eyebrow justify-self-start xl:col-span-2">{labelText}</p>
      )}
      <div>
        {align !== "split" && labelText && <p className="brand-eyebrow mb-5">{labelText}</p>}
        {title && (
          <h2
            className={cn(
              "type-heading-section text-text-primary",
              titleClassName
            )}
          >
            {title}
          </h2>
        )}
      </div>
      {(body || metadata || note) && (
        <div>
          {metadata && <div className="mb-4 text-sm font-semibold text-text-secondary">{metadata}</div>}
          {body && (
            <p className={cn("mt-5 max-w-[65ch] text-base leading-8 text-text-secondary md:text-lg", copyAlignment, align === "split" && "mt-0")}>
              {body}
            </p>
          )}
          {note && <p className={cn("mt-4 max-w-[65ch] text-sm leading-7 text-text-secondary", copyAlignment)}>{note}</p>}
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
  variant = "contained",
  className,
}) {
  const labelText = label ?? eyebrow;
  if (variant === "open") {
    return (
      <section
        className={cn(
          "marketing-section-standard border-t border-border-default bg-surface-default",
          className
        )}
        data-marketing-section="cta"
        data-spacing="standard"
        data-cta-variant="open"
      >
        <PageContainer>
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.52fr)] xl:items-end xl:gap-14">
            <div className="max-w-4xl">
              {labelText && <p className="brand-eyebrow mb-6">{labelText}</p>}
              <h2 className="type-heading-section text-text-primary">{title}</h2>
              {body && (
                <p className="mt-5 max-w-[68ch] text-base leading-8 text-text-secondary md:text-lg">
                  {body}
                </p>
              )}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
                {primaryAction}
                {secondaryAction}
              </div>
            </div>
            {(contactEmphasis || whatsappHref || email) && (
              <div className="border-t border-border-default pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
                {contactEmphasis && (
                  <p className="text-sm font-semibold leading-6 text-text-primary">
                    {contactEmphasis}
                  </p>
                )}
                <div className="mt-4 grid gap-2 text-sm font-semibold text-text-secondary">
                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      className="inline-flex min-h-11 items-center transition-colors hover:text-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    >
                      WhatsApp Niuva
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex min-h-11 items-center break-words transition-colors hover:text-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    >
                      {email}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </PageContainer>
      </section>
    );
  }

  return (
    <section className={cn("marketing-section-standard bg-action-primary text-text-inverse", className)} data-marketing-section="cta" data-spacing="standard">
      <PageContainer>
        <div className="brand-reveal relative overflow-hidden rounded-feature bg-surface-default p-1.5 shadow-surface ring-1 ring-white/40">
          <div className="relative overflow-hidden rounded-card bg-action-primary p-6 sm:p-8 md:p-12">
            <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.55fr)] xl:items-end">
              <div className="max-w-4xl">
                {labelText && <p className="brand-eyebrow mb-6 bg-white/20 text-text-inverse">{labelText}</p>}
                <h2 className="type-heading-section text-text-inverse">
                  {title}
                </h2>
                {body && <p className="mt-4 max-w-[72ch] text-base leading-7 text-text-inverse md:text-lg md:leading-8">{body}</p>}
                <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                  {primaryAction}
                  {secondaryAction}
                </div>
              </div>
              {(contactEmphasis || whatsappHref || email) && (
                <div className="border-t border-decoration-inverse-line pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
                  {contactEmphasis && <p className="text-sm font-semibold leading-6 text-text-inverse">{contactEmphasis}</p>}
                  <div className="mt-4 grid gap-3 text-sm font-semibold text-text-inverse">
                    {whatsappHref && <a href={whatsappHref} className="inline-flex min-h-11 items-center transition-colors hover:text-text-inverse">WhatsApp Niuva</a>}
                    {email && <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center break-words transition-colors hover:text-text-inverse">{email}</a>}
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
    { label: "Email", value: contact.email, href: contact.email ? `mailto:${contact.email}` : undefined },
    { label: "WhatsApp", value: contact.whatsapp, href: contact.whatsappHref },
  ].filter((item) => item.value);

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="brand-reveal border-t-2 border-brand-secondary pt-5">
          <p className="type-label text-text-secondary">{item.label}</p>
          {item.href ? (
            <a
              href={item.href}
              className="mt-2 inline-flex min-h-11 items-center break-words font-semibold leading-7 text-text-primary transition-colors duration-emphasis ease-snap hover:text-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              {item.value}
            </a>
          ) : (
            <p className="mt-2 leading-7 text-text-primary">{item.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function RequiredLabel({ children }) {
  return (
    <>
      {children} <span className="font-normal text-text-secondary">(wajib)</span>
    </>
  );
}

// Errors were toast-only, so they were unreachable for a screen-reader user and
// gone before the visitor got back to the field. The message now sits under its
// own input and is wired through aria-describedby.
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="type-body-small font-semibold text-status-error">
      {message}
    </p>
  );
}

function describedBy(fieldId, message) {
  return message ? `${fieldId}-error` : undefined;
}

export function ContactForm({
  form,
  onChange,
  onSubmit,
  loading = false,
  needOptions = [],
  timelineOptions = [],
  errors = {},
  className,
  submitLabel = "Kirim Permintaan",
  loadingLabel = "Mengirim",
}) {
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form
      onSubmit={onSubmit}
      className={cn("rounded-card bg-surface-page p-5 sm:p-6 md:p-9", className)}
      data-testid="contact-form"
      data-ph-no-capture
      data-private
      noValidate
      aria-describedby="contact-required-note contact-privacy-note"
    >
      <p id="contact-required-note" className="mb-6 text-sm leading-6 text-text-secondary">
        Semua field wajib diisi agar tim Niuva dapat meninjau brief awal dengan konteks yang cukup.
      </p>

      {/* Announced once per failed submit. Individual messages sit with their
          own field; this only tells a screen-reader user that something needs
          attention before they walk back through the form. */}
      <p role="alert" aria-live="polite" className="sr-only">
        {errorCount > 0 ? `Ada ${errorCount} field yang perlu diperbaiki.` : ""}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-sm font-semibold text-text-primary">
            <RequiredLabel>Nama</RequiredLabel>
          </Label>
          <Input
            id="contact-name"
            data-testid="contact-name"
            value={form.name}
            onChange={onChange("name")}
            required
            aria-required="true"
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={describedBy("contact-name", errors.name)}
            autoComplete="name"
            className="brand-field"
            placeholder="Nama lengkap"
          />
          <FieldError id="contact-name-error" message={errors.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-company" className="text-sm font-semibold text-text-primary">
            <RequiredLabel>Perusahaan / Instansi</RequiredLabel>
          </Label>
          <Input
            id="contact-company"
            data-testid="contact-company"
            value={form.company}
            onChange={onChange("company")}
            required
            aria-required="true"
            aria-invalid={errors.company ? "true" : undefined}
            aria-describedby={describedBy("contact-company", errors.company)}
            autoComplete="organization"
            className="brand-field"
            placeholder="Nama perusahaan atau institusi"
          />
          <FieldError id="contact-company-error" message={errors.company} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-sm font-semibold text-text-primary">
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
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={describedBy("contact-email", errors.email)}
            autoComplete="email"
            className="brand-field"
            placeholder="nama@perusahaan.com"
          />
          <FieldError id="contact-email-error" message={errors.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone" className="text-sm font-semibold text-text-primary">
            <RequiredLabel>Nomor WhatsApp</RequiredLabel>
          </Label>
          <Input
            id="contact-phone"
            data-testid="contact-phone"
            value={form.phone}
            onChange={onChange("phone")}
            required
            aria-required="true"
            aria-invalid={errors.phone ? "true" : undefined}
            aria-describedby={describedBy("contact-phone", errors.phone)}
            autoComplete="tel"
            className="brand-field"
            placeholder="08xx xxxx xxxx"
          />
          <FieldError id="contact-phone-error" message={errors.phone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-need" className="text-sm font-semibold text-text-primary">
            <RequiredLabel>Jenis kebutuhan</RequiredLabel>
          </Label>
          <select
            id="contact-need"
            data-testid="contact-need"
            value={form.needType}
            onChange={onChange("needType")}
            required
            aria-required="true"
            className="brand-field h-12 w-full px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          >
            {needOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-timeline" className="text-sm font-semibold text-text-primary">
            <RequiredLabel>Estimasi timeline</RequiredLabel>
          </Label>
          <select
            id="contact-timeline"
            data-testid="contact-timeline"
            value={form.timeline}
            onChange={onChange("timeline")}
            required
            aria-required="true"
            className="brand-field h-12 w-full px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          >
            {timelineOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Label htmlFor="contact-message" className="text-sm font-semibold text-text-primary">
          <RequiredLabel>Pesan tambahan</RequiredLabel>
        </Label>
        <Textarea
          id="contact-message"
          data-testid="contact-message"
          value={form.message}
          onChange={onChange("message")}
          required
          aria-required="true"
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={describedBy("contact-message", errors.message)}
          rows={7}
          className="brand-field min-h-[190px] resize-y py-4"
          placeholder="Jelaskan konteks, tujuan, ruang lingkup, target pengguna, bentuk hasil, atau batasan proyek."
        />
        <FieldError id="contact-message-error" message={errors.message} />
      </div>

      {/* DEC-UX-003 fixes this copy. It is the consent the backend now requires,
          so it stays verbatim rather than being reworded per surface. */}
      <div className="mt-8 border-t border-border-default pt-7">
        <div className="flex gap-3">
          <input
            id="contact-consent"
            data-testid="contact-consent"
            type="checkbox"
            checked={Boolean(form.consent)}
            onChange={onChange("consent")}
            required
            aria-required="true"
            aria-invalid={errors.consent ? "true" : undefined}
            aria-describedby={describedBy("contact-consent", errors.consent)}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          />
          <Label
            htmlFor="contact-consent"
            className="cursor-pointer text-sm font-normal leading-6 text-text-secondary"
          >
            Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan
            menghubungi saya terkait kebutuhan yang saya kirim. Data tidak
            digunakan untuk marketing tanpa persetujuan terpisah.
          </Label>
        </div>
        <FieldError id="contact-consent-error" message={errors.consent} />
      </div>

      <div className="mt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p id="contact-privacy-note" className="max-w-sm text-sm leading-6 text-text-secondary">
          Target respons pertama dari tim: satu hari kerja (Senin&ndash;Jumat,
          09.00&ndash;17.00 WIB, di luar hari libur nasional). Ini bukan
          penawaran harga atau jaminan pengiriman.
        </p>
        <BrandButton type="submit" disabled={loading} aria-busy={loading} data-testid="contact-submit">
          {loading ? loadingLabel : submitLabel}
        </BrandButton>
      </div>
    </form>
  );
}
export { BrandButton };
