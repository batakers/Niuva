import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Package, Clock } from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "../../components/Navbar";
import { StatusBadge } from "../../components/StatusStepper";
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
    <div className="min-h-screen bg-[#0A0B10]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-mono-tech text-xs uppercase text-blue-400">Dashboard</p>
            <h1 className="font-heading text-3xl font-bold text-white">{t("dash.title")}</h1>
            <p className="text-slate-400 mt-1 text-sm">Halo, {user?.name}</p>
          </div>
          <Link to="/order" data-testid="new-order-btn">
            <Button className="bg-blue-600 hover:bg-blue-500 h-11"><Plus className="mr-2 h-4 w-4" /> {t("dash.newOrder")}</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-400">{t("common.loading")}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-[#13151F] p-16 text-center" data-testid="no-orders">
            <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slate-400 mb-6">{t("dash.noOrders")}</p>
            <Link to="/order"><Button className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-4 w-4" /> {t("dash.newOrder")}</Button></Link>
          </div>
        ) : (
          <div className="space-y-3" data-testid="orders-list">
            {orders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} data-testid={`order-row-${o.order_number}`}
                className="block rounded-md border border-slate-800 bg-[#13151F] hover:border-blue-500/50 transition-colors p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="h-11 w-11 rounded-md bg-[#1E2130] border border-slate-700 grid place-items-center">
                      <Package className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="font-mono-tech text-sm text-white">{o.order_number}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{o.material_name} · {o.file?.original_filename}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {fmtDay(o.created_at)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
