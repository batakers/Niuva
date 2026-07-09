import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
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
    <Component className={cn("mx-auto w-full max-w-[1280px] min-w-0 px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Component>
  );
}

export function DecorativeMotif({ className, light = false }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className)}>
      <ULineMotif light={light} className="absolute inset-0" />
      <span
        className={cn(
          "absolute bottom-[12%] right-[10%] h-16 w-16 rounded-full",
          light ? "bg-white/20" : "bg-[var(--brand-blue-light)]"
        )}
      />
      <span
        className={cn(
          "absolute bottom-[28%] right-[28%] h-5 w-5 rounded-full",
          light ? "bg-white/40" : "bg-[rgba(102,146,188,0.35)]"
        )}
      />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  body,
  primaryAction,
  secondaryAction,
  visual,
  className,
}) {
  return (
    <section className={cn("relative overflow-hidden pb-[var(--brand-page-hero-bottom)] pt-[var(--brand-page-start)]", className)}>
      <div className="absolute -right-20 top-12 h-40 w-40 rounded-full bg-[var(--brand-blue-light)] sm:h-56 sm:w-56 lg:-right-24 lg:top-20 lg:h-72 lg:w-72" />
      <ULineMotif className="absolute -bottom-20 -left-16 h-52 w-52 opacity-40 sm:-bottom-28 sm:-left-20 sm:h-64 sm:w-64 lg:-bottom-32 lg:-left-24 lg:h-80 lg:w-80 lg:opacity-50" />
      <PageContainer className="relative grid min-w-0 items-start gap-9 md:gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)] xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.78fr)]">
        <div className="brand-reveal relative z-10 min-w-0">
          {eyebrow && <p className="brand-eyebrow mb-6">{eyebrow}</p>}
          <h1 className="brand-heading max-w-5xl text-[clamp(1.95rem,5.8vw,3.65rem)] leading-[1.05] text-[var(--brand-ink)] lg:leading-[1.03]">
            {title}
          </h1>
          {body && (
            <p className="mt-6 max-w-[72ch] text-base leading-7 text-[var(--brand-muted)] md:mt-7 md:text-lg md:leading-8 lg:text-xl">
              {body}
            </p>
          )}
          {(primaryAction || secondaryAction) && (
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
        <div className="brand-reveal relative z-10 min-w-0">
          {visual || (
            <RoundedVisualFrame title="Dari riset ke realisasi" kicker="Niuva Inovasi Utama">
              <DotPagination active={1} className="[&_span]:bg-white" />
            </RoundedVisualFrame>
          )}
        </div>
      </PageContainer>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, body, className, titleClassName }) {
  return (
    <header className={cn("mb-[var(--brand-section-header-gap)] max-w-5xl", className)}>
      {eyebrow && <p className="brand-eyebrow mb-5">{eyebrow}</p>}
      {title && (
        <h2
          className={cn(
            "brand-heading text-[clamp(2rem,5.8vw,4.1rem)] leading-[1.05] text-[var(--brand-ink)]",
            titleClassName
          )}
        >
          {title}
        </h2>
      )}
      {body && (
        <p className="mt-6 max-w-[72ch] text-lg leading-8 text-[var(--brand-muted)]">
          {body}
        </p>
      )}
    </header>
  );
}

export function CTASection({
  eyebrow = "Kolaborasi",
  title,
  body,
  primaryAction,
  secondaryAction,
  className,
}) {
  return (
    <section className={cn("bg-[var(--brand-blue)] py-[var(--brand-cta-space)] text-white", className)}>
      <PageContainer>
        <div className="brand-reveal relative overflow-hidden rounded-[var(--brand-radius-outer)] bg-white p-2">
          <div className="relative overflow-hidden rounded-[var(--brand-radius-inner)] bg-[var(--brand-blue)] p-6 sm:p-8 md:p-12">
            <DecorativeMotif light className="absolute -right-20 -top-16 h-64 w-64 opacity-50 md:-right-24 md:-top-20 md:h-96 md:w-96 md:opacity-70" />
            <div className="relative z-10 max-w-4xl">
              <p className="brand-eyebrow mb-6 bg-white/20 text-white">{eyebrow}</p>
              <h2 className="brand-heading text-[clamp(2.15rem,5.8vw,4.35rem)] leading-[1.03] text-white">
                {title}
              </h2>
              {body && <p className="mt-6 max-w-[72ch] text-base leading-7 text-white/85 md:mt-7 md:text-lg md:leading-8">{body}</p>}
              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                {primaryAction}
                {secondaryAction}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export function ContactSummary({ className, contact }) {
  const items = [
    { label: "Lokasi", value: contact.location },
    { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { label: "WhatsApp", value: contact.whatsapp, href: contact.whatsappHref },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="brand-reveal rounded-[var(--brand-radius-outer)] bg-white p-2 shadow-[var(--brand-shadow-card)]">
          <div className="relative min-h-[170px] overflow-hidden rounded-[var(--brand-radius-inner)] bg-[var(--brand-offwhite)] p-5 sm:p-6">
            <span aria-hidden="true" className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--brand-blue-light)]" />
            <div className="relative z-10">
              <div className="mb-5 h-3 w-3 rounded-full bg-[var(--brand-blue)]" />
              <p className="text-sm font-semibold text-[var(--brand-blue)]">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-3 block break-words font-semibold leading-7 text-[var(--brand-ink)] transition-colors duration-300 ease-snap hover:text-[var(--brand-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
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
export { BrandButton };

