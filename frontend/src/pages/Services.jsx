import React from "react";
import { Link } from "react-router-dom";
import { Car, Boxes, Printer, GraduationCap, ArrowUpRight, CheckCircle2, ChevronRight } from "lucide-react";
import { useI18n } from "../i18n";
import { MarketingLayout } from "../components/Layout";
import { Button } from "../components/ui/button";

const SERVICES = [
  { 
    k: "ev", 
    icon: Car, 
    img: "https://images.unsplash.com/photo-1737982560500-e152da0e770e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    specs: [
      { label: "Drivetrain", value: "Custom BLDC / Hub Motor" },
      { label: "Chassis", value: "Tubular / Monocoque" },
      { label: "Battery", value: "Li-ion NMC Custom Pack" },
    ]
  },
  { 
    k: "proto", 
    icon: Boxes, 
    img: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    specs: [
      { label: "Tolerance", value: "±0.05 mm" },
      { label: "Materials", value: "AL7075, Titanium, Steel" },
      { label: "Finishing", value: "Anodizing, Powder Coating" },
    ]
  },
  { 
    k: "print", 
    icon: Printer, 
    img: "https://images.unsplash.com/photo-1642969164999-979483e21601?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    specs: [
      { label: "Volume", value: "400 x 400 x 400 mm" },
      { label: "Resolution", value: "50 Microns" },
      { label: "Filaments", value: "PLA, PETG, ABS, TPU, PC" },
    ]
  },
  { 
    k: "hr", 
    icon: GraduationCap, 
    img: "https://images.unsplash.com/photo-1576669801838-1b1c52121e6a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    specs: [
      { label: "Focus", value: "Hardware & EV Tech" },
      { label: "Format", value: "Intensive R&D Project" },
      { label: "Duration", value: "3 - 6 Months" },
    ]
  },
];

export default function Services() {
  const { t } = useI18n();
  return (
    <MarketingLayout>
      <section className="relative pt-12 pb-16 border-b border-border bg-surface-1">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <div className="font-mono text-9xl font-black leading-none tracking-tighter">SVC</div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Capabilities Overview</p>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-foreground max-w-3xl tracking-tight leading-[1.1] mb-6">
            {t("services.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t("services.subtitle")}
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        {SERVICES.map(({ k, icon: Icon, img, specs }, i) => (
          <div key={k} data-testid={`service-${k}`} className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            {/* Image Section - alternating layout */}
            <div className={`lg:col-span-7 relative ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
              <div className="absolute -inset-4 bg-surface-2 border border-border -z-10 hidden lg:block" />
              
              <div className="relative aspect-[4/3] border border-border overflow-hidden bg-background">
                <img src={img} alt={t(`pillar.${k}.title`)} className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 opacity-90" />
                
                {/* Image Overlay HUD */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-background/80 backdrop-blur-md border border-border px-3 py-1 font-mono text-[10px] uppercase text-primary tracking-widest">
                    SYS.0{i + 1}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="bg-background/80 backdrop-blur-md border border-border px-3 py-1 font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
                    ONLINE
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className={`lg:col-span-5 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
              <div className="flex items-center gap-4 mb-8">
                <span className="w-12 h-12 flex items-center justify-center border border-border bg-surface-2">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </span>
                <span className="font-mono text-3xl font-light text-muted-foreground/30">0{i + 1}</span>
              </div>
              
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">{t(`pillar.${k}.title`)}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-10">{t(`pillar.${k}.desc`)}</p>
              
              {/* Data Panel Spec Sheet */}
              <div className="border border-border bg-surface-1 p-6 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-6 border-b border-border pb-3">Technical Specifications</h3>
                
                <ul className="space-y-4">
                  {specs.map((spec, idx) => (
                    <li key={idx} className="flex justify-between items-end border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">{spec.label}</span>
                      <span className="font-mono text-sm text-foreground text-right">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {k === "print" && (
                <Link to="/order">
                  <Button size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto px-8">
                    {t("nav.order")} <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>
    </MarketingLayout>
  );
}
