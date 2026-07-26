import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Download, Eye, Layers, Package } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Skeleton, SkeletonTableRow } from "@/components/ui/skeleton";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/operational/StatusStepper";
import { useI18n } from "@/i18n";
import {
  api,
  downloadCsv,
  downloadFile,
  fetchFile,
  formatApiError,
} from "@/lib/api";
import { fmtDay } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";

const BULK_STATUS_OPTIONS = [
  { value: "in_process", labelKey: "status.in_process" },
  { value: "completed", labelKey: "status.completed" },
  { value: "cancelled", labelKey: "status.cancelled" },
  { value: "awaiting_payment", labelKey: "status.awaiting_payment" },
  { value: "pending_estimate", labelKey: "status.pending_estimate" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", labelKey: "orders.filterAllStatus" },
  { value: "pending_estimate", labelKey: "status.pending_estimate" },
  { value: "awaiting_payment", labelKey: "status.awaiting_payment" },
  { value: "in_process", labelKey: "status.in_process" },
  { value: "completed", labelKey: "status.completed" },
  { value: "cancelled", labelKey: "status.cancelled" },
];

const INITIAL_FILTERS = { status: "all", search: "", dateFrom: "", dateTo: "" };

export default function AdminOrders() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("in_process");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [filters, setFilters] = useState(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && STATUS_FILTER_OPTIONS.some((o) => o.value === statusParam)) {
      return { ...INITIAL_FILTERS, status: statusParam };
    }
    return INITIAL_FILTERS;
  });

  const load = () => {
    setLoading(true);
    setLoadError("");
    api
      .get("/admin/orders")
      .then((r) => setOrders(r.data))
      .catch((err) => setLoadError(formatApiError(err.response?.data?.detail)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;
    return orders.filter((o) => {
      if (filters.status !== "all" && o.status !== filters.status) return false;
      if (
        term &&
        ![o.order_number, o.user_name, o.user_email, o.material_name]
          .some((field) => field?.toLowerCase().includes(term))
      )
        return false;
      if (from || to) {
        const created = new Date(o.created_at);
        if (from && created < from) return false;
        if (to && created > to) return false;
      }
      return true;
    });
  }, [orders, filters]);

  const orderIds = useMemo(
    () => filteredOrders.map((o) => o.id),
    [filteredOrders]
  );

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.search.trim() !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "";

  const updateFilter = (key) => (value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const toggleOne = (id) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelectedIds((current) =>
      current.length === orderIds.length ? [] : orderIds
    );

  const exportCsv = async () => {
    try {
      await downloadCsv("/admin/orders/export", "niuva-orders.csv");
    } catch (exportError) {
      toast.error(exportError.message);
    }
  };

  const bulkUpdateStatus = async () => {
    setBulkBusy(true);
    try {
      const { data } = await api.post("/admin/orders/bulk-status", {
        order_ids: selectedIds,
        status: bulkStatus,
        note: t("orders.bulkStatusNote"),
      });
      const failed = data.results.filter((row) => !row.success).length;
      if (failed === 0) {
        toast.success(t("orders.bulkSuccess").replace("{count}", String(data.results.length)));
      } else {
        toast.warning(`${data.results.length - failed} OK, ${failed} failed.`);
      }
      setSelectedIds([]);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <AdminLayout title={t("admin.orders")} subtitle={t("orders.subtitle")}>
      <SurfacePanel className="overflow-hidden">
        {/* Header */}
        <SurfacePanelHeader className="flex items-center justify-between">
          <p className="type-label text-text-secondary">
            {t("orders.total")}:{" "}
            <span className="font-heading font-semibold text-text-primary">
              {loading
                ? "—"
                : hasActiveFilters
                  ? `${filteredOrders.length} / ${orders.length}`
                  : orders.length}
            </span>
          </p>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-2 h-3.5 w-3.5" />
            {t("common.exportCsv")}
          </Button>
        </SurfacePanelHeader>

        {/* Filter bar */}
        {!loading && !loadError && orders.length > 0 && (
          <div className="flex flex-wrap items-end gap-3 border-b border-border-default px-4 sm:px-6 py-4">
            <div className="min-w-[200px] flex-1">
              <FormField label={t("common.search")}>
                <Input
                  value={filters.search}
                  onChange={(e) => updateFilter("search")(e.target.value)}
                  placeholder={t("orders.searchPlaceholder")}
                />
              </FormField>
            </div>
            <FormField label={t("common.status")}>
              <Select
                value={filters.status}
                onValueChange={updateFilter("status")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t("dashboard.dateFrom")}>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom")(e.target.value)}
                className="w-auto"
              />
            </FormField>
            <FormField label={t("dashboard.dateTo")}>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo")(e.target.value)}
                className="w-auto"
              />
            </FormField>
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

        {/* Bulk actions bar - sticky */}
        {selectedIds.length > 0 && (
          <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-action-primary/20 bg-action-primary/5 px-6 py-3">
            <span className="type-body-small font-medium text-action-primary">
              {selectedIds.length} {t("orders.selectedCount")}
            </span>
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BULK_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds([])}
              >
                {t("common.cancel")}
              </Button>
              <Button 
                size="sm" 
                loading={bulkBusy} 
                onClick={bulkUpdateStatus}
              >
                <Layers className="mr-2 h-3.5 w-3.5" />
                {t("orders.applyBulkStatus")}
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>{t("orders.col.number")}</TableHead>
                  <TableHead>{t("orders.col.client")}</TableHead>
                  <TableHead>{t("orders.col.config")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("orders.col.date")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonTableRow key={i} columns={7} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : loadError ? (
          <ErrorState error={loadError} onRetry={load} />
        ) : orders.length === 0 ? (
          <EmptyState icon={Package} className="py-16">
            {t("orders.empty")}
          </EmptyState>
        ) : filteredOrders.length === 0 ? (
          <EmptyState icon={Package} className="py-16">
            {t("orders.noMatch")}
          </EmptyState>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table data-testid="admin-orders-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        aria-label={t("orders.selectAll")}
                        checked={
                          orderIds.length > 0 &&
                          selectedIds.length === orderIds.length
                        }
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-border-default text-action-primary focus:ring-action-primary/20"
                      />
                    </TableHead>
                    <TableHead>{t("orders.col.number")}</TableHead>
                    <TableHead>{t("orders.col.client")}</TableHead>
                    <TableHead>{t("orders.col.config")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("orders.col.date")}</TableHead>
                    <TableHead className="text-right">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((o) => (
                    <TableRow 
                      key={o.id}
                      data-state={selectedIds.includes(o.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`${t("orders.select")} ${o.order_number}`}
                          checked={selectedIds.includes(o.id)}
                          onChange={() => toggleOne(o.id)}
                          className="h-4 w-4 rounded border-border-default text-action-primary focus:ring-action-primary/20"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-sm font-medium text-action-primary">
                        {o.order_number}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-text-primary">{o.user_name}</span>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {o.material_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">
                        {fmtDay(o.created_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid={`manage-order-${o.order_number}`}
                          onClick={() => setSel(o)}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          {t("orders.inspect")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border-default">
              {filteredOrders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-surface-muted/50 active:bg-surface-muted transition-colors duration-fast"
                  onClick={() => setSel(o)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium text-action-primary">
                      {o.order_number}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {o.user_name}
                    </span>
                    <span className="text-xs font-mono text-text-secondary shrink-0">
                      {fmtDay(o.created_at)}
                    </span>
                  </div>
                  {o.material_name && (
                    <p className="mt-0.5 text-xs text-text-secondary truncate">
                      {o.material_name}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </SurfacePanel>

      {sel && (
        <OrderManageDialog
          order={sel}
          onClose={() => setSel(null)}
          onUpdated={(o) => {
            setSel(o);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Order Management Dialog
 * ────────────────────────────────────────────────────────────────────────── */

function OrderManageDialog({ order, onClose, onUpdated }) {
  const { t } = useI18n();
  const [amount, setAmount] = useState(order.estimate?.amount || "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const downloadStoredFile = async (path, filename) => {
    try {
      await downloadFile(path, filename);
    } catch {
      toast.error(t("orders.fileDownloadFailed"));
    }
  };

  const act = async (fn) => {
    setBusy(true);
    try {
      const { data } = await fn();
      onUpdated(data);
      toast.success(t("orders.statusUpdated"));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="border-b border-border-default bg-surface-muted p-6 flex justify-between items-start">
          <div>
            <DialogHeader className="p-0 space-y-0 text-left">
              <DialogTitle className="type-label text-text-secondary mb-1">
                {t("detail.headerLabel")}
              </DialogTitle>
              <h2 className="font-heading text-2xl font-bold text-text-primary tracking-tight">
                {order.order_number}
              </h2>
            </DialogHeader>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Client & Design File */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-control border border-border-default bg-surface-page p-4 transition-colors hover:border-border-strong">
              <p className="type-label text-text-secondary mb-2">
                {t("orders.clientData")}
              </p>
              <p className="font-heading text-sm font-semibold text-text-primary">
                {order.user_name}
              </p>
              <p className="type-body-small text-text-secondary mt-1 truncate">
                {order.user_email}
              </p>
            </div>

            <div className="rounded-control border border-border-default bg-surface-page p-4 flex flex-col justify-between transition-colors hover:border-border-strong">
              <p className="type-label text-text-secondary mb-2">
                {t("detail.designFile")}
              </p>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-text-primary truncate">
                  {order.file?.original_filename}
                </span>
                <Button
                  type="button"
                  onClick={() =>
                    downloadStoredFile(
                      order.file?.storage_path,
                      order.file?.original_filename
                    )
                  }
                  data-testid="admin-download-design"
                  aria-label={`${t("detail.download")}: ${order.file?.original_filename || ""}`}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-control border border-border-default bg-surface-page p-4">
              <p className="type-label text-text-secondary mb-2">
                {t("detail.notes")}
              </p>
              <p className="type-body text-text-primary whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}

          {/* Estimate Section */}
          <div className="rounded-control border border-border-default bg-surface-muted p-6">
            <p className="type-label text-action-primary mb-4 pb-3 border-b border-border-default">
              {t("orders.estimateSection")}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="type-label text-text-secondary">
                  {t("orders.estimateAmount")}
                </Label>
                <Input
                  data-testid="estimate-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="type-label text-text-secondary">
                  {t("orders.estimateNote")}
                </Label>
                <Input
                  data-testid="estimate-note"
                  placeholder={t("orders.estimateNotePlaceholder")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <Button
              loading={busy}
              disabled={!amount}
              data-testid="submit-estimate"
              onClick={() =>
                act(() =>
                  api.post(`/admin/orders/${order.id}/estimate`, {
                    amount: parseFloat(amount),
                    note,
                  })
                )
              }
              className="w-full"
            >
              {t("orders.submitEstimate")}
            </Button>
          </div>

          {/* Payment Section */}
          {order.payment && (
            <div className="rounded-control border border-border-default bg-surface-muted p-6">
              <p className="type-label text-action-primary mb-4 pb-3 border-b border-border-default">
                {t("orders.paymentSection")}
              </p>
              <AuthenticatedFilePreview
                path={order.payment.proof?.storage_path}
                filename={order.payment.proof?.original_filename || "payment-proof"}
              />

              {order.payment.verified ? (
                <div className="flex items-center justify-center gap-2 rounded-control border border-status-success/40 bg-status-success/10 p-4 type-body-small font-medium text-status-success">
                  <CheckCircle2 className="h-4 w-4" /> {t("detail.verified")}
                </div>
              ) : (
                <Button
                  loading={busy}
                  data-testid="verify-payment"
                  onClick={() =>
                    act(() => api.post(`/admin/orders/${order.id}/verify-payment`))
                  }
                  variant="success"
                  className="w-full"
                >
                  {t("orders.verifyPayment")}
                </Button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              loading={busy}
              variant="outline"
              size="lg"
              data-testid="mark-process"
              onClick={() =>
                act(() =>
                  api.post(`/admin/orders/${order.id}/status`, {
                    status: "in_process",
                    note: "Set to in process",
                  })
                )
              }
            >
              {t("orders.markInProcess")}
            </Button>
            <Button
              loading={busy}
              variant="success"
              size="lg"
              data-testid="mark-complete"
              onClick={() =>
                act(() =>
                  api.post(`/admin/orders/${order.id}/status`, {
                    status: "completed",
                    note: "Order completed",
                  })
                )
              }
            >
              {t("orders.markCompleted")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Authenticated File Preview
 * ────────────────────────────────────────────────────────────────────────── */

function AuthenticatedFilePreview({ path, filename }) {
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    if (!path) {
      setLoading(false);
      return undefined;
    }

    fetchFile(path)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSource(objectUrl);
      })
      .catch(() => setSource(""))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (loading) {
    return (
      <div className="mb-4">
        <Skeleton className="h-48 w-full rounded-control" />
      </div>
    );
  }

  if (!source) return null;

  return (
    <button
      type="button"
      onClick={() => downloadFile(path, filename)}
      className="block w-full mb-4 rounded-control border border-border-default bg-surface-page p-2 group hover:border-action-primary/50 transition-all duration-fast"
    >
      <img
        src={source}
        alt="proof"
        className="max-h-48 w-full object-contain mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-fast"
      />
    </button>
  );
}
