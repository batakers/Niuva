import React from "react";
import { Building2, Cpu, Wrench } from "lucide-react";
import { useI18n } from "../i18n";
import { PublicLayout, PageHeader } from "../components/Layout";

const PARTNERS = [
  { name: "Telkom University", icon: Building2, desc: "Akses talenta & riset akademik kelas dunia." },
  { name: "Bandung Techno Park", icon: Cpu, desc: "Inkubasi teknologi & jaringan industri." },
  { name: "TelU Makerspace", icon: Wrench, desc: "Fasilitas fabrikasi & rapid prototyping." },
];

export default function Ecosystem() {
  const { t } = useI18n();
  return (
    <PublicLayout>
      <PageHeader tag="Network" title={t("ecosystem.title")} subtitle={t("ecosystem.subtitle")} />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <p className="text-slate-300 text-lg max-w-3xl leading-relaxed mb-12">{t("ecosystem.body")}</p>
        <h2 className="font-heading text-2xl font-bold text-white mb-8">{t("ecosystem.partnersTitle")}</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {PARTNERS.map(({ name, icon: Icon, desc }, i) => (
            <div key={name} data-testid={`partner-${i}`} className="p-7 rounded-md bg-[#13151F] border border-slate-800 hover:border-blue-500/50 transition-colors">
              <span className="h-12 w-12 rounded-md bg-blue-600/10 border border-blue-500/30 grid place-items-center mb-5">
                <Icon className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
              </span>
              <h3 className="font-heading text-lg font-semibold text-white mb-2">{name}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
