import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { LogoWordmark } from "@/components/brand/Logo";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { cn } from "@/lib/utils";

const AUDIENCE_CONTENT = {
  customer: {
    eyebrow: "Akun pelanggan",
    heading: "Pesanan Anda, dalam satu tempat.",
    tagline:
      "Pantau status, file, pembayaran, dan perkembangan pesanan yang terhubung dengan akun Anda.",
    note: "Informasi pelanggan tetap terpisah dari ruang kerja internal Niuva.",
  },
  staff: {
    eyebrow: "Admin Studio",
    heading: "Ruang kerja operasional Niuva.",
    tagline:
      "Masuk untuk menangani pekerjaan sesuai peran, izin, dan tanggung jawab akun Anda.",
    note: "Akses internal mengikuti peran dan izin yang ditetapkan untuk akun.",
  },
  recovery: {
    eyebrow: "Pemulihan akun",
    heading: "Kembali ke akun Anda dengan langkah yang jelas.",
    tagline:
      "Minta atau gunakan link reset untuk membuat password baru tanpa mengubah alur keamanan akun.",
    note: "Ikuti petunjuk pada layar. Link yang tidak valid dapat diminta ulang.",
  },
};

export function AuthShell({
  children,
  audience = "staff",
  heading,
  tagline,
}) {
  const content = AUDIENCE_CONTENT[audience] || AUDIENCE_CONTENT.recovery;

  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <main className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)]">
        <section className="hidden border-r border-border-default px-10 py-12 lg:flex lg:flex-col xl:px-16">
          <Link
            to="/"
            className="inline-flex w-fit items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-4 focus-visible:ring-offset-surface-page"
            aria-label="Kembali ke situs Niuva"
          >
            <LogoWordmark className="h-9 text-text-primary" />
          </Link>

          <div className="my-auto max-w-xl py-16">
            <p className="type-label text-action-primary">{content.eyebrow}</p>
            <h2 className="mt-5 font-heading text-4xl font-bold leading-tight tracking-tight text-text-primary xl:text-5xl">
              {heading || content.heading}
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-text-secondary">
              {tagline || content.tagline}
            </p>
          </div>

          <p className="max-w-lg border-t border-border-default pt-6 text-sm leading-6 text-text-secondary">
            {content.note}
          </p>
        </section>

        <section className="flex min-h-screen flex-col px-4 py-6 sm:px-8 sm:py-10 lg:justify-center lg:px-10">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <LogoWordmark className="h-8 text-text-primary" />
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali ke situs
            </Link>
          </div>

          <div className="mx-auto w-full max-w-md">{children}</div>
        </section>
      </main>
    </div>
  );
}

export const AuthCard = React.forwardRef(
  (
    {
      eyebrow,
      title,
      description,
      children,
      className,
      contentClassName,
      ...props
    },
    ref
  ) => (
    <SurfacePanel
      ref={ref}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <div className={cn("p-6 sm:p-8", contentClassName)}>
        {eyebrow && (
          <p className="type-label text-action-primary">{eyebrow}</p>
        )}
        {title && (
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
        )}
        {description && (
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        )}
        <div className={cn((eyebrow || title || description) && "mt-8")}>
          {children}
        </div>
      </div>
    </SurfacePanel>
  )
);
AuthCard.displayName = "AuthCard";
