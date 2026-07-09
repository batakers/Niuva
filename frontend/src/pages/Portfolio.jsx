import React, { useEffect, useState } from "react";
import { X, ArrowUpRight, Maximize2 } from "lucide-react";
import { useI18n } from "../i18n";
import { MarketingLayout } from "../components/Layout";
import { api } from "../lib/api";

export default function Portfolio() {
  const { t, lang } = useI18n();
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/portfolio").then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  return (
    <MarketingLayout>
      <section className="relative pt-12 pb-16 border-b border-border bg-surface-1">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <div className="font-mono text-9xl font-black leading-none tracking-tighter">PRT</div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected Works</p>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-foreground max-w-3xl tracking-tight leading-[1.1] mb-6">
            {t("portfolio.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t("portfolio.subtitle")}
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {projects.length === 0 ? (
          <div className="py-32 text-center font-mono text-muted-foreground border border-dashed border-border bg-surface-1">
            [ NO DATA FOUND IN SYSTEM ]
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {projects.map((p, i) => {
              // Asymmetric layout logic: 
              // pattern: 8-4, 4-4-4, 4-8, 12, etc.
              // For simplicity, every 3rd item is large, others are small.
              const isLarge = i % 3 === 0;
              
              return (
                <button 
                  key={p.id} 
                  data-testid={`portfolio-item-${i}`} 
                  onClick={() => setActive(p)}
                  className={`group text-left flex flex-col ${isLarge ? 'lg:col-span-8' : 'lg:col-span-4'}`}
                >
                  <div className={`relative w-full border border-border bg-surface-2 overflow-hidden mb-4 ${isLarge ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                    <img 
                      src={p.images?.[0]} 
                      alt={p.title_id} 
                      className="w-full h-full object-cover mix-blend-luminosity opacity-90 group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700" 
                    />
                    
                    {/* HUD Overlay */}
                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border border-border px-3 py-1">
                      <span className="font-mono text-[10px] text-foreground uppercase tracking-widest">{p.category}</span>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm border border-border p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-4 w-4 text-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {lang === "id" ? p.title_id : p.title_en}
                      </h3>
                      {p.client && (
                        <p className="font-mono text-xs text-muted-foreground mt-2 uppercase tracking-widest">
                          CLIENT: {p.client}
                        </p>
                      )}
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Industrial Lightbox */}
      {active && (
        <div 
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md grid place-items-center p-4 lg:p-8" 
          onClick={() => setActive(null)} 
          data-testid="portfolio-lightbox"
        >
          <div 
            className="max-w-[1200px] w-full bg-background border border-border flex flex-col lg:flex-row max-h-[90vh] overflow-hidden shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary z-10" />
            
            {/* Left Image Area */}
            <div className="relative lg:w-2/3 bg-surface-2 border-r border-border shrink-0">
              <img 
                src={active.images?.[0]} 
                alt={active.title_id} 
                className="w-full h-full object-contain max-h-[50vh] lg:max-h-[90vh]" 
              />
              
              {/* Image HUD */}
              <div className="absolute top-4 left-4 font-mono text-[10px] text-muted-foreground hidden sm:block">
                SYS_VIEW_ACTIVE // IMG_SRC_01
              </div>
            </div>
            
            {/* Right Content Area */}
            <div className="lg:w-1/3 flex flex-col h-full bg-surface-1 overflow-y-auto">
              <div className="p-6 sm:p-8 flex-1">
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-primary/10 border border-primary/30 px-3 py-1">
                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest">{active.category}</span>
                  </div>
                  <button 
                    onClick={() => setActive(null)} 
                    data-testid="lightbox-close" 
                    className="h-8 w-8 border border-border flex items-center justify-center hover:bg-surface-2 transition-colors text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <h2 className="font-heading text-3xl font-bold text-foreground mb-4 tracking-tight">
                  {lang === "id" ? active.title_id : active.title_en}
                </h2>
                
                {active.client && (
                  <div className="font-mono text-xs text-muted-foreground mb-8 pb-4 border-b border-border/50 uppercase tracking-widest">
                    CLIENT // {active.client}
                  </div>
                )}
                
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {lang === "id" ? active.description_id : active.description_en}
                </p>
                
                {/* Additional Spec Data (Placeholder to show industrial aesthetic) */}
                <div className="mt-12 space-y-4">
                  <h4 className="font-mono text-xs text-foreground uppercase tracking-widest border-b border-border pb-2">Project Data</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block font-mono text-[10px] text-muted-foreground uppercase">Material</span>
                      <span className="block font-mono text-sm text-foreground">Custom Alloy</span>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] text-muted-foreground uppercase">Tolerance</span>
                      <span className="block font-mono text-sm text-foreground">±0.05mm</span>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] text-muted-foreground uppercase">Duration</span>
                      <span className="block font-mono text-sm text-foreground">3 Weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MarketingLayout>
  );
}
