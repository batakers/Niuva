import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, FileBox, Check, Clock, ArrowLeft, ArrowRight, TerminalSquare } from "lucide-react";
import { useI18n } from "../../i18n";
import { OperationalLayout } from "@/components/layout/Layout";
import { api, formatApiError } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

export default function NewOrder() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialId, setMaterialId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/materials").then((r) => setMaterials(r.data)).catch(() => {});
  }, []);

  const onFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["stl", "obj"].includes(ext)) return toast.error(t("order.invalidFileType"));
    if (f.size > 50 * 1024 * 1024) return toast.error(t("order.fileTooLarge"));
    setFile(f);
  };

  const steps = [
    { label: t("order.step1"), id: "step-upload" },
    { label: t("order.step2"), id: "step-material" },
    { label: t("order.step3"), id: "step-notes" },
    { label: t("order.step4"), id: "step-confirm" }
  ];
  
  const canNext = (step === 1 && file) || (step === 2 && materialId) || step === 3;

  const submit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("material_id", materialId);
      fd.append("notes", notes);
      const { data } = await api.post("/orders", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(t("order.success"));
      nav(`/orders/${data.id}`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const material = materials.find((m) => m.id === materialId);

  return (
    <OperationalLayout>
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Terminal Header */}
        <div className="border border-border bg-surface-1">
          <div className="border-b border-border bg-surface-2 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {t("order.headerLabel")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-primary text-xs">
              <Clock className="h-3 w-3" /> {t("order.etaBadge")}
            </div>
          </div>
          <div className="p-6">
            <h1 className="font-heading text-2xl font-bold text-foreground uppercase tracking-tight mb-1">{t("order.title")}</h1>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{t("order.sla")}</p>
          </div>
        </div>

        {/* Stepper HUD */}
        <div className="flex flex-col sm:flex-row gap-2 border-b border-border pb-8">
          {steps.map((s, i) => {
            const n = i + 1;
            const isPast = n < step;
            const isCurrent = n === step;
            return (
              <div key={s.id} className="flex-1">
                <div className={`p-3 border text-xs font-mono uppercase tracking-widest ${
                  isPast ? "border-primary/50 bg-primary/10 text-primary" : 
                  isCurrent ? "border-primary bg-primary text-primary-foreground" : 
                  "border-border bg-surface-1 text-muted-foreground"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span>{t("order.stepLabel")} {n}</span>
                    {isPast ? <Check className="h-3 w-3" /> : null}
                  </div>
                  <div className="truncate opacity-80">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Interface */}
        <div className="border border-border bg-surface-1 min-h-[360px] relative">
          <div className="p-6 sm:p-10 relative z-10">
            {step === 1 && (
              <div className="max-w-xl">
                <Label className="font-mono text-[10px] text-primary uppercase tracking-widest block mb-4">{t("order.uploadLabel")}</Label>
                <label data-testid="file-dropzone" className="block border border-dashed border-primary/50 bg-surface-2 hover:bg-primary/5 p-16 text-center cursor-pointer transition-colors group">
                  <input data-testid="file-input" type="file" accept=".stl,.obj" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
                  {file ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 bg-primary/20 border border-primary text-primary flex items-center justify-center">
                        <FileBox className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-foreground font-mono font-bold">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-widest">
                          {(file.size / 1024 / 1024).toFixed(2)} MB · {t("order.replaceHint")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 bg-surface-1 border border-border text-muted-foreground flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                        <Upload className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs mb-1">{t("order.uploadHint")}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest">{t("order.formatsHint")}</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            )}

            {step === 2 && (
              <div>
                <Label className="font-mono text-[10px] text-primary uppercase tracking-widest block mb-4">{t("order.materialLabel")}</Label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((m) => (
                    <button key={m.id} data-testid={`material-${m.name}`} onClick={() => setMaterialId(m.id)}
                      className={`text-left p-5 border transition-colors relative overflow-hidden ${
                        materialId === m.id ? "border-primary bg-primary/5" : "border-border bg-surface-2 hover:border-primary/50"
                      }`}>
                      {materialId === m.id && <div className="absolute top-0 right-0 w-2 h-2 bg-primary" />}
                      <p className="font-heading font-bold text-foreground uppercase tracking-widest text-sm mb-2">{m.name}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-2xl">
                <Label className="font-mono text-[10px] text-primary uppercase tracking-widest block mb-4">{t("order.notesLabel")}</Label>
                <Textarea 
                  data-testid="order-notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  rows={8}
                  className="rounded-none border-border bg-surface-2 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm resize-none"
                  placeholder={t("order.notesPlaceholder")} 
                />
              </div>
            )}

            {step === 4 && (
              <div className="max-w-2xl border border-border bg-surface-2 p-6" data-testid="order-confirm">
                <h3 className="font-mono text-xs text-primary uppercase tracking-widest mb-6 pb-2 border-b border-border/50">
                  {t("order.confirmTitle")}
                </h3>
                <div className="space-y-1">
                  <Row label={t("order.confirmFile")} value={file?.name} />
                  <Row label={t("order.confirmMaterial")} value={material?.name} />
                  <Row label={t("order.confirmNotes")} value={notes || t("order.confirmNone")} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)} data-testid="order-prev" className="rounded-none font-mono uppercase tracking-widest text-[10px] h-10 px-6">
            <ArrowLeft className="mr-2 h-3 w-3" /> {t("order.prev")}
          </Button>
          
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            {t("order.phaseLabel")} {step}/4
          </div>
          
          {step < 4 ? (
            <Button disabled={!canNext} onClick={() => setStep(step + 1)} data-testid="order-next" className="rounded-none font-mono uppercase tracking-widest text-[10px] h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
              {t("order.next")} <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          ) : (
            <Button disabled={loading} onClick={submit} data-testid="order-submit" className="rounded-none font-mono uppercase tracking-widest text-[10px] h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? t("order.sending") : t("order.submit")}
            </Button>
          )}
        </div>
      </div>
    </OperationalLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-border/50 last:border-0 font-mono">
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-[11px] text-foreground text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
