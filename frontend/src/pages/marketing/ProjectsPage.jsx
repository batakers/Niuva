import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { MarketingLayout } from "@/components/layout/Layout";
import { HAS_CONFIGURED_BACKEND, api, resolveMediaUrl } from "../../lib/api";
import {
  BrandButton,
  ProjectCaseStudyCard,
  profileContent,
} from "../../components/brand/CompanyProfileBlocks";
import {
  BrandPage,
  CTASection,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicSettings } from "../../lib/publicSettings";

// Second case rather than the first, so the hero is not immediately repeated by
// the card directly beneath it. Left eager: it is the LCP element here.
const heroProject = profileContent.projects[1];

// Portfolio API response shape. Extra fields from the backend are allowed
// (passthrough); we only assert the keys the UI reads.
const portfolioItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title_id: z.string(),
  description_id: z.string().optional().default(""),
  category: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
}).passthrough();

const portfolioListSchema = z.array(portfolioItemSchema);

export function parsePortfolioResponse(data) {
  const result = portfolioListSchema.safeParse(data);
  if (result.success) {
    return { success: true, items: result.data };
  }
  // Do not make schema drift look like a genuine empty or partial portfolio.
  return { success: false, items: [] };
}

export default function ProjectsPage() {
  const { contact } = usePublicSettings();
  const [portfolioState, setPortfolioState] = useState({
    status: HAS_CONFIGURED_BACKEND ? "loading" : "disabled",
    items: [],
  });

  const loadPortfolio = React.useCallback(() => {
    if (!HAS_CONFIGURED_BACKEND) return undefined;
    setPortfolioState((current) => ({ ...current, status: "loading" }));
    return api.get("/portfolio").then((response) => {
      const parsed = parsePortfolioResponse(response.data);
      setPortfolioState({
        status: parsed.success ? "ready" : "invalid",
        items: parsed.items,
      });
    }).catch(() => {
      setPortfolioState((current) => ({ ...current, status: "error" }));
    });
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const projects = useMemo(
    () => (
      portfolioState.status === "disabled"
        ? profileContent.projects
        : portfolioState.items.map((item) => ({
            id: item.id,
            title: item.title_id,
            body: item.description_id,
            category: item.category,
            image: resolveMediaUrl(item.images?.[0]),
            imageAlt: `Dokumentasi ${item.title_id}`,
            imageFit: "cover",
          }))
    ),
    [portfolioState],
  );

  return (
    <MarketingLayout>
      <BrandPage>
        {/* Real project photography was already in the bundle while the hero
            showed a blue box listing category names. The evidence leads now. */}
        <PageHero
          eyebrow="Projects"
          title="Bukti produk, mobilitas, dan simulator Niuva."
          body="Halaman ini menampilkan proyek sebagai mini case study, bukan galeri visual. Setiap case menjelaskan konteks, tantangan, solusi, output, dan kapabilitas yang digunakan Niuva."
          variant="showcase"
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          visual={
            <div className="overflow-hidden rounded-card bg-surface-muted">
              <img
                src={heroProject.image}
                alt={heroProject.imageAlt}
                width={heroProject.imageWidth}
                height={heroProject.imageHeight}
                decoding="async"
                fetchPriority="high"
                className="aspect-[16/10] h-full w-full object-contain"
              />
            </div>
          }
        />

        <MarketingSection tone="default">
          <PageContainer className="relative z-10">
            <SectionHeader
              title="Empat proyek yang menunjukkan rentang kemampuan Niuva."
              body="Setiap project diringkas melalui konteks, tantangan, solusi, output, dan kapabilitas yang relevan agar calon mitra dapat menilai pendekatan kerja Niuva dengan cepat."
              align="stacked"
            />
            {portfolioState.status === "loading" && (
              <div role="status">
                <p className="sr-only">Memuat portfolio yang dipublikasikan.</p>
                <div aria-hidden="true" className="grid gap-8">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-[30rem] rounded-card" />
                  ))}
                </div>
              </div>
            )}
            {portfolioState.status === "error" && (
              <ErrorState error="Portfolio belum berhasil dimuat." onRetry={loadPortfolio} />
            )}
            {portfolioState.status === "invalid" && (
              <ErrorState
                error="Data portfolio tidak dapat diverifikasi."
                onRetry={loadPortfolio}
              >
                Muat ulang data. Jika masalah berlanjut, hubungi tim Niuva.
              </ErrorState>
            )}
            {portfolioState.status === "ready" && projects.length === 0 && (
              <EmptyState>Belum ada project yang dipublikasikan.</EmptyState>
            )}
            {portfolioState.status !== "loading" &&
              portfolioState.status !== "error" &&
              portfolioState.status !== "invalid" && (
              <div className="grid gap-12 lg:gap-16">
                {projects.map((project, index) => (
                <ProjectCaseStudyCard
                  key={project.id || project.title}
                  project={project}
                  index={index}
                  to="/contact"
                  ctaLabel="Diskusikan Project Serupa"
                />
              ))}
              </div>
            )}
          </PageContainer>
        </MarketingSection>

        <CTASection
          eyebrow={null}
          title="Diskusikan kebutuhan produk, EV, simulator, atau prototipe."
          body="Mulai dari konteks masalah, target pengguna, dan output yang dibutuhkan. Tim Niuva akan membantu membaca ruang lingkup riset, desain, teknologi, dan prototyping."
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          contactEmphasis="Pembahasan dimulai dari kebutuhan nyata, ruang lingkup teknis, dan bukti pekerjaan yang relevan."
          whatsappHref={contact.whatsappHref}
          email={contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
