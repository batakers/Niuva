import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Boxes, Printer, GraduationCap, Upload, Clock } from "lucide-react";
import { useI18n } from "../i18n";
import { PublicLayout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";

const PILLARS = [
  { icon: Car, k: "ev" },
  { icon: Boxes, k: "proto" },
  { icon: Printer, k: "print" },
  { icon: GraduationCap, k: "hr" },
];

const PARTNERS = ["Telkom University", "Bandung Techno Park", "TelU Makerspace"];
const HERO_IMG = "https://images.unsplash.com/photo-1555550252-fc3187f10240?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";

export default function Home() {
  const { t, lang } = useI18n();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/portfolio").then((r) => setProjects(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img src={HERO_IMG} alt="EV prototype" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B10] via-[#0A0B10]/85 to-[#0A0B10]/30" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <div className="max-w-2xl fade-up">
            <p className="font-mono-tech text-xs uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-blue-400" /> {t("hero.tag")}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05]">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">{t("hero.subtitle")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/order" data-testid="hero-order-btn">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-7 text-base">
                  {t("hero.cta1")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/portfolio" data-testid="hero-portfolio-btn">
                <Button variant="outline" className="border-slate-600 text-slate-200 hover:text-white hover:border-slate-400 h-12 px-7 text-base bg-transparent">
                  {t("hero.cta2")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">{t("home.pillarsTitle")}</h2>
          <p className="mt-3 text-slate-400 text-lg">{t("home.pillarsSubtitle")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map(({ icon: Icon, k }, i) => (
            <div key={k} data-testid={`pillar-${k}`}
              className="group p-7 rounded-md bg-[#13151F] border border-slate-800 hover:border-blue-500/50 transition-colors fade-up"
              style={{ animationDelay: `${i * 80}ms` }}>
              <span className="h-11 w-11 rounded-md bg-blue-600/10 border border-blue-500/30 grid place-items-center mb-5">
                <Icon className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
              </span>
              <h3 className="font-heading text-lg font-semibold text-white mb-2">{t(`pillar.${k}.title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`pillar.${k}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio highlight */}
      <section className="border-y border-slate-800 bg-[#0c0e15] py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">{t("home.portfolioTitle")}</h2>
              <p className="mt-3 text-slate-400 text-lg">{t("home.portfolioSubtitle")}</p>
            </div>
            <Link to="/portfolio"><Button variant="outline" className="border-slate-700 text-slate-200 bg-transparent">{t("home.viewAll")} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <Link to="/portfolio" key={p.id} data-testid={`home-project-${i}`}
                className="group relative rounded-md overflow-hidden border border-slate-800 fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="aspect-[4/3] overflow-hidden bg-[#1E2130]">
                  <img src={p.images?.[0]} alt={p.title_id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-transparent to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <span className="font-mono-tech text-[11px] uppercase text-blue-400">{p.category}</span>
                  <h3 className="font-heading text-lg font-semibold text-white">{lang === "id" ? p.title_id : p.title_en}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">{t("home.ecoTitle")}</h2>
        <p className="mt-3 text-slate-400 text-lg">{t("home.ecoSubtitle")}</p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {PARTNERS.map((p) => (
            <div key={p} className="px-7 py-5 rounded-md bg-[#13151F] border border-slate-800 font-heading font-semibold text-slate-300">{p}</div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <div className="relative rounded-lg overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-600/15 to-[#13151F] p-10 sm:p-14 grid-bg">
          <div className="relative max-w-2xl">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">{t("home.ctaTitle")}</h2>
            <p className="mt-4 text-slate-300 text-lg leading-relaxed">{t("home.ctaSubtitle")}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link to="/order" data-testid="cta-order-btn">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-7 text-base">
                  <Upload className="mr-2 h-4 w-4" /> {t("home.ctaButton")}
                </Button>
              </Link>
              <span className="flex items-center gap-2 text-sm text-slate-400 font-mono-tech">
                <Clock className="h-4 w-4 text-blue-400" /> SLA 1x24 jam
              </span>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
