import React, { useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Code, ShieldCheck, Database, TerminalSquare, Send } from "lucide-react";
import { useI18n } from "../i18n";
import { ConversionLayout } from "../components/Layout";
import { api, formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

const PROGRAM_SPECS = [
  { icon: Code, label: "Projects", desc: "Live R&D deployment" },
  { icon: ShieldCheck, label: "Mentoring", desc: "Direct engineer guidance" },
  { icon: Database, label: "Portfolio", desc: "Verifiable credentials" },
];

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
    <ConversionLayout title={t("internship.title")} subtitle={t("internship.subtitle")}>
      <div className="w-full space-y-12">
        
        {/* Program Specs */}
        <div className="grid sm:grid-cols-3 gap-4 border border-border bg-surface-1 p-2">
          {PROGRAM_SPECS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="border border-border/50 bg-background p-4 flex flex-col items-center text-center">
              <Icon className="h-5 w-5 text-primary mb-3" strokeWidth={1.5} />
              <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest mb-1">{label}</p>
              <p className="font-heading text-sm font-bold text-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* Application Terminal */}
        <div className="relative border border-border bg-surface-1 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-surface-2 border-b border-border flex items-center px-4 gap-2">
            <TerminalSquare className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">CANDIDATE_ONBOARDING // INTERNSHIP_PROG</span>
          </div>
          
          <div className="p-6 sm:p-8 pt-14">
            {done ? (
              <div className="border border-status-success/30 bg-status-success/5 p-10 text-center" data-testid="internship-success">
                <ShieldCheck className="h-12 w-12 text-status-success mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">APPLICATION_RECEIVED</h3>
                <p className="font-mono text-xs text-muted-foreground uppercase">{t("internship.success")}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6" data-testid="internship-form">
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <Field label={t("internship.fullName")} testid="intern-name" value={form.full_name} onChange={set("full_name")} required />
                  <Field label={t("common.email")} testid="intern-email" type="email" value={form.email} onChange={set("email")} required />
                  <Field label={t("common.phone")} testid="intern-phone" value={form.phone} onChange={set("phone")} required />
                  <Field label={t("internship.university")} testid="intern-univ" value={form.university} onChange={set("university")} required />
                  <Field label={t("internship.major")} testid="intern-major" value={form.major} onChange={set("major")} required />
                  <Field label={t("internship.semester")} testid="intern-sem" value={form.semester} onChange={set("semester")} />
                  <Field label={t("internship.duration")} testid="intern-duration" value={form.duration} onChange={set("duration")} />
                  <Field label={`${t("internship.portfolioUrl")} (OPTIONAL)`} testid="intern-portfolio" value={form.portfolio_url} onChange={set("portfolio_url")} />
                </div>
                
                <div>
                  <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">{t("internship.motivation")}</Label>
                  <Textarea 
                    data-testid="intern-motivation" 
                    value={form.motivation} 
                    onChange={set("motivation")} 
                    required 
                    rows={4} 
                    className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm resize-none"
                  />
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <Button type="submit" disabled={loading} data-testid="intern-submit" className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-mono uppercase tracking-widest text-xs">
                    <Send className="mr-2 h-4 w-4" /> {loading ? "PROCESSING..." : "SUBMIT_APPLICATION"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ConversionLayout>
  );
}

function Field({ label, testid, ...props }) {
  return (
    <div className="space-y-2">
      <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">{label}</Label>
      <Input 
        data-testid={testid} 
        {...props} 
        className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
      />
    </div>
  );
}
