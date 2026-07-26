import { ArrowLeft, ArrowRight, CircleAlert, History } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { StatusBadge } from "@/components/operational/StatusStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OperationalState } from "@/components/ui/operational-state";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { B2B_ACTION_PERMISSIONS, hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

const ACTION_TARGETS = {
  inquiry: { review: "reviewed", contact: "contacted", reject: "rejected" },
  quote: {
    submit_internal_review: "internal_review",
    send: "sent",
    return_to_draft: "draft",
    accept: "accepted",
    request_revision: "revision_requested",
    expire: "expired",
    reject: "rejected",
  },
  project: {
    activate: "active",
    hold: "on_hold",
    resume: "active",
    complete: "completed",
    cancel: "cancelled",
  },
};

const CONFIG = {
  inquiry: {
    endpoint: (id) => `/admin/inquiries/${id}`,
    backPath: "/admin/inquiries",
    titleKey: "admin.inquiries",
  },
  quote: {
    endpoint: (id) => `/admin/b2b/quotes/${id}`,
    backPath: "/admin/b2b/quotes",
    titleKey: "admin.quotes",
  },
  project: {
    endpoint: (id) => `/admin/b2b/projects/${id}`,
    backPath: "/admin/b2b/projects",
    titleKey: "admin.projects",
  },
};

// Commands the workbench can dispatch inline from this panel. `create_revision`
// is deliberately absent: it authors a whole scope snapshot, so it routes to the
// revision editor instead of firing from a one-click button.
const DEDICATED_COMMANDS = {
  inquiry: { convert: (id) => `/admin/inquiries/${id}/convert` },
  quote: { create_project: (id) => `/admin/b2b/quotes/${id}/project` },
  project: {},
};

function isDispatchable(kind, action) {
  return Boolean(ACTION_TARGETS[kind][action] || DEDICATED_COMMANDS[kind][action]);
}

function operationId() {
  return globalThis.crypto?.randomUUID?.() ||
    `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function blockerFor(kind, record, t) {
  if (kind === "quote" && record.status === "revision_requested") {
    return t("b2b.blockerRevision");
  }
  if (kind === "project" && record.status === "planned") {
    return t("b2b.blockerKickoff");
  }
  if (!record.permitted_next_actions?.length) return t("b2b.noNextAction");
  return t("b2b.noBlockerDetected");
}

function B2BDetail({ kind }) {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const config = CONFIG[kind];
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get(config.endpoint(id))
      .then((response) => setRecord(response.data))
      .catch((requestError) =>
        setError(formatApiError(requestError.response?.data?.detail))
      )
      .finally(() => setLoading(false));
  }, [config, id]);

  useEffect(() => {
    load();
  }, [load]);

  const actions = useMemo(
    () => record?.permitted_next_actions || [],
    [record]
  );

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
      const dedicated = DEDICATED_COMMANDS[kind][action];
      if (dedicated) {
        await api.post(dedicated(id), command);
      } else {
        await api.post(`${config.endpoint(id)}/transitions`, {
          ...command,
          target_status: ACTION_TARGETS[kind][action],
        });
      }
      setReason("");
      toast.success(t("b2b.actionApplied"));
      load();
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      const current = detail?.details;
      setError(formatApiError(detail));
      if (current?.current_version) load();
    } finally {
      setBusyAction("");
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t(config.titleKey)}>
        <OperationalState state="loading" title={t("common.loading")} />
      </AdminLayout>
    );
  }
  if (error && !record) {
    return (
      <AdminLayout title={t(config.titleKey)}>
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

  const permitted = actions.filter((action) =>
    hasPermission(user, B2B_ACTION_PERMISSIONS[kind][action])
  );
  const actionable = permitted.filter((action) => isDispatchable(kind, action));
  const revisionPending = permitted.includes("create_revision");

  return (
    <AdminLayout
      title={`${t(config.titleKey)} · ${record.id.slice(0, 8)}`}
      subtitle={`${t("b2b.version")} ${record.version}`}
    >
      <Link
        to={config.backPath}
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-action-primary"
      >
        <ArrowLeft className="h-4 w-4" />
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
                {record.id}
              </p>
            </SurfacePanelHeader>
            <dl className="grid gap-px bg-border-default sm:grid-cols-2">
              {kind === "inquiry" && (
                <>
                  <Fact label={t("b2b.company")} value={record.company} />
                  <Fact label={t("b2b.pic")} value={`${record.pic_name} · ${record.pic_email}`} />
                  <Fact label={t("b2b.need")} value={record.need} />
                  <Fact label={t("b2b.timeline")} value={record.timeline || "—"} />
                  <Fact className="sm:col-span-2" label={t("b2b.brief")} value={record.brief} />
                </>
              )}
              {kind === "quote" && (
                <>
                  <Fact label={t("b2b.revision")} value={record.current_revision} />
                  <Fact label={t("b2b.inquiry")} value={record.inquiry_id} mono />
                  <Fact label={t("b2b.total")} value={record.current_version?.total_minor == null ? t("b2b.notPriced") : `Rp ${record.current_version.total_minor.toLocaleString("id-ID")}`} />
                  <Fact label={t("b2b.acceptedVersion")} value={record.accepted_version_id || "—"} mono />
                </>
              )}
              {kind === "project" && (
                <>
                  <Fact label={t("b2b.quote")} value={record.quote_id} mono />
                  <Fact label={t("b2b.sourceVersion")} value={record.source_quote_version_id} mono />
                  <Fact label={t("b2b.milestones")} value={record.milestones?.length || 0} />
                  <Fact label={t("b2b.workOrders")} value={record.work_order_ids?.length || 0} />
                </>
              )}
            </dl>
          </SurfacePanel>

          <SurfacePanel data-testid="b2b-operational-spine">
            <SurfacePanelHeader>
              <p className="type-label text-action-primary">{t("admin.operationalSpine")}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
                {t("b2b.auditTimeline")}
              </h2>
            </SurfacePanelHeader>
            <ol className="p-5">
              {[...(record.history || [])].reverse().map((event, index) => (
                <li key={`${event.operation_id || "initial"}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
                  <div className="absolute bottom-0 left-[15px] top-8 w-px bg-border-default" aria-hidden="true" />
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-default">
                    <History className="h-3.5 w-3.5 text-action-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {event.from_status && <StatusBadge status={event.from_status} />}
                      <ArrowRight className="h-3.5 w-3.5 text-text-disabled" />
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
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
              <p className="text-sm leading-6 text-text-secondary">
                {blockerFor(kind, record, t)}
              </p>
            </div>
          </SurfacePanel>

          <SurfacePanel padding="md">
            <p className="type-label text-text-secondary">{t("b2b.nextActions")}</p>
            {revisionPending && (
              <Link
                to={`/admin/b2b/quotes/${id}/revision`}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-control bg-action-primary px-4 py-3 text-sm font-semibold text-text-inverse transition-colors duration-fast hover:bg-action-primary-hover motion-reduce:transition-none"
                data-testid="open-revision-editor"
              >
                {t("b2b.action.create_revision")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            {actionable.length > 0 ? (
              <div className="mt-4 space-y-3">
                <Input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t("b2b.reasonPlaceholder")}
                  aria-label={t("b2b.reason")}
                />
                {actionable.map((action) => (
                  <Button
                    key={action}
                    type="button"
                    variant={action.includes("reject") || action === "cancel" ? "outline" : "default"}
                    className="min-h-11 w-full justify-between"
                    loading={busyAction === action}
                    disabled={Boolean(busyAction)}
                    onClick={() => runAction(action)}
                  >
                    {t(`b2b.action.${action}`)}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            ) : (
              !revisionPending && (
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {t("b2b.noAvailableAction")}
                </p>
              )
            )}
          </SurfacePanel>
        </aside>
      </div>
    </AdminLayout>
  );
}

function Fact({ label, value, mono, className = "" }) {
  return (
    <div className={`bg-surface-default p-5 ${className}`}>
      <dt className="type-label text-text-secondary">{label}</dt>
      <dd className={`mt-2 text-sm text-text-primary ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

export const InquiryDetail = () => <B2BDetail kind="inquiry" />;
export const QuoteDetail = () => <B2BDetail kind="quote" />;
export const ProjectDetail = () => <B2BDetail kind="project" />;
