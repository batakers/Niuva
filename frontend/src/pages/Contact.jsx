import React, { useState } from "react";
import { toast } from "sonner";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import { useI18n } from "../i18n";
import { PublicLayout, PageHeader } from "../components/Layout";
import { api, formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

export default function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success(t("contact.success"));
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <PageHeader tag="Get in touch" title={t("contact.title")} subtitle={t("contact.subtitle")} />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12">
        <div className="space-y-5">
          {[
            { icon: MapPin, label: t("contact.location"), val: t("contact.locationVal") },
            { icon: Mail, label: "Email", val: "hello@niuva.com" },
            { icon: Phone, label: t("common.phone"), val: "+62 22 0000 0000" },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-start gap-4 p-5 rounded-md bg-[#13151F] border border-slate-800">
              <span className="h-10 w-10 rounded-md bg-blue-600/10 border border-blue-500/30 grid place-items-center flex-shrink-0">
                <Icon className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-xs font-mono-tech uppercase text-slate-500">{label}</p>
                <p className="text-slate-200">{val}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="rounded-lg border border-slate-800 bg-[#13151F] p-7 space-y-4" data-testid="contact-form">
          <h3 className="font-heading text-xl font-semibold text-white mb-2">{t("contact.formTitle")}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-slate-300 mb-1.5 block">{t("common.name")}</Label>
              <Input data-testid="contact-name" value={form.name} onChange={set("name")} required className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
            <div><Label className="text-slate-300 mb-1.5 block">{t("common.email")}</Label>
              <Input data-testid="contact-email" type="email" value={form.email} onChange={set("email")} required className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
          </div>
          <div><Label className="text-slate-300 mb-1.5 block">{t("contact.subject")}</Label>
            <Input data-testid="contact-subject" value={form.subject} onChange={set("subject")} required className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
          <div><Label className="text-slate-300 mb-1.5 block">{t("contact.message")}</Label>
            <Textarea data-testid="contact-message" value={form.message} onChange={set("message")} required rows={5} className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
          <Button type="submit" disabled={loading} data-testid="contact-submit" className="bg-blue-600 hover:bg-blue-500 w-full h-11">
            <Send className="mr-2 h-4 w-4" /> {loading ? t("common.loading") : t("common.send")}
          </Button>
        </form>
      </section>
    </PublicLayout>
  );
}
