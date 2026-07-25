import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { safeAuditEvent } from "@/lib/identityAccess";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

/* ─────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────── */

function formatTimestamp(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function AuditSnapshot({ title, value }) {
  return (
    <SurfacePanel>
      <SurfacePanelHeader>
        <TechnicalLabel>{title}</TechnicalLabel>
      </SurfacePanelHeader>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-6 text-text-secondary">
        {JSON.stringify(value || {}, null, 2)}
      </pre>
    </SurfacePanel>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

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
        if (active) {
          setItems(
            Array.isArray(response.data)
              ? response.data.map(safeAuditEvent)
              : []
          );
        }
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
    <AdminLayout
      title={t("admin.audit")}
      subtitle={t("audit.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between">
          <TechnicalLabel>
            {t("audit.total")}: {items.length}
          </TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? (
          <EmptyState>{t("common.loading")}</EmptyState>
        ) : permissionDenied ? (
          <EmptyState>
            <span role="alert" className="text-status-error">
              {t("audit.permissionDenied")}
            </span>
          </EmptyState>
        ) : error ? (
          <EmptyState>
            <span role="alert" className="text-status-error">{error}</span>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState>{t("audit.empty")}</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("audit.timestamp")}</TableHead>
                <TableHead>{t("audit.actor")}</TableHead>
                <TableHead>{t("audit.action")}</TableHead>
                <TableHead>{t("audit.target")}</TableHead>
                <TableHead>{t("audit.reason")}</TableHead>
                <TableHead className="text-right">{t("common.detail")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((event) => (
                <TableRow key={event.id} className="align-top">
                  <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">
                    {formatTimestamp(event.created_at)}
                  </TableCell>
                  <TableCell className="text-text-primary">
                    {event.actor_user_id || "system"}
                  </TableCell>
                  <TableCell className="font-mono text-action-primary">
                    {event.action}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    <span className="block">{event.target_type}</span>
                    <span className="mt-1 block font-mono text-[10px]">
                      {event.target_id}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs text-text-secondary">
                    {event.reason_code || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {canReadAudit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(event)}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        {t("common.view")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SurfacePanel>

      {/* Detail Dialog */}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.action}</DialogTitle>
            <DialogDescription>
              {selected?.actor_user_id || "system"} ·{" "}
              {formatTimestamp(selected?.created_at)} ·{" "}
              {selected?.reason_code || t("audit.noReasonCode")}
            </DialogDescription>
          </DialogHeader>

          {canReadAudit && (
            <div className="grid gap-4 md:grid-cols-2">
              <AuditSnapshot
                title={t("audit.previousState")}
                value={selected?.previous}
              />
              <AuditSnapshot
                title={t("audit.resultState")}
                value={selected?.result}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
