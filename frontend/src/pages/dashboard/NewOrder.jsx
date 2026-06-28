import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, FileBox, Check, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "../../i18n";
import { Navbar } from "../../components/Navbar";
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
    if (!["stl", "obj"].includes(ext)) return toast.error("Hanya file STL atau OBJ");
    if (f.size > 50 * 1024 * 1024) return toast.error("File melebihi 50MB");
    setFile(f);
  };

  const steps = ["order.step1", "order.step2", "order.step3", "order.step4"];
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
    <div className="min-h-screen bg-[#0A0B10]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-24 pb-20">
        <h1 className="font-heading text-3xl font-bold text-white mb-2">{t("order.title")}</h1>

        {/* SLA banner */}
        <div className="flex items-center gap-3 rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-3 mb-8">
          <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" strokeWidth={1.5} />
          <p className="text-sm text-blue-200">{t("order.sla")}</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {steps.map((s, i) => {
            const n = i + 1;
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-md grid place-items-center font-mono-tech text-sm border ${
                    n < step ? "bg-emerald-500 border-emerald-500 text-white" : n === step ? "bg-blue-600 border-blue-500 text-white" : "bg-[#1E2130] border-slate-700 text-slate-500"}`}>
                    {n < step ? <Check className="h-4 w-4" /> : n}
                  </div>
                  <span className={`mt-2 text-[11px] ${n === step ? "text-slate-200" : "text-slate-500"}`}>{t(s)}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-6 ${n < step ? "bg-emerald-500" : "bg-slate-700"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#13151F] p-7 min-h-[280px]">
          {step === 1 && (
            <div>
              <Label className="text-slate-200 mb-3 block">{t("order.uploadLabel")}</Label>
              <label data-testid="file-dropzone" className="block border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-lg p-12 text-center cursor-pointer transition-colors">
                <input data-testid="file-input" type="file" accept=".stl,.obj" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileBox className="h-10 w-10 text-emerald-400" strokeWidth={1.5} />
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB · Klik untuk ganti</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-slate-500" strokeWidth={1.5} />
                    <p className="text-slate-300">{t("order.uploadHint")}</p>
                    <p className="text-xs text-slate-500 font-mono-tech">STL · OBJ · max 50MB</p>
                  </div>
                )}
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <Label className="text-slate-200 mb-3 block">{t("order.materialLabel")}</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {materials.map((m) => (
                  <button key={m.id} data-testid={`material-${m.name}`} onClick={() => setMaterialId(m.id)}
                    className={`text-left p-4 rounded-md border transition-colors ${materialId === m.id ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-[#1E2130] hover:border-slate-500"}`}>
                    <p className="font-heading font-semibold text-white">{m.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{m.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <Label className="text-slate-200 mb-3 block">{t("order.notesLabel")}</Label>
              <Textarea data-testid="order-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={6}
                placeholder={t("order.notesPlaceholder")} className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4" data-testid="order-confirm">
              <h3 className="font-heading text-lg font-semibold text-white">{t("order.step4")}</h3>
              <Row label={t("order.step1")} value={file?.name} />
              <Row label={t("order.materialLabel")} value={material?.name} />
              <Row label={t("order.notesLabel")} value={notes || "-"} />
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)} data-testid="order-prev"
            className="border-slate-700 text-slate-200 bg-transparent"><ArrowLeft className="mr-2 h-4 w-4" /> {t("order.prev")}</Button>
          {step < 4 ? (
            <Button disabled={!canNext} onClick={() => setStep(step + 1)} data-testid="order-next" className="bg-blue-600 hover:bg-blue-500">{t("order.next")} <ArrowRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button disabled={loading} onClick={submit} data-testid="order-submit" className="bg-blue-600 hover:bg-blue-500">{loading ? t("common.loading") : t("order.submit")}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-800 py-2.5">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-200 text-sm text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
