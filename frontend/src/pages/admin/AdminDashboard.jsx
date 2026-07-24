import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { api, formatApiError } from "../../lib/api";
import { AdminLayout } from "./AdminLayout";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch((err) => setLoadError(formatApiError(err.response?.data?.detail)));
  }, []);

  if (loadError) {
    return (
      <AdminLayout title={t("admin.overview")} subtitle="System Operations Hub">
        <div className="border border-border bg-surface-1 p-12 text-center">
          <p className="font-mono text-xs text-destructive uppercase tracking-widest" role="alert">{loadError}</p>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title={t("admin.overview")} subtitle="System Operations Hub">
        <div className="border border-border bg-surface-1 p-12 text-center">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest" role="status">[ FETCHING_TELEMETRY... ]</p>
        </div>
      </AdminLayout>
    );
  }

  const items = [
    ["total_orders", "Total Orders", "text-primary"],
    ["pending_estimate", t("status.pending_estimate"), "text-warm"],
    ["awaiting_payment", t("status.awaiting_payment"), "text-primary"],
    ["in_process", t("status.in_process"), "text-primary"],
    ["completed", t("status.completed"), "text-status-success"],
    ["clients", t("admin.users"), "text-foreground"],
    ["internships", t("admin.internships"), "text-foreground"],
  ];

  return (
    <AdminLayout title={t("admin.overview")} subtitle="System Operations Hub">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-overview">
        {items.map(([k, label, color]) => (
          <div key={k} className="border border-border bg-surface-1 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
            
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 border-b border-border/50 pb-2">{label}</p>
            <p className={`font-heading text-4xl font-bold tracking-tight ${color}`}>{stats[k]}</p>
            
            <div className="mt-4 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">METRIC_ID: {k.substring(0,6)}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${color === "text-foreground" ? "bg-muted-foreground" : "bg-current"} ${color}`} />
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

