import React, { useMemo } from "react";
import { MarketingLayout } from "@/components/layout/Layout";
import { BrandButton } from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";
import { usePublicContent } from "../../lib/content";
import { usePublicSettings } from "../../lib/publicSettings";
import { useI18n } from "@/i18n";
import { getPublicPath } from "@/lib/publicRoutes";

const FAQ_ROW = "grid gap-3 border-b border-border-default py-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10";

function FaqSkeleton() {
  return (
    <>
      <p role="status" className="sr-only">Memuat pertanyaan yang sering diajukan.</p>
      <ul aria-hidden="true" className="border-t border-border-default">
        {[0, 1, 2, 3].map((row) => (
          <li key={row} className={FAQ_ROW}>
            <div className="h-5 w-3/4 rounded-sm bg-surface-muted" />
            <div className="grid gap-2">
              <div className="h-4 w-full rounded-sm bg-surface-muted" />
              <div className="h-4 w-11/12 rounded-sm bg-surface-muted" />
              <div className="h-4 w-2/3 rounded-sm bg-surface-muted" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function FaqPage() {
  const { lang, t } = useI18n();
  const contactPath = getPublicPath("contact", lang);
  const { contact } = usePublicSettings();
  const { blocks: cmsBlocks, status } = usePublicContent("faq");
  const faqs = useMemo(
    () => cmsBlocks
      .map((block) => block.fields)
      .filter((fields) => fields?.question && fields?.answer)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)),
    [cmsBlocks]
  );

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="FAQ"
          title="Pertanyaan yang sering diajukan."
          body="Ringkasan jawaban untuk pertanyaan umum seputar riset, desain, prototyping, dan kolaborasi dengan Niuva. Untuk pertanyaan spesifik, silakan hubungi tim kami langsung."
          variant="stack"
          primaryAction={<BrandButton to={contactPath}>{t("nav.discussProject")}</BrandButton>}
          showMotif={false}
        />

        <MarketingSection tone="default">
          <PageContainer>
            {/* Three distinct outcomes. Previously all of them rendered the
                "no questions yet" copy, including the in-flight one. */}
            {status === "loading" && <FaqSkeleton />}

            {status === "error" && (
              <SectionHeader
                title="Daftar pertanyaan belum bisa dimuat."
                body="Muat ulang halaman untuk mencoba lagi, atau hubungi tim Niuva langsung jika pertanyaan Anda mendesak."
                align="stacked"
              />
            )}

            {status === "invalid" && (
              <SectionHeader
                title="Data FAQ tidak dapat diverifikasi."
                body="Muat ulang halaman. Jika masalah berlanjut, hubungi tim Niuva melalui kanal resmi."
                align="stacked"
              />
            )}

            {status !== "loading" &&
              status !== "error" &&
              status !== "invalid" &&
              faqs.length === 0 && (
              <SectionHeader
                title="Pertanyaan yang sering diajukan akan tampil di sini."
                body="Hubungi tim Niuva langsung untuk pertanyaan spesifik mengenai proyek Anda."
                align="stacked"
              />
            )}

            {faqs.length > 0 && (
              <ul className="border-t border-border-default">
                {faqs.map((faq, index) => (
                  <li key={`${faq.question}-${index}`} className={`brand-reveal ${FAQ_ROW}`}>
                    <h3 className="type-heading-card text-text-primary">{faq.question}</h3>
                    <p className="type-body max-w-[64ch] text-text-secondary">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            )}
          </PageContainer>
        </MarketingSection>

        <CTASection
          eyebrow={null}
          title="Masih ada pertanyaan lain?"
          body="Sampaikan langsung ke tim Niuva melalui WhatsApp, email, atau form konsultasi."
          primaryAction={<BrandButton to={contactPath} variant="inverse">{t("nav.discussProject")}</BrandButton>}
          secondaryAction={<BrandButton href={contact.whatsappHref || contactPath} variant="secondary">{lang === "en" ? "Contact Niuva" : "Hubungi Niuva"}</BrandButton>}
          whatsappHref={contact.whatsappHref}
          email={contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
