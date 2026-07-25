import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, RefreshCw, SlidersHorizontal } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          <TechnicalLabel>{t("inventory.balances")}</TechnicalLabel>
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
          <div className="space-y-1.5">
            <Label>{t("inventory.subjectType")}</Label>
            <Select
              value={filters.subject_type}
              onValueChange={(value) =>
                setFilters((current) => ({ ...current, subject_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("common.all")}</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="product_variant">Product variant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("common.search")}</Label>
            <Input
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
            />
          </div>
        </div>
      </SurfacePanel>

      {/* Balances Table */}
      <SurfacePanel className="mt-4">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.subject")}</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Incoming</TableHead>
                <TableHead>Planned demand</TableHead>
                <TableHead>Projected</TableHead>
                <TableHead>Version</TableHead>
                {canWrite && (
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonTableRow key={i} columns={canWrite ? 9 : 8} />
              ))}
            </TableBody>
          </Table>
        ) : error ? (
          <EmptyState icon={AlertCircle} className="py-16">
            <span role="alert" className="text-status-error">{error}</span>
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState className="py-16">{t("inventory.empty")}</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.subject")}</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Incoming</TableHead>
                <TableHead>Planned demand</TableHead>
                <TableHead>Projected</TableHead>
                <TableHead>Version</TableHead>
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
                  </TableCell>
                  <TableCell>{balance.on_hand}</TableCell>
                  <TableCell>{balance.reserved}</TableCell>
                  <TableCell>{balance.available}</TableCell>
                  <TableCell>{balance.incoming}</TableCell>
                  <TableCell>{balance.planned_demand}</TableCell>
                  <TableCell
                    className={
                      Number(balance.projected) < 0
                        ? "font-semibold text-status-error"
                        : ""
                    }
                  >
                    {balance.projected}
                  </TableCell>
                  <TableCell>{balance.version}</TableCell>
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
        )}
      </SurfacePanel>

      {/* Reservations Panel */}
      <SurfacePanel className="mt-4">
        <SurfacePanelHeader>
          <TechnicalLabel>{t("inventory.activeReservations")}</TechnicalLabel>
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
                  <TableCell>{reservation.quantity}</TableCell>
                  <TableCell>
                    {reservation.reference_type} · {reservation.reference_id}
                  </TableCell>
                  <TableCell>
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
          <div className="space-y-1.5">
            <Label>{t("inventory.movementType")}</Label>
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
          </div>

          {form.movement_type === "adjustment" ? (
            <div className="space-y-1.5">
              <Label>{t("inventory.signedDelta")}</Label>
              <Input
                value={form.on_hand_delta}
                onChange={updateField("on_hand_delta")}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>{t("inventory.quantity")}</Label>
              <Input
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={updateField("quantity")}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>{t("inventory.referenceType")}</Label>
            <Input
              value={form.reference_type}
              onChange={updateField("reference_type")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("inventory.referenceId")}</Label>
            <Input
              value={form.reference_id}
              onChange={updateField("reference_id")}
            />
          </div>

          {form.movement_type === "reserve" && (
            <div className="space-y-1.5">
              <Label>{t("inventory.expiresAt")}</Label>
              <Input
                type="datetime-local"
                value={form.expires_at || ""}
                onChange={updateField("expires_at")}
              />
            </div>
          )}

          <div className="space-y-1.5 md:col-span-2">
            <Label>{t("common.reason")}</Label>
            <Textarea
              value={form.reason}
              onChange={updateField("reason")}
              maxLength={500}
            />
          </div>
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

        <div className="space-y-1.5">
          <Label>{t("common.reason")}</Label>
          <Textarea
            value={form.reason}
            onChange={(event) =>
              setForm((current) => ({ ...current, reason: event.target.value }))
            }
            maxLength={500}
          />
        </div>

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
