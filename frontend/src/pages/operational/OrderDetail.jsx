import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, Download, FileBox, History } from "lucide-react";
import { toast } from "sonner";

import { OperationalLayout } from "@/components/layout/Layout";
import { LegacyOrderStatusBadge } from "@/components/operational/LegacyOrderStatusBadge";
import { StatusStepper } from "@/components/operational/StatusStepper";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OperationalState } from "@/components/ui/operational-state";
import {
  SurfacePanel,
  SurfacePanelHeader,
} from "@/components/ui/surface-panel";
import { useI18n } from "@/i18n";
import { api, downloadApiFile } from "@/lib/api";
import { fmtDate, rupiah } from "@/lib/format";

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-text-primary">
        {children}
      </dd>
    </div>
  );
}

export default function OrderDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const loadRequestRef = useRef(null);

  const load = useCallback(() => {
    if (loadRequestRef.current) return loadRequestRef.current;

    setLoading(true);
    setLoadError(false);

    const request = api
      .get(`/orders/${id}`)
      .then((response) => setOrder(response.data))
      .catch(() => setLoadError(true))
      .finally(() => {
        if (loadRequestRef.current === request) {
          loadRequestRef.current = null;
        }
        setLoading(false);
      });

    loadRequestRef.current = request;
    return request;
  }, [id]);

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
      toast.error(t("detail.downloadError"));
    }
  };

  if (loading) {
    return (
      <OperationalLayout>
        <OperationalState
          state="loading"
          title={t("detail.loadingTitle")}
          description={t("detail.loadingDescription")}
          className="mx-auto max-w-5xl rounded-panel"
        />
      </OperationalLayout>
    );
  }

  if (loadError || !order) {
    return (
      <OperationalLayout>
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <Button asChild variant="ghost" className="-ml-3">
            <Link to="/dashboard">
              <span aria-hidden="true">←</span>
              {t("common.back")}
            </Link>
          </Button>
          <OperationalState
            state="error"
            title={t("detail.errorTitle")}
            description={t("detail.errorDescription")}
            retryLabel={t("common.retry")}
            onRetry={load}
            className="rounded-panel"
          />
        </div>
      </OperationalLayout>
    );
  }

  const history = Array.isArray(order.status_history)
    ? [...order.status_history].reverse()
    : [];

  return (
    <OperationalLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/dashboard" data-testid="back-to-dash">
            <span aria-hidden="true">←</span>
            {t("detail.backToOrders")}
          </Link>
        </Button>

        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm font-semibold text-action-primary">
              {order.order_number}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {t("detail.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              {t("detail.subtitle")}
            </p>
          </div>
          <LegacyOrderStatusBadge status={order.status} className="w-fit" />
        </header>

        <Alert tone="default" role="status" className="px-4 py-4">
          <p className="font-semibold text-text-primary">
            {t("detail.readOnlyTitle")}
          </p>
          <p className="mt-1 leading-6 text-text-secondary">
            {t("detail.readOnlyDescription")}
          </p>
        </Alert>

        <SurfacePanel className="overflow-hidden">
          <SurfacePanelHeader>
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              {t("detail.productionStatus")}
            </h2>
          </SurfacePanelHeader>
          <div className="p-5 sm:p-6">
            <StatusStepper status={order.status} />
          </div>
        </SurfacePanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <SurfacePanel className="overflow-hidden">
            <SurfacePanelHeader>
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                {t("detail.specifications")}
              </h2>
            </SurfacePanelHeader>
            <dl className="divide-y divide-border-default px-5 sm:px-6">
              {order.file?.original_filename && (
                <DetailRow label={t("detail.designFile")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileBox
                        className="h-4 w-4 shrink-0 text-text-secondary"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                      <span className="truncate font-mono text-xs sm:text-sm">
                        {order.file.original_filename}
                      </span>
                    </span>
                    <Button
                      type="button"
                      onClick={downloadDesign}
                      data-testid="download-design"
                      size="sm"
                      variant="outline"
                      className="w-full shrink-0 sm:w-auto"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      {t("detail.download")}
                    </Button>
                  </div>
                </DetailRow>
              )}
              <DetailRow label={t("dash.material")}>
                {order.material_name || "—"}
              </DetailRow>
              <DetailRow label={t("detail.dateLogged")}>
                <span className="tabular-nums">
                  {fmtDate(order.created_at)}
                </span>
              </DetailRow>
            </dl>
          </SurfacePanel>

          <SurfacePanel className="overflow-hidden">
            <SurfacePanelHeader>
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                {t("detail.costEstimate")}
              </h2>
            </SurfacePanelHeader>
            <div className="p-5 sm:p-6">
              {order.estimate ? (
                <div>
                  <p className="text-sm text-text-secondary">
                    {t("detail.estimate")}
                  </p>
                  <p className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                    {rupiah(order.estimate.amount)}
                  </p>
                  {order.estimate.estimated_at && (
                    <p className="mt-2 text-sm tabular-nums text-text-secondary">
                      {t("detail.estimatedAt")} {fmtDate(order.estimate.estimated_at)}
                    </p>
                  )}

                  <div className="mt-6 border-t border-border-default pt-6">
                    <p className="mb-3 text-sm font-semibold text-text-primary">
                      {t("detail.paymentHistory")}
                    </p>
                    {order.payment?.verified ? (
                      <Alert
                        tone="default"
                        role="status"
                        data-testid="payment-verified"
                        className="border-status-success/40 bg-status-success/10 text-status-success"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <CheckCircle2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          {t("detail.verified")}
                        </span>
                      </Alert>
                    ) : order.payment ? (
                      <Alert
                        tone="warning"
                        role="status"
                        data-testid="proof-uploaded"
                      >
                        {t("detail.proofUploaded")}
                      </Alert>
                    ) : (
                      <Alert tone="default" role="status">
                        <p className="font-semibold text-text-primary">
                          {t("payment.providerInactive")}
                        </p>
                        <p className="mt-1 leading-6 text-text-secondary">
                          {t("payment.mutationsDisabled")}
                        </p>
                      </Alert>
                    )}
                    <p className="mt-3 text-xs text-text-secondary">
                      {t("payment.legacyReadOnly")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center text-center">
                  <Clock3
                    className="h-7 w-7 text-text-disabled"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-semibold text-text-primary">
                    {t("detail.notEstimated")}
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                    {t("detail.notEstimatedDescription")}
                  </p>
                </div>
              )}
            </div>
          </SurfacePanel>
        </div>

        <SurfacePanel className="overflow-hidden">
          <SurfacePanelHeader className="flex items-center gap-3">
            <History
              className="h-5 w-5 text-action-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div>
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                {t("detail.eventLog")}
              </h2>
              <p className="mt-0.5 text-sm text-text-secondary">
                {t("detail.historyDescription")}
              </p>
            </div>
          </SurfacePanelHeader>
          <div className="p-5 sm:p-6">
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-secondary">
                {t("detail.noHistory")}
              </p>
            ) : (
              <ol
                className="ml-2 border-l border-border-default"
                data-testid="order-history"
              >
                {history.map((event, index) => (
                  <li
                    key={`${event.status}-${event.at || index}`}
                    className="relative pb-7 pl-7 last:pb-0"
                  >
                    <span
                      className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-surface-default bg-action-primary ring-1 ring-border-default"
                      aria-hidden="true"
                    />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <LegacyOrderStatusBadge
                        status={event.status}
                        className="w-fit"
                      />
                      {event.at && (
                        <time className="text-xs tabular-nums text-text-secondary">
                          {fmtDate(event.at)}
                        </time>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </SurfacePanel>
      </div>
    </OperationalLayout>
  );
}
