import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Clock,
  CreditCard,
  Package,
  CheckCircle2,
  Users,
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
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
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
 * Sum every numeric field on a row except "date" into a single total —
 * lets one <Line> render a combined trend without hardcoding field names
 * that vary by series (order statuses vs movement types).
 */
function totalForRow(row) {
  return Object.entries(row).reduce(
    (sum, [key, value]) => (key === "date" ? sum : sum + (Number(value) || 0)),
    0
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Action Card — links to page with "needs attention" count
 * ────────────────────────────────────────────────────────────────────────── */

function ActionCard({ icon: Icon, label, count, colorClass, to, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <SurfacePanel className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-control" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-10" />
          </div>
        </div>
      </SurfacePanel>
    );
  }

  const hasItems = count > 0;

  return (
    <SurfacePanel
      className={`p-4 transition-all duration-fast cursor-pointer hover:shadow-navigation hover:-translate-y-0.5 ${
        hasItems ? "ring-1 ring-inset ring-" + colorClass.replace("text-", "") + "/20" : ""
      }`}
      onClick={() => navigate(to)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(to)}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${
            hasItems ? "bg-" + colorClass.replace("text-", "") + "/10" : "bg-surface-muted"
          }`}
        >
          <Icon className={`h-5 w-5 ${hasItems ? colorClass : "text-text-secondary"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary truncate">
            {label}
          </p>
          <p className={`text-2xl font-bold tabular-nums ${hasItems ? colorClass : "text-text-primary"}`}>
            {count}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-text-secondary shrink-0" />
      </div>
    </SurfacePanel>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Trend Chart Component — with accessible description
 * ────────────────────────────────────────────────────────────────────────── */

function TrendChart({ title, rows, valueLabel, formatValue, loading, dateFrom, dateTo }) {
  const { t } = useI18n();
  const data = rows.map((row) => ({
    date: row.date,
    value: valueLabel === "revenue" ? row.amount : totalForRow(row),
  }));

  const chartDescription = t("dashboard.chartDescription")
    .replace("{title}", title)
    .replace("{from}", dateFrom || "")
    .replace("{to}", dateTo || "");

  return (
    <SurfacePanel className="p-4 sm:p-6">
      <p className="type-label text-text-secondary mb-4">{title}</p>
      {loading ? (
        <div className="h-[200px] sm:h-[220px] flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-control" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-[200px] sm:h-[220px] flex items-center justify-center">
          <EmptyState icon={BarChart3}>
            {t("dashboard.noDataInRange")}
          </EmptyState>
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
    </SurfacePanel>
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
  const canSeeRevenue = hasPermission(user, "payments.read");
  const statsLoading = !stats && !loadError;

  if (loadError) {
    return (
      <AdminLayout
        title={t("admin.overview")}
        subtitle={t("admin.overviewSubtitle")}
      >
        <ErrorState error={loadError} onRetry={fetchStats} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("admin.overview")}
      subtitle={t("admin.overviewSubtitle")}
    >
      {/* ─── Action Cards — status-driven "needs attention" row ─── */}
      <section aria-label={t("dashboard.actionNeeded")}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <ActionCard
            icon={Clock}
            label={t("dashboard.pendingEstimates")}
            count={stats?.pending_estimate ?? 0}
            colorClass="text-status-warning"
            to="/admin/orders?status=pending_estimate"
            loading={statsLoading}
          />
          <ActionCard
            icon={CreditCard}
            label={t("dashboard.awaitingPayments")}
            count={stats?.awaiting_payment ?? 0}
            colorClass="text-action-primary"
            to="/admin/orders?status=awaiting_payment"
            loading={statsLoading}
          />
          <ActionCard
            icon={Package}
            label={t("dashboard.inProcess")}
            count={stats?.in_process ?? 0}
            colorClass="text-action-primary"
            to="/admin/orders?status=in_process"
            loading={statsLoading}
          />
          <ActionCard
            icon={CheckCircle2}
            label={t("dashboard.completedOrders")}
            count={stats?.completed ?? 0}
            colorClass="text-status-success"
            to="/admin/orders?status=completed"
            loading={statsLoading}
          />
        </div>
      </section>

      {/* ─── Summary Stats ─── */}
      <div
        className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        data-testid="admin-overview"
      >
        {statsLoading ? (
          <>
            <StatCardSkeleton hero />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label={t("admin.totalOrders")}
              value={stats.total_orders}
              colorClass="text-action-primary"
              accentClass="border-l-action-primary"
              hero
              delay={0}
            />
            <StatCard
              label={t("dashboard.totalClients")}
              value={stats.clients}
              colorClass="text-text-primary"
              accentClass="border-l-border-strong"
              delay={60}
              className="flex items-center"
            />
          </>
        )}
      </div>

      {/* ─── Date Range Filter ─── */}
      <SurfacePanel className="mt-8 p-4">
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
      </SurfacePanel>

      {seriesError && (
        <ErrorState
          error={seriesError}
          onRetry={loadSeries}
          compact
          className="mt-4"
        />
      )}

      {/* ─── Trend Charts ─── */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TrendChart
          title={t("dashboard.ordersTrend")}
          rows={series?.orders_by_status || []}
          loading={seriesLoading}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
        {canSeeInventory && (
          <TrendChart
            title={t("dashboard.stockMovementsTrend")}
            rows={series?.stock_movements || []}
            loading={seriesLoading}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        )}
        {canSeeRevenue && (
          <TrendChart
            title={t("dashboard.revenueTrend")}
            rows={series?.revenue || []}
            valueLabel="revenue"
            formatValue={(value) =>
              `Rp ${Number(value).toLocaleString("id-ID")}`
            }
            loading={seriesLoading}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        )}
      </div>
    </AdminLayout>
  );
}
