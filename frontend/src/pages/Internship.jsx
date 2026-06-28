import React, { useState } from "react";
import { toast } from "sonner";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import { useI18n } from "../i18n";
import { PublicLayout, PageHeader } from "../components/Layout";
import { api, formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

const BENEFITS = ["Proyek R&D nyata", "Mentoring engineer", "Sertifikat & portofolio", "Lingkungan technopark"];

export default function Internship() {
  const { t } = useI18n();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", university: "", major: "", semester: "", duration: "", motivation: "", portfolio_url: "" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/internships", form);
      setDone(true);
      toast.success(t("internship.success"));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <PageHeader tag="Careers" title={t("internship.title")} subtitle={t("internship.subtitle")} />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <span className="h-12 w-12 rounded-md bg-blue-600/10 border border-blue-500/30 grid place-items-center mb-6">
            <GraduationCap className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
          </span>
          <ul className="space-y-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex gap-3 text-slate-300"><CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />{b}</li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          {done ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-10 text-center" data-testid="internship-success">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-slate-200 text-lg">{t("internship.success")}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-lg border border-slate-800 bg-[#13151F] p-7 space-y-4" data-testid="internship-form">
              <h3 className="font-heading text-xl font-semibold text-white mb-2">{t("internship.formTitle")}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("internship.fullName")} testid="intern-name" value={form.full_name} onChange={set("full_name")} required />
                <Field label={t("common.email")} testid="intern-email" type="email" value={form.email} onChange={set("email")} required />
                <Field label={t("common.phone")} testid="intern-phone" value={form.phone} onChange={set("phone")} required />
                <Field label={t("internship.university")} testid="intern-univ" value={form.university} onChange={set("university")} required />
                <Field label={t("internship.major")} testid="intern-major" value={form.major} onChange={set("major")} required />
                <Field label={t("internship.semester")} testid="intern-sem" value={form.semester} onChange={set("semester")} />
                <Field label={t("internship.duration")} testid="intern-duration" value={form.duration} onChange={set("duration")} />
                <Field label={`${t("internship.portfolioUrl")} ${t("common.optional")}`} testid="intern-portfolio" value={form.portfolio_url} onChange={set("portfolio_url")} />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5 block">{t("internship.motivation")}</Label>
                <Textarea data-testid="intern-motivation" value={form.motivation} onChange={set("motivation")} required rows={4}
                  className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" />
              </div>
              <Button type="submit" disabled={loading} data-testid="intern-submit"
                className="bg-blue-600 hover:bg-blue-500 w-full h-11">{loading ? t("common.loading") : t("internship.submit")}</Button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({ label, testid, ...props }) {
  return (
    <div>
      <Label className="text-slate-300 mb-1.5 block">{label}</Label>
      <Input data-testid={testid} {...props} className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" />
    </div>
  );
}
