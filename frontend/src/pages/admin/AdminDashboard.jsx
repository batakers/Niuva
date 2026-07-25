import React, { useCallback, useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { api, formatApiError } from "../../lib/api";
import { AdminLayout } from "./AdminLayout";

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
  return Object.entries(row).reduce((sum, [key, value]) => (key === "date" ? sum : sum + (Number(value) || 0)), 0);
}

function TrendChart({ title, rows, valueLabel, formatValue }) {
  const { t } = useI18n();
  const data = rows.map((row) => ({ date: row.date, value: valueLabel === "revenue" ? row.amount : totalForRow(row) }));
  return (
    <div className="rounded-card border border-border-default bg-surface-default shadow-surface p-6">
      <p className="type-label text-text-secondary mb-4">{title}</p>
      {data.length === 0 ? (
        <p className="type-body-small text-text-secondary" role="status">{t("dashboard.noDataInRange")}</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-secondary)", fontFamily: "var(--font-family-mono)" }} stroke="var(--color-border-default)" />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)", fontFamily: "var(--font-family-mono)" }} stroke="var(--color-border-default)" />
            <Tooltip formatter={formatValue} contentStyle={{ borderRadius: "0.75rem", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-navigation)", fontFamily: "var(--font-family-body)" }} />
            <Line type="monotone" dataKey="value" stroke="var(--color-action-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [dateFrom, setDateFrom] = useState(defaultDateFrom());
  const [dateTo, setDateTo] = useState(isoDate(new Date()));
  const [series, setSeries] = useState(null);
  const [seriesError, setSeriesError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch((err) => setLoadError(formatApiError(err.response?.data?.detail)));
  }, []);

  const loadSeries = useCallback(() => {
    setSeriesError("");
    api
      .get("/admin/stats/timeseries", { params: { date_from: dateFrom, date_to: dateTo } })
      .then((r) => setSeries(r.data.series))
      .catch((err) => setSeriesError(formatApiError(err.response?.data?.detail)));
  }, [dateFrom, dateTo]);

  useEffect(() => { loadSeries(); }, [loadSeries]);

  const canSeeInventory = hasPermission(user, "inventory.read");
  const canSeeRevenue = hasPermission(user, "payments.read");

  if (loadError) {
    return (
      <AdminLayout title={t("admin.overview")} subtitle={t("admin.overviewSubtitle")}>
        <div className="rounded-card border border-border-default bg-surface-default shadow-surface p-12 text-center">
          <p className="type-body text-status-error" role="alert">{loadError}</p>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title={t("admin.overview")} subtitle={t("admin.overviewSubtitle")}>
        <div className="rounded-card border border-border-default bg-surface-default shadow-surface p-12 text-center">
          <p className="type-body-small text-text-secondary" role="status">{t("common.loading")}</p>
        </div>
      </AdminLayout>
    );
  }

  const items = [
    ["total_orders", t("admin.totalOrders"), "text-action-primary"],
    ["pending_estimate", t("status.pending_estimate"), "text-status-warning"],
    ["awaiting_payment", t("status.awaiting_payment"), "text-action-primary"],
    ["in_process", t("status.in_process"), "text-action-primary"],
    ["completed", t("status.completed"), "text-status-success"],
    ["clients", t("admin.users"), "text-text-primary"],
    ["internships", t("admin.internships"), "text-text-primary"],
  ];

  return (
    <AdminLayout title={t("admin.overview")} subtitle={t("admin.overviewSubtitle")}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-overview">
        {items.map(([k, label, color]) => (
          <div key={k} className="rounded-card border border-border-default bg-surface-default shadow-surface p-6">
            <p className="type-label text-text-secondary mb-3">{label}</p>
            <p className={`font-heading text-4xl font-bold tracking-tight ${color}`}>{stats[k]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-3">
        <label className="space-y-1.5">
          <span className="block type-label text-text-secondary">{t("dashboard.dateFrom")}</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11 rounded-control border border-border-default bg-surface-default px-3 type-body-small text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2" />
        </label>
        <label className="space-y-1.5">
          <span className="block type-label text-text-secondary">{t("dashboard.dateTo")}</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11 rounded-control border border-border-default bg-surface-default px-3 type-body-small text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2" />
        </label>
      </div>

      {seriesError && <p className="mt-4 type-body-small text-status-error" role="alert">{seriesError}</p>}

      {series && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TrendChart title={t("dashboard.ordersTrend")} rows={series.orders_by_status || []} />
          {canSeeInventory && series.stock_movements && (
            <TrendChart title={t("dashboard.stockMovementsTrend")} rows={series.stock_movements} />
          )}
          {canSeeRevenue && series.revenue && (
            <TrendChart title={t("dashboard.revenueTrend")} rows={series.revenue} valueLabel="revenue" formatValue={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`} />
          )}
        </div>
      )}
    </AdminLayout>
  );
}
