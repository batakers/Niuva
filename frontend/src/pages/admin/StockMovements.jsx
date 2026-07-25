import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
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
import { useI18n } from "@/i18n";
import { downloadCsv } from "@/lib/api";
import { inventoryApi, parseInventoryConflict } from "@/lib/inventory";
import { AdminLayout } from "./AdminLayout";

const INITIAL_FILTERS = {
  subject_type: "",
  subject_id: "",
  reference_id: "",
  movement_type: "",
  actor: "",
  date: "",
};

export default function StockMovements() {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);

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
    setFilters((current) => ({ ...current, [field]: value }));

  const updateFilterEvent = (field) => (event) =>
    setFilters((current) => ({ ...current, [field]: event.target.value }));

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
          <div className="space-y-1.5">
            <Label>{t("inventory.subjectType")}</Label>
            <Select
              value={filters.subject_type}
              onValueChange={updateFilter("subject_type")}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("common.all")}</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="product_variant">Product variant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject ID */}
          <div className="space-y-1.5">
            <Label>{t("inventory.subjectId")}</Label>
            <Input
              value={filters.subject_id}
              onChange={updateFilterEvent("subject_id")}
              placeholder="..."
            />
          </div>

          {/* Movement Type */}
          <div className="space-y-1.5">
            <Label>{t("inventory.movementType")}</Label>
            <Input
              value={filters.movement_type}
              onChange={updateFilterEvent("movement_type")}
              placeholder="..."
            />
          </div>

          {/* Reference ID */}
          <div className="space-y-1.5">
            <Label>{t("inventory.referenceId")}</Label>
            <Input
              value={filters.reference_id}
              onChange={updateFilterEvent("reference_id")}
              placeholder="..."
            />
          </div>

          {/* Actor */}
          <div className="space-y-1.5">
            <Label>{t("inventory.actor")}</Label>
            <Input
              value={filters.actor}
              onChange={updateFilterEvent("actor")}
              placeholder="..."
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>{t("common.date")}</Label>
            <Input
              type="date"
              value={filters.date}
              onChange={updateFilterEvent("date")}
            />
          </div>
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
          <EmptyState icon={AlertCircle} className="py-16">
            <span role="alert" className="text-status-error">{error}</span>
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState className="py-16">{t("inventory.noMovements")}</EmptyState>
        ) : (
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
                  <TableCell className="whitespace-nowrap font-mono text-xs">
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
                  <TableCell className="font-mono text-sm tabular-nums">
                    {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-text-secondary">
                    {row.reference_id || "—"}
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
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
