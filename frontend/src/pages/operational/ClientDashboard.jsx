import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, History, Package } from "lucide-react";

import { LegacyOrderStatusBadge } from "@/components/operational/LegacyOrderStatusBadge";
import { OperationalLayout } from "@/components/layout/Layout";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OperationalState } from "@/components/ui/operational-state";
import {
  SurfacePanel,
  SurfacePanelHeader,
} from "@/components/ui/surface-panel";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      .then((response) => {
        // A malformed projection must not become a false empty account.
        if (!Array.isArray(response.data)) {
          throw new Error("invalid_orders_projection");
        }
        setOrders(response.data);
      })
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
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="type-label text-action-primary">
              {t("dash.portalLabel")}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {t("dash.title")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
              {t("dash.welcomeBack")}, {user?.name}. {t("dash.subtitle")}
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/retail">
              {t("dash.openRetail")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <Alert tone="default" role="status" className="px-4 py-4">
          <p className="font-semibold text-text-primary">
            {t("dash.legacyTitle")}
          </p>
          <p className="mt-1 leading-6 text-text-secondary">
            {t("dash.legacyDescription")}
          </p>
        </Alert>

        <SurfacePanel className="overflow-hidden">
          <SurfacePanelHeader className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <History
                className="h-5 w-5 text-action-primary"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div>
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                  {t("dash.historyTitle")}
                </h2>
                <p className="mt-0.5 text-sm text-text-secondary">
                  {t("dash.ordersTotal")} · {orders.length}
                </p>
              </div>
            </div>
          </SurfacePanelHeader>

          {loading ? (
            <OperationalState
              state="loading"
              title={t("dash.loadingTitle")}
              description={t("dash.loadingDescription")}
              className="border-0 bg-transparent"
            />
          ) : loadError ? (
            <OperationalState
              state="error"
              title={t("dash.errorTitle")}
              description={t("dash.errorDescription")}
              retryLabel={t("common.retry")}
              onRetry={loadOrders}
              className="border-0 bg-transparent"
            />
          ) : orders.length === 0 ? (
            <div
              className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"
              data-testid="no-orders"
            >
              <Package
                className="h-9 w-9 text-text-disabled"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h2 className="mt-4 font-heading text-lg font-semibold text-text-primary">
                {t("dash.emptyTitle")}
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">
                {t("dash.noOrders")}
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/retail">{t("dash.openRetail")}</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block" data-testid="orders-table">
                <Table data-testid="orders-list">
                  <TableCaption className="sr-only">
                    {t("dash.historyCaption")}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">{t("dash.orderNo")}</TableHead>
                      <TableHead scope="col">{t("dash.material")}</TableHead>
                      <TableHead scope="col">{t("dash.date")}</TableHead>
                      <TableHead scope="col">{t("dash.status")}</TableHead>
                      <TableHead scope="col" className="text-right">
                        {t("common.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="whitespace-nowrap font-mono text-sm font-semibold text-action-primary">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-text-primary">
                            {order.material_name || "—"}
                          </span>
                          {order.file?.original_filename && (
                            <span className="mt-1 block max-w-xs truncate font-mono text-xs text-text-secondary">
                              {order.file.original_filename}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-text-secondary">
                          {fmtDay(order.created_at)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <LegacyOrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link
                              to={`/orders/${order.id}`}
                              data-testid={`order-row-${order.order_number}`}
                            >
                              {t("dash.colDetails")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div
                className="divide-y divide-border-default md:hidden"
                data-testid="orders-mobile-list"
              >
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="group block px-5 py-5 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
                    data-testid={`mobile-order-row-${order.order_number}`}
                    aria-label={`${t("dash.colDetails")} ${order.order_number}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-action-primary">
                          {order.order_number}
                        </p>
                        <p className="mt-2 font-medium text-text-primary">
                          {order.material_name || "—"}
                        </p>
                        <p className="mt-1 truncate text-sm text-text-secondary">
                          {order.file?.original_filename || fmtDay(order.created_at)}
                        </p>
                      </div>
                      <ArrowRight
                        className="mt-1 h-4 w-4 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <LegacyOrderStatusBadge status={order.status} />
                      <span className="text-xs text-text-secondary">
                        {fmtDay(order.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </SurfacePanel>
      </div>
    </OperationalLayout>
  );
}
