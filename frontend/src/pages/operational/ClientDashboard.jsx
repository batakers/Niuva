import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileTerminal, Package, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OperationalLayout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/operational/StatusStepper";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api } from "@/lib/api";
import { fmtDay } from "@/lib/format";

export default function ClientDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <OperationalLayout>
      <div className="w-full">
        {/* Dashboard Header */}
        <div className="border border-border-default bg-surface-default mb-8">
          <div className="border-b border-border-default bg-surface-muted px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileTerminal className="h-4 w-4 text-text-secondary" />
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                {t("dash.headerLabel")} · ID: {user?.id?.substring(0, 8) || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
              <span className="text-xs text-text-secondary">
                {t("dash.systemActive")}
              </span>
            </div>
          </div>
          <div className="p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-1 uppercase tracking-tight">
                {t("dash.title")}
              </h1>
              <p className="text-sm text-text-secondary">
                {t("dash.welcomeBack")}, {user?.name}
              </p>
            </div>
            <Link to="/order" data-testid="new-order-btn">
              <Button
                size="lg"
                className="font-mono text-xs uppercase tracking-widest"
              >
                <Plus className="mr-2 h-4 w-4" /> {t("dash.newOrder")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Data Table */}
        <div className="border border-border-default bg-surface-default">
          <div className="border-b border-border-default bg-surface-muted px-6 py-3">
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              {t("dash.ordersTotal")} · {orders.length}
            </span>
          </div>

          {loading ? (
            <div
              className="p-12 text-center text-sm text-text-secondary"
              role="status"
            >
              {t("common.loading")}
            </div>
          ) : orders.length === 0 ? (
            <div
              className="p-20 text-center flex flex-col items-center border-dashed border border-border-default m-4 bg-surface-page/50"
              data-testid="no-orders"
            >
              <Package
                className="h-10 w-10 text-text-secondary mb-4"
                strokeWidth={1.5}
              />
              <p className="text-sm text-text-secondary mb-6">
                {t("dash.noOrders")}
              </p>
              <Link to="/order">
                <Button
                  variant="outline"
                  className="font-mono text-xs uppercase tracking-widest"
                >
                  <Plus className="mr-2 h-4 w-4" /> {t("dash.createFirstOrder")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                data-testid="orders-list"
              >
                <thead>
                  <tr className="border-b border-border-default/50 bg-surface-page/50 text-text-secondary font-mono text-[10px] uppercase tracking-widest">
                    <th className="font-normal px-6 py-4">{t("dash.orderNo")}</th>
                    <th className="font-normal px-6 py-4">{t("dash.material")}</th>
                    <th className="font-normal px-6 py-4">{t("dash.date")}</th>
                    <th className="font-normal px-6 py-4">{t("dash.status")}</th>
                    <th className="font-normal px-6 py-4 text-right">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs text-text-primary divide-y divide-border-default/50">
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-surface-muted/50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-action-primary">
                        {o.order_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="uppercase">{o.material_name}</span>
                          <span className="text-[10px] text-text-secondary truncate max-w-[200px]">
                            {o.file?.original_filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                        {fmtDay(o.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/orders/${o.id}`}
                          data-testid={`order-row-${o.order_number}`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="border border-transparent group-hover:border-border-default uppercase tracking-widest text-[10px]"
                          >
                            {t("dash.colDetails")}
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
