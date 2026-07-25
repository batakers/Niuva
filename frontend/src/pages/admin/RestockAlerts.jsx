import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonTableRow } from "@/components/ui/skeleton";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import {
  alertActions,
  inventoryApi,
  parseInventoryConflict,
  statusTone,
  validInventoryReason,
} from "@/lib/inventory";
import { AdminLayout } from "./AdminLayout";

export default function RestockAlerts() {
  const { t } = useI18n();
  const { user } = useAuth();
  const actions = alertActions(user?.permissions || []);

  const [status, setStatus] = useState("active");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await inventoryApi.alerts({ status, limit: 500 }));
    } catch (requestError) {
      setError(parseInventoryConflict(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout
      title={t("admin.restockAlerts")}
      subtitle={t("inventory.alertSubtitle")}
    >
      {/* Filters */}
      <SurfacePanel>
        <SurfacePanelHeader className="flex flex-wrap items-center justify-between gap-3">
          <p className="type-label text-text-secondary">{t("inventory.alerts")}</p>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </SurfacePanelHeader>

        <div className="p-4">
          <div className="space-y-1.5 max-w-xs">
            <Label>{t("common.status")}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SurfacePanel>

      {/* Data Table */}
      <SurfacePanel className="mt-4">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.subject")}</TableHead>
                <TableHead>{t("inventory.trigger")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("inventory.metrics")}</TableHead>
                <TableHead>{t("inventory.recipients")}</TableHead>
                <TableHead>{t("common.updated")}</TableHead>
                {actions.includes("resolve") && (
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonTableRow key={i} columns={actions.includes("resolve") ? 7 : 6} />
              ))}
            </TableBody>
          </Table>
        ) : error ? (
          <EmptyState icon={AlertCircle} className="py-16">
            <span role="alert" className="text-status-error">{error}</span>
          </EmptyState>
        ) : rows.length === 0 ? (
          <EmptyState className="py-16">{t("inventory.noAlerts")}</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.subject")}</TableHead>
                <TableHead>{t("inventory.trigger")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("inventory.metrics")}</TableHead>
                <TableHead>{t("inventory.recipients")}</TableHead>
                <TableHead>{t("common.updated")}</TableHead>
                {actions.includes("resolve") && (
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((alert) => (
                <TableRow key={alert.id}>
                  {/* Subject */}
                  <TableCell>
                    <div className="font-semibold text-text-primary">
                      {alert.subject_name || alert.subject_id}
                    </div>
                    <TechnicalLabel size="micro">{alert.subject_type}</TechnicalLabel>
                  </TableCell>

                  {/* Trigger */}
                  <TableCell>
                    <TechnicalLabel
                      tone={
                        alert.trigger_type === "projected_shortage"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {alert.trigger_type}
                    </TechnicalLabel>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <TechnicalLabel tone={statusTone(alert.status)}>
                      {alert.status}
                    </TechnicalLabel>
                  </TableCell>

                  {/* Metrics */}
                  <TableCell>
                    <div className="font-mono text-xs tabular-nums text-text-secondary">
                      Available: {alert.last_balance?.available ?? "—"}
                    </div>
                    <div className="font-mono text-xs tabular-nums text-text-secondary">
                      Reserved: {alert.last_balance?.reserved ?? "—"}
                    </div>
                  </TableCell>

                  {/* Recipients */}
                  <TableCell className="text-text-secondary">
                    {alert.recipients?.length ?? 0}
                  </TableCell>

                  {/* Updated */}
                  <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">
                    {alert.updated_at}
                  </TableCell>

                  {/* Actions */}
                  {actions.includes("resolve") && (
                    <TableCell className="text-right">
                      {alert.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResolving(alert)}
                        >
                          <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                          {t("inventory.resolve")}
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SurfacePanel>

      {/* Resolve Dialog */}
      {resolving && (
        <ResolveDialog
          alert={resolving}
          onClose={() => setResolving(null)}
          onResolved={() => {
            setResolving(null);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Resolve Dialog
 * ────────────────────────────────────────────────────────────────────────── */

function ResolveDialog({ alert, onClose, onResolved }) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const resolve = async () => {
    setBusy(true);
    try {
      await inventoryApi.resolveAlert(alert.id, reason.trim());
      toast.success(t("inventory.resolveSuccess"));
      onResolved();
    } catch (error) {
      toast.error(parseInventoryConflict(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("inventory.resolve")} · {alert.subject_name || alert.subject_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>{t("common.reason")}</Label>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            placeholder={t("common.reason")}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={busy || !validInventoryReason(reason)}
            onClick={resolve}
          >
            {t("inventory.resolve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
