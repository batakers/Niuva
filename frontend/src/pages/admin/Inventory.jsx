import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TechnicalLabel } from "../../components/ui/technical-label";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";
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
} from "../../lib/inventory";
import { hasPermission } from "../../lib/permissions";
import { AdminLayout } from "./AdminLayout";


export default function Inventory() {
  const { t } = useI18n();
  const { user } = useAuth();
  const permissions = user?.permissions || [];
  const canWrite = hasPermission(user, "inventory.write");
  const [filters, setFilters] = useState({ subject_type: "", search: "" });
  const [balances, setBalances] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [operation, setOperation] = useState(null);
  const [transition, setTransition] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const requestFilters = { subject_type: filters.subject_type, limit: 500 };
      const [balanceRows, reservationRows] = await Promise.all([
        inventoryApi.balances(requestFilters),
        inventoryApi.reservations({ ...requestFilters, status: "active" }),
      ]);
      setBalances(balanceRows);
      setReservations(reservationRows);
    } catch (requestError) {
      setError(parseInventoryConflict(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, [filters.subject_type]);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => balances.filter((balance) => (
    [balance.subject_id, balance.subject_name, balance.sku]
      .some((value) => String(value || "").toLowerCase().includes(filters.search.toLowerCase()))
  )), [balances, filters.search]);

  const startOperation = (balance) => {
    const movements = visibleMovementTypes(balance.subject_type, permissions);
    setOperation(operationDefaults(balance.subject_type, balance.subject_id, movements[0] || "receive"));
  };

  const startTransition = (reservation, action) => {
    setTransition({
      reservation,
      form: reservationTransitionDefaults(reservation.id, action),
    });
  };

  return (
    <AdminLayout title={t("admin.inventory")} subtitle={t("inventory.subtitle")}>
      <SurfacePanel>
        <SurfacePanelHeader padding="sm" className="flex flex-wrap items-center justify-between gap-3">
          <TechnicalLabel>{t("inventory.balances")}</TechnicalLabel>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />{t("common.refresh")}
          </Button>
        </SurfacePanelHeader>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <label className="space-y-1">
            <TechnicalLabel>{t("inventory.subjectType")}</TechnicalLabel>
            <select
              value={filters.subject_type}
              onChange={(event) => setFilters({ ...filters, subject_type: event.target.value })}
              className="h-10 w-full border border-border bg-background px-3"
            >
              <option value="">{t("common.all")}</option>
              <option value="material">Material</option>
              <option value="product_variant">Product variant</option>
            </select>
          </label>
          <label className="space-y-1">
            <TechnicalLabel>{t("common.search")}</TechnicalLabel>
            <Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
          </label>
        </div>
      </SurfacePanel>

      <SurfacePanel className="mt-4">
        {loading ? <EmptyState>{t("common.loading")}</EmptyState>
          : error ? <EmptyState><span role="alert">{error}</span></EmptyState>
            : visible.length === 0 ? <EmptyState>{t("inventory.empty")}</EmptyState>
              : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>{t("inventory.subject")}</TableHead><TableHead>On hand</TableHead>
                    <TableHead>Reserved</TableHead><TableHead>Available</TableHead><TableHead>Incoming</TableHead>
                    <TableHead>Planned demand</TableHead><TableHead>Projected</TableHead><TableHead>Version</TableHead>
                    {canWrite && <TableHead className="text-right">{t("common.actions")}</TableHead>}
                  </TableRow></TableHeader>
                  <TableBody>{visible.map((balance) => (
                    <TableRow key={`${balance.subject_type}:${balance.subject_id}`}>
                      <TableCell><div className="font-semibold">{balance.subject_name || balance.subject_id}</div><TechnicalLabel size="micro">{balance.subject_type} · {balance.subject_id}</TechnicalLabel></TableCell>
                      {['on_hand', 'reserved', 'available', 'incoming', 'planned_demand', 'projected'].map((field) => <TableCell key={field} className={field === "projected" && Number(balance[field]) < 0 ? "font-semibold text-destructive" : ""}>{balance[field]}</TableCell>)}
                      <TableCell>{balance.version}</TableCell>
                      {canWrite && <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => startOperation(balance)}><SlidersHorizontal className="mr-2 h-4 w-4" />{t("inventory.operation")}</Button></TableCell>}
                    </TableRow>
                  ))}</TableBody>
                </Table>
              )}
      </SurfacePanel>

      <SurfacePanel className="mt-4">
        <SurfacePanelHeader padding="sm">
          <TechnicalLabel>{t("inventory.activeReservations")}</TechnicalLabel>
        </SurfacePanelHeader>
        {loading ? <EmptyState>{t("common.loading")}</EmptyState>
          : reservations.length === 0 ? <EmptyState>{t("inventory.noActiveReservations")}</EmptyState>
            : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t("inventory.subject")}</TableHead><TableHead>{t("inventory.quantity")}</TableHead>
                  <TableHead>{t("inventory.reference")}</TableHead><TableHead>{t("inventory.expiresAt")}</TableHead>
                  {canWrite && <TableHead className="text-right">{t("common.actions")}</TableHead>}
                </TableRow></TableHeader>
                <TableBody>{reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell><div className="font-semibold">{reservation.subject_name || reservation.subject_id}</div><TechnicalLabel size="micro">{reservation.subject_type} · {reservation.id}</TechnicalLabel></TableCell>
                    <TableCell>{reservation.quantity}</TableCell>
                    <TableCell>{reservation.reference_type} · {reservation.reference_id}</TableCell>
                    <TableCell>{reservation.expires_at ? new Date(reservation.expires_at).toLocaleString() : "—"}</TableCell>
                    {canWrite && <TableCell><div className="flex justify-end gap-2">{reservationActions(reservation, permissions).map((action) => <Button key={action} variant={action === "consume" ? "technical" : "outline"} size="sm" onClick={() => startTransition(reservation, action)}>{t(`inventory.${action}`)}</Button>)}</div></TableCell>}
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
      </SurfacePanel>

      {operation && <OperationDialog formValue={operation} permissions={permissions} onClose={() => setOperation(null)} onApplied={() => { setOperation(null); load(); }} />}
      {transition && <ReservationTransitionDialog value={transition} onClose={() => setTransition(null)} onApplied={() => { setTransition(null); load(); }} />}
    </AdminLayout>
  );
}


function OperationDialog({ formValue, permissions, onClose, onApplied }) {
  const { t } = useI18n();
  const [form, setForm] = useState(formValue);
  const [busy, setBusy] = useState(false);
  const movements = visibleMovementTypes(form.subject_type, permissions);
  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const submit = async () => {
    setBusy(true);
    try {
      const payload = buildOperationPayload(form);
      if (form.movement_type === "reserve") {
        await inventoryApi.reserve({ ...payload, expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : undefined });
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
  const quantityValid = form.movement_type === "adjustment" ? form.on_hand_delta && form.on_hand_delta !== "0" : Number(form.quantity) > 0;
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{t("inventory.operation")} · {form.subject_id}</DialogTitle></DialogHeader><div className="grid gap-4 md:grid-cols-2"><label className="space-y-1"><TechnicalLabel>{t("inventory.movementType")}</TechnicalLabel><select value={form.movement_type} onChange={set("movement_type")} className="h-10 w-full border border-border bg-background px-3">{movements.map((movement) => <option key={movement} value={movement}>{movement}</option>)}</select></label>{form.movement_type === "adjustment" ? <FormField label={t("inventory.signedDelta")} value={form.on_hand_delta} onChange={set("on_hand_delta")} /> : <FormField label={t("inventory.quantity")} value={form.quantity} onChange={set("quantity")} type="number" min="0" step="any" />}<FormField label={t("inventory.referenceType")} value={form.reference_type} onChange={set("reference_type")} /><FormField label={t("inventory.referenceId")} value={form.reference_id} onChange={set("reference_id")} />{form.movement_type === "reserve" && <FormField label={t("inventory.expiresAt")} value={form.expires_at || ""} onChange={set("expires_at")} type="datetime-local" />}<label className="space-y-1 md:col-span-2"><TechnicalLabel>{t("common.reason")}</TechnicalLabel><Textarea value={form.reason} onChange={set("reason")} maxLength={500} /></label></div><DialogFooter><Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button><Button disabled={busy || !quantityValid || !form.reference_type || !validInventoryReason(form.reason)} onClick={submit}>{t("inventory.apply")}</Button></DialogFooter></DialogContent></Dialog>;
}


function ReservationTransitionDialog({ value, onClose, onApplied }) {
  const { t } = useI18n();
  const [form, setForm] = useState(value.form);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      const payload = buildReservationTransitionPayload(form);
      if (form.action === "release") await inventoryApi.release(form.reservation_id, payload);
      else await inventoryApi.consume(form.reservation_id, payload);
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
        <DialogHeader><DialogTitle>{t(`inventory.${form.action}`)} · {value.reservation.reference_id}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{value.reservation.quantity} · {value.reservation.subject_id}</p>
        <label className="space-y-1"><TechnicalLabel>{t("common.reason")}</TechnicalLabel><Textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} maxLength={500} /></label>
        <DialogFooter><Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button><Button disabled={busy || !validInventoryReason(form.reason)} onClick={submit}>{t(`inventory.${form.action}`)}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function FormField({ label, ...props }) {
  return <label className="space-y-1"><TechnicalLabel>{label}</TechnicalLabel><Input {...props} /></label>;
}
