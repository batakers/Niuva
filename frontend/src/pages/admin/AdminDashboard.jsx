import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Clock,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { ADMIN_MENU_GROUPS, getRoleHome } from "@/lib/adminWorkbench";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

/* ─────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────── */

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function defaultDateFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return isoDate(date);
}

/**
 * Sum the per-status counts on an order row. Safe only where every field
 * carries the same unit: adding a signed quantity to a count of events would
 * combine two different things into one meaningless number.
 */
function totalForRow(row) {
  return Object.entries(row).reduce(
    (sum, [key, value]) => (key === "date" ? sum : sum + (Number(value) || 0)),
    0
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Operational Spine — role-scoped next work
 * ────────────────────────────────────────────────────────────────────────── */

function WorkQueueRow({ path, index, count, loading }) {
  const { t } = useI18n();
  const item = ADMIN_MENU_GROUPS.flatMap((group) => group.items).find(
    (candidate) => candidate.path === path
  );
  if (!item) return null;
  const Icon = item.icon;
  if (loading) {
    return (
      <div className="relative flex gap-4 pb-5 last:pb-0">
        <Skeleton className="relative z-10 h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 border border-border-default bg-surface-default p-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-3 h-3 w-52" />
        </div>
      </div>
    );
  }

  const measured = Number.isFinite(count);
  const hasItems = measured && count > 0;

  return (
    <div className="relative flex gap-4 pb-5 last:pb-0">
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[17px] top-9 w-px bg-border-default last:hidden"
      />
      <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${hasItems ? "border-status-warning/50 bg-status-warning/10 text-status-warning" : "border-border-default bg-surface-muted text-text-secondary"}`}>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <Link
        to={path}
        className="group flex min-h-20 flex-1 items-center gap-4 border border-border-default bg-surface-default p-4 transition-colors duration-fast hover:border-action-primary/50 hover:bg-surface-muted/40 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-text-primary">
            {t(item.label)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {!measured
              ? t("admin.queueNeedsReview")
              : hasItems
                ? t("admin.queueNeedsAction").replace("{count}", count)
                : t("admin.queueReady")}
          </p>
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-text-secondary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary transition-transform duration-fast group-hover:translate-x-1 motion-reduce:transition-none" />
      </Link>
    </div>
  );
}

function finiteCount(value) {
  if (value === null || value === undefined || value === "") return null;
  const count = Number(value);
  return Number.isFinite(count) ? count : null;
}

export function queueCount(path, stats) {
  if (!stats) return null;
  if (path === "/admin/retail-orders") {
    const counts = ["pending_estimate", "awaiting_payment", "in_process"].map(
      (key) =>
        Object.prototype.hasOwnProperty.call(stats, key)
          ? finiteCount(stats[key])
          : null,
    );
    if (counts.some((count) => count === null)) return null;
    return counts.reduce((sum, count) => sum + count, 0);
  }
  if (path === "/admin/inquiries") {
    return finiteCount(stats.inquiries ?? stats.contacts);
  }
  if (path === "/admin/inventory") return finiteCount(stats.low_stock);
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Trend Chart Component — with accessible description
 * ────────────────────────────────────────────────────────────────────────── */

function columnsOf(rows) {
  const seen = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key !== "date" && !seen.includes(key)) seen.push(key);
    }
  }
  return seen;
}

function TrendChart({
  id,
  title,
  rows,
  value,
  formatValue,
  loading,
  dateFrom,
  dateTo,
  emptyAction,
}) {
  const { t } = useI18n();
  // The caller states which figure is plotted. Inferring it from the row shape
  // silently changes meaning whenever a series gains a field.
  const data = rows.map((row) => ({ date: row.date, value: value(row) }));
  const columns = columnsOf(rows);

  const chartDescription = t("dashboard.chartDescription")
    .replace("{title}", title)
    .replace("{from}", dateFrom || "")
    .replace("{to}", dateTo || "");

  return (
    <section
      className="border-t border-border-default py-6 sm:py-8"
      aria-labelledby={id}
    >
      <h3 id={id} className="font-heading text-lg font-semibold text-text-primary">
        {title}
      </h3>
      {loading ? (
        <div className="h-[200px] sm:h-[220px] flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-control" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 sm:min-h-[220px]">
          <EmptyState icon={BarChart3}>
            {t("dashboard.noDataInRange")}
          </EmptyState>
          {/* Actionable, and only where the reader can act: an empty chart
              otherwise leaves them with nowhere to go. */}
          {emptyAction && (
            <Link
              to={emptyAction.to}
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-action-primary"
              data-testid="chart-empty-action"
            >
              {t(emptyAction.labelKey)}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      ) : (
        <div role="img" aria-label={chartDescription}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 11,
                  fill: "var(--color-text-secondary)",
                  fontFamily: "var(--font-family-mono)",
                }}
                stroke="var(--color-border-default)"
                tickLine={false}
                axisLine={{ stroke: "var(--color-border-default)" }}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "var(--color-text-secondary)",
                  fontFamily: "var(--font-family-mono)",
                }}
                stroke="var(--color-border-default)"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={formatValue}
                contentStyle={{
                  borderRadius: "var(--radius-control)",
                  border: "1px solid var(--color-border-default)",
                  boxShadow: "var(--shadow-navigation)",
                  fontFamily: "var(--font-family-body)",
                  backgroundColor: "var(--color-surface-default)",
                }}
                labelStyle={{
                  color: "var(--color-text-secondary)",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={title}
                stroke="var(--color-action-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--color-action-primary)",
                  stroke: "var(--color-surface-default)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {!loading && data.length > 0 && (
        <details className="mt-4" data-testid="chart-data-table">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-action-primary">
            {t("dashboard.showDataTable")}
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">{chartDescription}</caption>
              <thead>
                <tr className="border-b border-border-default">
                  <th scope="col" className="py-2 pr-4 font-semibold text-text-secondary">
                    {t("common.date")}
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="py-2 pr-4 font-semibold text-text-secondary"
                    >
                      {t(`dashboard.column.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.date} className="border-b border-border-default last:border-0">
                    <th scope="row" className="py-2 pr-4 font-mono text-xs font-normal text-text-secondary">
                      {row.date}
                    </th>
                    {columns.map((column) => (
                      <td key={column} className="py-2 pr-4 text-xs tabular-nums text-text-primary">
                        {row[column] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [dateFrom, setDateFrom] = useState(defaultDateFrom());
  const [dateTo, setDateTo] = useState(isoDate(new Date()));
  const [series, setSeries] = useState(null);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [seriesError, setSeriesError] = useState("");

  const fetchStats = useCallback(() => {
    setLoadError("");
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch((err) => setLoadError(formatApiError(err.response?.data?.detail)));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const loadSeries = useCallback(() => {
    setSeriesError("");
    setSeriesLoading(true);
    api
      .get("/admin/stats/timeseries", {
        params: { date_from: dateFrom, date_to: dateTo },
      })
      .then((r) => setSeries(r.data.series))
      .catch((err) => setSeriesError(formatApiError(err.response?.data?.detail)))
      .finally(() => setSeriesLoading(false));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const canSeeInventory = hasPermission(user, "inventory.read");
  const statsLoading = !stats && !loadError;
  const roleHome = getRoleHome(user);
  const queueCounts = stats
    ? roleHome.queuePaths
        .map((path) => queueCount(path, stats))
    : [];
  const measuredQueueCounts = queueCounts.filter(Number.isFinite);
  const hasQueuedWork = measuredQueueCounts.some((count) => count > 0);
  const hasCompleteQueueCoverage =
    stats &&
    roleHome.queuePaths.length > 0 &&
    queueCounts.length === roleHome.queuePaths.length &&
    queueCounts.every(Number.isFinite);

  if (loadError) {
    return (
      <AdminLayout
        title={t("admin.workHome")}
        subtitle={t(roleHome.labelKey)}
      >
        <ErrorState error={loadError} onRetry={fetchStats} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("admin.workHome")}
      subtitle={t(roleHome.labelKey)}
    >
      <section aria-labelledby="work-queue-title" className="max-w-3xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border-default pb-4">
          <div>
            <p className="type-label uppercase tracking-widest text-action-primary">
              {t("admin.operationalSpine")}
            </p>
            <h2 id="work-queue-title" className="mt-1 font-heading text-xl font-semibold text-text-primary">
              {t("dashboard.actionNeeded")}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            {statsLoading ? (
              <Clock className="h-4 w-4" />
            ) : hasQueuedWork ? (
              <CircleAlert className="h-4 w-4 text-status-warning" />
            ) : hasCompleteQueueCoverage ? (
              <CircleCheck className="h-4 w-4 text-status-success" />
            ) : (
              <CircleHelp className="h-4 w-4 text-text-secondary" />
            )}
            {statsLoading
              ? t("common.loading")
              : hasCompleteQueueCoverage
                ? t("admin.queueLive")
                : t("admin.queueReviewRequired")}
          </div>
        </div>
        <div data-testid="operational-spine">
          {roleHome.queuePaths.map((path, index) => (
            <WorkQueueRow
              key={path}
              path={path}
              index={index}
              count={queueCount(path, stats)}
              loading={statsLoading}
            />
          ))}
          {!statsLoading && roleHome.queuePaths.length === 0 && (
            <EmptyState frame="solid">{t("admin.noAssignedQueue")}</EmptyState>
          )}
        </div>
      </section>

      {/* ─── Date Range Filter ─── */}
      <section
        className="mt-10 border-y border-border-default py-5"
        aria-labelledby="dashboard-date-range-title"
      >
        <h2 id="dashboard-date-range-title" className="sr-only">
          {t("dashboard.dateRange")}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <FormField label={t("dashboard.dateFrom")}>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-auto"
            />
          </FormField>
          <FormField label={t("dashboard.dateTo")}>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-auto"
            />
          </FormField>
        </div>
      </section>

      {seriesError && (
        <ErrorState
          error={seriesError}
          onRetry={loadSeries}
          compact
          className="mt-4"
        />
      )}

      {/* ─── Trend Charts ─── */}
      <section className="mt-8" aria-labelledby="dashboard-trends-title">
        <div className="mb-4 max-w-3xl">
          <h2
            id="dashboard-trends-title"
            className="font-heading text-xl font-semibold text-text-primary"
          >
            {t("dashboard.operationalTrends")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {t("dashboard.operationalTrendsBody")}
          </p>
        </div>
        <div className="grid gap-x-8 lg:grid-cols-2">
          <TrendChart
            id="dashboard-orders-trend"
            title={t("dashboard.ordersTrend")}
            rows={series?.orders_by_status || []}
            value={totalForRow}
            loading={seriesLoading}
            dateFrom={dateFrom}
            dateTo={dateTo}
            emptyAction={
              hasPermission(user, "orders.read")
                ? {
                    to: "/admin/retail-orders",
                    labelKey: "dashboard.openOrders",
                  }
                : null
            }
          />
          {canSeeInventory && (
            <TrendChart
              id="dashboard-stock-trend"
              title={t("dashboard.stockMovementsTrend")}
              rows={series?.stock_movements || []}
              value={(row) => Number(row.signed_quantity) || 0}
              loading={seriesLoading}
              dateFrom={dateFrom}
              dateTo={dateTo}
              emptyAction={{
                to: "/admin/stock-movements",
                labelKey: "dashboard.openStockMovements",
              }}
            />
          )}
        </div>
      </section>

      {series?.revenue?.available === false && (
        <SurfacePanel
          intent="dashed"
          padding="md"
          className="mt-4"
          data-testid="revenue-withheld"
        >
          <p className="type-label text-text-secondary">
            {t("dashboard.revenueWithheldTitle")}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("dashboard.revenueWithheldBody")}
          </p>
        </SurfacePanel>
      )}
    </AdminLayout>
  );
}
