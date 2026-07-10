import React, { useEffect, useMemo, useState } from "react";
import { MarketingLayout } from "../../components/Layout";
import { useI18n } from "../../i18n";
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
  PageContainer,
  PageHero,
  SectionHeader,
} from "../../components/brand/BrandSystem";

function normalizeTitle(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const proofAreas = [
  {
    title: "Mobility product",
    body: "Redesign motor dan pengembangan EV menunjukkan kemampuan Niuva membaca bentuk, fungsi, dan batasan teknis produk mobilitas.",
  },
  {
    title: "Interactive simulator",
    body: "Simulator sepeda dan motor menunjukkan integrasi perangkat fisik, interaksi pengguna, dan prototyping pengalaman.",
  },
  {
    title: "Design engineering",
    body: "Setiap proyek diposisikan sebagai bukti proses: konteks, tantangan, solusi, output, dan kapabilitas yang digunakan.",
  },
];

export default function ProjectsPage() {
  const { lang } = useI18n();
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
          body: match
            ? (lang === "id" ? match.description_id : match.description_en) || project.body
            : project.body,
          image: match?.images?.[0],
          client: match?.client,
        };
      }),
    [apiProjects, lang]
  );

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          eyebrow="Projects"
          title="Bukti kapabilitas pada mobilitas, simulator, dan produk teknis."
          body="Halaman ini menampilkan proyek sebagai mini case study, bukan galeri visual. Setiap case menjelaskan konteks, tantangan, solusi, output, dan kapabilitas yang digunakan Niuva."
          primaryAction={<BrandButton to="/contact">Diskusikan Project Serupa</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          visual={
            <RoundedVisualFrame title="Selected engineering and product cases." kicker="Proof of capability">
              <div className="grid gap-3 text-sm font-semibold text-white/82">
                <span>EV and mobility development</span>
                <span>Interactive simulator prototyping</span>
                <span>Product redesign and validation</span>
              </div>
            </RoundedVisualFrame>
          }
        />

        <section className="relative bg-white py-[var(--brand-section-space)]">
          <PageContainer className="relative z-10">
            <SectionHeader
              eyebrow="Case Study Preview"
              title="Empat proyek yang menunjukkan rentang kemampuan Niuva."
              body="Setiap project diringkas melalui konteks, tantangan, solusi, output, dan kapabilitas yang relevan agar calon mitra dapat menilai pendekatan kerja Niuva dengan cepat."
              align="split"
            />
            <div className="grid gap-6">
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
        </section>

        <section className="bg-[var(--brand-blue-bg)] py-[var(--brand-section-space)]">
          <PageContainer>
            <SectionHeader
              eyebrow="What The Work Proves"
              title="Project Niuva dibaca sebagai bukti proses, bukan sekadar portofolio."
              body="Rangkaian proyek ini menunjukkan cara Niuva menghubungkan riset, design engineering, perangkat fisik, prototyping, dan validasi pengalaman untuk kebutuhan B2B."
              align="split"
            />
            <div className="grid border-y border-[var(--brand-border)] lg:grid-cols-3">
              {proofAreas.map((area) => (
                <article
                  key={area.title}
                  className="brand-reveal border-b border-[var(--brand-border)] py-6 last:border-b-0 lg:border-b-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
                >
                  <span aria-hidden="true" className="mb-6 block h-3 w-3 rounded-full bg-[var(--brand-blue)]" />
                  <h3 className="brand-heading text-2xl leading-tight text-[var(--brand-ink)] sm:text-3xl">
                    {area.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[var(--brand-muted)]">{area.body}</p>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>

        <CTASection
          title="Diskusikan kebutuhan produk, EV, simulator, atau prototipe."
          body="Mulai dari konteks masalah, target pengguna, dan output yang dibutuhkan. Tim Niuva akan membantu membaca ruang lingkup riset, desain, teknologi, dan prototyping."
          primaryAction={<BrandButton to="/contact" variant="inverse">Diskusikan Project Serupa</BrandButton>}
          secondaryAction={<BrandButton to="/capabilities" variant="secondary">Lihat Capabilities</BrandButton>}
          contactEmphasis="Pembahasan dimulai dari kebutuhan nyata, ruang lingkup teknis, dan bukti pekerjaan yang relevan."
          whatsappHref={profileContent.contact.whatsappHref}
          email={profileContent.contact.email}
        />
      </BrandPage>
    </MarketingLayout>
  );
}