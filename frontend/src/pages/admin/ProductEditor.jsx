import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { TechnicalLabel } from "../../components/ui/technical-label";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";
import { formatApiError } from "../../lib/api";
import { catalogApi, emptyProductDraft, normalizeValidationErrors } from "../../lib/catalog";
import { hasPermission } from "../../lib/permissions";
import { AdminLayout } from "./AdminLayout";


const emptyVariant = () => ({
  sku: "", name: "", option_values: {}, fixed_price: "", currency: "IDR",
  production_type: "ready_stock", inventory_tracking_enabled: false,
  reorder_point: "0", status: "active",
});
const emptyOption = () => ({
  code: "", label: "", type: "select", allowed_values: [], min_value: null,
  max_value: null, required: false, active: true, display_order: 0,
});

function Field({ label, error, children }) {
  return (
    <label className="block space-y-1">
      <TechnicalLabel as="span" size="micro">{label}</TechnicalLabel>
      {children}
      {error?.map((message) => <span key={message} className="block text-xs text-destructive" role="alert">{message}</span>)}
    </label>
  );
}

function Section({ title, children, action }) {
  return (
    <SurfacePanel>
      <SurfacePanelHeader padding="sm" className="flex items-center justify-between gap-3"><TechnicalLabel>{title}</TechnicalLabel>{action}</SurfacePanelHeader>
      <div className="space-y-4 p-5">{children}</div>
    </SurfacePanel>
  );
}

export default function ProductEditor() {
  const { productId = "new" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const canWrite = hasPermission(user, "catalog.write");
  const canPublish = hasPermission(user, "catalog.publish");
  const canArchive = hasPermission(user, "catalog.archive");
  const isNew = productId === "new";
  const [draft, setDraft] = useState(emptyProductDraft);
  const [variants, setVariants] = useState([]);
  const [options, setOptions] = useState([]);
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [validation, setValidation] = useState({});
  const [reason, setReason] = useState("");
  const [selectedRevision, setSelectedRevision] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (id = productId) => {
    setLoading(true);
    setError("");
    try {
      const categoryRows = await catalogApi.listCategories();
      setCategories(categoryRows.filter((category) => category.status !== "archived"));
      if (id !== "new") {
        const aggregate = await catalogApi.getProduct(id);
        setDraft({ ...emptyProductDraft(), ...aggregate.product });
        setVariants(aggregate.variants || []);
        setOptions(aggregate.options || []);
        setPublications(aggregate.publications || []);
        setSelectedRevision(aggregate.publications?.[0]?.id || "");
      }
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const set = (field) => (eventOrValue) => {
    const value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;
    setDraft((current) => ({ ...current, [field]: value }));
  };
  const updateMedia = (index, field, value) => setDraft((current) => ({
    ...current,
    media: current.media.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
  }));
  const updateVariant = (index, field, value) => setVariants((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const updateOption = (index, field, value) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));

  const payload = useMemo(() => ({
    ...draft,
    price_from: Number.parseInt(draft.price_from || 0, 10),
    pricing_rule_reference: draft.pricing_rule_reference || null,
    media: (draft.media || []).filter((item) => item.storage_path || item.alt),
  }), [draft]);

  const save = async () => {
    setBusy(true);
    setValidation({});
    try {
      const product = isNew
        ? await catalogApi.createProduct(payload)
        : await catalogApi.updateProduct(productId, payload);
      const id = product.id;
      await Promise.all([
        catalogApi.replaceVariants(id, variants.map((variant) => ({
          ...variant,
          fixed_price: variant.fixed_price === "" || variant.fixed_price == null ? null : Number.parseInt(variant.fixed_price, 10),
          reorder_point: String(variant.reorder_point ?? "0"),
        }))),
        catalogApi.replaceOptions(id, options.map((option) => ({
          ...option,
          allowed_values: Array.isArray(option.allowed_values)
            ? option.allowed_values
            : String(option.allowed_values || "").split(",").map((value) => value.trim()).filter(Boolean),
          display_order: Number.parseInt(option.display_order || 0, 10),
        }))),
      ]);
      toast.success(t("catalog.saveSuccess"));
      if (isNew) navigate(`/admin/catalog/${id}`, { replace: true });
      else await load(id);
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setValidation(normalizeValidationErrors(detail?.errors || detail || []));
      toast.error(formatApiError(detail?.message || detail));
    } finally {
      setBusy(false);
    }
  };

  const validate = async () => {
    const result = await catalogApi.validateProduct(productId);
    const grouped = normalizeValidationErrors(result.errors || []);
    setValidation(grouped);
    return result.errors || [];
  };

  const publish = async () => {
    if (reason.trim().length < 3) return;
    setBusy(true);
    try {
      const errors = await validate();
      if (errors.length) {
        toast.error(t("catalog.validationFailed"));
        return;
      }
      await catalogApi.publishProduct(productId, reason.trim());
      toast.success(t("catalog.publishSuccess"));
      setReason("");
      await load();
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setValidation(normalizeValidationErrors(detail?.errors || []));
      toast.error(formatApiError(detail?.message || detail));
    } finally {
      setBusy(false);
    }
  };

  const rollback = async () => {
    if (!selectedRevision || reason.trim().length < 3) return;
    setBusy(true);
    try {
      await catalogApi.rollbackProduct(productId, selectedRevision, reason.trim());
      toast.success(t("catalog.rollbackSuccess"));
      setReason("");
      await load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const archive = async () => {
    if (reason.trim().length < 3) return;
    setBusy(true);
    try {
      await catalogApi.archiveProduct(productId, reason.trim());
      toast.success(t("catalog.archiveSuccess"));
      navigate("/admin/catalog");
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <AdminLayout title={t("catalog.editor")}><EmptyState>{t("common.loading")}</EmptyState></AdminLayout>;
  if (error) return <AdminLayout title={t("catalog.editor")}><EmptyState><span role="alert">{error}</span></EmptyState></AdminLayout>;

  return (
    <AdminLayout title={isNew ? t("catalog.create") : draft.name || t("catalog.editor")} subtitle={canWrite ? t("catalog.editHint") : t("catalog.readOnly")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm"><Link to="/admin/catalog"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.back")}</Link></Button>
        {canWrite && <Button onClick={save} disabled={busy} variant="technical"><Save className="mr-2 h-4 w-4" />{t("common.save")}</Button>}
      </div>
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start rounded-none border border-border bg-surface-1">
          {["basic", "media", "variants", "options", "pricing", "publish"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-none font-mono text-xs">{t(`catalog.tab.${tab}`)}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic"><Section title={t("catalog.basicInformation")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("catalog.category")} error={validation.category_id}><select value={draft.category_id} onChange={set("category_id")} disabled={!canWrite} className="h-10 w-full border border-border bg-background px-3"><option value="">—</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <Field label={t("common.name")} error={validation.name}><Input value={draft.name} onChange={set("name")} disabled={!canWrite} /></Field>
            <Field label="Slug" error={validation.slug}><Input value={draft.slug || ""} onChange={set("slug")} disabled={!canWrite} /></Field>
            <Field label={t("catalog.shortDescription")} error={validation.short_description}><Input value={draft.short_description || ""} onChange={set("short_description")} disabled={!canWrite} /></Field>
          </div>
          <Field label={t("catalog.description")} error={validation.description}><Textarea value={draft.description || ""} onChange={set("description")} disabled={!canWrite} rows={7} /></Field>
        </Section></TabsContent>

        <TabsContent value="media"><Section title={t("catalog.media")} action={canWrite && <Button size="sm" variant="outline" onClick={() => setDraft((current) => ({ ...current, media: [...current.media, { storage_path: "", alt: "" }] }))}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>}>
          {draft.media.length === 0 && <EmptyState frame="dashed">{t("catalog.noMedia")}</EmptyState>}
          {draft.media.map((item, index) => <div key={`${index}-${item.storage_path}`} className="grid gap-3 border border-border p-3 md:grid-cols-[1fr_1fr_auto]">
            <Field label={t("catalog.storagePath")}><Input value={item.storage_path} onChange={(event) => updateMedia(index, "storage_path", event.target.value)} disabled={!canWrite} /></Field>
            <Field label={t("catalog.altText")} error={validation.media}><Input value={item.alt} onChange={(event) => updateMedia(index, "alt", event.target.value)} disabled={!canWrite} /></Field>
            {canWrite && <Button variant="ghost" size="icon" aria-label={`${t("common.delete")}: ${t("catalog.media")} ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, media: current.media.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>}
          </div>)}
        </Section></TabsContent>

        <TabsContent value="variants"><Section title={t("catalog.variants")} action={canWrite && <Button size="sm" variant="outline" onClick={() => setVariants((current) => [...current, emptyVariant()])}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>}>
          {variants.length === 0 && <EmptyState frame="dashed">{t("catalog.noVariants")}</EmptyState>}
          {variants.map((variant, index) => <div key={variant.id || index} className="grid gap-3 border border-border p-3 md:grid-cols-3">
            <Field label="SKU" error={validation.variants}><Input value={variant.sku} onChange={(event) => updateVariant(index, "sku", event.target.value)} disabled={!canWrite} /></Field>
            <Field label={t("common.name")}><Input value={variant.name} onChange={(event) => updateVariant(index, "name", event.target.value)} disabled={!canWrite} /></Field>
            <Field label={t("catalog.productionType")}><select value={variant.production_type} onChange={(event) => updateVariant(index, "production_type", event.target.value)} disabled={!canWrite} className="h-10 w-full border border-border bg-background px-3"><option value="ready_stock">Ready stock</option><option value="made_to_order">Made to order</option></select></Field>
            <Field label={t("catalog.fixedPrice")}><Input type="number" min="0" value={variant.fixed_price ?? ""} onChange={(event) => updateVariant(index, "fixed_price", event.target.value)} disabled={!canWrite} /></Field>
            <Field label={t("materials.reorderPoint")}><Input value={variant.reorder_point ?? "0"} onChange={(event) => updateVariant(index, "reorder_point", event.target.value)} disabled={!canWrite} /></Field>
            <div className="flex items-end justify-between gap-3"><label className="flex items-center gap-2"><Switch checked={Boolean(variant.inventory_tracking_enabled)} onCheckedChange={(value) => updateVariant(index, "inventory_tracking_enabled", value)} disabled={!canWrite} /><span className="text-xs">{t("inventory.tracking")}</span></label>{canWrite && <Button variant="ghost" size="icon" aria-label={`${t("common.delete")}: ${variant.name || variant.sku || t("catalog.variants")}`} onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>}</div>
          </div>)}
        </Section></TabsContent>

        <TabsContent value="options"><Section title={t("catalog.options")} action={canWrite && <Button size="sm" variant="outline" onClick={() => setOptions((current) => [...current, emptyOption()])}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>}>
          {options.length === 0 && <EmptyState frame="dashed">{t("catalog.noOptions")}</EmptyState>}
          {options.map((option, index) => <div key={option.id || index} className="grid gap-3 border border-border p-3 md:grid-cols-3">
            <Field label={t("catalog.optionCode")}><Input value={option.code} onChange={(event) => updateOption(index, "code", event.target.value)} disabled={!canWrite} /></Field>
            <Field label={t("catalog.optionLabel")}><Input value={option.label} onChange={(event) => updateOption(index, "label", event.target.value)} disabled={!canWrite} /></Field>
            <Field label={t("catalog.optionType")}><select value={option.type} onChange={(event) => updateOption(index, "type", event.target.value)} disabled={!canWrite} className="h-10 w-full border border-border bg-background px-3"><option value="select">Select</option><option value="number">Number</option><option value="text">Text</option><option value="file">File</option><option value="boolean">Boolean</option></select></Field>
            <Field label={t("catalog.allowedValues")}><Input value={Array.isArray(option.allowed_values) ? option.allowed_values.join(", ") : option.allowed_values || ""} onChange={(event) => updateOption(index, "allowed_values", event.target.value)} disabled={!canWrite} /></Field>
            <Field label={t("catalog.displayOrder")}><Input type="number" min="0" value={option.display_order ?? 0} onChange={(event) => updateOption(index, "display_order", event.target.value)} disabled={!canWrite} /></Field>
            <div className="flex items-end justify-between"><label className="flex items-center gap-2"><Switch checked={Boolean(option.required)} onCheckedChange={(value) => updateOption(index, "required", value)} disabled={!canWrite} /><span className="text-xs">{t("catalog.required")}</span></label>{canWrite && <Button variant="ghost" size="icon" aria-label={`${t("common.delete")}: ${option.label || option.code || t("catalog.options")}`} onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>}</div>
          </div>)}
        </Section></TabsContent>

        <TabsContent value="pricing"><Section title={t("catalog.pricingStock")}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("catalog.pricingMode")} error={validation.pricing_mode}><select value={draft.pricing_mode} onChange={set("pricing_mode")} disabled={!canWrite} className="h-10 w-full border border-border bg-background px-3"><option value="fixed">Fixed</option><option value="calculated">Calculated</option><option value="quote_required">Quote required</option></select></Field>
            <Field label={t("catalog.priceFrom")} error={validation.price_from}><Input type="number" min="0" value={draft.price_from} onChange={set("price_from")} disabled={!canWrite} /></Field>
            <Field label={t("catalog.stockPolicy")}><select value={draft.stock_visibility} onChange={set("stock_visibility")} disabled={!canWrite} className="h-10 w-full border border-border bg-background px-3"><option value="status_only">Status only</option><option value="made_to_order">Made to order</option></select></Field>
          </div>
          <Field label={t("catalog.pricingRuleReference")} error={validation.pricing_rule_reference}><Input value={draft.pricing_rule_reference || ""} onChange={set("pricing_rule_reference")} disabled={!canWrite} /></Field>
          <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2"><Switch checked={draft.retail_cta_enabled} onCheckedChange={set("retail_cta_enabled")} disabled={!canWrite} />Retail CTA</label><label className="flex items-center gap-2"><Switch checked={draft.b2b_cta_enabled} onCheckedChange={set("b2b_cta_enabled")} disabled={!canWrite} />B2B CTA</label></div>
        </Section></TabsContent>

        <TabsContent value="publish"><Section title={t("catalog.publication")}>
          {Object.keys(validation).length > 0 && <div className="border border-destructive/50 bg-destructive/5 p-4" role="alert"><TechnicalLabel tone="danger">{t("catalog.validationFailed")}</TechnicalLabel>{Object.entries(validation).map(([field, messages]) => <div key={field} className="mt-2 text-sm"><strong>{field}</strong><ul className="list-disc pl-5">{messages.map((message) => <li key={message}>{message}</li>)}</ul></div>)}</div>}
          {!isNew && <Button variant="outline" onClick={validate}>{t("catalog.validate")}</Button>}
          <Field label={t("common.reason")}><Textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} rows={3} /></Field>
          <div className="flex flex-wrap gap-2">
            {canPublish && !isNew && <Button onClick={publish} disabled={busy || reason.trim().length < 3}>{t("catalog.publish")}</Button>}
            {canArchive && !isNew && <Button variant="destructive" onClick={archive} disabled={busy || reason.trim().length < 3}>{t("catalog.archive")}</Button>}
          </div>
          <div className="border-t border-border pt-4"><TechnicalLabel>{t("catalog.revisionHistory")}</TechnicalLabel>
            {publications.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">{t("catalog.noPublications")}</p> : <div className="mt-2 space-y-2">{publications.map((publication) => <label key={publication.id} className="flex items-center gap-3 border border-border p-3"><input type="radio" name="revision" checked={selectedRevision === publication.id} onChange={() => setSelectedRevision(publication.id)} /><span className="flex-1">Revision {publication.revision} · {new Date(publication.published_at).toLocaleString()}</span><TechnicalLabel size="micro">{publication.publish_reason}</TechnicalLabel></label>)}</div>}
            {canPublish && publications.length > 0 && <Button className="mt-3" variant="outline" onClick={rollback} disabled={busy || !selectedRevision || reason.trim().length < 3}>{t("catalog.rollback")}</Button>}
          </div>
        </Section></TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
