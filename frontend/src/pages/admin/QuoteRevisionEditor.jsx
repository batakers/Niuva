import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OperationalState } from "@/components/ui/operational-state";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { rupiah } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";

// Money is held as an integer in the currency's minor unit. IDR is treated as
// zero-decimal, so a minor unit is one rupiah and no scaling is applied.
const SCOPE_FIELDS = [
  { key: "company", labelKey: "b2b.company", required: true },
  { key: "pic_name", labelKey: "b2b.pic", required: true },
  { key: "pic_email", labelKey: "b2b.picEmail", required: true, type: "email" },
  { key: "pic_phone", labelKey: "b2b.picPhone" },
  { key: "need", labelKey: "b2b.need", required: true },
  { key: "timeline", labelKey: "b2b.timeline" },
];

const EMPTY_ITEM = {
  description: "",
  quantity: "1",
  unit_price_minor: "0",
  variant_id: "",
};

function operationId() {
  return globalThis.crypto?.randomUUID?.() ||
    `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toInteger(value) {
  const parsed = Number.parseInt(String(value).replace(/[^\d-]/g, ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function lineTotal(item) {
  return toInteger(item.quantity) * toInteger(item.unit_price_minor);
}

export default function QuoteRevisionEditor() {
  const { id } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scope, setScope] = useState({});
  const [brief, setBrief] = useState("");
  const [items, setItems] = useState([]);
  const [variants, setVariants] = useState([]);
  const [reason, setReason] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get(`/admin/b2b/quotes/${id}`)
      .then((response) => {
        const record = response.data;
        const snapshot = record.current_version?.scope_snapshot || {};
        setQuote(record);
        setScope(snapshot);
        setBrief(snapshot.brief || "");
        setItems(
          (record.current_version?.items || []).map((item) => ({
            description: item.description || "",
            quantity: String(item.quantity ?? 1),
            unit_price_minor: String(item.unit_price_minor ?? 0),
            variant_id: item.variant_id || "",
          }))
        );
      })
      .catch((requestError) =>
        setError(formatApiError(requestError.response?.data?.detail))
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // A line without a variant carries no snapshot, so the catalog is loaded
    // even when the quotation currently has none: the choice has to exist
    // before anyone can make it.
    api
      .get("/admin/catalog/quotable-variants")
      .then((response) => setVariants(response.data || []))
      .catch(() => setVariants([]));
  }, []);

  const totalMinor = useMemo(
    () => items.reduce((sum, item) => sum + lineTotal(item), 0),
    [items]
  );

  const setScopeField = (key) => (event) =>
    setScope((current) => ({ ...current, [key]: event.target.value }));

  const setItemField = (index, key) => (event) =>
    setItems((current) =>
      current.map((item, position) =>
        position === index ? { ...item, [key]: event.target.value } : item
      )
    );

  const chooseVariant = (index) => (event) => {
    const variantId = event.target.value;
    const chosen = variants.find((item) => item.variant_id === variantId);
    setItems((current) =>
      current.map((item, position) => {
        if (position !== index) return item;
        if (!chosen) return { ...item, variant_id: "" };
        return {
          ...item,
          variant_id: variantId,
          // Seeded from the catalog, and still editable: a quotation may
          // describe or price a line differently from the shelf. The server
          // takes its own snapshot regardless of what is typed here.
          description:
            item.description.trim() ||
            `${chosen.product_name} · ${chosen.variant_name}`.trim(),
          unit_price_minor:
            toInteger(item.unit_price_minor) > 0
              ? item.unit_price_minor
              : String(chosen.fixed_price ?? 0),
        };
      })
    );
  };

  const addItem = () => setItems((current) => [...current, { ...EMPTY_ITEM }]);
  const removeItem = (index) =>
    setItems((current) => current.filter((_, position) => position !== index));

  const submit = async (event) => {
    event.preventDefault();

    if (reason.trim().length < 3) {
      toast.error(t("b2b.reasonRequired"));
      return;
    }
    const missing = SCOPE_FIELDS.filter(
      (field) => field.required && !String(scope[field.key] || "").trim()
    );
    if (missing.length > 0) {
      toast.error(t("b2b.revisionScopeIncomplete"));
      return;
    }
    if (items.some((item) => !item.description.trim())) {
      toast.error(t("b2b.revisionItemIncomplete"));
      return;
    }
    if (items.some((item) => toInteger(item.quantity) < 1)) {
      toast.error(t("b2b.revisionQuantityInvalid"));
      return;
    }
    if (items.some((item) => toInteger(item.unit_price_minor) < 0)) {
      toast.error(t("b2b.revisionPriceInvalid"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post(`/admin/b2b/quotes/${id}/versions`, {
        expected_version: quote.version,
        operation_id: operationId(),
        reason: reason.trim(),
        scope_snapshot: {
          ...SCOPE_FIELDS.reduce(
            (snapshot, field) => ({
              ...snapshot,
              [field.key]: String(scope[field.key] || "").trim(),
            }),
            {}
          ),
          brief: brief.trim(),
        },
        items: items.map((item) => ({
          description: item.description.trim(),
          quantity: toInteger(item.quantity),
          unit_price_minor: toInteger(item.unit_price_minor),
          // A line without a variant carries no snapshot, which is a valid
          // choice for bespoke work the catalog does not describe.
          variant_id: item.variant_id || null,
        })),
        // Line totals and the sum are derived server-side from the lines. The
        // figures shown above are a preview, never the stored truth.
        // An unpriced revision stays explicitly unpriced rather than free.
        total_minor: items.length === 0 ? null : totalMinor,
      });
      toast.success(t("b2b.revisionCreated"));
      navigate(`/admin/b2b/quotes/${id}`);
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = (
    <Link
      to={`/admin/b2b/quotes/${id}`}
      className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-action-primary"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {t("common.back")}
    </Link>
  );

  if (loading) {
    return (
      <AdminLayout title={t("b2b.revisionEditor")}>
        <OperationalState state="loading" title={t("common.loading")} />
      </AdminLayout>
    );
  }

  if (error && !quote) {
    return (
      <AdminLayout title={t("b2b.revisionEditor")}>
        <OperationalState
          state="error"
          title={t("b2b.loadFailed")}
          description={error}
          retryLabel={t("common.retry")}
          onRetry={load}
        />
      </AdminLayout>
    );
  }

  // The backend only accepts a revision from revision_requested. Saying so up
  // front beats letting the operator fill a long form and lose it to a 409.
  if (quote.status !== "revision_requested") {
    return (
      <AdminLayout title={t("b2b.revisionEditor")}>
        {backLink}
        <OperationalState
          state="conflict"
          title={t("b2b.revisionNotOpen")}
          description={t("b2b.revisionNotOpenBody")}
          retryLabel={t("common.retry")}
          onRetry={load}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("b2b.revisionEditor")}
      subtitle={`${t("b2b.revision")} ${quote.current_revision} · ${t("b2b.version")} ${quote.version}`}
    >
      {backLink}

      {error && (
        <OperationalState
          state="conflict"
          title={t("b2b.commandFailed")}
          description={error}
          retryLabel={t("common.retry")}
          onRetry={load}
          className="mb-5 min-h-0"
        />
      )}

      <form onSubmit={submit} data-testid="quote-revision-form">
        <SurfacePanel className="mb-5">
          <SurfacePanelHeader>
            <p className="type-label text-action-primary">{t("b2b.revisionScope")}</p>
            <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
              {t("b2b.revisionScopeTitle")}
            </h2>
          </SurfacePanelHeader>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            {SCOPE_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={`scope-${field.key}`} className="text-sm font-semibold">
                  {t(field.labelKey)}
                </Label>
                <Input
                  id={`scope-${field.key}`}
                  data-testid={`scope-${field.key}`}
                  type={field.type || "text"}
                  value={scope[field.key] || ""}
                  onChange={setScopeField(field.key)}
                  required={field.required}
                  aria-required={field.required ? "true" : undefined}
                  className="min-h-11"
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="scope-brief" className="text-sm font-semibold">
                {t("b2b.brief")}
              </Label>
              <Textarea
                id="scope-brief"
                data-testid="scope-brief"
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                rows={5}
              />
            </div>
          </div>
        </SurfacePanel>

        <SurfacePanel className="mb-5">
          <SurfacePanelHeader className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="type-label text-action-primary">{t("b2b.revisionItems")}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">
                {t("b2b.revisionItemsTitle")}
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={addItem}
              data-testid="add-item"
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("b2b.revisionAddItem")}
            </Button>
          </SurfacePanelHeader>

          {items.length === 0 ? (
            <p className="p-5 text-sm leading-6 text-text-secondary">
              {t("b2b.revisionNoItems")}
            </p>
          ) : (
            <ul className="divide-y divide-border-default">
              {items.map((item, index) => (
                <li key={index} className="grid gap-4 p-5">
                  <div className="space-y-2">
                    <Label htmlFor={`item-variant-${index}`} className="text-sm font-semibold">
                      {t("b2b.revisionItemVariant")}
                    </Label>
                    <select
                      id={`item-variant-${index}`}
                      data-testid={`item-variant-${index}`}
                      value={item.variant_id || ""}
                      onChange={chooseVariant(index)}
                      className="brand-field h-11 w-full rounded-control border border-border-default bg-surface-default px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    >
                      <option value="">{t("b2b.revisionItemNoVariant")}</option>
                      {variants.map((variant) => (
                        <option key={variant.variant_id} value={variant.variant_id}>
                          {variant.product_name} · {variant.sku}
                          {variant.bill_of_materials_lines > 0
                            ? ` · ${variant.bill_of_materials_lines} ${t("workOrder.materials").toLowerCase()}`
                            : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs leading-5 text-text-secondary">
                      {item.variant_id
                        ? t("b2b.revisionItemSnapshotNote")
                        : t("b2b.revisionItemNoSnapshotNote")}
                    </p>
                  </div>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_6rem_10rem_auto] sm:items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`item-description-${index}`} className="text-sm font-semibold">
                      {t("b2b.revisionItemDescription")}
                    </Label>
                    <Input
                      id={`item-description-${index}`}
                      data-testid={`item-description-${index}`}
                      value={item.description}
                      onChange={setItemField(index, "description")}
                      className="min-h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-quantity-${index}`} className="text-sm font-semibold">
                      {t("b2b.revisionItemQuantity")}
                    </Label>
                    <Input
                      id={`item-quantity-${index}`}
                      data-testid={`item-quantity-${index}`}
                      inputMode="numeric"
                      value={item.quantity}
                      onChange={setItemField(index, "quantity")}
                      className="min-h-11 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-price-${index}`} className="text-sm font-semibold">
                      {t("b2b.revisionItemPrice")}
                    </Label>
                    <Input
                      id={`item-price-${index}`}
                      data-testid={`item-price-${index}`}
                      inputMode="numeric"
                      value={item.unit_price_minor}
                      onChange={setItemField(index, "unit_price_minor")}
                      className="min-h-11 font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <p className="font-mono text-sm text-text-primary" data-testid={`item-total-${index}`}>
                      {rupiah(lineTotal(item))}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 min-w-11"
                      onClick={() => removeItem(index)}
                      aria-label={t("b2b.revisionRemoveItem")}
                      data-testid={`remove-item-${index}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-border-default bg-surface-muted px-5 py-4">
            <p className="type-label text-text-secondary">{t("b2b.total")}</p>
            <p className="font-mono text-base font-semibold text-text-primary" data-testid="revision-total">
              {items.length === 0 ? t("b2b.notPriced") : rupiah(totalMinor)}
            </p>
          </div>
        </SurfacePanel>

        <SurfacePanel padding="md">
          <div className="space-y-2">
            <Label htmlFor="revision-reason" className="text-sm font-semibold">
              {t("b2b.reason")}
            </Label>
            <Input
              id="revision-reason"
              data-testid="revision-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("b2b.reasonPlaceholder")}
              required
              aria-required="true"
              className="min-h-11"
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            {t("b2b.revisionImmutableNote")}
          </p>
          <Button
            type="submit"
            className="mt-5 min-h-11 w-full sm:w-auto"
            loading={submitting}
            data-testid="submit-revision"
          >
            {t("b2b.revisionSubmit")}
          </Button>
        </SurfacePanel>
      </form>
    </AdminLayout>
  );
}
