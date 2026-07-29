import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OperationalState } from "@/components/ui/operational-state";
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
  const [loadError, setLoadError] = useState(false);
  const loadRequestRef = useRef(null);

  const loadOrders = useCallback(() => {
    if (loadRequestRef.current) return loadRequestRef.current;

    setLoading(true);
    setLoadError(false);

    const request = api
      .get("/orders")
      .then((r) => setOrders(r.data))
      .catch(() => setLoadError(true))
      .finally(() => {
        if (loadRequestRef.current === request) {
          loadRequestRef.current = null;
        }
        setLoading(false);
      });

    loadRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <OperationalLayout>
      <div className="w-full">
        {/* Dashboard Header */}
        <section className="mb-8 overflow-hidden rounded-panel border border-border-default bg-surface-default shadow-surface">
          <div className="flex items-center justify-between border-b border-border-default bg-surface-muted px-5 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <LayoutDashboard
                className="h-4 w-4 text-action-primary"
                aria-hidden="true"
              />
              <span className="type-label font-semibold text-text-secondary">
                {t("dash.headerLabel")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full bg-status-success"
                aria-hidden="true"
              />
              <span className="type-label text-text-secondary">
                {t("dash.systemActive")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
            <div>
              <h1 className="mb-2 font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {t("dash.title")}
              </h1>
              <p className="type-body-small text-text-secondary">
                {t("dash.welcomeBack")}, {user?.name}
              </p>
            </div>
            <div className="max-w-sm rounded-card border border-status-warning/40 bg-status-warning/10 px-4 py-3 text-sm leading-6 text-text-secondary">
              Pembuatan pesanan legacy dinonaktifkan. Gunakan katalog Retail
              untuk discovery atau ajukan kebutuhan melalui Contact.
            </div>
          </div>
        </section>

        {/* Order Data Table */}
        <section className="overflow-hidden rounded-panel border border-border-default bg-surface-default shadow-surface">
          <div className="border-b border-border-default bg-surface-muted px-5 py-4 sm:px-6">
            <span className="type-label font-semibold text-text-secondary">
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
          ) : loadError ? (
            <OperationalState
              state="error"
              title={t("dash.errorTitle")}
              description={t("dash.errorDescription")}
              retryLabel={t("common.retry")}
              onRetry={loadOrders}
              className="m-4 rounded-card border-solid bg-surface-page/50 sm:m-6"
            />
          ) : orders.length === 0 ? (
            <div
              className="m-4 flex flex-col items-center rounded-card border border-border-default bg-surface-page/50 p-10 text-center sm:m-6 sm:p-16"
              data-testid="no-orders"
            >
              <Package
                className="h-10 w-10 text-text-secondary mb-4"
                strokeWidth={1.5}
              />
              <p className="text-sm text-text-secondary mb-6">
                {t("dash.noOrders")}
              </p>
              <Link to="/retail">
                <Button
                  variant="outline"
                  className="min-h-11"
                >
                  Lihat katalog Retail
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
                  <tr className="border-b border-border-default/50 bg-surface-page/50 text-xs font-semibold text-text-secondary">
                    <th className="font-normal px-6 py-4">{t("dash.orderNo")}</th>
                    <th className="font-normal px-6 py-4">{t("dash.material")}</th>
                    <th className="font-normal px-6 py-4">{t("dash.date")}</th>
                    <th className="font-normal px-6 py-4">{t("dash.status")}</th>
                    <th className="font-normal px-6 py-4 text-right">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/50 text-sm text-text-primary">
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="group transition-colors duration-fast hover:bg-surface-muted/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-action-primary">
                        {o.order_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="uppercase">{o.material_name}</span>
                          <span className="max-w-[200px] truncate text-xs text-text-secondary">
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
                            className="min-h-11 border border-transparent group-hover:border-border-default"
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
        </section>
      </div>
    </OperationalLayout>
  );
}
