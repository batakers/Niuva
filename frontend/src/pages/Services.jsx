import React from "react";
import { Link } from "react-router-dom";
import { Car, Boxes, Printer, GraduationCap, ArrowRight } from "lucide-react";
import { useI18n } from "../i18n";
import { PublicLayout, PageHeader } from "../components/Layout";
import { Button } from "../components/ui/button";

const SERVICES = [
  { k: "ev", icon: Car, img: "https://images.unsplash.com/photo-1737982560500-e152da0e770e?crop=entropy&cs=srgb&fm=jpg&q=85&w=900" },
  { k: "proto", icon: Boxes, img: "https://images.unsplash.com/photo-1555550252-fc3187f10240?crop=entropy&cs=srgb&fm=jpg&q=85&w=900" },
  { k: "print", icon: Printer, img: "https://images.unsplash.com/photo-1642969164999-979483e21601?crop=entropy&cs=srgb&fm=jpg&q=85&w=900" },
  { k: "hr", icon: GraduationCap, img: "https://images.unsplash.com/photo-1576669801838-1b1c52121e6a?crop=entropy&cs=srgb&fm=jpg&q=85&w=900" },
];

export default function Services() {
  const { t } = useI18n();
  return (
    <PublicLayout>
      <PageHeader tag="Capabilities" title={t("services.title")} subtitle={t("services.subtitle")} />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 space-y-6">
        {SERVICES.map(({ k, icon: Icon, img }, i) => (
          <div key={k} data-testid={`service-${k}`}
            className={`grid lg:grid-cols-2 gap-0 rounded-lg overflow-hidden border border-slate-800 bg-[#13151F] ${i % 2 ? "lg:[direction:rtl]" : ""}`}>
            <div className="aspect-[16/10] lg:aspect-auto overflow-hidden [direction:ltr]">
              <img src={img} alt={t(`pillar.${k}.title`)} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-center [direction:ltr]">
              <span className="h-11 w-11 rounded-md bg-blue-600/10 border border-blue-500/30 grid place-items-center mb-5">
                <Icon className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">{t(`pillar.${k}.title`)}</h2>
              <p className="text-slate-400 leading-relaxed text-lg">{t(`pillar.${k}.desc`)}</p>
              {k === "print" && (
                <Link to="/order" className="mt-6"><Button className="bg-blue-600 hover:bg-blue-500 w-fit">{t("nav.order")} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              )}
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
