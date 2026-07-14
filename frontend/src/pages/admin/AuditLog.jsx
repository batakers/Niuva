import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError } from "../../lib/api";
import { hasPermission } from "../../lib/permissions";
import { AdminLayout } from "./AdminLayout";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { EmptyState } from "../../components/ui/empty-state";
import {
  SurfacePanel,
  SurfacePanelHeader,
} from "../../components/ui/surface-panel";
import { TechnicalLabel } from "../../components/ui/technical-label";


function formatTimestamp(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}


function AuditSnapshot({ title, value }) {
  return (
    <SurfacePanel>
      <SurfacePanelHeader padding="sm">
        <TechnicalLabel>{title}</TechnicalLabel>
      </SurfacePanelHeader>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-6 text-muted-foreground">
        {JSON.stringify(value || {}, null, 2)}
      </pre>
    </SurfacePanel>
  );
}


export default function AdminAuditLog() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selected, setSelected] = useState(null);
  const canReadAudit = hasPermission(user, "audit.read");

  useEffect(() => {
    let active = true;
    api
      .get("/admin/audit-events?limit=100")
      .then((response) => {
        if (active) setItems(response.data);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 403) setPermissionDenied(true);
        setError(formatApiError(requestError.response?.data?.detail));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout title={t("admin.audit")} subtitle="Read-only Change Ledger">
      <SurfacePanel>
        <SurfacePanelHeader>
          <TechnicalLabel>AUDIT_EVENTS // LATEST: {items.length}</TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? <EmptyState>[ FETCHING_AUDIT_EVENTS... ]</EmptyState> : null}
        {!loading && permissionDenied ? (
          <EmptyState frame="dashed" className="text-destructive">
            Anda tidak memiliki izin membaca audit log.
          </EmptyState>
        ) : null}
        {!loading && !permissionDenied && error ? (
          <EmptyState frame="dashed" className="text-destructive">{error}</EmptyState>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyState>NO_AUDIT_EVENTS_FOUND</EmptyState>
        ) : null}
        {!loading && !error && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-background/50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-4 font-normal">Timestamp</th>
                  <th className="px-5 py-4 font-normal">Actor</th>
                  <th className="px-5 py-4 font-normal">Action</th>
                  <th className="px-5 py-4 font-normal">Target</th>
                  <th className="px-5 py-4 font-normal">Reason</th>
                  <th className="px-5 py-4 text-right font-normal">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs">
                {items.map((event) => (
                  <tr key={event.id} className="align-top transition-colors hover:bg-surface-2/50">
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                      {formatTimestamp(event.created_at)}
                    </td>
                    <td className="px-5 py-4 text-foreground">{event.actor_email || event.actor_user_id || "system"}</td>
                    <td className="px-5 py-4 font-mono text-primary">{event.action}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <span className="block">{event.target_type}</span>
                      <span className="mt-1 block font-mono text-[10px]">{event.target_id}</span>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-muted-foreground">{event.reason || "-"}</td>
                    <td className="px-5 py-4 text-right">
                      {canReadAudit ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(event)}>
                          <Eye /> View
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SurfacePanel>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-none border-border bg-surface-1 text-foreground">
          <DialogHeader>
            <DialogTitle>{selected?.action}</DialogTitle>
            <DialogDescription>
              {selected?.actor_email || selected?.actor_user_id || "system"} · {formatTimestamp(selected?.created_at)} · {selected?.reason || "Tanpa alasan"}
            </DialogDescription>
          </DialogHeader>
          {canReadAudit ? (
            <div className="grid gap-4 md:grid-cols-2">
              <AuditSnapshot title="BEFORE" value={selected?.before} />
              <AuditSnapshot title="AFTER" value={selected?.after} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
