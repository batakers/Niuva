import React, { useState } from "react";
import { toast } from "sonner";
import { MapPin, Mail, Phone, Send, TerminalSquare } from "lucide-react";
import { useI18n } from "../i18n";
import { ConversionLayout } from "../components/Layout";
import { api, formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { profileContent } from "../components/brand/CompanyProfileBlocks";

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
    <ConversionLayout title={t("contact.title")} subtitle={t("contact.subtitle")}>
      <div className="w-full space-y-12">

        {/* Contact Specs */}
        <div className="grid sm:grid-cols-3 gap-4 border border-border bg-surface-1 p-2">
          {[
            { icon: MapPin, label: "HQ", val: profileContent.contact.location },
            { icon: Mail, label: "Email", val: profileContent.contact.email },
            { icon: Phone, label: "Comms", val: "WhatsApp melalui formulir" },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="border border-border/50 bg-background p-4 flex flex-col justify-center text-center">
              <Icon className="h-5 w-5 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest mb-1">{label}</p>
              <p className="font-heading text-sm font-bold text-foreground">{val}</p>
            </div>
          ))}
        </div>

        {/* Form Terminal */}
        <div className="relative border border-border bg-surface-1 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-surface-2 border-b border-border flex items-center px-4 gap-2">
            <TerminalSquare className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">TRANSMISSION_PROTOCOL // SECURE</span>
          </div>

          <form onSubmit={submit} className="p-6 sm:p-8 pt-14 space-y-6" data-testid="contact-form">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">IDENTIFIER</Label>
                <Input
                  data-testid="contact-name"
                  value={form.name}
                  onChange={set("name")}
                  required
                  className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">RETURN_ADDRESS</Label>
                <Input
                  data-testid="contact-email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  required
                  className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
                  placeholder="nama@perusahaan.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">QUERY_SUBJECT</Label>
              <Input
                data-testid="contact-subject"
                value={form.subject}
                onChange={set("subject")}
                required
                className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
                placeholder="Pengembangan prototipe produk"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">PAYLOAD</Label>
              <Textarea
                data-testid="contact-message"
                value={form.message}
                onChange={set("message")}
                required
                rows={5}
                className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm resize-none"
                placeholder="Jelaskan konteks, tujuan, dan ruang lingkup proyek."
              />
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button type="submit" disabled={loading} data-testid="contact-submit" className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-mono uppercase tracking-widest text-xs">
                <Send className="mr-2 h-4 w-4" /> {loading ? "TRANSMITTING..." : "EXECUTE"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ConversionLayout>
  );
}
