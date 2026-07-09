import React from "react";
import { Target, Rocket, Activity, Binary, ArrowRight } from "lucide-react";
import { useI18n } from "../i18n";
import { MarketingLayout } from "../components/Layout";

const ABOUT_IMG = "https://images.unsplash.com/photo-1576669801838-1b1c52121e6a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const TIMELINE = [
  { year: "2020", title: "Inception", desc: "Started as a small R&D group focused on rapid prototyping and custom 3D printing." },
  { year: "2021", title: "EV Development", desc: "Expanded capabilities into Electric Vehicle drivetrain engineering and custom chassis fabrication." },
  { year: "2023", title: "Niuva Inovasi Utama", desc: "Incorporated officially, scaling operations to serve academic and industrial B2B clients." },
  { year: "2024", title: "Ecosystem Expansion", desc: "Launched structured internship programs and strategic partnerships with Telkom University." },
];

export default function About() {
  const { t } = useI18n();
  
  return (
    <MarketingLayout>
      {/* Header */}
      <section className="relative pt-12 pb-16 border-b border-border bg-surface-1">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <div className="font-mono text-9xl font-black leading-none tracking-tighter">ABT</div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Entity Profile</p>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-foreground max-w-3xl tracking-tight leading-[1.1] mb-6">
            {t("about.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t("about.intro")}
          </p>
        </div>
      </section>

      {/* Profile & Image */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 border-b border-border">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <h2 className="font-mono text-xs text-primary uppercase tracking-[0.2em] mb-4">Core Competency</h2>
            <p className="text-2xl text-foreground font-light leading-snug mb-8">
              We bridge the gap between digital concepts and physical realities through precision engineering and rapid manufacturing.
            </p>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-8 border-t border-border">
              <div>
                <span className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Entity Type</span>
                <span className="block font-heading text-lg font-bold text-foreground">Indie R&D Studio</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Location</span>
                <span className="block font-heading text-lg font-bold text-foreground">Bandung, ID</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Specialization</span>
                <span className="block font-heading text-lg font-bold text-foreground">EV & Prototyping</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Status</span>
                <span className="block font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Active
                </span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-primary/5 translate-x-4 translate-y-4 border border-border -z-10" />
            <div className="relative aspect-[4/3] border border-border bg-surface-2 overflow-hidden">
              <img src={ABOUT_IMG} alt="NIUVA lab" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
              <div className="absolute top-4 left-4 border border-primary/50 bg-background/80 backdrop-blur-sm px-3 py-1">
                <span className="font-mono text-[10px] text-primary uppercase tracking-widest">FACILITY_VIEW_01</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directives (Vision/Mission) */}
      <section className="py-24 border-b border-border bg-surface-1">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">Strategic Directives</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-border bg-background p-8 sm:p-10 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
              <Target className="h-8 w-8 text-primary mb-6" strokeWidth={1.5} />
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Directive Alpha // Vision</h3>
              <p className="font-heading text-2xl font-bold text-foreground leading-snug">
                {t("about.vision")}
              </p>
            </div>
            
            <div className="border border-border bg-background p-8 sm:p-10 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
              <Rocket className="h-8 w-8 text-primary mb-6" strokeWidth={1.5} />
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Directive Beta // Mission</h3>
              <ul className="space-y-4">
                {["about.mission1", "about.mission2", "about.mission3"].map((k, i) => (
                  <li key={k} className="flex gap-4 items-start">
                    <span className="font-mono text-[10px] text-primary mt-1 border border-primary/30 px-1.5 py-0.5">M{i+1}</span>
                    <span className="text-foreground leading-relaxed">{t(k)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Evolution Timeline */}
      <section className="py-24 overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border -translate-x-1/2 hidden md:block" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center relative bg-background inline-block mx-auto px-6 z-10 left-1/2 -translate-x-1/2">
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">Evolution Log</h2>
          </div>
          
          <div className="space-y-12 md:space-y-0 relative">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row items-center justify-between ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Center Node */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-2 border-primary bg-background -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                </div>
                
                {/* Mobile timeline line */}
                <div className="absolute top-0 bottom-[-3rem] left-4 w-px bg-border -translate-x-1/2 md:hidden" />
                
                <div className="w-full md:w-5/12 pl-12 md:pl-0" />
                
                <div className={`w-full md:w-5/12 pl-12 md:pl-0 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'} py-4 md:py-12`}>
                  <div className={`inline-block border border-border bg-surface-1 p-6 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} hover:border-primary/50 transition-colors`}>
                    <span className="font-mono text-2xl font-bold text-primary block mb-2">{item.year}</span>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-t border-border bg-foreground text-background">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <Binary className="h-12 w-12 text-primary mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="font-mono text-xs text-primary uppercase tracking-[0.2em] mb-4">Core Algorithm</h2>
          <p className="font-heading text-2xl sm:text-4xl font-light leading-relaxed">
            "{t("about.value")}"
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
