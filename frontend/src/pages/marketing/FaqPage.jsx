import React, { useMemo } from "react";
import { MarketingLayout } from "@/components/layout/Layout";
import { BrandButton, profileContent } from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";
import { usePublicContent } from "../../lib/content";

export default function FaqPage() {
  const cmsBlocks = usePublicContent("faq");
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
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          showMotif={false}
        />

        <MarketingSection tone="default">
          <PageContainer>
            {faqs.length === 0 ? (
              <SectionHeader
                eyebrow="Belum ada FAQ"
                title="Pertanyaan yang sering diajukan akan tampil di sini."
                body="Hubungi tim Niuva langsung untuk pertanyaan spesifik mengenai proyek Anda."
                align="split"
              />
            ) : (
              <div className="grid gap-5">
                {faqs.map((faq, index) => (
                  <article key={`${faq.question}-${index}`} className="brand-reveal overflow-hidden rounded-card border border-border-default bg-surface-default p-6 sm:p-7">
                    <h3 className="type-heading-card text-text-primary">{faq.question}</h3>
                    <p className="mt-3 text-base leading-7 text-text-secondary">{faq.answer}</p>
                  </article>
                ))}
              </div>
            )}
          </PageContainer>
        </MarketingSection>

        <CTASection
          title="Masih ada pertanyaan lain?"
          body="Sampaikan langsung ke tim Niuva melalui WhatsApp, email, atau form konsultasi."
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton href={profileContent.contact.whatsappHref} variant="secondary">Hubungi Niuva</BrandButton>}
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
