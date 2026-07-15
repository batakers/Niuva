import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Coins, Pencil, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { Switch } from "../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TechnicalLabel } from "../../components/ui/technical-label";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";
import { formatApiError } from "../../lib/api";
import {
  SUPPORTED_MATERIAL_UNITS,
  formatIdr,
  materialFormFromRecord,
  materialsApi,
  priceVersionPayload,
  validReason,
  visibleMaterialActions,
} from "../../lib/materials";
import { AdminLayout } from "./AdminLayout";


const newMaterial = () => materialFormFromRecord({ status: "active", setup_status: "needs_review" });

function apiMessage(error) {
  const detail = error.response?.data?.detail;
  return formatApiError(detail?.message || detail);
}

function Status({ material }) {
  const needsReview = material.setup_status !== "ready";
  return (
    <div className="space-y-1">
      <TechnicalLabel tone={needsReview ? "warning" : "success"}>{needsReview ? "NEEDS_REVIEW" : "READY"}</TechnicalLabel>
      <TechnicalLabel size="micro" tone={material.status === "archived" ? "muted" : "foreground"}>{material.status || (material.active ? "active" : "archived")}</TechnicalLabel>
    </div>
  );
}

export default function AdminMaterials() {
  const { t } = useI18n();
  const { user } = useAuth();
  const actions = visibleMaterialActions(user?.permissions || []);
  const canViewPriceHistory = actions.includes("price_history");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [archiving, setArchiving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await materialsApi.list();
      if (canViewPriceHistory) {
        const prices = await Promise.all(rows.map(async (material) => {
          try { return await materialsApi.effectivePrice(material.id); }
          catch { return { current: null, next_scheduled: null }; }
        }));
        setItems(rows.map((material, index) => ({ ...material, price_summary: prices[index] })));
      } else setItems(rows);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [canViewPriceHistory]);

  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => items.filter((item) => [item.name, item.sku, item.supplier_reference]
    .some((value) => String(value || "").toLowerCase().includes(query.trim().toLowerCase()))), [items, query]);

  return (
    <AdminLayout title={t("admin.materials")} subtitle={t("materials.subtitle")}>
      <SurfacePanel>
        <SurfacePanelHeader padding="sm" className="flex flex-wrap items-center justify-between gap-3">
          <TechnicalLabel>{t("materials.registry")}</TechnicalLabel>
          <div className="flex gap-2"><Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />{t("common.refresh")}</Button>{actions.includes("create") && <Button variant="technical" size="sm" onClick={() => setEditing(newMaterial())}><Plus className="mr-2 h-4 w-4" />{t("materials.create")}</Button>}</div>
        </SurfacePanelHeader>
        <div className="p-4"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("materials.searchPlaceholder")} aria-label={t("common.search")} /></div>
      </SurfacePanel>

      <SurfacePanel className="mt-4">
        {loading ? <EmptyState>{t("common.loading")}</EmptyState> : error ? <EmptyState><span role="alert">{error}</span></EmptyState> : filtered.length === 0 ? <EmptyState>{t("materials.empty")}</EmptyState> : (
          <>
            <div className="hidden lg:block"><Table>
              <TableHeader><TableRow><TableHead>SKU / {t("common.name")}</TableHead><TableHead>{t("materials.unit")}</TableHead><TableHead>{t("materials.supplier")}</TableHead><TableHead>{t("materials.setup")}</TableHead><TableHead>{t("materials.currentPrice")}</TableHead><TableHead>{t("materials.nextPrice")}</TableHead><TableHead>{t("materials.reorderPoint")}</TableHead><TableHead>{t("materials.leadTime")}</TableHead><TableHead>{t("inventory.tracking")}</TableHead><TableHead className="text-right">{t("common.actions")}</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map((material) => <TableRow key={material.id}>
                <TableCell><div className="font-semibold">{material.name}</div><TechnicalLabel size="micro">{material.sku || "LEGACY_UNSET"}</TechnicalLabel></TableCell>
                <TableCell>{material.base_unit || "—"}</TableCell><TableCell>{material.supplier_reference || "—"}</TableCell><TableCell><Status material={material} /></TableCell>
                <TableCell>{formatIdr(material.price_summary?.current?.amount)}</TableCell><TableCell>{formatIdr(material.price_summary?.next_scheduled?.amount)}</TableCell>
                <TableCell>{material.reorder_point ?? "0"}</TableCell><TableCell>{material.lead_time_days ?? 0} {t("common.days")}</TableCell><TableCell>{material.inventory_tracking_enabled ? t("common.yes") : t("common.no")}</TableCell>
                <TableCell><MaterialActions material={material} actions={actions} onEdit={setEditing} onPrice={setPricing} onArchive={setArchiving} /></TableCell>
              </TableRow>)}</TableBody>
            </Table></div>
            <div className="grid gap-3 p-3 lg:hidden">{filtered.map((material) => <article key={material.id} className="border border-border p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{material.name}</h2><TechnicalLabel size="micro">{material.sku || "LEGACY_UNSET"}</TechnicalLabel></div><Status material={material} /></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">{t("materials.unit")}</dt><dd>{material.base_unit || "—"}</dd></div><div><dt className="text-muted-foreground">{t("materials.currentPrice")}</dt><dd>{formatIdr(material.price_summary?.current?.amount)}</dd></div><div><dt className="text-muted-foreground">{t("materials.reorderPoint")}</dt><dd>{material.reorder_point ?? "0"}</dd></div><div><dt className="text-muted-foreground">{t("materials.leadTime")}</dt><dd>{material.lead_time_days ?? 0}</dd></div></dl><div className="mt-4"><MaterialActions material={material} actions={actions} onEdit={setEditing} onPrice={setPricing} onArchive={setArchiving} /></div></article>)}</div>
          </>
        )}
      </SurfacePanel>

      {editing && <MaterialEditor value={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {pricing && <PriceHistory material={pricing} canAppend={actions.includes("append_price")} onClose={() => setPricing(null)} onChanged={load} />}
      {archiving && <ArchiveMaterial material={archiving} onClose={() => setArchiving(null)} onArchived={() => { setArchiving(null); load(); }} />}
    </AdminLayout>
  );
}

function MaterialActions({ material, actions, onEdit, onPrice, onArchive }) {
  return <div className="flex justify-end gap-1">{actions.includes("edit") && <Button variant="ghost" size="icon" onClick={() => onEdit(materialFormFromRecord(material))} aria-label={`Edit ${material.name}`}><Pencil className="h-4 w-4" /></Button>}{actions.includes("price_history") && <Button variant="ghost" size="icon" onClick={() => onPrice(material)} aria-label={`Price ${material.name}`}><Coins className="h-4 w-4" /></Button>}{actions.includes("archive") && material.status !== "archived" && <Button variant="ghost" size="icon" onClick={() => onArchive(material)} aria-label={`Archive ${material.name}`}><Archive className="h-4 w-4" /></Button>}</div>;
}

function MaterialEditor({ value, onClose, onSaved }) {
  const { t } = useI18n();
  const [form, setForm] = useState(value);
  const [busy, setBusy] = useState(false);
  const set = (field) => (eventOrValue) => setForm((current) => ({ ...current, [field]: eventOrValue?.target ? eventOrValue.target.value : eventOrValue }));
  const save = async () => {
    setBusy(true);
    try {
      const { id, ...fields } = form;
      const payload = { ...fields, base_unit: fields.base_unit || null, lead_time_days: Number.parseInt(fields.lead_time_days || 0, 10), waste_percentage: String(fields.waste_percentage || "0"), reorder_point: String(fields.reorder_point || "0") };
      if (id) await materialsApi.update(id, payload); else await materialsApi.create(payload);
      toast.success(t("materials.saveSuccess")); onSaved();
    } catch (error) { toast.error(apiMessage(error)); } finally { setBusy(false); }
  };
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{form.id ? t("materials.edit") : t("materials.create")}</DialogTitle></DialogHeader><div className="grid gap-4 md:grid-cols-2">
    <FormInput label="SKU" value={form.sku} onChange={set("sku")} /><FormInput label={t("common.name")} value={form.name} onChange={set("name")} />
    <FormInput label={t("materials.color")} value={form.color} onChange={set("color")} /><FormInput label={t("materials.supplier")} value={form.supplier_reference} onChange={set("supplier_reference")} />
    <label className="space-y-1"><TechnicalLabel>{t("materials.unit")}</TechnicalLabel><select value={form.base_unit} onChange={set("base_unit")} className="h-10 w-full border border-border bg-background px-3"><option value="">—</option>{SUPPORTED_MATERIAL_UNITS.map((unit) => <option key={unit}>{unit}</option>)}</select></label>
    <label className="space-y-1"><TechnicalLabel>{t("materials.setup")}</TechnicalLabel><select value={form.setup_status} onChange={set("setup_status")} className="h-10 w-full border border-border bg-background px-3"><option value="needs_review">Needs review</option><option value="ready">Ready</option></select></label>
    <FormInput label={t("materials.waste")} value={form.waste_percentage} onChange={set("waste_percentage")} type="number" /><FormInput label={t("materials.reorderPoint")} value={form.reorder_point} onChange={set("reorder_point")} />
    <FormInput label={t("materials.leadTime")} value={form.lead_time_days} onChange={set("lead_time_days")} type="number" /><label className="flex items-end gap-3 pb-2"><Switch checked={form.inventory_tracking_enabled} onCheckedChange={set("inventory_tracking_enabled")} /><span>{t("inventory.tracking")}</span></label>
    <label className="space-y-1 md:col-span-2"><TechnicalLabel>{t("catalog.description")}</TechnicalLabel><Textarea value={form.description} onChange={set("description")} rows={4} /></label>
  </div><DialogFooter><Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button><Button onClick={save} disabled={busy || form.name.trim().length < 2}>{t("common.save")}</Button></DialogFooter></DialogContent></Dialog>;
}

function FormInput({ label, ...props }) { return <label className="space-y-1"><TechnicalLabel>{label}</TechnicalLabel><Input {...props} /></label>; }

function PriceHistory({ material, canAppend, onClose, onChanged }) {
  const { t } = useI18n();
  const [versions, setVersions] = useState([]);
  const [summary, setSummary] = useState({ current: null, next_scheduled: null });
  const [form, setForm] = useState({ amount: "", price_unit: material.base_unit || "", effective_from: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const [history, effective] = await Promise.all([materialsApi.priceVersions(material.id), materialsApi.effectivePrice(material.id)]); setVersions(history); setSummary(effective); }, [material.id]);
  useEffect(() => { load().catch((error) => toast.error(apiMessage(error))); }, [load]);
  const append = async () => { setBusy(true); try { await materialsApi.appendPrice(material.id, priceVersionPayload(form)); toast.success(t("materials.priceAdded")); setForm((current) => ({ ...current, amount: "", reason: "" })); await load(); onChanged(); } catch (error) { toast.error(apiMessage(error)); } finally { setBusy(false); } };
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{t("materials.priceHistory")} · {material.name}</DialogTitle></DialogHeader><div className="grid gap-3 sm:grid-cols-2"><div className="border border-border p-3"><TechnicalLabel>{t("materials.currentPrice")}</TechnicalLabel><p className="mt-2 text-lg font-semibold">{formatIdr(summary.current?.amount)}</p></div><div className="border border-border p-3"><TechnicalLabel>{t("materials.nextPrice")}</TechnicalLabel><p className="mt-2 text-lg font-semibold">{formatIdr(summary.next_scheduled?.amount)}</p></div></div>{canAppend && <div className="grid gap-3 border border-border p-4 md:grid-cols-2"><FormInput label={t("materials.amount")} type="number" min="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /><FormInput label={t("materials.effectiveFrom")} type="datetime-local" value={form.effective_from} onChange={(event) => setForm({ ...form, effective_from: event.target.value })} /><label className="space-y-1 md:col-span-2"><TechnicalLabel>{t("common.reason")}</TechnicalLabel><Textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label><Button className="md:col-span-2" disabled={busy || !form.amount || !form.effective_from || !validReason(form.reason)} onClick={append}>{t("materials.appendPrice")}</Button></div>}<div className="space-y-2">{versions.length === 0 ? <EmptyState>{t("materials.noPrices")}</EmptyState> : versions.map((version) => <div key={version.id} className="flex flex-wrap justify-between gap-2 border-b border-border py-3"><span>{formatIdr(version.amount)} / {version.price_unit}</span><span>{new Date(version.effective_from).toLocaleString()}</span><TechnicalLabel size="micro">{version.reason}</TechnicalLabel></div>)}</div></DialogContent></Dialog>;
}

function ArchiveMaterial({ material, onClose, onArchived }) {
  const { t } = useI18n(); const [reason, setReason] = useState(""); const [busy, setBusy] = useState(false);
  const archive = async () => { setBusy(true); try { await materialsApi.archive(material.id, reason.trim()); toast.success(t("materials.archiveSuccess")); onArchived(); } catch (error) { toast.error(apiMessage(error)); } finally { setBusy(false); } };
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{t("materials.archive")} · {material.name}</DialogTitle></DialogHeader><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t("common.reason")} /><DialogFooter><Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button><Button variant="destructive" disabled={busy || !validReason(reason)} onClick={archive}>{t("materials.archive")}</Button></DialogFooter></DialogContent></Dialog>;
}
