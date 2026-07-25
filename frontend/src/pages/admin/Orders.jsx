import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Eye, Layers } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurfacePanel } from "@/components/ui/surface-panel";
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

export default function AdminOrders() {
  const { t } = useI18n();
  const [orders, setOrders] = useState([]);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("in_process");
  const [bulkBusy, setBulkBusy] = useState(false);

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

  const orderIds = useMemo(() => orders.map((o) => o.id), [orders]);

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
        note: "Bulk status update",
      });
      const failed = data.results.filter((row) => !row.success).length;
      if (failed === 0) {
        toast.success(`${data.results.length} pesanan diperbarui.`);
      } else {
        toast.warning(`${data.results.length - failed} berhasil, ${failed} gagal.`);
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
        <div className="flex items-center justify-between border-b border-border-default bg-surface-muted px-6 py-4">
          <p className="type-label text-text-secondary">
            {t("orders.total")}:{" "}
            <span className="font-heading font-semibold text-text-primary">
              {orders.length}
            </span>
          </p>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-2 h-3.5 w-3.5" />
            {t("common.exportCsv")}
          </Button>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default bg-surface-page px-6 py-3">
            <span className="type-body-small text-text-primary">
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
              <Button size="sm" disabled={bulkBusy} onClick={bulkUpdateStatus}>
                <Layers className="mr-2 h-3.5 w-3.5" />
                {t("orders.applyBulkStatus")}
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center" role="status">
            <p className="type-body-small text-text-secondary">
              {t("common.loading")}
            </p>
          </div>
        ) : loadError ? (
          <div className="p-12 text-center" role="alert">
            <p className="type-body text-status-error">{loadError}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="type-body-small text-text-secondary">
              {t("orders.empty")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`${t("orders.select")} ${o.order_number}`}
                        checked={selectedIds.includes(o.id)}
                        onChange={() => toggleOne(o.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-sm text-action-primary">
                      {o.order_number}
                    </TableCell>
                    <TableCell className="type-body-small text-text-primary">
                      {o.user_name}
                    </TableCell>
                    <TableCell className="type-body-small text-text-secondary">
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
                        variant="outline"
                        data-testid={`manage-order-${o.order_number}`}
                        onClick={() => setSel(o)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        {t("orders.inspect")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
      toast.error("FILE_DOWNLOAD_FAILED");
    }
  };

  const act = async (fn) => {
    setBusy(true);
    try {
      const { data } = await fn();
      onUpdated(data);
      toast.success("SYSTEM_UPDATED");
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
            <div className="rounded-control border border-border-default bg-surface-page p-4">
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

            <div className="rounded-control border border-border-default bg-surface-page p-4 flex flex-col justify-between">
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
            <p className="type-label text-action-primary mb-4 pb-2 border-b border-border-default">
              {t("orders.estimateSection")}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label>{t("orders.estimateAmount")}</Label>
                <Input
                  data-testid="estimate-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("orders.estimateNote")}</Label>
                <Input
                  data-testid="estimate-note"
                  placeholder={t("orders.estimateNotePlaceholder")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <Button
              disabled={busy || !amount}
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
              <p className="type-label text-action-primary mb-4 pb-2 border-b border-border-default">
                {t("orders.paymentSection")}
              </p>
              <AuthenticatedFilePreview
                path={order.payment.proof?.storage_path}
                filename={order.payment.proof?.original_filename || "payment-proof"}
              />

              {order.payment.verified ? (
                <div className="flex items-center justify-center gap-2 rounded-control border border-status-success/40 bg-status-success/10 p-3 type-body-small text-status-success">
                  <CheckCircle2 className="h-4 w-4" /> {t("detail.verified")}
                </div>
              ) : (
                <Button
                  disabled={busy}
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
          <div className="grid grid-cols-2 gap-3">
            <Button
              disabled={busy}
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
              disabled={busy}
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

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    if (!path) return undefined;

    fetchFile(path)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSource(objectUrl);
      })
      .catch(() => setSource(""));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (!source) return null;

  return (
    <button
      type="button"
      onClick={() => downloadFile(path, filename)}
      className="block w-full mb-4 rounded-control border border-border-default bg-surface-page p-2 group hover:border-action-primary/50 transition-colors"
    >
      <img
        src={source}
        alt="proof"
        className="max-h-48 w-full object-contain mix-blend-luminosity group-hover:mix-blend-normal transition-all"
      />
    </button>
  );
}
