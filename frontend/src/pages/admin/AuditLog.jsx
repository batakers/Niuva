import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { safeAuditEvent } from "@/lib/identityAccess";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

const PAGE_SIZE = 100;
const INITIAL_FILTERS = {
  actor: "",
  action: "",
  target_type: "",
  target_id: "",
  date_from: "",
  date_to: "",
};

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
        <p className="type-label text-text-secondary">{title}</p>
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [hasMore, setHasMore] = useState(false);

  const canReadAudit = hasPermission(user, "audit.read");

  const activeParams = useMemo(() => {
    const params = { limit: PAGE_SIZE };
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) params[key] = value.trim();
    });
    return params;
  }, [filters]);

  const hasActiveFilters = Object.values(filters).some((value) => value.trim());

  const load = useCallback((offset = 0) => {
    const isFirstPage = offset === 0;
    if (isFirstPage) {
      setLoading(true);
      setError("");
      setPermissionDenied(false);
    } else {
      setLoadingMore(true);
    }
    return api
      .get("/admin/audit-events", { params: { ...activeParams, offset } })
      .then((response) => {
        const rows = Array.isArray(response.data)
          ? response.data.map(safeAuditEvent)
          : [];
        setItems((current) => (isFirstPage ? rows : [...current, ...rows]));
        setHasMore(rows.length === PAGE_SIZE);
      })
      .catch((requestError) => {
        if (requestError.response?.status === 403) setPermissionDenied(true);
        setError(formatApiError(requestError.response?.data?.detail));
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [activeParams]);

  useEffect(() => {
    load(0);
  }, [load]);

  const updateFilter = (key) => (value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  return (
    <AdminLayout
      title={t("admin.audit")}
      subtitle={t("audit.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between">
          <p className="type-label text-text-secondary">
            {t("audit.total")}: {items.length}
          </p>
        </SurfacePanelHeader>

        {/* Filter bar */}
        {!permissionDenied && (
          <div className="flex flex-wrap items-end gap-3 border-b border-border-default px-6 py-4">
            <div className="min-w-[160px] flex-1 space-y-1.5">
              <Label className="type-label text-text-secondary">
                {t("audit.actor")}
              </Label>
              <Input
                value={filters.actor}
                onChange={(e) => updateFilter("actor")(e.target.value)}
                placeholder={t("audit.filterActorPlaceholder")}
              />
            </div>
            <div className="min-w-[160px] flex-1 space-y-1.5">
              <Label className="type-label text-text-secondary">
                {t("audit.action")}
              </Label>
              <Input
                value={filters.action}
                onChange={(e) => updateFilter("action")(e.target.value)}
                placeholder={t("audit.filterActionPlaceholder")}
              />
            </div>
            <div className="min-w-[140px] flex-1 space-y-1.5">
              <Label className="type-label text-text-secondary">
                {t("audit.target")}
              </Label>
              <Input
                value={filters.target_type}
                onChange={(e) => updateFilter("target_type")(e.target.value)}
                placeholder={t("audit.filterTargetPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="type-label text-text-secondary">
                {t("dashboard.dateFrom")}
              </Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => updateFilter("date_from")(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="type-label text-text-secondary">
                {t("dashboard.dateTo")}
              </Label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => updateFilter("date_to")(e.target.value)}
                className="w-auto"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(INITIAL_FILTERS)}
              >
                {t("common.reset")}
              </Button>
            )}
          </div>
        )}

        {loading ? (
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
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonTableRow key={i} columns={6} />
              ))}
            </TableBody>
          </Table>
        ) : permissionDenied ? (
          <EmptyState icon={AlertCircle} className="py-16">
            <span role="alert" className="text-status-error">
              {t("audit.permissionDenied")}
            </span>
          </EmptyState>
        ) : error ? (
          <EmptyState icon={AlertCircle} className="py-16">
            <span role="alert" className="text-status-error">{error}</span>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState icon={ScrollText} className="py-16">
            {hasActiveFilters ? t("audit.noMatch") : t("audit.empty")}
          </EmptyState>
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

        {!loading && !error && !permissionDenied && hasMore && (
          <div className="flex justify-center border-t border-border-default p-4">
            <Button
              variant="outline"
              size="sm"
              loading={loadingMore}
              onClick={() => load(items.length)}
            >
              {t("audit.loadMore")}
            </Button>
          </div>
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
