import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  History,
  PackageCheck,
  PackageMinus,
} from "lucide-react";
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
import { fetchB2BPages } from "@/lib/b2bPagination";
import { fmtDate } from "@/lib/format";
import { B2B_ACTION_PERMISSIONS, hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

const TRANSITION_TARGETS = {
  start: "in_progress",
  complete: "completed",
  cancel: "cancelled",
};

function operationId() {
  return globalThis.crypto?.randomUUID?.() ||
    `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Allocation and consumption are separate commands, not status transitions, so
// they are not in permitted_next_actions. Their availability follows the run's
// own material state rather than the transition graph.
function materialActions(record) {
  const allocated = (record.reservation_ids || []).length > 0;
  const actions = [];
  if (record.status === "planned" && !allocated) actions.push("allocate");
  if (record.status === "in_progress" && allocated && !record.materials_consumed) {
    actions.push("consume");
  }
  return actions;
}

function blockerFor(record, shortage, t) {
  if (shortage) return t("workOrder.blockerShortage");
  if (record.status === "planned" && !(record.reservation_ids || []).length) {
    return t("workOrder.blockerUnallocated");
  }
  if (record.status === "in_progress" && !record.materials_consumed) {
    return t("workOrder.blockerConsumption");
  }
  if (!record.permitted_next_actions?.length) return t("b2b.noNextAction");
  return t("b2b.noBlockerDetected");
}

export default function WorkOrderDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();

  const [record, setRecord] = useState(null);
  const [shortage, setShortage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get(`/admin/b2b/work-orders/${id}`),
      // A stalled run is only meaningful next to the run itself.
      fetchB2BPages(api, "/admin/b2b/material-shortages", {
        params: { status_filter: "open" },
      }).catch(() => []),
    ])
      .then(([detail, shortages]) => {
        setRecord(detail.data);
        setShortage(
          shortages.find((item) => item.work_order_id === id) || null
        );
      })
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
    const command = {
      expected_version: record.version,
      operation_id: operationId(),
      reason: reason.trim(),
    };
    try {
      if (action === "allocate" || action === "consume") {
        await api.post(`/admin/b2b/work-orders/${id}/${action}`, command);
      } else {
        await api.post(`/admin/b2b/work-orders/${id}/transitions`, {
          ...command,
          target_status: TRANSITION_TARGETS[action],
        });
      }
      setReason("");
      toast.success(t("b2b.actionApplied"));
      load();
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setError(formatApiError(detail));
      // A shortage is answered with its deficit lines; reload so the panel
      // shows what to restock instead of only the message.
      if (detail?.code === "work_order_material_shortage") load();
    } finally {
      setBusyAction("");
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t("admin.workOrders")}>
        <OperationalState state="loading" title={t("common.loading")} />
      </AdminLayout>
    );
  }
  if (error && !record) {
    return (
      <AdminLayout title={t("admin.workOrders")}>
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

  const permitted = [
    ...(record.permitted_next_actions || []),
    ...materialActions(record),
  ].filter((action) =>
    hasPermission(user, B2B_ACTION_PERMISSIONS.work_order[action])
  );

  return (
    <AdminLayout
      title={`${t("admin.workOrders")} · ${record.id.slice(0, 8)}`}
      subtitle={`${t("b2b.version")} ${record.version}`}
    >
      <Link
        to={`/admin/b2b/projects/${record.project_id}`}
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-action-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("workOrder.backToProject")}
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
              <p className="font-mono text-xs text-text-secondary">{record.id}</p>
            </SurfacePanelHeader>
            <dl className="grid gap-px bg-border-default sm:grid-cols-2">
              <Fact label={t("workOrder.quantity")} value={record.quantity} />
              <Fact label={t("workOrder.variant")} value={record.variant_id} mono />
              <Fact label={t("b2b.quote")} value={record.quote_id} mono />
              <Fact
                label={t("workOrder.materialsConsumed")}
                value={record.materials_consumed ? t("common.yes") : t("common.no")}
              />
            </dl>
          </SurfacePanel>

          <SurfacePanel data-testid="work-order-requirements">
            <SurfacePanelHeader>
              <p className="type-label text-action-primary">{t("workOrder.materials")}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
                {t("workOrder.requirementsTitle")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {t("workOrder.requirementsNote")}
              </p>
            </SurfacePanelHeader>
            {(record.material_requirements || []).length === 0 ? (
              <p className="p-5 text-sm leading-6 text-text-secondary">
                {t("workOrder.noRequirements")}
              </p>
            ) : (
              <ul className="divide-y divide-border-default">
                {record.material_requirements.map((entry) => (
                  <li
                    key={entry.material_id}
                    className="flex flex-wrap items-center justify-between gap-3 p-5"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary">
                        {entry.name || entry.material_id}
                      </p>
                      <TechnicalLabel size="micro">
                        {entry.sku || entry.material_id}
                      </TechnicalLabel>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-text-primary">
                        {entry.quantity_required} {entry.base_unit || ""}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-text-disabled">
                        {entry.quantity_per_unit} × {record.quantity}
                      </p>
                    </div>
                    <Link
                      to={`/admin/stock-movements?subject_type=material&subject_id=${encodeURIComponent(entry.material_id)}`}
                      className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-action-primary"
                    >
                      {t("inventory.viewMovements")}
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {(record.reservation_ids || []).length > 0 && (
              <div className="flex items-center gap-2 border-t border-border-default bg-surface-muted px-5 py-4">
                <PackageCheck
                  className="h-4 w-4 text-status-success"
                  aria-hidden="true"
                />
                <p className="text-sm text-text-secondary">
                  {t("workOrder.allocatedCount")}: {record.reservation_ids.length}
                </p>
              </div>
            )}
          </SurfacePanel>

          <SurfacePanel data-testid="work-order-spine">
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
                      {event.event && (
                        <TechnicalLabel tone="primary" size="micro">
                          {t(`workOrder.event.${event.event}`)}
                        </TechnicalLabel>
                      )}
                      {event.from_status !== event.to_status && (
                        <>
                          {event.from_status && <StatusBadge status={event.from_status} />}
                          <ArrowRight className="h-3.5 w-3.5 text-text-disabled" aria-hidden="true" />
                          <StatusBadge status={event.to_status} />
                        </>
                      )}
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
          <SurfacePanel padding="md" data-testid="work-order-blockers">
            <p className="type-label text-text-secondary">{t("b2b.blockers")}</p>
            <div className="mt-3 flex gap-3 border-l-2 border-status-warning/50 pl-3">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" aria-hidden="true" />
              <p className="text-sm leading-6 text-text-secondary">
                {blockerFor(record, shortage, t)}
              </p>
            </div>
            {shortage && (
              <ul className="mt-4 space-y-3" data-testid="work-order-shortage">
                {shortage.lines.map((line) => (
                  <li key={line.material_id} className="border-l-2 border-status-error/50 pl-3">
                    <p className="text-sm font-semibold text-text-primary">
                      {line.name || line.material_id}
                    </p>
                    <p className="mt-1 font-mono text-xs text-text-secondary">
                      {t("workOrder.deficit")}: {line.deficit} {line.base_unit || ""}
                    </p>
                    <p className="font-mono text-[11px] text-text-disabled">
                      {t("inventory.available")} {line.available} / {line.quantity_required}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SurfacePanel>

          <SurfacePanel padding="md">
            <p className="type-label text-text-secondary">{t("b2b.nextActions")}</p>
            {permitted.length > 0 ? (
              <div className="mt-4 space-y-3">
                <Input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t("b2b.reasonPlaceholder")}
                  aria-label={t("b2b.reason")}
                  className="min-h-11"
                />
                {permitted.map((action) => (
                  <Button
                    key={action}
                    type="button"
                    variant={action === "cancel" ? "outline" : "default"}
                    className="min-h-11 w-full justify-between"
                    loading={busyAction === action}
                    disabled={Boolean(busyAction)}
                    onClick={() => runAction(action)}
                    data-testid={`work-order-action-${action}`}
                  >
                    {t(`workOrder.action.${action}`)}
                    {action === "consume" ? (
                      <PackageMinus className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {t("b2b.noAvailableAction")}
              </p>
            )}
          </SurfacePanel>
        </aside>
      </div>
    </AdminLayout>
  );
}

function Fact({ label, value, mono }) {
  return (
    <div className="bg-surface-default p-5">
      <dt className="type-label text-text-secondary">{label}</dt>
      <dd className={`mt-2 text-sm text-text-primary ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
