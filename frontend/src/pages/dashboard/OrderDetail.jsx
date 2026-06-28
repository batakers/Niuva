import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download, Upload, Clock, CheckCircle2, FileBox, Banknote } from "lucide-react";
import { useI18n } from "../../i18n";
import { Navbar } from "../../components/Navbar";
import { StatusStepper, StatusBadge } from "../../components/StatusStepper";
import { api, fileUrl, formatApiError } from "../../lib/api";
import { rupiah, fmtDate } from "../../lib/format";
import { Button } from "../../components/ui/button";

export default function OrderDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = () => api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch(() => nav("/dashboard"));

  useEffect(() => {
    load();
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, [id]);

  const uploadProof = async (f) => {
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      await api.post(`/orders/${id}/payment-proof`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Bukti transfer terkirim");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setUploading(false);
    }
  };

  if (!order) return <div className="min-h-screen bg-[#0A0B10]"><Navbar /><div className="pt-24 text-center text-slate-400">{t("common.loading")}</div></div>;

  return (
    <div className="min-h-screen bg-[#0A0B10]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-24 pb-20">
        <button onClick={() => nav("/dashboard")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6" data-testid="back-to-dash">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </button>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="font-mono-tech text-sm text-blue-400">{order.order_number}</p>
            <h1 className="font-heading text-2xl font-bold text-white">{t("detail.title")}</h1>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Stepper */}
        <div className="rounded-lg border border-slate-800 bg-[#13151F] p-7 mb-6">
          <StatusStepper status={order.status} />
        </div>

        {/* SLA anchor */}
        {order.status === "pending_estimate" && (
          <div className="flex items-center gap-3 rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-3 mb-6" data-testid="sla-banner">
            <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-sm text-blue-200">{t("order.sla")}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* File & details */}
          <div className="rounded-lg border border-slate-800 bg-[#13151F] p-6 space-y-4">
            <div>
              <p className="text-xs font-mono-tech uppercase text-slate-500 mb-2">{t("detail.designFile")}</p>
              <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-[#1E2130] border border-slate-700">
                <div className="flex items-center gap-3 min-w-0">
                  <FileBox className="h-5 w-5 text-blue-400 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-slate-200 truncate">{order.file?.original_filename}</span>
                </div>
                <a href={fileUrl(order.file?.storage_path)} target="_blank" rel="noreferrer" download data-testid="download-design">
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-200 bg-transparent h-8"><Download className="h-3.5 w-3.5" /></Button>
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-mono-tech uppercase text-slate-500 mb-1">{t("dash.material")}</p>
              <p className="text-slate-200">{order.material_name}</p>
            </div>
            {order.notes && (
              <div>
                <p className="text-xs font-mono-tech uppercase text-slate-500 mb-1">{t("detail.notes")}</p>
                <p className="text-slate-300 text-sm">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Estimate + Payment */}
          <div className="rounded-lg border border-slate-800 bg-[#13151F] p-6 space-y-4">
            <p className="text-xs font-mono-tech uppercase text-slate-500">{t("detail.estimate")}</p>
            {order.estimate ? (
              <>
                <p className="font-heading text-3xl font-bold text-white">{rupiah(order.estimate.amount)}</p>
                {order.estimate.note && <p className="text-sm text-slate-400">{order.estimate.note}</p>}

                {order.status === "awaiting_payment" && settings && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <p className="text-xs font-mono-tech uppercase text-slate-500 flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5" /> {t("detail.payTitle")}</p>
                    <PayRow label={t("detail.bank")} value={settings.bank_name} />
                    <PayRow label={t("detail.accountNo")} value={settings.account_number} mono />
                    <PayRow label={t("detail.accountName")} value={settings.account_holder} />
                  </div>
                )}

                {order.payment ? (
                  order.payment.verified ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm" data-testid="payment-verified"><CheckCircle2 className="h-4 w-4" /> {t("detail.verified")}</div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400 text-sm" data-testid="proof-uploaded"><Clock className="h-4 w-4" /> {t("detail.proofUploaded")}</div>
                  )
                ) : order.status === "awaiting_payment" ? (
                  <>
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" data-testid="proof-input" onChange={(e) => uploadProof(e.target.files[0])} />
                    <Button onClick={() => fileRef.current.click()} disabled={uploading} data-testid="upload-proof-btn" className="bg-blue-600 hover:bg-blue-500 w-full">
                      <Upload className="mr-2 h-4 w-4" /> {uploading ? t("common.loading") : t("detail.uploadProof")}
                    </Button>
                  </>
                ) : null}
              </>
            ) : (
              <p className="text-slate-500 text-sm">{t("detail.notEstimated")}</p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-lg border border-slate-800 bg-[#13151F] p-6 mt-6">
          <p className="text-xs font-mono-tech uppercase text-slate-500 mb-4">{t("detail.timeline")}</p>
          <div className="space-y-4">
            {[...order.status_history].reverse().map((h, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1.5" />
                  {i < order.status_history.length - 1 && <span className="w-px flex-1 bg-slate-700" />}
                </div>
                <div className="pb-2">
                  <StatusBadge status={h.status} />
                  {h.note && <p className="text-sm text-slate-400 mt-1">{h.note}</p>}
                  <p className="text-xs text-slate-600 mt-0.5 font-mono-tech">{fmtDate(h.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PayRow({ label, value, mono }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`text-slate-200 ${mono ? "font-mono-tech" : ""}`}>{value}</span>
    </div>
  );
}
