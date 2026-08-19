import {
  ArrowRight,
  BriefcaseBusiness,
  Factory,
  FileText,
  Inbox,
  ShoppingBag,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { B2BStatusBadge } from "@/components/admin/B2BStatusBadge";
import { RetailOrderStatusBadge } from "@/components/admin/RetailOrderStatusBadge";
import { WorkOrderStatusBadge } from "@/components/admin/WorkOrderStatusBadge";
import { OperationalState } from "@/components/ui/operational-state";
import { Button } from "@/components/ui/button";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { readB2BPage } from "@/lib/b2bPagination";
import { fmtDate } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";

const CONFIG = {
  inquiry: {
    paginated: true,
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
    paginated: true,
    endpoint: "/admin/b2b/quotes",
    basePath: "/admin/b2b/quotes",
    titleKey: "admin.quotes",
    subtitleKey: "b2b.quotesSubtitle",
    emptyKey: "b2b.quotesEmpty",
    icon: FileText,
    primary: (record, t) =>
      t("b2b.quoteRecord").replace("{id}", record.id.slice(0, 8)),
    secondary: (record, t) =>
      t("b2b.inquiryReference")
        .replace("{id}", record.inquiry_id.slice(0, 8))
        .replace("{revision}", record.current_revision),
  },
  project: {
    paginated: true,
    endpoint: "/admin/b2b/projects",
    basePath: "/admin/b2b/projects",
    titleKey: "admin.projects",
    subtitleKey: "b2b.projectsSubtitle",
    emptyKey: "b2b.projectsEmpty",
    icon: BriefcaseBusiness,
    primary: (record, t) =>
      t("b2b.projectRecord").replace("{id}", record.id.slice(0, 8)),
    secondary: (record, t) =>
      t("b2b.projectReference").replace("{id}", record.quote_id.slice(0, 8)),
  },
  retail_order: {
    paginated: true,
    endpoint: "/admin/retail-orders",
    basePath: "/admin/retail-orders",
    titleKey: "admin.retailOrders",
    subtitleKey: "retail.subtitle",
    emptyKey: "retail.empty",
    icon: ShoppingBag,
    primary: (record) => record.order_number,
    secondary: (record, t) =>
      t("b2b.retailRecordReference")
        .replace("{customer}", record.customer?.name || t("common.notAvailable"))
        .replace("{count}", record.item_count || 0),
  },
  work_order: {
    paginated: true,
    endpoint: "/admin/b2b/work-orders",
    basePath: "/admin/b2b/work-orders",
    titleKey: "admin.workOrders",
    subtitleKey: "workOrder.subtitle",
    emptyKey: "workOrder.empty",
    icon: Factory,
    primary: (record, t) =>
      t("b2b.workOrderRecord").replace("{id}", record.id.slice(0, 8)),
    secondary: (record, t) =>
      t("b2b.workOrderReference")
        .replace("{id}", record.project_id.slice(0, 8))
        .replace("{quantity}", record.quantity),
  },
};

const RETAIL_ORDER_STATUSES = [
  "created",
  "awaiting_payment",
  "paid",
  "file_review",
  "queued",
  "in_production",
  "quality_control",
  "ready_to_ship",
  "ready_to_pickup",
  "shipped",
  "picked_up",
  "completed",
];

const EMPTY_RETAIL_FILTERS = {
  status: "",
  search: "",
  updated_from: "",
  updated_to: "",
};

function LifecycleStatusBadge({ kind, status }) {
  if (kind === "retail_order") {
    return <RetailOrderStatusBadge status={status} />;
  }
  if (kind === "work_order") {
    return <WorkOrderStatusBadge status={status} />;
  }
  return <B2BStatusBadge kind={kind} status={status} />;
}

function B2BList({ kind }) {
  const { t } = useI18n();
  const config = CONFIG[kind];
  const Icon = config.icon;
  const isRetailOrder = kind === "retail_order";
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [draftRetailFilters, setDraftRetailFilters] = useState(
    EMPTY_RETAIL_FILTERS
  );
  const [retailFilters, setRetailFilters] = useState(EMPTY_RETAIL_FILTERS);
  const requestSequence = useRef(0);

  const hasActiveRetailFilters = isRetailOrder && Object.values(retailFilters).some(Boolean);

  const load = useCallback((cursor = null) => {
    const requestId = ++requestSequence.current;
    if (cursor) {
      setLoadingMore(true);
      setLoadMoreError("");
    } else {
      setLoading(true);
      setLoadingMore(false);
      setError("");
      setLoadMoreError("");
    }
    const params = config.paginated
      ? {
          limit: 50,
          ...(isRetailOrder ? retailFilters : {}),
          ...(cursor ? { cursor } : {}),
        }
      : undefined;
    api
      .get(config.endpoint, {
        params,
      })
      .then((response) => {
        if (requestId !== requestSequence.current) return;
        if (!config.paginated) {
          setRecords(response.data);
          setNextCursor(null);
          return;
        }
        const page = readB2BPage(response.data);
        setRecords((current) =>
          cursor ? [...current, ...page.items] : page.items
        );
        setNextCursor(page.nextCursor);
      })
      .catch((requestError) => {
        if (requestId !== requestSequence.current) return;
        const message = formatApiError(requestError.response?.data?.detail);
        if (cursor) setLoadMoreError(message);
        else setError(message);
      })
      .finally(() => {
        if (requestId !== requestSequence.current) return;
        setLoading(false);
        setLoadingMore(false);
      });
  }, [config.endpoint, config.paginated, isRetailOrder, retailFilters]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout title={t(config.titleKey)} subtitle={t(config.subtitleKey)}>
      <SurfacePanel className="overflow-hidden">
        <SurfacePanelHeader className="flex items-center justify-between">
          <p className="type-label text-text-secondary">
            {t("b2b.records")}: {records.length}
          </p>
          <Icon className="h-4 w-4 text-action-primary" aria-hidden="true" />
        </SurfacePanelHeader>
        {isRetailOrder && (
          <form
            className="grid gap-4 border-b border-border-default p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              setRetailFilters({ ...draftRetailFilters });
            }}
            aria-label={t("retail.filterTitle")}
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2 className="font-heading text-base font-semibold text-text-primary">
                {t("retail.filterTitle")}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t("retail.filterHint")}
              </p>
            </div>
            <label className="grid gap-2 text-sm font-medium text-text-primary">
              {t("retail.searchLabel")}
              <input
                type="search"
                value={draftRetailFilters.search}
                maxLength={80}
                placeholder={t("retail.searchPlaceholder")}
                onChange={(event) =>
                  setDraftRetailFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                className="h-11 rounded-control border border-border-control bg-surface-default px-3 text-base text-text-primary shadow-sm focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring md:text-sm"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-text-primary">
              {t("retail.statusFilter")}
              <select
                value={draftRetailFilters.status}
                onChange={(event) =>
                  setDraftRetailFilters((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                className="h-11 rounded-control border border-border-control bg-surface-default px-3 text-base text-text-primary shadow-sm focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring md:text-sm"
              >
                <option value="">{t("common.all")}</option>
                {RETAIL_ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`status.${status}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-text-primary">
              {t("retail.updatedFrom")}
              <input
                type="date"
                value={draftRetailFilters.updated_from}
                onChange={(event) =>
                  setDraftRetailFilters((current) => ({
                    ...current,
                    updated_from: event.target.value,
                  }))
                }
                className="h-11 rounded-control border border-border-control bg-surface-default px-3 text-base text-text-primary shadow-sm focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring md:text-sm"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-text-primary">
              {t("retail.updatedTo")}
              <input
                type="date"
                value={draftRetailFilters.updated_to}
                onChange={(event) =>
                  setDraftRetailFilters((current) => ({
                    ...current,
                    updated_to: event.target.value,
                  }))
                }
                className="h-11 rounded-control border border-border-control bg-surface-default px-3 text-base text-text-primary shadow-sm focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring md:text-sm"
              />
            </label>
            <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-4">
              <Button type="submit">{t("retail.applyFilters")}</Button>
              <Button
                type="button"
                variant="outline"
                disabled={!Object.values(draftRetailFilters).some(Boolean)}
                onClick={() => {
                  setDraftRetailFilters(EMPTY_RETAIL_FILTERS);
                  setRetailFilters(EMPTY_RETAIL_FILTERS);
                }}
              >
                {t("retail.clearFilters")}
              </Button>
            </div>
          </form>
        )}
        {loading ? (
          <OperationalState state="loading" title={t("common.loading")} />
        ) : error ? (
          <OperationalState
            state="error"
            title={t("b2b.loadFailed")}
            description={error}
            retryLabel={t("common.retry")}
            onRetry={() => load()}
          />
        ) : records.length === 0 ? (
          <OperationalState
            state={hasActiveRetailFilters ? "no-match" : "empty"}
            title={t(hasActiveRetailFilters ? "retail.noMatch" : config.emptyKey)}
          />
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
                      {config.primary(record, t)}
                    </h2>
                    <LifecycleStatusBadge kind={kind} status={record.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-text-secondary">
                    {config.secondary(record, t)}
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
            {loadMoreError && (
              <OperationalState
                state="error"
                title={t("b2b.loadFailed")}
                description={loadMoreError}
                retryLabel={t("common.retry")}
                onRetry={() => load(nextCursor)}
                className="min-h-0 border-0 border-t p-4 sm:p-5"
              />
            )}
            {nextCursor && (
              <div className="flex justify-center p-4 sm:p-5">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loadingMore}
                  onClick={() => load(nextCursor)}
                >
                  {loadingMore ? t("b2b.loadingMore") : t("b2b.loadMore")}
                </Button>
              </div>
            )}
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
export const RetailOrderList = () => <B2BList kind="retail_order" />;
