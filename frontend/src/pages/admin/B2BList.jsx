import {
  ArrowRight,
  BriefcaseBusiness,
  Factory,
  FileText,
  Inbox,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { OperationalState } from "@/components/ui/operational-state";
import { StatusBadge } from "@/components/operational/StatusStepper";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";

const CONFIG = {
  inquiry: {
    endpoint: "/admin/inquiries",
    basePath: "/admin/inquiries",
    titleKey: "admin.inquiries",
    subtitleKey: "b2b.inquiriesSubtitle",
    emptyKey: "b2b.inquiriesEmpty",
    icon: Inbox,
    primary: (record) => record.company,
    secondary: (record) => `${record.pic_name} · ${record.need}`,
  },
  quote: {
    endpoint: "/admin/b2b/quotes",
    basePath: "/admin/b2b/quotes",
    titleKey: "admin.quotes",
    subtitleKey: "b2b.quotesSubtitle",
    emptyKey: "b2b.quotesEmpty",
    icon: FileText,
    primary: (record) => `Quote · ${record.id.slice(0, 8)}`,
    secondary: (record) => `Inquiry ${record.inquiry_id.slice(0, 8)} · Rev ${record.current_revision}`,
  },
  project: {
    endpoint: "/admin/b2b/projects",
    basePath: "/admin/b2b/projects",
    titleKey: "admin.projects",
    subtitleKey: "b2b.projectsSubtitle",
    emptyKey: "b2b.projectsEmpty",
    icon: BriefcaseBusiness,
    primary: (record) => `Project · ${record.id.slice(0, 8)}`,
    secondary: (record) => `Quote ${record.quote_id.slice(0, 8)}`,
  },
  work_order: {
    endpoint: "/admin/b2b/work-orders",
    basePath: "/admin/b2b/work-orders",
    titleKey: "admin.workOrders",
    subtitleKey: "workOrder.subtitle",
    emptyKey: "workOrder.empty",
    icon: Factory,
    primary: (record) => `WO · ${record.id.slice(0, 8)}`,
    secondary: (record) =>
      `Project ${record.project_id.slice(0, 8)} · ${record.quantity} unit`,
  },
};

function B2BList({ kind }) {
  const { t } = useI18n();
  const config = CONFIG[kind];
  const Icon = config.icon;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get(config.endpoint)
      .then((response) => setRecords(response.data))
      .catch((requestError) =>
        setError(formatApiError(requestError.response?.data?.detail))
      )
      .finally(() => setLoading(false));
  }, [config.endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout title={t(config.titleKey)} subtitle={t(config.subtitleKey)}>
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between">
          <p className="type-label text-text-secondary">
            {t("b2b.records")}: {records.length}
          </p>
          <Icon className="h-4 w-4 text-action-primary" aria-hidden="true" />
        </SurfacePanelHeader>
        {loading ? (
          <OperationalState state="loading" title={t("common.loading")} />
        ) : error ? (
          <OperationalState
            state="error"
            title={t("b2b.loadFailed")}
            description={error}
            retryLabel={t("common.retry")}
            onRetry={load}
          />
        ) : records.length === 0 ? (
          <OperationalState state="empty" title={t(config.emptyKey)} />
        ) : (
          <div className="divide-y divide-border-default">
            {records.map((record) => (
              <Link
                key={record.id}
                to={`${config.basePath}/${record.id}`}
                className="group flex min-h-20 items-center gap-4 p-4 transition-colors duration-fast hover:bg-surface-muted/50 motion-reduce:transition-none sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-heading text-base font-semibold text-text-primary">
                      {config.primary(record)}
                    </h2>
                    <StatusBadge status={record.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-text-secondary">
                    {config.secondary(record)}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="font-mono text-xs text-text-secondary">
                    v{record.version}
                  </p>
                  <p className="mt-1 text-xs text-text-disabled">
                    {fmtDate(record.updated_at)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary transition-transform duration-fast group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
            ))}
          </div>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}

export const InquiryList = () => <B2BList kind="inquiry" />;
export const QuoteList = () => <B2BList kind="quote" />;
export const ProjectList = () => <B2BList kind="project" />;
export const WorkOrderList = () => <B2BList kind="work_order" />;
