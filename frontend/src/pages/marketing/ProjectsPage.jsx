import React, { useEffect, useMemo, useState } from "react";
import { MarketingLayout } from "@/components/layout/Layout";
import { HAS_CONFIGURED_BACKEND, api } from "../../lib/api";
import {
  BrandButton,
  ProjectCaseStudyCard,
  RoundedVisualFrame,
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

function normalizeTitle(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export default function ProjectsPage() {
  const [apiProjects, setApiProjects] = useState([]);

  useEffect(() => {
    if (!HAS_CONFIGURED_BACKEND) return undefined;

    let mounted = true;
    api.get("/portfolio").then((response) => {
      if (mounted) setApiProjects(response.data);
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const projects = useMemo(
    () =>
      profileContent.projects.map((project) => {
        const target = normalizeTitle(project.title);
        const match = apiProjects.find((item) => {
          const idTitle = normalizeTitle(item.title_id);
          const enTitle = normalizeTitle(item.title_en);
          return (
            (idTitle && (idTitle.includes(target) || target.includes(idTitle))) ||
            (enTitle && (enTitle.includes(target) || target.includes(enTitle)))
          );
        });

        return {
          ...project,
          body: match?.description_id || project.body,
          image: match?.images?.[0] || project.image,
          imageWidth: match?.images?.[0] ? undefined : project.imageWidth,
          imageHeight: match?.images?.[0] ? undefined : project.imageHeight,
          imageAlt: match?.images?.[0] ? `Dokumentasi ${project.title}` : project.imageAlt,
          imageFit: match?.images?.[0] ? "cover" : project.imageFit,
          client: match?.client,
        };
      }),
    [apiProjects]
  );

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Projects"
          title="Bukti produk, mobilitas, dan simulator Niuva."
          body="Halaman ini menampilkan proyek sebagai mini case study, bukan galeri visual. Setiap case menjelaskan konteks, tantangan, solusi, output, dan kapabilitas yang digunakan Niuva."
          primaryAction={<BrandButton to="/contact">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          visual={
            <RoundedVisualFrame title="Empat proyek sebagai bukti proses dan kapabilitas." kicker="Bukti pekerjaan">
              <div className="grid gap-3 text-sm font-semibold text-text-inverse">
                <span>Mobilitas dan EV</span>
                <span>Simulator interaktif</span>
                <span>Redesain dan validasi produk</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        <MarketingSection tone="default">
          <PageContainer className="relative z-10">
            <SectionHeader
              eyebrow="Studi kasus"
              title="Empat proyek yang menunjukkan rentang kemampuan Niuva."
              body="Setiap project diringkas melalui konteks, tantangan, solusi, output, dan kapabilitas yang relevan agar calon mitra dapat menilai pendekatan kerja Niuva dengan cepat."
              align="split"
            />
            <div className="grid gap-12 lg:gap-16">
              {projects.map((project, index) => (
                <ProjectCaseStudyCard
                  key={project.title}
                  project={project}
                  index={index}
                  to="/contact"
                  ctaLabel="Diskusikan Project Serupa"
                />
              ))}
            </div>
          </PageContainer>
        </MarketingSection>

        <CTASection
          title="Diskusikan kebutuhan produk, EV, simulator, atau prototipe."
          body="Mulai dari konteks masalah, target pengguna, dan output yang dibutuhkan. Tim Niuva akan membantu membaca ruang lingkup riset, desain, teknologi, dan prototyping."
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          contactEmphasis="Pembahasan dimulai dari kebutuhan nyata, ruang lingkup teknis, dan bukti pekerjaan yang relevan."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}
