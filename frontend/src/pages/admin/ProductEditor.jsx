import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorState } from "../../components/ui/error-state";
import { FormField } from "../../components/ui/form-field";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
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
import { DevelopmentMediaUpload } from "../../components/admin/DevelopmentMediaUpload";


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
    <FormField label={label} error={error?.join("; ")}>
      {children}
    </FormField>
  );
}

const SECTION_STATES = Object.freeze({
  idle: "idle",
  notAttempted: "not_attempted",
  submitting: "submitting",
  success: "success",
  validation: "validation_error",
  conflict: "conflict",
  dependency: "dependency_error",
  error: "error",
});

function classifySaveError(requestError) {
  const status = requestError?.response?.status;
  if (status === 409) return SECTION_STATES.conflict;
  if (status === 422) return SECTION_STATES.validation;
  if (!requestError?.response || status >= 500 || status === 503) {
    return SECTION_STATES.dependency;
  }
  return SECTION_STATES.error;
}

function sectionStateKey(state) {
  const keys = {
    [SECTION_STATES.notAttempted]: "catalog.sectionState.notAttempted",
    [SECTION_STATES.submitting]: "catalog.sectionState.submitting",
    [SECTION_STATES.success]: "catalog.sectionState.success",
    [SECTION_STATES.validation]: "catalog.sectionState.validation",
    [SECTION_STATES.conflict]: "catalog.sectionState.conflict",
    [SECTION_STATES.dependency]: "catalog.sectionState.dependency",
    [SECTION_STATES.error]: "catalog.sectionState.error",
  };
  return keys[state] || "catalog.sectionState.idle";
}

function sectionHintKey(state) {
  const keys = {
    [SECTION_STATES.validation]: "catalog.sectionHint.validation",
    [SECTION_STATES.conflict]: "catalog.sectionHint.conflict",
    [SECTION_STATES.dependency]: "catalog.sectionHint.dependency",
    [SECTION_STATES.error]: "catalog.sectionHint.error",
  };
  return keys[state] || "";
}

function sectionActionLabel(state, defaultKey, t) {
  const retryStates = [
    SECTION_STATES.validation,
    SECTION_STATES.conflict,
    SECTION_STATES.dependency,
    SECTION_STATES.error,
  ];
  return retryStates.includes(state) ? t("common.retry") : t(defaultKey);
}

function SectionStatus({ section, state, error, t }) {
  const hintKey = sectionHintKey(state);
  return (
    <div className="flex flex-col items-end gap-1 text-right" data-testid={`${section}-save-status`}>
      <span className="text-xs text-text-secondary" role="status" aria-live="polite">
        {t(sectionStateKey(state))}
      </span>
      {hintKey && (
        <span className="max-w-[18rem] text-xs text-status-error" role="alert">
          {t(hintKey)}{error ? ` ${error}` : ""}
        </span>
      )}
    </div>
  );
}

function Section({ title, children, action, status, error, section, t }) {
  return (
    <SurfacePanel>
      <SurfacePanelHeader padding="sm" className="flex items-center justify-between gap-3">
        <p className="type-label text-text-secondary">{title}</p>
        <div className="flex items-center gap-3">
          {section && <SectionStatus section={section} state={status} error={error} t={t} />}
          {action}
        </div>
      </SurfacePanelHeader>
      <div className="space-y-4 p-5">{children}</div>
    </SurfacePanel>
  );
}

const EMPTY_EDITOR_SELECT_VALUE = "__empty__";

function EditorSelect({
  allowEmpty = false,
  children,
  disabled,
  onValueChange,
  value,
}) {
  const selectedValue = allowEmpty && !value ? EMPTY_EDITOR_SELECT_VALUE : value;

  return (
    <Select
      value={selectedValue}
      onValueChange={(nextValue) =>
        onValueChange(
          allowEmpty && nextValue === EMPTY_EDITOR_SELECT_VALUE ? "" : nextValue
        )
      }
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && <SelectItem value={EMPTY_EDITOR_SELECT_VALUE}>—</SelectItem>}
        {children}
      </SelectContent>
    </Select>
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
  const canUploadMedia = hasPermission(user, "media.write");
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
  const [sectionStates, setSectionStates] = useState(() => ({
    product: SECTION_STATES.idle,
    variants: isNew ? SECTION_STATES.notAttempted : SECTION_STATES.idle,
    options: isNew ? SECTION_STATES.notAttempted : SECTION_STATES.idle,
  }));
  const [sectionErrors, setSectionErrors] = useState({});

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
      return true;
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
      return false;
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

  const setSectionState = (section, state, message = "") => {
    setSectionStates((current) => ({ ...current, [section]: state }));
    setSectionErrors((current) => ({ ...current, [section]: message }));
  };

  const handleSectionFailure = (section, requestError) => {
    const detail = requestError?.response?.data?.detail;
    const state = classifySaveError(requestError);
    const normalizedErrors = normalizeValidationErrors(detail?.errors || detail || []);
    if (state === SECTION_STATES.validation) setValidation(normalizedErrors);
    const message = formatApiError(detail?.message || detail);
    setSectionState(section, state, message);
    toast.error(message);
  };

  const saveProduct = async () => {
    setSectionState("product", SECTION_STATES.submitting);
    setValidation({});
    try {
      const product = isNew
        ? await catalogApi.createProduct(payload)
        : await catalogApi.updateProduct(productId, payload);
      setSectionState("product", SECTION_STATES.success);
      toast.success(t("catalog.productSaved"));
      if (isNew) {
        navigate(`/admin/catalog/${product.id}`, { replace: true });
      } else {
        await load(product.id);
      }
    } catch (requestError) {
      handleSectionFailure("product", requestError);
    }
  };

  const reconcileSection = async (section, state, message = "") => {
    const reconciled = await load(productId);
    if (!reconciled) {
      setSectionState(section, SECTION_STATES.dependency, message);
      return false;
    }
    setSectionState(section, state, message);
    return true;
  };

  const saveVariants = async () => {
    if (isNew) return;
    setValidation({});
    setSectionState("variants", SECTION_STATES.submitting);
    try {
      await catalogApi.replaceVariants(productId, variants.map((variant) => ({
        ...variant,
        fixed_price: variant.fixed_price === "" || variant.fixed_price == null ? null : Number.parseInt(variant.fixed_price, 10),
        reorder_point: String(variant.reorder_point ?? "0"),
      })));
      if (await reconcileSection("variants", SECTION_STATES.success)) {
        toast.success(t("catalog.variantsSaved"));
      }
    } catch (requestError) {
      const state = classifySaveError(requestError);
      const detail = requestError?.response?.data?.detail;
      const message = formatApiError(detail?.message || detail);
      const normalizedErrors = normalizeValidationErrors(detail?.errors || detail || []);
      if (state === SECTION_STATES.validation) setValidation(normalizedErrors);
      await reconcileSection("variants", state, message);
      toast.error(message);
    }
  };

  const saveOptions = async () => {
    if (isNew) return;
    setValidation({});
    setSectionState("options", SECTION_STATES.submitting);
    try {
      await catalogApi.replaceOptions(productId, options.map((option) => ({
        ...option,
        allowed_values: Array.isArray(option.allowed_values)
          ? option.allowed_values
          : String(option.allowed_values || "").split(",").map((value) => value.trim()).filter(Boolean),
        display_order: Number.parseInt(option.display_order || 0, 10),
      })));
      if (await reconcileSection("options", SECTION_STATES.success)) {
        toast.success(t("catalog.optionsSaved"));
      }
    } catch (requestError) {
      const state = classifySaveError(requestError);
      const detail = requestError?.response?.data?.detail;
      const message = formatApiError(detail?.message || detail);
      const normalizedErrors = normalizeValidationErrors(detail?.errors || detail || []);
      if (state === SECTION_STATES.validation) setValidation(normalizedErrors);
      await reconcileSection("options", state, message);
      toast.error(message);
    }
  };

  const validate = async () => {
    if (reason.trim().length < 3) return;
    setBusy(true);
    try {
      await catalogApi.validateProduct(productId, reason.trim());
      setValidation({});
      toast.success(t("catalog.validationPassed"));
      await load();
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setValidation(normalizeValidationErrors(detail?.errors || []));
      toast.error(formatApiError(detail?.message || detail));
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (reason.trim().length < 3) return;
    setBusy(true);
    try {
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

  if (loading) return <AdminLayout title={t("catalog.editor")}><div className="space-y-6 p-6"><Skeleton variant="heading" className="w-64" /><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /></div></AdminLayout>;
  if (error) return <AdminLayout title={t("catalog.editor")}><ErrorState error={error} onRetry={() => load()} /></AdminLayout>;

  return (
    <AdminLayout title={isNew ? t("catalog.create") : draft.name || t("catalog.editor")} subtitle={canWrite ? t("catalog.editHint") : t("catalog.readOnly")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm"><Link to="/admin/catalog"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.back")}</Link></Button>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {canWrite && <SectionStatus section="product" state={sectionStates.product} error={sectionErrors.product} t={t} />}
          {canWrite && <Button onClick={saveProduct} disabled={busy || sectionStates.product === SECTION_STATES.submitting} variant="technical"><Save className="mr-2 h-4 w-4" />{sectionActionLabel(sectionStates.product, "catalog.saveProduct", t)}</Button>}
        </div>
      </div>
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start border border-border-default bg-surface-default">
          {["basic", "media", "variants", "options", "pricing", "publish"].map((tab) => (
            <TabsTrigger key={tab} value={tab} disabled={isNew && ["variants", "options"].includes(tab)}>{t(`catalog.tab.${tab}`)}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic"><Section title={t("catalog.basicInformation")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("catalog.category")} error={validation.category_id}><EditorSelect value={draft.category_id} onValueChange={set("category_id")} disabled={!canWrite} allowEmpty>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</EditorSelect></Field>
            <Field label={t("common.name")} error={validation.name}><Input value={draft.name} onChange={set("name")} disabled={!canWrite} /></Field>
            <Field label="Slug" error={validation.slug}><Input value={draft.slug || ""} onChange={set("slug")} disabled={!canWrite} /></Field>
            <Field label={t("catalog.shortDescription")} error={validation.short_description}><Input value={draft.short_description || ""} onChange={set("short_description")} disabled={!canWrite} /></Field>
          </div>
          <Field label={t("catalog.description")} error={validation.description}><Textarea value={draft.description || ""} onChange={set("description")} disabled={!canWrite} rows={7} /></Field>
        </Section></TabsContent>

        <TabsContent value="media"><Section title={t("catalog.media")} action={canWrite && <div className="flex flex-wrap items-center justify-end gap-2">{canUploadMedia && <DevelopmentMediaUpload disabled={busy || sectionStates.product === SECTION_STATES.submitting} onUploaded={(media) => setDraft((current) => ({ ...current, media: [...current.media, { storage_path: media.reference, alt: media.original_filename }] }))} />}<Button size="sm" variant="outline" onClick={() => setDraft((current) => ({ ...current, media: [...current.media, { storage_path: "", alt: "" }] }))} disabled={sectionStates.product === SECTION_STATES.submitting}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button></div>}>
          {draft.media.length === 0 && <EmptyState frame="dashed">{t("catalog.noMedia")}</EmptyState>}
          {draft.media.map((item, index) => <div key={`${index}-${item.storage_path}`} className="grid gap-3 border border-border-default p-3 md:grid-cols-[1fr_1fr_auto]">
            <Field label={t("catalog.storagePath")}><Input value={item.storage_path} onChange={(event) => updateMedia(index, "storage_path", event.target.value)} disabled={!canWrite} /></Field>
            <Field label={t("catalog.altText")} error={validation.media}><Input value={item.alt} onChange={(event) => updateMedia(index, "alt", event.target.value)} disabled={!canWrite} /></Field>
            {canWrite && <Button variant="ghost" size="icon" aria-label={`${t("common.delete")}: ${t("catalog.media")} ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, media: current.media.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>}
          </div>)}
        </Section></TabsContent>

        <TabsContent value="variants"><Section
          title={t("catalog.variants")}
          section="variants"
          status={sectionStates.variants}
          error={sectionErrors.variants}
          t={t}
          action={<div className="flex flex-wrap items-center justify-end gap-2">
            {canWrite && <Button size="sm" variant="outline" onClick={() => setVariants((current) => [...current, emptyVariant()])} disabled={isNew || sectionStates.variants === SECTION_STATES.submitting}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>}
            {canWrite && <Button size="sm" onClick={saveVariants} disabled={isNew || sectionStates.variants === SECTION_STATES.submitting}><Save className="mr-2 h-4 w-4" />{sectionStates.variants === SECTION_STATES.submitting ? t("common.saving") : sectionActionLabel(sectionStates.variants, "catalog.saveVariants", t)}</Button>}
          </div>}
        >
          {isNew && <p className="text-sm text-text-secondary">{t("catalog.childRequiresProduct")}</p>}
          {variants.length === 0 && <EmptyState frame="dashed">{t("catalog.noVariants")}</EmptyState>}
          {variants.map((variant, index) => <div key={variant.id || index} className="grid gap-3 border border-border-default p-3 md:grid-cols-3">
            <Field label="SKU" error={validation.variants}><Input value={variant.sku} onChange={(event) => updateVariant(index, "sku", event.target.value)} disabled={!canWrite || isNew} /></Field>
            <Field label={t("common.name")}><Input value={variant.name} onChange={(event) => updateVariant(index, "name", event.target.value)} disabled={!canWrite || isNew} /></Field>
            <Field label={t("catalog.productionType")}><EditorSelect value={variant.production_type} onValueChange={(value) => updateVariant(index, "production_type", value)} disabled={!canWrite || isNew}><SelectItem value="ready_stock">{t("catalog.readyStock")}</SelectItem><SelectItem value="made_to_order">{t("catalog.madeToOrder")}</SelectItem></EditorSelect></Field>
            <Field label={t("catalog.fixedPrice")}><Input type="number" min="0" value={variant.fixed_price ?? ""} onChange={(event) => updateVariant(index, "fixed_price", event.target.value)} disabled={!canWrite || isNew} /></Field>
            <Field label={t("materials.reorderPoint")}><Input value={variant.reorder_point ?? "0"} onChange={(event) => updateVariant(index, "reorder_point", event.target.value)} disabled={!canWrite || isNew} /></Field>
            <div className="flex items-end justify-between gap-3"><label className="flex items-center gap-2"><Switch checked={Boolean(variant.inventory_tracking_enabled)} onCheckedChange={(value) => updateVariant(index, "inventory_tracking_enabled", value)} disabled={!canWrite || isNew} /><span className="text-xs">{t("inventory.tracking")}</span></label>{canWrite && <Button variant="ghost" size="icon" aria-label={`${t("common.delete")}: ${variant.name || variant.sku || t("catalog.variants")}`} onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={isNew}><Trash2 className="h-4 w-4" /></Button>}</div>
          </div>)}
        </Section></TabsContent>

        <TabsContent value="options"><Section
          title={t("catalog.options")}
          section="options"
          status={sectionStates.options}
          error={sectionErrors.options}
          t={t}
          action={<div className="flex flex-wrap items-center justify-end gap-2">
            {canWrite && <Button size="sm" variant="outline" onClick={() => setOptions((current) => [...current, emptyOption()])} disabled={isNew || sectionStates.options === SECTION_STATES.submitting}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>}
            {canWrite && <Button size="sm" onClick={saveOptions} disabled={isNew || sectionStates.options === SECTION_STATES.submitting}><Save className="mr-2 h-4 w-4" />{sectionStates.options === SECTION_STATES.submitting ? t("common.saving") : sectionActionLabel(sectionStates.options, "catalog.saveOptions", t)}</Button>}
          </div>}
        >
          {isNew && <p className="text-sm text-text-secondary">{t("catalog.childRequiresProduct")}</p>}
          {options.length === 0 && <EmptyState frame="dashed">{t("catalog.noOptions")}</EmptyState>}
          {options.map((option, index) => <div key={option.id || index} className="grid gap-3 border border-border-default p-3 md:grid-cols-3">
            <Field label={t("catalog.optionCode")}><Input value={option.code} onChange={(event) => updateOption(index, "code", event.target.value)} disabled={!canWrite || isNew} /></Field>
            <Field label={t("catalog.optionLabel")}><Input value={option.label} onChange={(event) => updateOption(index, "label", event.target.value)} disabled={!canWrite || isNew} /></Field>
            <Field label={t("catalog.optionType")}><EditorSelect value={option.type} onValueChange={(value) => updateOption(index, "type", value)} disabled={!canWrite || isNew}><SelectItem value="select">{t("catalog.optionTypeSelect")}</SelectItem><SelectItem value="number">{t("catalog.optionTypeNumber")}</SelectItem><SelectItem value="text">{t("catalog.optionTypeText")}</SelectItem><SelectItem value="file">{t("catalog.optionTypeFile")}</SelectItem><SelectItem value="boolean">{t("catalog.optionTypeBoolean")}</SelectItem></EditorSelect></Field>
            <Field label={t("catalog.allowedValues")}><Input value={Array.isArray(option.allowed_values) ? option.allowed_values.join(", ") : option.allowed_values || ""} onChange={(event) => updateOption(index, "allowed_values", event.target.value)} disabled={!canWrite || isNew} /></Field>
            <Field label={t("catalog.displayOrder")}><Input type="number" min="0" value={option.display_order ?? 0} onChange={(event) => updateOption(index, "display_order", event.target.value)} disabled={!canWrite || isNew} /></Field>
            <div className="flex items-end justify-between"><label className="flex items-center gap-2"><Switch checked={Boolean(option.required)} onCheckedChange={(value) => updateOption(index, "required", value)} disabled={!canWrite || isNew} /><span className="text-xs">{t("catalog.required")}</span></label>{canWrite && <Button variant="ghost" size="icon" aria-label={`${t("common.delete")}: ${option.label || option.code || t("catalog.options")}`} onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={isNew}><Trash2 className="h-4 w-4" /></Button>}</div>
          </div>)}
        </Section></TabsContent>

        <TabsContent value="pricing"><Section title={t("catalog.pricingStock")}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("catalog.pricingMode")} error={validation.pricing_mode}><EditorSelect value={draft.pricing_mode} onValueChange={set("pricing_mode")} disabled={!canWrite}><SelectItem value="fixed">{t("catalog.pricingFixed")}</SelectItem><SelectItem value="calculated">{t("catalog.pricingCalculated")}</SelectItem><SelectItem value="quote_required">{t("catalog.pricingQuoteRequired")}</SelectItem></EditorSelect></Field>
            <Field label={t("catalog.priceFrom")} error={validation.price_from}><Input type="number" min="0" value={draft.price_from} onChange={set("price_from")} disabled={!canWrite} /></Field>
            <Field label={t("catalog.stockPolicy")}><EditorSelect value={draft.stock_visibility} onValueChange={set("stock_visibility")} disabled={!canWrite}><SelectItem value="status_only">{t("catalog.stockStatusOnly")}</SelectItem><SelectItem value="made_to_order">{t("catalog.stockMadeToOrder")}</SelectItem></EditorSelect></Field>
          </div>
          <Field label={t("catalog.pricingRuleReference")} error={validation.pricing_rule_reference}><Input value={draft.pricing_rule_reference || ""} onChange={set("pricing_rule_reference")} disabled={!canWrite} /></Field>
          <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2"><Switch checked={draft.retail_cta_enabled} onCheckedChange={set("retail_cta_enabled")} disabled={!canWrite} />{t("catalog.retailCta")}</label><label className="flex items-center gap-2"><Switch checked={draft.b2b_cta_enabled} onCheckedChange={set("b2b_cta_enabled")} disabled={!canWrite} />{t("catalog.b2bCta")}</label></div>
        </Section></TabsContent>

        <TabsContent value="publish"><Section title={t("catalog.publication")}>
          {Object.keys(validation).length > 0 && <Alert><p className="font-semibold text-status-error">{t("catalog.validationFailed")}</p>{Object.entries(validation).map(([field, messages]) => <div key={field} className="mt-2 text-sm"><strong>{field}</strong><ul className="list-disc pl-5">{messages.map((message) => <li key={message}>{message}</li>)}</ul></div>)}</Alert>}
          {canWrite && !isNew && <Button variant="outline" onClick={validate} disabled={busy || reason.trim().length < 3}>{t("catalog.validate")}</Button>}
          <Field label={t("common.reason")}><Textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} rows={3} /></Field>
          <div className="flex flex-wrap gap-2">
            {canPublish && !isNew && <Button onClick={publish} disabled={busy || reason.trim().length < 3}>{t("catalog.publish")}</Button>}
            {canArchive && !isNew && <Button variant="destructive" onClick={archive} disabled={busy || reason.trim().length < 3}>{t("catalog.archive")}</Button>}
          </div>
          <div className="border-t border-border-default pt-4"><p className="type-label text-text-secondary">{t("catalog.revisionHistory")}</p>
            {publications.length === 0 ? <p className="mt-2 text-sm text-text-secondary">{t("catalog.noPublications")}</p> : <div className="mt-2 space-y-2">{publications.map((publication) => <label key={publication.id} className="flex items-center gap-3 border border-border-default p-3"><input type="radio" name="revision" checked={selectedRevision === publication.id} onChange={() => setSelectedRevision(publication.id)} /><span className="flex-1">{t("catalog.revisionLabel").replace("{n}", String(publication.revision))} · {new Date(publication.published_at).toLocaleString()}</span><TechnicalLabel size="micro">{publication.publish_reason}</TechnicalLabel></label>)}</div>}
            {canPublish && publications.length > 0 && <Button className="mt-3" variant="outline" onClick={rollback} disabled={busy || !selectedRevision || reason.trim().length < 3}>{t("catalog.rollback")}</Button>}
          </div>
        </Section></TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
