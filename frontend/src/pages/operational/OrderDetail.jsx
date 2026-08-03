import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileBox,
  TerminalSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { OperationalLayout } from "@/components/layout/Layout";
import { StatusBadge, StatusStepper } from "@/components/operational/StatusStepper";
import { useI18n } from "@/i18n";
import { api, downloadApiFile } from "@/lib/api";
import { fmtDate, rupiah } from "@/lib/format";

export default function OrderDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);

  const load = useCallback(
    () =>
      api
        .get(`/orders/${id}`)
        .then((r) => setOrder(r.data))
        .catch(() => nav("/dashboard")),
    [id, nav]
  );

  useEffect(() => {
    load();
  }, [load]);

  const downloadDesign = async () => {
    try {
      await downloadApiFile(
        `/orders/${order.id}/design-file`,
        order.file?.original_filename
      );
    } catch {
      toast.error("File tidak dapat diunduh");
    }
  };

  if (!order)
    return (
      <OperationalLayout>
        <div
          className="w-full text-center py-24 text-sm text-text-secondary"
          role="status"
        >
          {t("common.loading")}
        </div>
      </OperationalLayout>
    );

  return (
    <OperationalLayout>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => nav("/dashboard")}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-mono text-[10px] uppercase tracking-widest mb-2 transition-colors border border-transparent hover:border-border-default bg-surface-muted/0 hover:bg-surface-muted px-3 py-1.5 -ml-3"
          data-testid="back-to-dash"
        >
          <ArrowLeft className="h-3 w-3" /> {t("common.back")} // DASHBOARD
        </button>

        {/* Order Header */}
        <div className="border border-border-default bg-surface-default">
          <div className="border-b border-border-default bg-surface-muted px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-4 w-4 text-text-secondary" />
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                {t("detail.headerLabel")} · ID: {order.id.substring(0, 8)}
              </span>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="p-6 sm:p-8 flex items-end justify-between flex-wrap gap-4 relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-mono text-action-primary font-bold text-sm tracking-widest mb-2">
                {order.order_number}
              </p>
              <h1 className="font-heading text-3xl font-bold text-text-primary uppercase tracking-tight">
                {t("detail.title")}
              </h1>
            </div>
          </div>
        </div>

        {/* Stepper HUD */}
        <div className="border border-border-default bg-surface-default p-6 sm:p-8">
          <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-6">
            {t("detail.productionStatus")}
          </p>
          <StatusStepper status={order.status} />
        </div>

        {/* SLA Banner */}
        {order.status === "pending_estimate" && (
          <div
            className="border border-action-primary/50 bg-action-primary/10 p-4 flex items-center gap-3"
            data-testid="sla-banner"
          >
            <Clock
              className="h-5 w-5 text-action-primary flex-shrink-0"
              strokeWidth={1.5}
            />
            <div>
              <p className="font-mono text-[10px] text-action-primary uppercase tracking-widest">
                {t("detail.notice")}
              </p>
              <p className="text-sm text-text-primary">{t("order.sla")}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* File & Details Specs */}
          <div className="border border-border-default bg-surface-default h-full flex flex-col">
            <div className="border-b border-border-default/50 p-4 bg-surface-muted">
              <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                {t("detail.specifications")}
              </p>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div>
                <p className="font-mono text-[10px] text-action-primary uppercase tracking-widest mb-2">
                  {t("detail.designFile")}
                </p>
                <div className="flex items-center justify-between gap-3 p-4 border border-border-default bg-surface-page">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileBox
                      className="h-5 w-5 text-text-secondary flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="font-mono text-sm text-text-primary truncate">
                      {order.file?.original_filename}
                    </span>
                  </div>
                  <Button
                    type="button"
                    onClick={downloadDesign}
                    data-testid="download-design"
                    size="sm"
                    variant="outline"
                    className="uppercase tracking-widest font-mono text-[10px] px-3 h-8"
                  >
                    <Download className="h-3.5 w-3.5 mr-2" /> DL
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border-default p-4 bg-surface-page">
                  <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-1">
                    {t("dash.material")}
                  </p>
                  <p className="font-heading font-bold text-text-primary">
                    {order.material_name}
                  </p>
                </div>
                <div className="border border-border-default p-4 bg-surface-page">
                  <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-1">
                    {t("detail.dateLogged")}
                  </p>
                  <p className="font-heading font-bold text-text-primary text-sm truncate">
                    {fmtDate(order.created_at)}
                  </p>
                </div>
              </div>
              {order.notes && (
                <div className="border border-border-default p-4 bg-surface-page">
                  <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-2">
                    {t("detail.notes")}
                  </p>
                  <p className="font-mono text-sm text-text-primary whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Estimate + Payment */}
          <div className="border border-border-default bg-surface-default h-full flex flex-col">
            <div className="border-b border-border-default/50 p-4 bg-surface-muted flex justify-between items-center">
              <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                {t("detail.costEstimate")}
              </p>
              {!order.estimate && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-status-warning uppercase tracking-widest">
                  <AlertTriangle className="h-3 w-3" /> PENDING
                </span>
              )}
            </div>

            <div className="p-6 space-y-6 flex-1 flex flex-col">
              {order.estimate ? (
                <>
                  <div className="border-b border-border-default pb-6">
                    <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-2">
                      {t("detail.estimate")}
                    </p>
                    <p className="font-heading text-4xl font-black text-text-primary tracking-tight">
                      {rupiah(order.estimate.amount)}
                    </p>
                    {order.estimate.note && (
                      <p className="font-mono text-xs text-text-secondary mt-3 p-3 border border-border-default bg-surface-page">
                        {order.estimate.note}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-6">
                    {order.payment ? (
                      order.payment.verified ? (
                        <div
                          className="flex items-center gap-2 text-status-success font-mono text-xs uppercase tracking-widest p-4 border border-status-success/30 bg-status-success/5"
                          data-testid="payment-verified"
                        >
                          <CheckCircle2 className="h-4 w-4" /> {t("detail.verified")}
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 text-status-warning font-mono text-xs uppercase tracking-widest p-4 border border-status-warning/30 bg-status-warning/5"
                          data-testid="proof-uploaded"
                        >
                          <Clock className="h-4 w-4 motion-safe:animate-pulse" />{" "}
                          {t("detail.proofUploaded")} · {t("detail.awaitingVerification")}
                        </div>
                      )
                    ) : order.status === "awaiting_payment" ? (
                      <div
                        className="border border-border-default bg-surface-page p-4"
                        role="status"
                      >
                        <p className="font-heading text-sm font-semibold text-text-primary">
                          {t("payment.providerInactive")}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {t("payment.mutationsDisabled")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <Clock className="h-8 w-8 mb-4 text-text-secondary" />
                  <p className="font-mono text-sm text-text-secondary uppercase tracking-widest">
                    {t("detail.notEstimated")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="border border-border-default bg-surface-default">
          <div className="border-b border-border-default/50 p-4 bg-surface-muted">
            <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              {t("detail.eventLog")}
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-border-default before:to-transparent">
              {[...order.status_history].reverse().map((h, i) => (
                <div
                  key={i}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4"
                >
                  {/* Timeline icon */}
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-border-default bg-surface-page text-action-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ml-0.5">
                    <div className="w-1.5 h-1.5 bg-action-primary rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] border border-border-default bg-surface-muted p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <StatusBadge status={h.status} />
                      <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                        {fmtDate(h.at)}
                      </span>
                    </div>
                    {h.note && (
                      <p className="font-mono text-xs text-text-primary mt-2 border-l-2 border-action-primary/30 pl-3">
                        {h.note}
                      </p>
                    )}
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
