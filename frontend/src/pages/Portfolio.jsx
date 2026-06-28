import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "../i18n";
import { PublicLayout, PageHeader } from "../components/Layout";
import { api } from "../lib/api";

export default function Portfolio() {
  const { t, lang } = useI18n();
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/portfolio").then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      <PageHeader tag="Selected Works" title={t("portfolio.title")} subtitle={t("portfolio.subtitle")} />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        {projects.length === 0 ? (
          <p className="text-slate-400 text-center py-20">{t("portfolio.empty")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <button key={p.id} data-testid={`portfolio-item-${i}`} onClick={() => setActive(p)}
                className="group text-left rounded-md overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-colors fade-up"
                style={{ animationDelay: `${i * 70}ms` }}>
                <div className="aspect-[4/3] overflow-hidden bg-[#1E2130]">
                  <img src={p.images?.[0]} alt={p.title_id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="font-mono-tech text-[11px] uppercase text-blue-400">{p.category}</span>
                  <h3 className="font-heading text-lg font-semibold text-white mt-1">{lang === "id" ? p.title_id : p.title_en}</h3>
                  {p.client && <p className="text-xs text-slate-500 mt-1">{t("portfolio.client")}: {p.client}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {active && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm grid place-items-center p-4" onClick={() => setActive(null)} data-testid="portfolio-lightbox">
          <div className="max-w-3xl w-full bg-[#13151F] border border-slate-700 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video bg-[#1E2130]">
              <img src={active.images?.[0]} alt={active.title_id} className="w-full h-full object-cover" />
              <button onClick={() => setActive(null)} data-testid="lightbox-close" className="absolute top-3 right-3 h-9 w-9 rounded-md bg-black/60 grid place-items-center text-white hover:bg-black/80">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-7">
              <span className="font-mono-tech text-xs uppercase text-blue-400">{active.category} · {active.client}</span>
              <h2 className="font-heading text-2xl font-bold text-white mt-1 mb-3">{lang === "id" ? active.title_id : active.title_en}</h2>
              <p className="text-slate-400 leading-relaxed">{lang === "id" ? active.description_id : active.description_en}</p>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
