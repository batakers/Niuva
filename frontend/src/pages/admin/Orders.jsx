import React, { useEffect, useMemo, useState } from "react";
import { Eye, Download, CheckCircle2, Layers } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { api, downloadCsv, downloadFile, fetchFile, formatApiError } from "../../lib/api";
import { fmtDay } from "../../lib/format";
import { AdminLayout } from "./AdminLayout";
import { StatusBadge } from "@/components/operational/StatusStepper";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

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
  
  useEffect(() => { load(); }, []);

  const orderIds = useMemo(() => orders.map((o) => o.id), [orders]);
  const toggleOne = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds((current) => current.length === orderIds.length ? [] : orderIds);

  const exportCsv = async () => {
    try { await downloadCsv("/admin/orders/export", "niuva-orders.csv"); }
    catch (exportError) { toast.error(exportError.message); }
  };

  const bulkUpdateStatus = async () => {
    setBulkBusy(true);
    try {
      const { data } = await api.post("/admin/orders/bulk-status", { order_ids: selectedIds, status: bulkStatus, note: "Bulk status update" });
      const failed = data.results.filter((row) => !row.success).length;
      if (failed === 0) toast.success(`${data.results.length} pesanan diperbarui.`);
      else toast.warning(`${data.results.length - failed} berhasil, ${failed} gagal.`);
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
      <div className="rounded-panel border border-border-default bg-surface-default shadow-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-default bg-surface-muted px-6 py-4">
          <p className="type-label text-text-secondary">{t("orders.total")}: <span className="font-heading font-semibold text-text-primary">{orders.length}</span></p>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-2 h-3.5 w-3.5" />{t("common.exportCsv")}
          </Button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default bg-surface-page px-6 py-3">
            <span className="type-body-small text-text-primary">{selectedIds.length} {t("orders.selectedCount")}</span>
            <div className="flex items-center gap-2">
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} aria-label={t("orders.bulkStatusLabel")} className="h-9 rounded-control border border-border-default bg-surface-default px-3 type-body-small text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">
                <option value="in_process">{t("status.in_process")}</option>
                <option value="completed">{t("status.completed")}</option>
                <option value="cancelled">{t("status.cancelled")}</option>
                <option value="awaiting_payment">{t("status.awaiting_payment")}</option>
                <option value="pending_estimate">{t("status.pending_estimate")}</option>
              </select>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>{t("common.cancel")}</Button>
              <Button size="sm" disabled={bulkBusy} onClick={bulkUpdateStatus}>
                <Layers className="mr-2 h-3.5 w-3.5" />{t("orders.applyBulkStatus")}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center" role="status">
            <p className="type-body-small text-text-secondary">{t("common.loading")}</p>
          </div>
        ) : loadError ? (
          <div className="p-12 text-center" role="alert">
            <p className="type-body text-status-error">{loadError}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="admin-orders-table">
              <thead>
                <tr className="border-b border-border-default bg-surface-page">
                  <th className="w-10 px-6 py-3"><input type="checkbox" aria-label={t("orders.selectAll")} checked={orderIds.length > 0 && selectedIds.length === orderIds.length} onChange={toggleAll} /></th>
                  <th className="type-label text-text-secondary px-6 py-3">{t("orders.col.number")}</th>
                  <th className="type-label text-text-secondary px-6 py-3">{t("orders.col.client")}</th>
                  <th className="type-label text-text-secondary px-6 py-3">{t("orders.col.config")}</th>
                  <th className="type-label text-text-secondary px-6 py-3">{t("common.status")}</th>
                  <th className="type-label text-text-secondary px-6 py-3">{t("orders.col.date")}</th>
                  <th className="type-label text-text-secondary px-6 py-3 text-right">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-muted transition-colors group">
                    <td className="px-6 py-4"><input type="checkbox" aria-label={`${t("orders.select")} ${o.order_number}`} checked={selectedIds.includes(o.id)} onChange={() => toggleOne(o.id)} /></td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-action-primary">{o.order_number}</td>
                    <td className="px-6 py-4 type-body-small text-text-primary">{o.user_name}</td>
                    <td className="px-6 py-4 type-body-small text-text-secondary">{o.material_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-text-secondary">{fmtDay(o.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button size="sm" variant="outline" data-testid={`manage-order-${o.order_number}`} onClick={() => setSel(o)}>
                        <Eye className="h-3.5 w-3.5 mr-2" />{t("orders.inspect")}
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center type-body-small text-text-secondary">{t("orders.empty")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {sel && <OrderManageDialog order={sel} onClose={() => setSel(null)} onUpdated={(o) => { setSel(o); load(); }} />}
    </AdminLayout>
  );
}

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
      <DialogContent className="rounded-panel border border-border-default bg-surface-default text-text-primary max-w-2xl max-h-[90vh] overflow-y-auto p-0 shadow-overlay">

        <div className="border-b border-border-default bg-surface-muted p-6 flex justify-between items-start rounded-t-panel">
          <div>
            <DialogHeader className="p-0 space-y-0 text-left">
              <DialogTitle className="type-label text-text-secondary mb-1">
                {t("detail.headerLabel")}
              </DialogTitle>
              <h2 className="font-heading text-2xl font-bold text-text-primary tracking-tight">{order.order_number}</h2>
            </DialogHeader>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="p-6 space-y-6">

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-card border border-border-default bg-surface-page p-4">
              <p className="type-label text-text-secondary mb-2">{t("orders.clientData")}</p>
              <p className="font-heading text-sm font-semibold text-text-primary">{order.user_name}</p>
              <p className="type-body-small text-text-secondary mt-1 truncate">{order.user_email}</p>
            </div>

            <div className="rounded-card border border-border-default bg-surface-page p-4 flex flex-col justify-between">
              <p className="type-label text-text-secondary mb-2">{t("detail.designFile")}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-text-primary truncate">{order.file?.original_filename}</span>
                <Button type="button" onClick={() => downloadStoredFile(order.file?.storage_path, order.file?.original_filename)} data-testid="admin-download-design" aria-label={`${t("detail.download")}: ${order.file?.original_filename || ""}`} size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-card border border-border-default bg-surface-page p-4">
              <p className="type-label text-text-secondary mb-2">{t("detail.notes")}</p>
              <p className="type-body text-text-primary whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          <div className="rounded-card border border-border-default bg-surface-muted p-6">
            <p className="type-label text-action-primary mb-4 pb-2 border-b border-border-default">{t("orders.estimateSection")}</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="type-label text-text-secondary">{t("orders.estimateAmount")}</Label>
                <Input
                  data-testid="estimate-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="type-label text-text-secondary">{t("orders.estimateNote")}</Label>
                <Input
                  data-testid="estimate-note"
                  placeholder={t("orders.estimateNotePlaceholder")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <Button disabled={busy || !amount} data-testid="submit-estimate" onClick={() => act(() => api.post(`/admin/orders/${order.id}/estimate`, { amount: parseFloat(amount), note }))} className="w-full">
              {t("orders.submitEstimate")}
            </Button>
          </div>

          {order.payment && (
            <div className="rounded-card border border-border-default bg-surface-muted p-6">
              <p className="type-label text-action-primary mb-4 pb-2 border-b border-border-default">{t("orders.paymentSection")}</p>
              <AuthenticatedFilePreview
                path={order.payment.proof?.storage_path}
                filename={order.payment.proof?.original_filename || "payment-proof"}
              />

              {order.payment.verified ? (
                <div className="flex items-center justify-center gap-2 rounded-control border border-status-success/40 bg-status-success/10 p-3 type-body-small text-status-success">
                  <CheckCircle2 className="h-4 w-4" /> {t("detail.verified")}
                </div>
              ) : (
                <Button disabled={busy} data-testid="verify-payment" onClick={() => act(() => api.post(`/admin/orders/${order.id}/verify-payment`))} variant="success" className="w-full">
                  {t("orders.verifyPayment")}
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button disabled={busy} variant="outline" size="lg" data-testid="mark-process" onClick={() => act(() => api.post(`/admin/orders/${order.id}/status`, { status: "in_process", note: "Set to in process" }))}>
              {t("orders.markInProcess")}
            </Button>
            <Button disabled={busy} variant="success" size="lg" data-testid="mark-complete" onClick={() => act(() => api.post(`/admin/orders/${order.id}/status`, { status: "completed", note: "Order completed" }))}>
              {t("orders.markCompleted")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuthenticatedFilePreview({ path, filename }) {
  const [source, setSource] = useState("");

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    if (!path) return undefined;

    fetchFile(path).then((blob) => {
      objectUrl = URL.createObjectURL(blob);
      if (!cancelled) setSource(objectUrl);
    }).catch(() => setSource(""));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (!source) return null;
  return (
    <button type="button" onClick={() => downloadFile(path, filename)} className="block w-full mb-4 border border-border bg-background p-2 group hover:border-primary/50 transition-colors">
      <img src={source} alt="proof" className="max-h-48 w-full object-contain mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
    </button>
  );
}
