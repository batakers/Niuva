import { ArrowRight, Factory, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { StatusBadge } from "@/components/operational/StatusStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ quote_line_id: "", quantity: "1", reason: "" });

  const canCreate = hasPermission(
    user,
    B2B_ACTION_PERMISSIONS.project.create_work_order
  );
  const variants = quotedVariants(project);
  const closed = !["planned", "active"].includes(project.status);

  const load = useCallback(() => {
    fetchB2BPages(api, "/admin/b2b/work-orders", {
      params: { project_id: project.id },
    })
      .then(setWorkOrders)
      .catch((requestError) =>
        setError(formatApiError(requestError.response?.data?.detail))
      );
  }, [project.id]);

  useEffect(() => {
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
    setError("");
    try {
      await api.post(`/admin/b2b/projects/${project.id}/work-orders`, {
        expected_version: project.version,
        operation_id: operationId(),
        reason: form.reason.trim(),
        quote_line_id: form.quote_line_id,
        quantity: Number.parseInt(form.quantity, 10) || 1,
      });
      setForm({ quote_line_id: "", quantity: "1", reason: "" });
      toast.success(t("workOrder.created"));
      load();
      // Creating a run bumps the project version; the parent must reload or
      // its next command would collide with a stale expected_version.
      onChanged?.();
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setCreating(false);
    }
  };

  return (
    <SurfacePanel data-testid="project-work-orders">
      <SurfacePanelHeader>
        <p className="type-label text-action-primary">{t("workOrder.production")}</p>
        <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
          {t("admin.workOrders")}
        </h2>
      </SurfacePanelHeader>

      {error && (
        <p className="border-b border-border-default bg-status-error/5 px-5 py-3 text-sm text-status-error">
          {error}
        </p>
      )}

      {workOrders.length === 0 ? (
        <p className="p-5 text-sm leading-6 text-text-secondary">
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
                    <StatusBadge status={workOrder.status} />
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

      {canCreate && !closed && variants.length > 0 && (
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
            data-testid="create-work-order"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("workOrder.create")}
          </Button>
        </form>
      )}

      {canCreate && !closed && variants.length === 0 && (
        <p className="border-t border-border-default p-5 text-sm leading-6 text-text-secondary">
          {t("workOrder.noQuotedVariants")}
        </p>
      )}
    </SurfacePanel>
  );
}
