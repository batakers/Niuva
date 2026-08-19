import { ArrowRight, Factory, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { WorkOrderStatusBadge } from "@/components/admin/WorkOrderStatusBadge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fetchB2BPages } from "@/lib/b2bPagination";
import { B2B_ACTION_PERMISSIONS, hasPermission } from "@/lib/permissions";

function operationId() {
  return globalThis.crypto?.randomUUID?.() ||
    `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function focusAfterPaint(ref) {
  if (typeof window === "undefined") return;
  const schedule = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
  schedule(() => ref.current?.focus());
}

function isUncertainCreate(requestError) {
  return !requestError.response || requestError.response.status >= 500;
}

// A run can only be opened for a variant the accepted quotation carries, so the
// picker is built from the snapshot the project froze at acceptance rather than
// from the live catalog. Offering anything else would earn a 422.
function quotedVariants(project) {
  return (project.quote_snapshot?.items || []).filter((item) => item.variant_id);
}

export default function ProjectWorkOrders({ project, onChanged }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createState, setCreateState] = useState("ready");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ quote_line_id: "", quantity: "1", reason: "" });
  const headingRef = useRef(null);
  const retryRef = useRef(null);
  const createOperationIdRef = useRef(null);

  const canCreate = hasPermission(
    user,
    B2B_ACTION_PERMISSIONS.project.create_work_order
  );
  const variants = quotedVariants(project);
  const closed = !["planned", "active"].includes(project.status);

  const load = useCallback(async ({ focusOnReady = false } = {}) => {
    setLoadState("loading");
    setLoadError("");
    try {
      const items = await fetchB2BPages(api, "/admin/b2b/work-orders", {
        params: { project_id: project.id },
      });
      setWorkOrders(items);
      setLoadState("ready");
      if (focusOnReady) focusAfterPaint(headingRef);
      return items;
    } catch (requestError) {
      setLoadError(formatApiError(requestError.response?.data?.detail));
      setLoadState("error");
      if (focusOnReady) focusAfterPaint(retryRef);
      return null;
    }
  }, [project.id]);

  useEffect(() => {
    setWorkOrders([]);
    setLoadState("loading");
    setLoadError("");
    setCreateError("");
    setCreateState("ready");
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    if (form.reason.trim().length < 3) {
      toast.error(t("b2b.reasonRequired"));
      return;
    }
    if (!form.quote_line_id) {
      toast.error(t("workOrder.variantRequired"));
      return;
    }
    setCreating(true);
    setCreateError("");
    setCreateState("submitting");
    const requestOperationId = createOperationIdRef.current || operationId();
    createOperationIdRef.current = requestOperationId;
    try {
      await api.post(`/admin/b2b/projects/${project.id}/work-orders`, {
        expected_version: project.version,
        operation_id: requestOperationId,
        reason: form.reason.trim(),
        quote_line_id: form.quote_line_id,
        quantity: Number.parseInt(form.quantity, 10) || 1,
      });
      setForm({ quote_line_id: "", quantity: "1", reason: "" });
      toast.success(t("workOrder.created"));
      await load({ focusOnReady: true });
      createOperationIdRef.current = null;
      setCreateState("ready");
      // Creating a run bumps the project version; the parent must reload or
      // its next command would collide with a stale expected_version.
      onChanged?.();
    } catch (requestError) {
      setCreateError(formatApiError(requestError.response?.data?.detail));
      if (isUncertainCreate(requestError)) {
        setCreateState("reconciling");
        await load();
        setCreateState("uncertain");
      } else {
        createOperationIdRef.current = null;
        setCreateState("error");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <SurfacePanel
      data-testid="project-work-orders"
      aria-busy={loadState === "loading"}
    >
      <SurfacePanelHeader>
        <p className="type-label text-action-primary">{t("workOrder.production")}</p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 rounded-control font-heading text-lg font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
        >
          {t("admin.workOrders")}
        </h2>
      </SurfacePanelHeader>

      {createError && (
        <Alert
          tone={createState === "uncertain" ? "warning" : "error"}
          className="m-5"
          data-testid="work-order-create-error"
          data-state={createState}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="min-w-0 flex-1">{createError}</span>
            {createState === "reconciling" && (
              <span className="text-sm">{t("common.loading")}</span>
            )}
          </div>
        </Alert>
      )}

      {loadState === "error" && workOrders.length > 0 && (
        <Alert tone="error" className="m-5" data-testid="work-order-load-error-inline">
          <div className="flex flex-wrap items-center gap-3">
            <span className="min-w-0 flex-1">
              {loadError || t("b2b.loadFailed")}
            </span>
            <Button
              ref={retryRef}
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => load({ focusOnReady: true })}
            >
              {t("common.retry")}
            </Button>
          </div>
        </Alert>
      )}

      {loadState === "loading" && workOrders.length === 0 ? (
        <div data-testid="work-order-loading">
          <SkeletonGroup label={t("common.loading")}>
            <div className="space-y-3 p-5">
              <Skeleton variant="text" className="w-2/3" />
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
          </SkeletonGroup>
        </div>
      ) : loadState === "error" && workOrders.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 p-8 text-center"
          data-testid="work-order-load-error"
          role="alert"
        >
          <p className="text-sm font-semibold text-text-primary">
            {t("b2b.loadFailed")}
          </p>
          {loadError && (
            <p className="text-sm leading-6 text-text-secondary">{loadError}</p>
          )}
          <Button
            ref={retryRef}
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => load({ focusOnReady: true })}
          >
            {t("common.retry")}
          </Button>
        </div>
      ) : (
        <>
          {loadState === "loading" && (
            <div
              className="border-b border-border-default bg-surface-muted px-5 py-3 text-sm text-text-secondary"
              role="status"
              aria-live="polite"
              data-testid="work-order-refreshing"
            >
              {t("common.loading")}
            </div>
          )}

          {workOrders.length === 0 ? (
            <p
              className="p-5 text-sm leading-6 text-text-secondary"
              data-testid="work-order-empty"
            >
              {t("workOrder.noneForProject")}
            </p>
          ) : (
            <ul className="divide-y divide-border-default">
              {workOrders.map((workOrder) => (
                <li key={workOrder.id}>
                  <Link
                    to={`/admin/b2b/work-orders/${workOrder.id}`}
                    className="group flex min-h-20 items-center gap-4 p-5 transition-colors duration-fast hover:bg-surface-muted/50 motion-reduce:transition-none"
                  >
                    <Factory className="h-4 w-4 shrink-0 text-action-primary" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-text-primary">
                          {workOrder.id.slice(0, 8)}
                        </span>
                        <WorkOrderStatusBadge status={workOrder.status} />
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        {workOrder.quantity} unit ·{" "}
                        {(workOrder.material_requirements || []).length}{" "}
                        {t("workOrder.materials").toLowerCase()}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary transition-transform duration-fast group-hover:translate-x-1 motion-reduce:transition-none" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {loadState === "ready" && canCreate && !closed && variants.length > 0 && (
        <form onSubmit={submit} className="border-t border-border-default p-5">
          <p className="type-label text-text-secondary">{t("workOrder.openRun")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
            <div className="space-y-2">
              <Label htmlFor="wo-variant" className="text-sm font-semibold">
                {t("workOrder.variant")}
              </Label>
              <select
                id="wo-variant"
                data-testid="work-order-variant"
                value={form.quote_line_id}
                disabled={createState === "uncertain"}
                onChange={(event) =>
                  setForm((current) => ({ ...current, quote_line_id: event.target.value }))
                }
                className="brand-field h-11 w-full rounded-control border border-border-default bg-surface-default px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <option value="">{t("workOrder.selectVariant")}</option>
                {variants.map((item) => (
                  <option key={item.quote_line_id} value={item.quote_line_id}>
                    {item.description} · {item.quantity} unit
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wo-quantity" className="text-sm font-semibold">
                {t("workOrder.quantity")}
              </Label>
              <Input
                id="wo-quantity"
                data-testid="work-order-quantity"
                inputMode="numeric"
                value={form.quantity}
                disabled={createState === "uncertain"}
                onChange={(event) =>
                  setForm((current) => ({ ...current, quantity: event.target.value }))
                }
                className="min-h-11 font-mono"
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="wo-reason" className="text-sm font-semibold">
              {t("b2b.reason")}
            </Label>
            <Input
              id="wo-reason"
              data-testid="work-order-reason"
              value={form.reason}
              disabled={createState === "uncertain"}
              onChange={(event) =>
                setForm((current) => ({ ...current, reason: event.target.value }))
              }
              placeholder={t("b2b.reasonPlaceholder")}
              className="min-h-11"
            />
          </div>
          <Button
            type="submit"
            className="mt-4 min-h-11 w-full sm:w-auto"
            loading={creating}
            disabled={loadState !== "ready" || createState === "reconciling"}
            data-testid="create-work-order"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("workOrder.create")}
          </Button>
        </form>
      )}

      {loadState === "ready" && canCreate && !closed && variants.length === 0 && (
        <p className="border-t border-border-default p-5 text-sm leading-6 text-text-secondary">
          {t("workOrder.noQuotedVariants")}
        </p>
      )}
    </SurfacePanel>
  );
}
