import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Download, RefreshCw, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { downloadCsv } from "@/lib/api";
import {
  buildOperationPayload,
  buildReservationTransitionPayload,
  inventoryApi,
  operationDefaults,
  parseInventoryConflict,
  reservationActions,
  reservationTransitionDefaults,
  validInventoryReason,
  visibleMovementTypes,
} from "@/lib/inventory";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

// Server-computed verdict on a balance; the tone mirrors its urgency.
const STOCK_STATUS_TONE = {
  normal: "success",
  rendah: "warning",
  habis: "destructive",
};

const ALL_SUBJECT_TYPES = "all";

function StockStatusLabel({ status }) {
  const { t } = useI18n();
  if (!status) return null;
  return (
    <TechnicalLabel
      tone={STOCK_STATUS_TONE[status] || "muted"}
      data-testid={`stock-status-${status}`}
    >
      {t(`inventory.stockStatus.${status}`)}
    </TechnicalLabel>
  );
}

function movementHistoryPath(balance) {
  const params = new URLSearchParams({
    subject_type: balance.subject_type,
    subject_id: balance.subject_id,
  });
  return `/admin/stock-movements?${params.toString()}`;
}

export default function Inventory() {
  const { t } = useI18n();
  const { user } = useAuth();
  const permissions = user?.permissions || [];
  const canWrite = hasPermission(user, "inventory.write");
  const canApproveAdjustment = hasPermission(user, "inventory.adjust");

  const [filters, setFilters] = useState({ subject_type: "", search: "" });
  const [balances, setBalances] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [operation, setOperation] = useState(null);
  const [transition, setTransition] = useState(null);
  const [adjustmentRequests, setAdjustmentRequests] = useState([]);
  const [adjustmentDecision, setAdjustmentDecision] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const requestFilters = { subject_type: filters.subject_type, limit: 500 };
      const [balanceRows, reservationRows, requestRows] = await Promise.all([
        inventoryApi.balances(requestFilters),
        inventoryApi.reservations({ ...requestFilters, status: "active" }),
        canApproveAdjustment
          ? inventoryApi.adjustmentRequests({ status: "pending", limit: 200 })
          : Promise.resolve([]),
      ]);
      setBalances(balanceRows);
      setReservations(reservationRows);
      setAdjustmentRequests(requestRows);
    } catch (requestError) {
      setError(parseInventoryConflict(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, [canApproveAdjustment, filters.subject_type]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    const query = filters.subject_type
      ? `?subject_type=${encodeURIComponent(filters.subject_type)}`
      : "";
    try {
      await downloadCsv(
        `/admin/inventory/balances/export${query}`,
        "niuva-inventory-balances.csv"
      );
    } catch (exportError) {
      toast.error(exportError.message);
    }
  };

  const visible = useMemo(
    () =>
      balances.filter((balance) =>
        [balance.subject_id, balance.subject_name, balance.sku].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        )
      ),
    [balances, filters.search]
  );

  const startOperation = (balance) => {
    const movements = visibleMovementTypes(balance.subject_type, permissions);
    setOperation(
      operationDefaults(
        balance.subject_type,
        balance.subject_id,
        movements[0] || "receive"
      )
    );
  };

  const startTransition = (reservation, action) => {
    setTransition({
      reservation,
      form: reservationTransitionDefaults(reservation.id, action),
    });
  };

  return (
    <AdminLayout title={t("admin.inventory")} subtitle={t("inventory.subtitle")}>
      {/* Balances Panel */}
      <SurfacePanel>
        <SurfacePanelHeader className="flex flex-wrap items-center justify-between gap-3">
          <p className="type-label text-text-secondary">{t("inventory.balances")}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" />
              {t("common.exportCsv")}
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </div>
        </SurfacePanelHeader>

        <div className="grid gap-4 p-4 md:grid-cols-2">
          <FormField label={t("inventory.subjectType")}>
            <Select
              value={filters.subject_type || ALL_SUBJECT_TYPES}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  subject_type: value === ALL_SUBJECT_TYPES ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SUBJECT_TYPES}>{t("common.all")}</SelectItem>
                <SelectItem value="material">{t("inventory.subjectMaterial")}</SelectItem>
                <SelectItem value="product_variant">{t("inventory.subjectProductVariant")}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label={t("common.search")}>
            <Input
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
            />
          </FormField>
        </div>
      </SurfacePanel>

      {canApproveAdjustment && (
        <SurfacePanel className="mt-4">
          <SurfacePanelHeader>
            <p className="type-label text-text-secondary">
              Pending inventory adjustments
            </p>
          </SurfacePanelHeader>
          {adjustmentRequests.length === 0 ? (
            <p className="p-4 text-sm text-text-secondary">
              Tidak ada adjustment yang menunggu approval.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Delta</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustmentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.subject_type} · {request.subject_id}</TableCell>
                    <TableCell className="font-mono">{request.on_hand_delta}</TableCell>
                    <TableCell className="font-mono text-xs">{request.requested_by}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setAdjustmentDecision({ request, action: "approve" })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAdjustmentDecision({ request, action: "reject" })}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SurfacePanel>
      )}

      {/* Balances Table */}
      <SurfacePanel className="mt-4">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.subject")}</TableHead>
                <TableHead>{t("inventory.stockStatusLabel")}</TableHead>
                <TableHead>{t("inventory.onHand")}</TableHead>
                <TableHead>{t("inventory.reserved")}</TableHead>
                <TableHead>{t("inventory.available")}</TableHead>
                <TableHead>{t("inventory.incoming")}</TableHead>
                <TableHead>{t("inventory.plannedDemand")}</TableHead>
                <TableHead>{t("inventory.projected")}</TableHead>
                <TableHead>{t("inventory.version")}</TableHead>
                {canWrite && (
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonTableRow key={i} columns={canWrite ? 10 : 9} />
              ))}
            </TableBody>
          </Table>
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : visible.length === 0 ? (
          <EmptyState className="py-16">{t("inventory.empty")}</EmptyState>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("inventory.subject")}</TableHead>
                    <TableHead>{t("inventory.stockStatusLabel")}</TableHead>
                    <TableHead>{t("inventory.onHand")}</TableHead>
                    <TableHead>{t("inventory.reserved")}</TableHead>
                    <TableHead>{t("inventory.available")}</TableHead>
                    <TableHead>{t("inventory.incoming")}</TableHead>
                    <TableHead>{t("inventory.plannedDemand")}</TableHead>
                    <TableHead>{t("inventory.projected")}</TableHead>
                    <TableHead>{t("inventory.version")}</TableHead>
                    {canWrite && (
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((balance) => (
                    <TableRow key={`${balance.subject_type}:${balance.subject_id}`}>
                      <TableCell>
                        <div className="font-semibold text-text-primary">
                          {balance.subject_name || balance.subject_id}
                        </div>
                        <TechnicalLabel size="micro">
                          {balance.subject_type} · {balance.subject_id}
                        </TechnicalLabel>
                        <Link
                          to={movementHistoryPath(balance)}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-action-primary"
                          data-testid="balance-history-link"
                        >
                          {t("inventory.viewMovements")}
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StockStatusLabel status={balance.stock_status} />
                      </TableCell>
                      <TableCell className="tabular-nums">{balance.on_hand}</TableCell>
                      <TableCell className="tabular-nums">{balance.reserved}</TableCell>
                      <TableCell className="tabular-nums">{balance.available}</TableCell>
                      <TableCell className="tabular-nums">{balance.incoming}</TableCell>
                      <TableCell className="tabular-nums">{balance.planned_demand}</TableCell>
                      <TableCell
                        className={`tabular-nums ${
                          Number(balance.projected) < 0
                            ? "font-semibold text-status-error"
                            : ""
                        }`}
                      >
                        {balance.projected}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums text-text-secondary">{balance.version}</TableCell>
                      {canWrite && (
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startOperation(balance)}
                          >
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            {t("inventory.operation")}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border-default">
              {visible.map((balance) => (
                <div
                  key={`${balance.subject_type}:${balance.subject_id}`}
                  className="px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text-primary truncate">
                      {balance.subject_name || balance.subject_id}
                    </span>
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        Number(balance.projected) < 0 ? "text-status-error" : "text-text-primary"
                      }`}
                    >
                      {balance.projected}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-text-secondary">
                    <span>
                      {t("inventory.available")}: {balance.available} · {t("inventory.reserved")}: {balance.reserved}
                    </span>
                    <StockStatusLabel status={balance.stock_status} />
                  </div>
                  <Link
                    to={movementHistoryPath(balance)}
                    className="mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-action-primary"
                  >
                    {t("inventory.viewMovements")}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                  {canWrite && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => startOperation(balance)}
                    >
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      {t("inventory.operation")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </SurfacePanel>

      {/* Reservations Panel */}
      <SurfacePanel className="mt-4">
        <SurfacePanelHeader>
          <p className="type-label text-text-secondary">{t("inventory.activeReservations")}</p>
        </SurfacePanelHeader>

        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.subject")}</TableHead>
                <TableHead>{t("inventory.quantity")}</TableHead>
                <TableHead>{t("inventory.reference")}</TableHead>
                <TableHead>{t("inventory.expiresAt")}</TableHead>
                {canWrite && (
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <SkeletonTableRow key={i} columns={canWrite ? 5 : 4} />
              ))}
            </TableBody>
          </Table>
        ) : reservations.length === 0 ? (
          <EmptyState className="py-16">{t("inventory.noActiveReservations")}</EmptyState>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("inventory.subject")}</TableHead>
                    <TableHead>{t("inventory.quantity")}</TableHead>
                    <TableHead>{t("inventory.reference")}</TableHead>
                    <TableHead>{t("inventory.expiresAt")}</TableHead>
                    {canWrite && (
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="font-semibold text-text-primary">
                          {reservation.subject_name || reservation.subject_id}
                        </div>
                        <TechnicalLabel size="micro">
                          {reservation.subject_type} · {reservation.id}
                        </TechnicalLabel>
                      </TableCell>
                      <TableCell className="tabular-nums">{reservation.quantity}</TableCell>
                      <TableCell className="font-mono text-xs text-text-secondary">
                        {reservation.reference_type} · {reservation.reference_id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">
                        {reservation.expires_at
                          ? new Date(reservation.expires_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      {canWrite && (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {reservationActions(reservation, permissions).map(
                              (action) => (
                                <Button
                                  key={action}
                                  variant={action === "consume" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => startTransition(reservation, action)}
                                >
                                  {t(`inventory.${action}`)}
                                </Button>
                              )
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border-default">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text-primary truncate">
                      {reservation.subject_name || reservation.subject_id}
                    </span>
                    <span className="text-sm tabular-nums text-text-secondary">
                      {reservation.quantity}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-text-secondary truncate">
                    {reservation.reference_type} · {reservation.reference_id}
                  </p>
                  {canWrite && (
                    <div className="mt-2 flex gap-2">
                      {reservationActions(reservation, permissions).map((action) => (
                        <Button
                          key={action}
                          variant={action === "consume" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => startTransition(reservation, action)}
                        >
                          {t(`inventory.${action}`)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </SurfacePanel>

      {/* Dialogs */}
      {operation && (
        <OperationDialog
          formValue={operation}
          permissions={permissions}
          onClose={() => setOperation(null)}
          onApplied={() => {
            setOperation(null);
            load();
          }}
        />
      )}
      {transition && (
        <ReservationTransitionDialog
          value={transition}
          onClose={() => setTransition(null)}
          onApplied={() => {
            setTransition(null);
            load();
          }}
        />
      )}
      {adjustmentDecision && (
        <AdjustmentDecisionDialog
          value={adjustmentDecision}
          onClose={() => setAdjustmentDecision(null)}
          onApplied={() => {
            setAdjustmentDecision(null);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Operation Dialog
 * ────────────────────────────────────────────────────────────────────────── */

function OperationDialog({ formValue, permissions, onClose, onApplied }) {
  const { t } = useI18n();
  const [form, setForm] = useState(formValue);
  const [busy, setBusy] = useState(false);

  const movements = visibleMovementTypes(form.subject_type, permissions);

  const updateField = (field) => (eventOrValue) =>
    setForm((current) => ({
      ...current,
      [field]: eventOrValue?.target ? eventOrValue.target.value : eventOrValue,
    }));

  const submit = async () => {
    setBusy(true);
    try {
      const payload = buildOperationPayload(form);
      if (form.movement_type === "reserve") {
        await inventoryApi.reserve({
          ...payload,
          expires_at: form.expires_at
            ? new Date(form.expires_at).toISOString()
            : undefined,
        });
      } else if (form.movement_type === "adjustment") {
        await inventoryApi.requestAdjustment({
          request_operation_id: payload.operation_id,
          subject_type: payload.subject_type,
          subject_id: payload.subject_id,
          on_hand_delta: payload.on_hand_delta,
          reference_type: payload.reference_type,
          reference_id: payload.reference_id,
          expected_balance_version: payload.expected_balance_version,
          reason: payload.reason,
        });
      } else {
        await inventoryApi.apply(payload);
      }
      toast.success(t("inventory.operationSuccess"));
      onApplied();
    } catch (error) {
      toast.error(parseInventoryConflict(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const quantityValid =
    form.movement_type === "adjustment"
      ? form.on_hand_delta && form.on_hand_delta !== "0"
      : Number(form.quantity) > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("inventory.operation")} · {form.subject_id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={t("inventory.movementType")}>
            <Select value={form.movement_type} onValueChange={updateField("movement_type")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {movements.map((movement) => (
                  <SelectItem key={movement} value={movement}>
                    {movement}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {form.movement_type === "adjustment" ? (
            <FormField label={t("inventory.signedDelta")}>
              <Input
                value={form.on_hand_delta}
                onChange={updateField("on_hand_delta")}
              />
            </FormField>
          ) : (
            <FormField label={t("inventory.quantity")}>
              <Input
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={updateField("quantity")}
              />
            </FormField>
          )}

          <FormField label={t("inventory.referenceType")}>
            <Input
              value={form.reference_type}
              onChange={updateField("reference_type")}
            />
          </FormField>

          <FormField label={t("inventory.referenceId")}>
            <Input
              value={form.reference_id}
              onChange={updateField("reference_id")}
            />
          </FormField>

          {form.movement_type === "reserve" && (
            <FormField label={t("inventory.expiresAt")}>
              <Input
                type="datetime-local"
                value={form.expires_at || ""}
                onChange={updateField("expires_at")}
              />
            </FormField>
          )}

          <FormField label={t("common.reason")} className="md:col-span-2">
            <Textarea
              value={form.reason}
              onChange={updateField("reason")}
              maxLength={500}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={
              busy ||
              !quantityValid ||
              !form.reference_type ||
              !validInventoryReason(form.reason)
            }
            onClick={submit}
          >
            {t("inventory.apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdjustmentDecisionDialog({ value, onClose, onApplied }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = {
        expected_version: value.request.version,
        reason: reason.trim(),
      };
      if (value.action === "approve") {
        await inventoryApi.approveAdjustment(value.request.id, {
          ...payload,
          operation_id: operationDefaults().operation_id,
        });
      } else {
        await inventoryApi.rejectAdjustment(value.request.id, payload);
      }
      toast.success("Request adjustment diproses.");
      onApplied();
    } catch (error) {
      toast.error(parseInventoryConflict(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {value.action === "approve" ? "Approve" : "Reject"} adjustment
          </DialogTitle>
        </DialogHeader>
        <FormField label="Alasan keputusan">
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
          />
        </FormField>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Batal</Button>
          <Button
            onClick={submit}
            disabled={busy || !validInventoryReason(reason)}
            loading={busy}
          >
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Reservation Transition Dialog
 * ────────────────────────────────────────────────────────────────────────── */

function ReservationTransitionDialog({ value, onClose, onApplied }) {
  const { t } = useI18n();
  const [form, setForm] = useState(value.form);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = buildReservationTransitionPayload(form);
      if (form.action === "release") {
        await inventoryApi.release(form.reservation_id, payload);
      } else {
        await inventoryApi.consume(form.reservation_id, payload);
      }
      toast.success(t("inventory.reservationTransitionSuccess"));
      onApplied();
    } catch (error) {
      toast.error(parseInventoryConflict(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(`inventory.${form.action}`)} · {value.reservation.reference_id}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-text-secondary">
          {value.reservation.quantity} · {value.reservation.subject_id}
        </p>

        <FormField label={t("common.reason")}>
          <Textarea
            value={form.reason}
            onChange={(event) =>
              setForm((current) => ({ ...current, reason: event.target.value }))
            }
            maxLength={500}
          />
        </FormField>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={busy || !validInventoryReason(form.reason)}
            onClick={submit}
          >
            {t(`inventory.${form.action}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
