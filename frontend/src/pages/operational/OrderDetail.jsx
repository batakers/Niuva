import React, { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download, Upload, Clock, CheckCircle2, FileBox, Banknote, TerminalSquare, AlertTriangle } from "lucide-react";
import { useI18n } from "../../i18n";
import { OperationalLayout } from "@/components/layout/Layout";
import { StatusStepper, StatusBadge } from "@/components/operational/StatusStepper";
import { api, downloadFile, formatApiError } from "../../lib/api";
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

  const load = useCallback(
    () => api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch(() => nav("/dashboard")),
    [id, nav]
  );

  useEffect(() => {
    load();
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, [id, load]);

  const downloadDesign = async () => {
    try {
      await downloadFile(order.file?.storage_path, order.file?.original_filename);
    } catch {
      toast.error("File tidak dapat diunduh");
    }
  };

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

  if (!order) return (
    <OperationalLayout>
      <div className="w-full text-center py-24 text-sm text-muted-foreground" role="status">
        {t("common.loading")}
      </div>
    </OperationalLayout>
  );

  return (
    <OperationalLayout>
      <div className="w-full max-w-5xl mx-auto space-y-6">

        <button onClick={() => nav("/dashboard")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-[10px] uppercase tracking-widest mb-2 transition-colors border border-transparent hover:border-border bg-surface-2/0 hover:bg-surface-2 px-3 py-1.5 -ml-3" data-testid="back-to-dash">
          <ArrowLeft className="h-3 w-3" /> {t("common.back")} // DASHBOARD
        </button>

        {/* Order Header */}
        <div className="border border-border bg-surface-1">
          <div className="border-b border-border bg-surface-2 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {t("detail.headerLabel")} · ID: {order.id.substring(0,8)}
              </span>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="p-6 sm:p-8 flex items-end justify-between flex-wrap gap-4 relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-mono text-primary font-bold text-sm tracking-widest mb-2">{order.order_number}</p>
              <h1 className="font-heading text-3xl font-bold text-foreground uppercase tracking-tight">{t("detail.title")}</h1>
            </div>
          </div>
        </div>

        {/* Stepper HUD */}
        <div className="border border-border bg-surface-1 p-6 sm:p-8">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-6">{t("detail.productionStatus")}</p>
          <StatusStepper status={order.status} />
        </div>

        {/* SLA Banner */}
        {order.status === "pending_estimate" && (
          <div className="border border-primary/50 bg-primary/10 p-4 flex items-center gap-3" data-testid="sla-banner">
            <Clock className="h-5 w-5 text-primary flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-mono text-[10px] text-primary uppercase tracking-widest">{t("detail.notice")}</p>
              <p className="text-sm text-foreground">{t("order.sla")}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* File & Details Specs */}
          <div className="border border-border bg-surface-1 h-full flex flex-col">
            <div className="border-b border-border/50 p-4 bg-surface-2">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{t("detail.specifications")}</p>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div>
                <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">{t("detail.designFile")}</p>
                <div className="flex items-center justify-between gap-3 p-4 border border-border bg-background">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileBox className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                    <span className="font-mono text-sm text-foreground truncate">{order.file?.original_filename}</span>
                  </div>
                  <Button type="button" onClick={downloadDesign} data-testid="download-design" size="sm" variant="outline" className="rounded-none border-border hover:border-primary uppercase tracking-widest font-mono text-[10px] px-3 h-8">
                    <Download className="h-3.5 w-3.5 mr-2" /> DL
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border p-4 bg-background">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t("dash.material")}</p>
                  <p className="font-heading font-bold text-foreground">{order.material_name}</p>
                </div>
                <div className="border border-border p-4 bg-background">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t("detail.dateLogged")}</p>
                  <p className="font-heading font-bold text-foreground text-sm truncate">{fmtDate(order.created_at)}</p>
                </div>
              </div>
              {order.notes && (
                <div className="border border-border p-4 bg-background">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{t("detail.notes")}</p>
                  <p className="font-mono text-sm text-foreground whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estimate + Payment */}
          <div className="border border-border bg-surface-1 h-full flex flex-col">
            <div className="border-b border-border/50 p-4 bg-surface-2 flex justify-between items-center">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{t("detail.costEstimate")}</p>
              {!order.estimate && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-warm uppercase tracking-widest">
                  <AlertTriangle className="h-3 w-3" /> PENDING
                </span>
              )}
            </div>

            <div className="p-6 space-y-6 flex-1 flex flex-col">
              {order.estimate ? (
                <>
                  <div className="border-b border-border pb-6">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{t("detail.estimate")}</p>
                    <p className="font-heading text-4xl font-black text-foreground tracking-tight">{rupiah(order.estimate.amount)}</p>
                    {order.estimate.note && (
                      <p className="font-mono text-xs text-muted-foreground mt-3 p-3 border border-border bg-background">
                        {order.estimate.note}
                      </p>
                    )}
                  </div>

                  {order.status === "awaiting_payment" && settings && (
                    <div className="space-y-3">
                      <p className="font-mono text-[10px] text-primary flex items-center gap-1.5 uppercase tracking-widest">
                        <Banknote className="h-3.5 w-3.5" /> {t("detail.payTitle")}
                      </p>
                      <div className="border border-border bg-background p-4 space-y-2">
                        <PayRow label={t("detail.bank")} value={settings.bank_name} />
                        <PayRow label={t("detail.accountNo")} value={settings.account_number} mono highlight />
                        <PayRow label={t("detail.accountName")} value={settings.account_holder} />
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6">
                    {order.payment ? (
                      order.payment.verified ? (
                        <div className="flex items-center gap-2 text-status-success font-mono text-xs uppercase tracking-widest p-4 border border-status-success/30 bg-status-success/5" data-testid="payment-verified">
                          <CheckCircle2 className="h-4 w-4" /> {t("detail.verified")}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-warm font-mono text-xs uppercase tracking-widest p-4 border border-warm/30 bg-warm/5" data-testid="proof-uploaded">
                          <Clock className="h-4 w-4 animate-pulse" /> {t("detail.proofUploaded")} · {t("detail.awaitingVerification")}
                        </div>
                      )
                    ) : order.status === "awaiting_payment" ? (
                      <>
                        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" data-testid="proof-input" onChange={(e) => uploadProof(e.target.files[0])} />
                        <Button onClick={() => fileRef.current.click()} disabled={uploading} data-testid="upload-proof-btn" className="w-full rounded-none h-12 font-mono text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">
                          <Upload className="mr-2 h-4 w-4" /> {uploading ? t("detail.sending") : t("detail.uploadProof")}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <Clock className="h-8 w-8 mb-4 text-muted-foreground" />
                  <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">{t("detail.notEstimated")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="border border-border bg-surface-1">
          <div className="border-b border-border/50 p-4 bg-surface-2">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{t("detail.eventLog")}</p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {[...order.status_history].reverse().map((h, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">

                  {/* Timeline icon */}
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-border bg-background text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ml-0.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] border border-border bg-surface-2 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <StatusBadge status={h.status} />
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{fmtDate(h.at)}</span>
                    </div>
                    {h.note && <p className="font-mono text-xs text-foreground mt-2 border-l-2 border-primary/30 pl-3">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </OperationalLayout>
  );
}

function PayRow({ label, value, mono, highlight }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className={`${mono ? "font-mono" : "font-heading font-medium"} text-sm ${highlight ? "text-primary text-base" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
