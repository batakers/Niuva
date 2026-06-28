import React from "react";
import { Target, Rocket, Sparkles, CheckCircle2 } from "lucide-react";
import { useI18n } from "../i18n";
import { PublicLayout, PageHeader } from "../components/Layout";

const ABOUT_IMG = "https://images.unsplash.com/photo-1576669801838-1b1c52121e6a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

export default function About() {
  const { t } = useI18n();
  return (
    <PublicLayout>
      <PageHeader tag="PT Niuva Inovasi Utama" title={t("about.title")} subtitle={t("about.intro")} />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-lg overflow-hidden border border-slate-800">
          <img src={ABOUT_IMG} alt="NIUVA lab" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-8">
          <div className="p-6 rounded-md bg-[#13151F] border border-slate-800 border-t-2 border-t-blue-500">
            <div className="flex items-center gap-3 mb-3"><Target className="h-6 w-6 text-blue-400" strokeWidth={1.5} /><h3 className="font-heading text-xl font-semibold text-white">{t("about.visionTitle")}</h3></div>
            <p className="text-slate-400 leading-relaxed">{t("about.vision")}</p>
          </div>
          <div className="p-6 rounded-md bg-[#13151F] border border-slate-800 border-t-2 border-t-amber-500">
            <div className="flex items-center gap-3 mb-4"><Rocket className="h-6 w-6 text-amber-400" strokeWidth={1.5} /><h3 className="font-heading text-xl font-semibold text-white">{t("about.missionTitle")}</h3></div>
            <ul className="space-y-3">
              {["about.mission1", "about.mission2", "about.mission3"].map((k) => (
                <li key={k} className="flex gap-3 text-slate-400"><CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />{t(k)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-blue-600/10 to-[#13151F] p-10 text-center">
          <Sparkles className="h-8 w-8 text-blue-400 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="font-heading text-2xl font-bold text-white mb-3">{t("about.valueTitle")}</h3>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">{t("about.value")}</p>
        </div>
      </section>
    </PublicLayout>
  );
}
