import React, { useEffect, useState } from "react";
import { Eye, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { api, fileUrl, formatApiError } from "../../lib/api";
import { fmtDay } from "../../lib/format";
import { AdminLayout } from "./AdminLayout";
import { StatusBadge } from "../../components/StatusStepper";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function AdminOrders() {
  const { t } = useI18n();
  const [orders, setOrders] = useState([]);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/orders").then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  return (
    <AdminLayout title={t("admin.orders")} subtitle="Order Management Log">
      <div className="border border-border bg-surface-1">
        <div className="border-b border-border bg-surface-2 px-6 py-3">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">ORDER_REGISTRY // TOTAL: {orders.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
            [ FETCHING_DATA... ]
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="admin-orders-table">
              <thead>
                <tr className="border-b border-border/50 bg-background/50 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
                  <th className="font-normal px-6 py-4">Order_ID</th>
                  <th className="font-normal px-6 py-4">Client_Entity</th>
                  <th className="font-normal px-6 py-4">Config</th>
                  <th className="font-normal px-6 py-4">Status</th>
                  <th className="font-normal px-6 py-4">Date_Logged</th>
                  <th className="font-normal px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-foreground divide-y divide-border/50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-2/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-primary">{o.order_number}</td>
                    <td className="px-6 py-4 text-muted-foreground">{o.user_name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{o.material_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{fmtDay(o.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button size="sm" variant="outline" data-testid={`manage-order-${o.order_number}`} onClick={() => setSel(o)} className="rounded-none border-border group-hover:border-primary text-foreground bg-transparent h-8 font-mono text-[10px] uppercase tracking-widest">
                        <Eye className="h-3.5 w-3.5 mr-2" /> INSPECT
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">NO_ORDERS_FOUND</td>
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-surface-1 border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-none">
        
        {/* Header */}
        <div className="border-b border-border bg-surface-2 p-6 flex justify-between items-start">
          <div>
            <DialogHeader className="p-0 space-y-0 text-left">
              <DialogTitle className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                ORDER_MANIFEST
              </DialogTitle>
              <h2 className="font-heading text-2xl font-bold text-primary uppercase tracking-tight">{order.order_number}</h2>
            </DialogHeader>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="p-6 space-y-8">
          
          {/* Client & File Spec */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-border p-4 bg-background">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">CLIENT_DATA</p>
              <p className="font-heading text-sm font-bold">{order.user_name}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1 truncate">{order.user_email}</p>
            </div>
            
            <div className="border border-border p-4 bg-background flex flex-col justify-between">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">PAYLOAD_FILE</p>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-foreground truncate">{order.file?.original_filename}</span>
                <a href={fileUrl(order.file?.storage_path)} target="_blank" rel="noreferrer" download data-testid="admin-download-design">
                  <Button size="sm" variant="outline" className="rounded-none border-border hover:border-primary uppercase tracking-widest font-mono text-[10px] h-8 px-3">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="border border-border p-4 bg-background">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{t("detail.notes")}</p>
              <p className="font-mono text-sm text-foreground whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* Estimate Configuration */}
          <div className="border border-border p-6 bg-surface-2">
            <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-4 border-b border-border/50 pb-2">COMMERCIAL_EVALUATION</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">SET_AMOUNT (IDR)</Label>
                <Input 
                  data-testid="estimate-amount" 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">EVALUATION_NOTES</Label>
                <Input 
                  data-testid="estimate-note" 
                  placeholder="Optional details..." 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" 
                />
              </div>
            </div>
            <Button disabled={busy || !amount} data-testid="submit-estimate" onClick={() => act(() => api.post(`/admin/orders/${order.id}/estimate`, { amount: parseFloat(amount), note }))} className="w-full rounded-none h-10 font-mono text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">
              SUBMIT_EVALUATION
            </Button>
          </div>

          {/* Payment proof */}
          {order.payment && (
            <div className="border border-border p-6 bg-surface-2">
              <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-4 border-b border-border/50 pb-2">TRANSACTION_VERIFICATION</p>
              <a href={fileUrl(order.payment.proof?.storage_path)} target="_blank" rel="noreferrer" className="block mb-4 border border-border bg-background p-2 group hover:border-primary/50 transition-colors">
                <img src={fileUrl(order.payment.proof?.storage_path)} alt="proof" className="max-h-48 w-full object-contain mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
              </a>
              
              {order.payment.verified ? (
                <div className="flex justify-center items-center gap-2 p-3 border border-status-success/30 bg-status-success/10 text-status-success font-mono text-xs uppercase tracking-widest">
                  <CheckCircle2 className="h-4 w-4" /> TRANSACTION_VERIFIED
                </div>
              ) : (
                <Button disabled={busy} data-testid="verify-payment" onClick={() => act(() => api.post(`/admin/orders/${order.id}/verify-payment`))} className="w-full rounded-none h-10 font-mono text-xs uppercase tracking-widest bg-emerald-600 hover:bg-status-success text-white">
                  VERIFY_FUNDS
                </Button>
              )}
            </div>
          )}

          {/* Status actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button disabled={busy} variant="outline" data-testid="mark-process" onClick={() => act(() => api.post(`/admin/orders/${order.id}/status`, { status: "in_process", note: "Set to in process" }))} className="rounded-none border-border bg-background hover:bg-surface-2 text-foreground font-mono text-xs uppercase tracking-widest h-12">
              MARK_IN_PROGRESS
            </Button>
            <Button disabled={busy} data-testid="mark-complete" onClick={() => act(() => api.post(`/admin/orders/${order.id}/status`, { status: "completed", note: "Order completed" }))} className="rounded-none bg-emerald-600 hover:bg-status-success text-white font-mono text-xs uppercase tracking-widest h-12">
              MARK_COMPLETED
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
