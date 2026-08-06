import { ArrowLeft, ArrowRight, CircleAlert, History, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PortfolioStatusBadge } from "@/components/admin/PortfolioStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OperationalState } from "@/components/ui/operational-state";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import {
  PORTFOLIO_ACTION_PERMISSIONS,
  PORTFOLIO_ROLLBACK_PERMISSION,
  hasPermission,
} from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

const ACTION_TARGETS = {
  submit_review: "review",
  return_to_draft: "draft",
  approve_preview: "preview",
  return_to_review: "review",
  schedule: "scheduled",
  publish: "published",
  archive: "archived",
  restore: "draft",
  revise: "draft",
};

// Only scheduling asks for a time; every other action is immediate.
const NEEDS_SCHEDULE = new Set(["schedule"]);

function blockerFor(record, t) {
  if (record.status === "review") return t("portfolio.blockerReview");
  if (record.status === "preview") return t("portfolio.blockerPreview");
  if (record.status === "scheduled") {
    return `${t("portfolio.blockerScheduled")} ${fmtDate(record.scheduled_for)}`;
  }
  if (record.status === "archived") return t("portfolio.blockerArchived");
  if (record.status === "published") return t("portfolio.blockerPublished");
  return t("b2b.noBlockerDetected");
}

export default function PortfolioDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get(`/admin/portfolio/${id}`)
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
    if (NEEDS_SCHEDULE.has(action) && !scheduledFor) {
      toast.error(t("portfolio.scheduleRequired"));
      return;
    }
    setBusyAction(action);
    try {
      await api.post(`/admin/portfolio/${id}/transitions`, {
        target_status: ACTION_TARGETS[action],
        expected_version: record.version,
        reason: reason.trim(),
        ...(NEEDS_SCHEDULE.has(action)
          ? { scheduled_for: new Date(scheduledFor).toISOString() }
          : {}),
      });
      setReason("");
      setScheduledFor("");
      toast.success(t("b2b.actionApplied"));
      load();
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusyAction("");
    }
  };

  const rollback = async (revision) => {
    if (reason.trim().length < 3) {
      toast.error(t("portfolio.rollbackReasonRequired"));
      return;
    }
    setBusyAction(`rollback-${revision}`);
    try {
      await api.post(`/admin/portfolio/${id}/rollback`, {
        revision,
        expected_version: record.version,
        reason: reason.trim(),
      });
      setReason("");
      toast.success(t("portfolio.rolledBack"));
      load();
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusyAction("");
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t("admin.portfolio")}>
        <OperationalState state="loading" title={t("common.loading")} />
      </AdminLayout>
    );
  }
  if (error && !record) {
    return (
      <AdminLayout title={t("admin.portfolio")}>
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

  const actionable = (record.permitted_next_actions || []).filter((action) =>
    hasPermission(user, PORTFOLIO_ACTION_PERMISSIONS[action])
  );
  const withheld = (record.permitted_next_actions || []).filter(
    (action) => !hasPermission(user, PORTFOLIO_ACTION_PERMISSIONS[action])
  );
  const revisions = [...(record.versions || [])].reverse();

  return (
    <AdminLayout
      title={`${t("admin.portfolio")} · ${record.title_id}`}
      subtitle={`${t("b2b.version")} ${record.version}`}
    >
      <Link
        to="/admin/portfolio"
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
                <div className="mt-2">
                  <PortfolioStatusBadge status={record.status} />
                </div>
              </div>
              {record.source_project_id && (
                <Link
                  to={`/admin/b2b/projects/${record.source_project_id}`}
                  className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-action-primary"
                  data-testid="portfolio-source-project"
                >
                  {t("portfolio.sourceProject")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </SurfacePanelHeader>
            <dl className="grid gap-px bg-border-default sm:grid-cols-2">
              <Fact label={t("portfolio.titleId")} value={record.title_id} />
              <Fact label={t("portfolio.titleEn")} value={record.title_en} />
              <Fact label={t("portfolio.category")} value={record.category || "—"} />
              <Fact
                label={t("portfolio.displayOrder")}
                value={record.display_order}
              />
            </dl>
          </SurfacePanel>

          <SurfacePanel data-testid="portfolio-revisions">
            <SurfacePanelHeader>
              <p className="type-label text-action-primary">{t("portfolio.revisions")}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
                {t("portfolio.revisionsTitle")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {t("portfolio.rollbackNote")}
              </p>
            </SurfacePanelHeader>
            {revisions.length === 0 ? (
              <p className="p-5 text-sm leading-6 text-text-secondary">
                {t("portfolio.noRevisions")}
              </p>
            ) : (
              <ul className="divide-y divide-border-default">
                {revisions.map((revision) => (
                  <li
                    key={revision.revision}
                    className="flex flex-wrap items-center justify-between gap-3 p-5"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary">
                        {t("portfolio.revision")} {revision.revision} ·{" "}
                        {revision.content?.title_id}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {revision.reason}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-text-disabled">
                        {fmtDate(revision.created_at)}
                      </p>
                    </div>
                    {revision.revision !== revisions[0].revision &&
                      hasPermission(user, PORTFOLIO_ROLLBACK_PERMISSION) && (
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11"
                        loading={busyAction === `rollback-${revision.revision}`}
                        disabled={Boolean(busyAction)}
                        onClick={() => rollback(revision.revision)}
                        data-testid={`portfolio-rollback-${revision.revision}`}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                        {t("portfolio.rollback")}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SurfacePanel>

          <SurfacePanel data-testid="portfolio-spine">
            <SurfacePanelHeader>
              <p className="type-label text-action-primary">{t("admin.operationalSpine")}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
                {t("b2b.auditTimeline")}
              </h2>
            </SurfacePanelHeader>
            <ol className="p-5">
              {[...(record.history || [])].reverse().map((event, index) => (
                <li key={index} className="relative flex gap-4 pb-6 last:pb-0">
                  <div className="absolute bottom-0 left-[15px] top-8 w-px bg-border-default" aria-hidden="true" />
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-default">
                    <History className="h-3.5 w-3.5 text-action-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {event.from_status && (
                        <PortfolioStatusBadge status={event.from_status} />
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-text-disabled" aria-hidden="true" />
                      <PortfolioStatusBadge status={event.to_status} />
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{event.reason}</p>
                    <p className="mt-1 font-mono text-[11px] text-text-disabled">
                      {fmtDate(event.timestamp)}
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
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="portfolio-reason" className="text-sm font-semibold">
                  {t("b2b.reason")}
                </Label>
                <Input
                  id="portfolio-reason"
                  data-testid="portfolio-action-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t("b2b.reasonPlaceholder")}
                  className="min-h-11"
                />
              </div>
              {actionable.includes("schedule") && (
                <div className="space-y-2">
                  <Label htmlFor="portfolio-schedule" className="text-sm font-semibold">
                    {t("portfolio.scheduledFor")}
                  </Label>
                  <Input
                    id="portfolio-schedule"
                    data-testid="portfolio-scheduled-for"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className="min-h-11"
                  />
                </div>
              )}
              {actionable.length > 0 ? (
                actionable.map((action) => (
                  <Button
                    key={action}
                    type="button"
                    variant={action === "archive" ? "outline" : "default"}
                    className="min-h-11 w-full justify-between"
                    loading={busyAction === action}
                    disabled={Boolean(busyAction)}
                    onClick={() => runAction(action)}
                    data-testid={`portfolio-action-${action}`}
                  >
                    {t(`portfolio.action.${action}`)}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ))
              ) : (
                <p className="text-sm leading-6 text-text-secondary">
                  {t("b2b.noAvailableAction")}
                </p>
              )}
            </div>
            {withheld.length > 0 && (
              /* Named, not hidden: the reader learns the step exists and that
                 someone else has to take it. */
              <p
                className="mt-4 border-t border-border-default pt-4 text-sm leading-6 text-text-secondary"
                data-testid="portfolio-needs-approval"
              >
                {t("portfolio.needsApproval")}
              </p>
            )}
          </SurfacePanel>
        </aside>
      </div>
    </AdminLayout>
  );
}

function Fact({ label, value }) {
  return (
    <div className="bg-surface-default p-5">
      <dt className="type-label text-text-secondary">{label}</dt>
      <dd className="mt-2 text-sm text-text-primary">{value}</dd>
    </div>
  );
}
