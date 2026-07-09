import React from "react";
import { Building2, Cpu, Wrench, Network, Activity } from "lucide-react";
import { useI18n } from "../i18n";
import { MarketingLayout } from "../components/Layout";

const PARTNERS = [
  { 
    id: "P01",
    name: "Telkom University", 
    icon: Building2, 
    desc: "Akses talenta & riset akademik kelas dunia.",
    type: "Academic Partner",
    status: "Active Link"
  },
  { 
    id: "P02",
    name: "Bandung Techno Park", 
    icon: Cpu, 
    desc: "Inkubasi teknologi & jaringan industri.",
    type: "Incubator Hub",
    status: "Active Link"
  },
  { 
    id: "P03",
    name: "TelU Makerspace", 
    icon: Wrench, 
    desc: "Fasilitas fabrikasi & rapid prototyping.",
    type: "Facility Node",
    status: "Active Link"
  },
];

export default function Ecosystem() {
  const { t } = useI18n();
  
  return (
    <MarketingLayout>
      <section className="relative pt-12 pb-16 border-b border-border bg-surface-1 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <div className="font-mono text-9xl font-black leading-none tracking-tighter">NET</div>
        </div>
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Ecosystem Network</p>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-foreground max-w-3xl tracking-tight leading-[1.1] mb-6">
            {t("ecosystem.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t("ecosystem.subtitle")}
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <Network className="h-12 w-12 text-primary mb-6" strokeWidth={1.5} />
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-6">
                {t("ecosystem.partnersTitle")}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t("ecosystem.body")}
              </p>
              
              <div className="border border-border bg-surface-2 p-6 font-mono text-sm text-muted-foreground">
                <div className="flex justify-between border-b border-border pb-2 mb-2">
                  <span>NETWORK_STATUS:</span>
                  <span className="text-primary">OPTIMAL</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2 mb-2">
                  <span>ACTIVE_NODES:</span>
                  <span className="text-foreground">03</span>
                </div>
                <div className="flex justify-between">
                  <span>LATENCY:</span>
                  <span className="text-foreground">12ms</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 relative">
            {/* Visual connecting line behind nodes */}
            <div className="absolute left-8 top-10 bottom-10 w-px bg-border hidden sm:block" />
            
            <div className="space-y-8 relative">
              {PARTNERS.map(({ id, name, icon: Icon, desc, type, status }, i) => (
                <div key={id} data-testid={`partner-${i}`} className="relative pl-0 sm:pl-20 group">
                  {/* Connection Node */}
                  <div className="absolute left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full hidden sm:flex items-center justify-center z-10 group-hover:bg-primary transition-colors">
                    <div className="w-1 h-1 bg-primary rounded-full group-hover:bg-background transition-colors" />
                  </div>
                  
                  {/* Connection horizontal line */}
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-px bg-border hidden sm:block" />
                  
                  <div className="border border-border bg-surface-1 hover:border-primary/50 transition-colors p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <span className="h-12 w-12 border border-border bg-surface-2 flex items-center justify-center shrink-0">
                          <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </span>
                        <div>
                          <h3 className="font-heading text-2xl font-bold text-foreground">{name}</h3>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{type}</span>
                        </div>
                      </div>
                      
                      <div className="font-mono text-xs flex items-center gap-2 border border-border px-3 py-1 bg-surface-2 w-fit">
                        <Activity className="h-3 w-3 text-primary" /> {status}
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed border-t border-border pt-6">
                      {desc}
                    </p>
                    
                    <div className="mt-6 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                      NODE_ID: {id} // UPLINK: ESTABLISHED
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
