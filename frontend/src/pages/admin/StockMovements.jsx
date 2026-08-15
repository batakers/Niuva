import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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
import { useI18n } from "@/i18n";
import { downloadCsv } from "@/lib/api";
import { inventoryApi, parseInventoryConflict } from "@/lib/inventory";
import { AdminLayout } from "./AdminLayout";

// The URL is the filter state, so any filtered view of the immutable history
// is a shareable deep link: another surface can point at the movements of one
// source record, and the operator can hand that address to a colleague.
const FILTER_KEYS = [
  "subject_type",
  "subject_id",
  "reference_id",
  "movement_type",
  "actor",
  "date",
];

const ALL_SUBJECT_TYPES = "all";

export default function StockMovements() {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () =>
      Object.fromEntries(
        FILTER_KEYS.map((key) => [key, searchParams.get(key) || ""])
      ),
    [searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(
        await inventoryApi.movements({
          subject_type: filters.subject_type,
          subject_id: filters.subject_id,
          reference_id: filters.reference_id,
          limit: 500,
        })
      );
    } catch (requestError) {
      setError(parseInventoryConflict(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, [filters.subject_type, filters.subject_id, filters.reference_id]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          (!filters.movement_type || row.movement_type === filters.movement_type) &&
          (!filters.actor || String(row.created_by || "").includes(filters.actor)) &&
          (!filters.date || String(row.created_at || "").startsWith(filters.date))
      ),
    [rows, filters.movement_type, filters.actor, filters.date]
  );

  const updateFilter = (field) => (value) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(field, value);
        else next.delete(field);
        return next;
      },
      { replace: true }
    );

  const updateFilterEvent = (field) => (event) =>
    updateFilter(field)(event.target.value);

  const exportCsv = async () => {
    const params = new URLSearchParams();
    if (filters.subject_type) params.set("subject_type", filters.subject_type);
    if (filters.subject_id) params.set("subject_id", filters.subject_id);
    if (filters.reference_id) params.set("reference_id", filters.reference_id);
    const query = params.toString();
    try {
      await downloadCsv(
        `/admin/inventory/movements/export${query ? `?${query}` : ""}`,
        "niuva-stock-movements.csv"
      );
    } catch (exportError) {
      toast.error(exportError.message);
    }
  };

  return (
    <AdminLayout
      title={t("admin.stockMovements")}
      subtitle={t("inventory.historySubtitle")}
    >
      {/* Filters Panel */}
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between">
          <p className="type-label text-text-secondary">{t("inventory.immutableHistory")}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" />
              {t("common.exportCsv")}
            </Button>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </div>
        </SurfacePanelHeader>

        <div className="grid gap-4 p-4 md:grid-cols-3 xl:grid-cols-6">
          {/* Subject Type */}
          <FormField label={t("inventory.subjectType")}>
            <Select
              value={filters.subject_type || ALL_SUBJECT_TYPES}
              onValueChange={(value) =>
                updateFilter("subject_type")(
                  value === ALL_SUBJECT_TYPES ? "" : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SUBJECT_TYPES}>{t("common.all")}</SelectItem>
                <SelectItem value="material">{t("inventory.subjectMaterial")}</SelectItem>
                <SelectItem value="product_variant">{t("inventory.subjectProductVariant")}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* Subject ID */}
          <FormField label={t("inventory.subjectId")}>
            <Input
              value={filters.subject_id}
              onChange={updateFilterEvent("subject_id")}
              placeholder="..."
            />
          </FormField>

          {/* Movement Type */}
          <FormField label={t("inventory.movementType")}>
            <Input
              value={filters.movement_type}
              onChange={updateFilterEvent("movement_type")}
              placeholder="..."
            />
          </FormField>

          {/* Reference ID */}
          <FormField label={t("inventory.referenceId")}>
            <Input
              value={filters.reference_id}
              onChange={updateFilterEvent("reference_id")}
              placeholder="..."
            />
          </FormField>

          {/* Actor */}
          <FormField label={t("inventory.actor")}>
            <Input
              value={filters.actor}
              onChange={updateFilterEvent("actor")}
              placeholder="..."
            />
          </FormField>

          {/* Date */}
          <FormField label={t("common.date")}>
            <Input
              type="date"
              value={filters.date}
              onChange={updateFilterEvent("date")}
            />
          </FormField>
        </div>
      </SurfacePanel>

      {/* Data Table */}
      <SurfacePanel className="mt-4">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("inventory.subject")}</TableHead>
                <TableHead>{t("inventory.movementType")}</TableHead>
                <TableHead>{t("inventory.quantity")}</TableHead>
                <TableHead>{t("inventory.referenceId")}</TableHead>
                <TableHead>{t("inventory.actor")}</TableHead>
                <TableHead>{t("common.reason")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonTableRow key={i} columns={7} />
              ))}
            </TableBody>
          </Table>
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : visible.length === 0 ? (
          <EmptyState className="py-16">{t("inventory.noMovements")}</EmptyState>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead>{t("inventory.subject")}</TableHead>
                    <TableHead>{t("inventory.movementType")}</TableHead>
                    <TableHead>{t("inventory.quantity")}</TableHead>
                    <TableHead>{t("inventory.referenceId")}</TableHead>
                    <TableHead>{t("inventory.actor")}</TableHead>
                    <TableHead>{t("common.reason")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">
                        {row.created_at}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-text-primary">
                          {row.subject_name || row.subject_id}
                        </div>
                        <TechnicalLabel size="micro">{row.subject_type}</TechnicalLabel>
                      </TableCell>
                      <TableCell>
                        <TechnicalLabel
                          tone={
                            row.movement_type.includes("out") ||
                            row.movement_type.includes("reserve")
                              ? "warning"
                              : "success"
                          }
                        >
                          {row.movement_type}
                        </TechnicalLabel>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                      </TableCell>
                      <TableCell>
                        {row.reference_id ? (
                          <>
                            <Link
                              to={`/admin/stock-movements?reference_id=${encodeURIComponent(row.reference_id)}`}
                              className="font-mono text-xs font-semibold text-action-primary"
                              data-testid="movement-reference-link"
                            >
                              {row.reference_id}
                            </Link>
                            <TechnicalLabel size="micro" className="block">
                              {row.reference_type || "manual"}
                            </TechnicalLabel>
                          </>
                        ) : (
                          <span className="font-mono text-xs text-text-secondary">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {row.created_by || "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-text-secondary">
                        {row.reason || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border-default">
              {visible.map((row) => (
                <div key={row.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text-primary truncate">
                      {row.subject_name || row.subject_id}
                    </span>
                    <span className="text-sm tabular-nums text-text-primary shrink-0">
                      {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <TechnicalLabel
                      tone={
                        row.movement_type.includes("out") ||
                        row.movement_type.includes("reserve")
                          ? "warning"
                          : "success"
                      }
                      size="micro"
                    >
                      {row.movement_type}
                    </TechnicalLabel>
                    <span className="font-mono text-xs text-text-secondary">
                      {row.created_at}
                    </span>
                  </div>
                  {row.reference_id && (
                    <Link
                      to={`/admin/stock-movements?reference_id=${encodeURIComponent(row.reference_id)}`}
                      className="mt-1 inline-flex min-h-11 items-center font-mono text-xs font-semibold text-action-primary"
                    >
                      {row.reference_type || "manual"} · {row.reference_id}
                    </Link>
                  )}
                  {row.reason && (
                    <p className="mt-1 text-xs text-text-secondary truncate">{row.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
