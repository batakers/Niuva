import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Package, FileTerminal } from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { OperationalLayout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/operational/StatusStepper";
import { api } from "../../lib/api";
import { fmtDay } from "../../lib/format";
import { Button } from "../../components/ui/button";

export default function ClientDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders").then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <OperationalLayout>
      <div className="w-full">
        {/* Dashboard Header Terminal */}
        <div className="border border-border bg-surface-1 mb-8">
          <div className="border-b border-border bg-surface-2 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileTerminal className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                USER_DASHBOARD // CLIENT_ID: {user?.id?.substring(0,8) || "UNKNOWN"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">SYSTEM_ONLINE</span>
            </div>
          </div>
          <div className="p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-1 uppercase tracking-tight">{t("dash.title")}</h1>
              <p className="font-mono text-xs text-muted-foreground uppercase">WELCOME_BACK // {user?.name}</p>
            </div>
            <Link to="/order" data-testid="new-order-btn">
              <Button size="lg" className="rounded-none font-mono text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> INITIATE_ORDER
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Data Table */}
        <div className="border border-border bg-surface-1">
          <div className="border-b border-border bg-surface-2 px-6 py-3">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">ORDER_REGISTRY // TOTAL: {orders.length}</span>
          </div>

          {loading ? (
            <div className="p-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
              [ FETCHING_DATA... ]
            </div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center border-dashed border border-border m-4 bg-background/50" data-testid="no-orders">
              <Package className="h-10 w-10 text-muted-foreground mb-4" strokeWidth={1.5} />
              <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest mb-6">NO_ACTIVE_ORDERS_FOUND</p>
              <Link to="/order">
                <Button variant="outline" className="rounded-none font-mono text-xs uppercase tracking-widest">
                  <Plus className="mr-2 h-4 w-4" /> CREATE_FIRST_ORDER
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" data-testid="orders-list">
                <thead>
                  <tr className="border-b border-border/50 bg-background/50 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
                    <th className="font-normal px-6 py-4">Order_ID</th>
                    <th className="font-normal px-6 py-4">Payload_Data</th>
                    <th className="font-normal px-6 py-4">Timestamp</th>
                    <th className="font-normal px-6 py-4">Status</th>
                    <th className="font-normal px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs text-foreground divide-y divide-border/50">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-2/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-primary">{o.order_number}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="uppercase">{o.material_name}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{o.file?.original_filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{fmtDay(o.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link to={`/orders/${o.id}`} data-testid={`order-row-${o.order_number}`}>
                          <Button variant="ghost" size="sm" className="rounded-none border border-transparent group-hover:border-border uppercase tracking-widest text-[10px]">
                            VIEW_DETAILS
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </OperationalLayout>
  );
}
