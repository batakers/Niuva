import { ArrowLeft, ArrowRight, CircleAlert, History, Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { StatusBadge } from "@/components/operational/StatusStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OperationalState } from "@/components/ui/operational-state";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDate, rupiah } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

// Each action names the single stage it advances to. The backend owns the
// graph; this only translates an offered action into its target.
const ACTION_TARGETS = {
  request_payment: "awaiting_payment",
  mark_paid: "paid",
  start_file_review: "file_review",
  queue: "queued",
  start_production: "in_production",
  submit_quality_control: "quality_control",
  mark_ready_to_ship: "ready_to_ship",
  mark_ready_to_pickup: "ready_to_pickup",
  mark_shipped: "shipped",
  mark_picked_up: "picked_up",
  complete: "completed",
};

function operationId() {
  return globalThis.crypto?.randomUUID?.() ||
    `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function blockerFor(record, t) {
  if (record.status === "awaiting_payment") return t("retail.blockerPayment");
  if (record.status === "file_review") return t("retail.blockerFileReview");
  if (record.status === "quality_control") return t("retail.blockerQualityControl");
  if (!record.permitted_next_actions?.length) return t("b2b.noNextAction");
  return t("b2b.noBlockerDetected");
}

export default function RetailOrderDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const canWrite = hasPermission(user, "orders.write");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get(`/admin/retail-orders/${id}`)
      .then((response) => setRecord(response.data))
      .catch((requestError) =>
        setError(formatApiError(requestError.response?.data?.detail))
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (action) => {
    if (reason.trim().length < 3) {
      toast.error(t("b2b.reasonRequired"));
      return;
    }
    setBusyAction(action);
    try {
      await api.post(`/admin/retail-orders/${id}/transitions`, {
        target_status: ACTION_TARGETS[action],
        expected_version: record.version,
        operation_id: operationId(),
        reason: reason.trim(),
      });
      setReason("");
      toast.success(t("b2b.actionApplied"));
      load();
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusyAction("");
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t("admin.retailOrders")}>
        <OperationalState state="loading" title={t("common.loading")} />
      </AdminLayout>
    );
  }
  if (error && !record) {
    return (
      <AdminLayout title={t("admin.retailOrders")}>
        <OperationalState
          state="error"
          title={t("b2b.loadFailed")}
          description={error}
          retryLabel={t("common.retry")}
          onRetry={load}
        />
      </AdminLayout>
    );
  }

  const actionable = canWrite
    ? (record.permitted_next_actions || []).filter((action) => ACTION_TARGETS[action])
    : [];

  return (
    <AdminLayout
      title={`${t("admin.retailOrders")} · ${record.order_number}`}
      subtitle={`${t("b2b.version")} ${record.version}`}
    >
      <Link
        to="/admin/retail-orders"
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-action-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("common.back")}
      </Link>

      {error && (
        <OperationalState
          state="conflict"
          title={t("b2b.commandFailed")}
          description={error}
          retryLabel={t("common.retry")}
          onRetry={load}
          className="mb-5 min-h-0"
        />
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <SurfacePanel>
            <SurfacePanelHeader className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="type-label text-text-secondary">{t("b2b.currentStatus")}</p>
                <div className="mt-2"><StatusBadge status={record.status} /></div>
              </div>
              <p className="font-mono text-xs text-text-secondary">
                {record.order_number}
              </p>
            </SurfacePanelHeader>
            <dl className="grid gap-px bg-border-default sm:grid-cols-2">
              <Fact label={t("retail.customer")} value={record.customer?.name} />
              <Fact
                label={t("common.email")}
                value={record.customer?.email}
              />
              <Fact
                label={t("retail.fulfilment")}
                value={t(`retail.fulfilment.${record.fulfilment_method}`)}
              />
              <Fact label={t("b2b.total")} value={rupiah(record.total_minor)} />
              {record.notes && (
                <Fact className="sm:col-span-2" label={t("retail.notes")} value={record.notes} />
              )}
            </dl>
          </SurfacePanel>

          <SurfacePanel data-testid="retail-order-items">
            <SurfacePanelHeader>
              <p className="type-label text-action-primary">{t("retail.items")}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
                {t("retail.itemsTitle")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {t("retail.itemsNote")}
              </p>
            </SurfacePanelHeader>
            <ul className="divide-y divide-border-default">
              {(record.items || []).map((item, index) => (
                <li
                  key={`${item.variant_id}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">
                      {item.product_snapshot?.name || item.variant_id}
                    </p>
                    <TechnicalLabel size="micro">
                      {item.configuration_snapshot?.sku || item.variant_id}
                    </TechnicalLabel>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-text-primary">
                      {rupiah(item.line_total_minor)}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-text-disabled">
                      {item.quantity} × {rupiah(item.unit_price_minor)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border-default bg-surface-muted px-5 py-4">
              <p className="type-label text-text-secondary">{t("b2b.total")}</p>
              <p className="font-mono text-base font-semibold text-text-primary">
                {rupiah(record.total_minor)}
              </p>
            </div>
          </SurfacePanel>

          <SurfacePanel data-testid="retail-order-spine">
            <SurfacePanelHeader>
              <p className="type-label text-action-primary">{t("admin.operationalSpine")}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
                {t("b2b.auditTimeline")}
              </h2>
            </SurfacePanelHeader>
            <ol className="p-5">
              {[...(record.history || [])].reverse().map((event, index) => (
                <li
                  key={`${event.operation_id || "initial"}-${index}`}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  <div className="absolute bottom-0 left-[15px] top-8 w-px bg-border-default" aria-hidden="true" />
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-default">
                    <History className="h-3.5 w-3.5 text-action-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {event.from_status && <StatusBadge status={event.from_status} />}
                      <ArrowRight className="h-3.5 w-3.5 text-text-disabled" aria-hidden="true" />
                      <StatusBadge status={event.to_status} />
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{event.reason}</p>
                    <p className="mt-1 font-mono text-[11px] text-text-disabled">
                      {fmtDate(event.timestamp)}
                      {event.operation_id ? ` · ${event.operation_id}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </SurfacePanel>
        </div>

        <aside className="space-y-5">
          <SurfacePanel padding="md">
            <p className="type-label text-text-secondary">{t("b2b.blockers")}</p>
            <div className="mt-3 flex gap-3 border-l-2 border-status-warning/50 pl-3">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" aria-hidden="true" />
              <p className="text-sm leading-6 text-text-secondary">
                {blockerFor(record, t)}
              </p>
            </div>
          </SurfacePanel>

          <SurfacePanel padding="md">
            <p className="type-label text-text-secondary">{t("b2b.nextActions")}</p>
            {actionable.length > 0 ? (
              <div className="mt-4 space-y-3">
                <Input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t("b2b.reasonPlaceholder")}
                  aria-label={t("b2b.reason")}
                  className="min-h-11"
                />
                {actionable.map((action) => (
                  <Button
                    key={action}
                    type="button"
                    className="min-h-11 w-full justify-between"
                    loading={busyAction === action}
                    disabled={Boolean(busyAction)}
                    onClick={() => runAction(action)}
                    data-testid={`retail-action-${action}`}
                  >
                    {t(`retail.action.${action}`)}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {t("b2b.noAvailableAction")}
              </p>
            )}
          </SurfacePanel>

          {(record.suspended_actions || []).length > 0 && (
            <SurfacePanel padding="md" intent="dashed" data-testid="retail-suspended">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                <p className="type-label text-text-secondary">
                  {t("retail.suspendedTitle")}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {t("retail.suspendedBody")}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {record.suspended_actions.map((action) => (
                  <li key={action}>
                    <TechnicalLabel size="micro">
                      {t(`retail.suspended.${action}`)}
                    </TechnicalLabel>
                  </li>
                ))}
              </ul>
            </SurfacePanel>
          )}
        </aside>
      </div>
    </AdminLayout>
  );
}

function Fact({ label, value, className = "" }) {
  return (
    <div className={`bg-surface-default p-5 ${className}`}>
      <dt className="type-label text-text-secondary">{label}</dt>
      <dd className="mt-2 text-sm text-text-primary">{value}</dd>
    </div>
  );
}
