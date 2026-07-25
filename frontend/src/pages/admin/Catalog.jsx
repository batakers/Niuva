import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Edit3, Plus, RefreshCw } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatApiError } from "@/lib/api";
import {
  buildCategoryPayload,
  catalogApi,
  categoryDraftFrom,
  emptyCategoryDraft,
  validCategoryDraft,
  visibleCatalogActions,
} from "@/lib/catalog";
import { AdminLayout } from "./AdminLayout";

const initialFilters = {
  search: "",
  category: "all",
  workflow: "all",
  pricing: "all",
  stock: "all",
  archive: "active",
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export default function Catalog() {
  const { t } = useI18n();
  const { user } = useAuth();
  const actions = visibleCatalogActions(user?.permissions || []);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Archive states
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");

  // Category states
  const [categoryEditor, setCategoryEditor] = useState(null);
  const [categoryArchiveTarget, setCategoryArchiveTarget] = useState(null);
  const [categoryArchiveReason, setCategoryArchiveReason] = useState("");

  // Bulk states
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);
  const [bulkReason, setBulkReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productRows, categoryRows] = await Promise.all([
        catalogApi.listProducts(),
        catalogApi.listCategories(),
      ]);
      setProducts(productRows);
      setCategories(categoryRows);
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories]
  );

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const search = filters.search.trim().toLowerCase();
        const matchesSearch =
          !search ||
          [product.name, product.slug].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(search)
          );
        const matchesCategory =
          filters.category === "all" || product.category_id === filters.category;
        const matchesWorkflow =
          filters.workflow === "all" || product.workflow_status === filters.workflow;
        const matchesPricing =
          filters.pricing === "all" || product.pricing_mode === filters.pricing;
        const matchesStock =
          filters.stock === "all" || product.stock_visibility === filters.stock;
        const matchesArchive =
          filters.archive === "all" ||
          (filters.archive === "archived"
            ? product.workflow_status === "archived"
            : product.workflow_status !== "archived");
        return (
          matchesSearch &&
          matchesCategory &&
          matchesWorkflow &&
          matchesPricing &&
          matchesStock &&
          matchesArchive
        );
      }),
    [filters, products]
  );

  const changeFilter = (key) => (value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const changeFilterEvent = (key) => (event) => {
    setFilters((current) => ({ ...current, [key]: event.target.value }));
  };

  // Archive single product
  const archive = async () => {
    if (archiveReason.trim().length < 3) return;
    setBusy(true);
    try {
      await catalogApi.archiveProduct(archiveTarget.id, archiveReason.trim());
      toast.success(t("catalog.archiveSuccess"));
      setArchiveTarget(null);
      setArchiveReason("");
      await load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  // Bulk selection
  const archivableIds = useMemo(
    () =>
      filtered
        .filter((product) => product.workflow_status !== "archived")
        .map((product) => product.id),
    [filtered]
  );
  const selectedInView = selectedIds.filter((id) => archivableIds.includes(id));

  const toggleOne = (id) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelectedIds((current) =>
      selectedInView.length === archivableIds.length
        ? current.filter((id) => !archivableIds.includes(id))
        : [...new Set([...current, ...archivableIds])]
    );

  // Bulk archive
  const bulkArchive = async () => {
    if (bulkReason.trim().length < 3) return;
    setBusy(true);
    try {
      const { results } = await catalogApi.bulkArchiveProducts(
        selectedInView,
        bulkReason.trim()
      );
      const failed = results.filter((row) => !row.success).length;
      if (failed === 0) {
        toast.success(t("catalog.bulkArchiveSuccess"));
      } else {
        toast.warning(`${results.length - failed} berhasil, ${failed} gagal.`);
      }
      setBulkArchiveOpen(false);
      setBulkReason("");
      setSelectedIds([]);
      await load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  // Category CRUD
  const saveCategory = async () => {
    if (!validCategoryDraft(categoryEditor?.form)) return;
    setBusy(true);
    try {
      const payload = buildCategoryPayload(categoryEditor.form);
      if (categoryEditor.id) {
        await catalogApi.updateCategory(categoryEditor.id, payload);
      } else {
        await catalogApi.createCategory(payload);
      }
      toast.success(t("catalog.categorySaveSuccess"));
      setCategoryEditor(null);
      await load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const archiveCategory = async () => {
    if (categoryArchiveReason.trim().length < 3) return;
    setBusy(true);
    try {
      await catalogApi.archiveCategory(
        categoryArchiveTarget.id,
        categoryArchiveReason.trim()
      );
      toast.success(t("catalog.categoryArchiveSuccess"));
      setCategoryArchiveTarget(null);
      setCategoryArchiveReason("");
      await load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title={t("admin.catalog")} subtitle={t("catalog.subtitle")}>
      {/* Categories Panel */}
      <SurfacePanel>
        <SurfacePanelHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <TechnicalLabel>{t("catalog.categoryRegistry")}</TechnicalLabel>
            <p className="mt-1 text-sm text-text-secondary">
              {t("catalog.categoryHint")}
            </p>
          </div>
          {actions.includes("create") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCategoryEditor({ id: null, form: emptyCategoryDraft() })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("catalog.addCategory")}
            </Button>
          )}
        </SurfacePanelHeader>

        {loading ? (
          <EmptyState>{t("common.loading")}</EmptyState>
        ) : categories.length === 0 ? (
          <EmptyState>{t("catalog.noCategories")}</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("catalog.category")}</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("catalog.displayOrder")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="font-semibold text-text-primary">
                      {category.name}
                    </div>
                    <span className="text-sm text-text-secondary">
                      {category.description || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TechnicalLabel size="micro">/{category.slug}</TechnicalLabel>
                  </TableCell>
                  <TableCell>
                    <TechnicalLabel
                      tone={category.status === "active" ? "success" : "muted"}
                    >
                      {category.status}
                    </TechnicalLabel>
                  </TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {actions.includes("edit") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCategoryEditor({
                              id: category.id,
                              form: categoryDraftFrom(category),
                            })
                          }
                          aria-label={`${t("catalog.editCategory")} ${category.name}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {actions.includes("archive") &&
                        category.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCategoryArchiveTarget(category)}
                            aria-label={`${t("catalog.archiveCategory")} ${category.name}`}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SurfacePanel>

      {/* Products Filter Panel */}
      <SurfacePanel className="mt-4">
        <SurfacePanelHeader className="flex flex-wrap items-center justify-between gap-3">
          <TechnicalLabel>{t("catalog.registry")}</TechnicalLabel>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
            {actions.includes("create") && (
              <Button asChild size="sm">
                <Link to="/admin/catalog/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("catalog.create")}
                </Link>
              </Button>
            )}
          </div>
        </SurfacePanelHeader>

        <div className="grid gap-4 p-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="space-y-1.5 md:col-span-2">
            <Label>{t("common.search")}</Label>
            <Input
              value={filters.search}
              onChange={changeFilterEvent("search")}
              placeholder={t("catalog.searchPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("catalog.category")}</Label>
            <Select value={filters.category} onValueChange={changeFilter("category")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t("catalog.workflow")}</Label>
            <Select value={filters.workflow} onValueChange={changeFilter("workflow")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t("catalog.pricingMode")}</Label>
            <Select value={filters.pricing} onValueChange={changeFilter("pricing")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="calculated">Calculated</SelectItem>
                <SelectItem value="quote_required">Quote required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t("catalog.stockPolicy")}</Label>
            <Select value={filters.stock} onValueChange={changeFilter("stock")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="status_only">Status only</SelectItem>
                <SelectItem value="made_to_order">Made to order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SurfacePanel>

      {/* Bulk Selection Bar */}
      {actions.includes("archive") && selectedInView.length > 0 && (
        <SurfacePanel className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <TechnicalLabel>
              {selectedInView.length} {t("catalog.selectedCount")}
            </TechnicalLabel>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkArchiveOpen(true)}
              >
                <Archive className="mr-2 h-4 w-4" />
                {t("catalog.bulkArchive")}
              </Button>
            </div>
          </div>
        </SurfacePanel>
      )}

      {/* Products Table */}
      <SurfacePanel className="mt-4">
        {loading ? (
          <EmptyState>{t("common.loading")}</EmptyState>
        ) : error ? (
          <EmptyState>
            <span role="alert">{error}</span>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>{t("catalog.empty")}</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {actions.includes("archive") && (
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label={t("catalog.selectAll")}
                      checked={
                        archivableIds.length > 0 &&
                        selectedInView.length === archivableIds.length
                      }
                      onChange={toggleAll}
                      disabled={archivableIds.length === 0}
                    />
                  </TableHead>
                )}
                <TableHead>{t("catalog.product")}</TableHead>
                <TableHead>{t("catalog.category")}</TableHead>
                <TableHead>{t("catalog.variants")}</TableHead>
                <TableHead>{t("catalog.pricingMode")}</TableHead>
                <TableHead>{t("catalog.publication")}</TableHead>
                <TableHead>{t("catalog.stockPolicy")}</TableHead>
                <TableHead>{t("common.updated")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  {actions.includes("archive") && (
                    <TableCell>
                      {product.workflow_status !== "archived" && (
                        <input
                          type="checkbox"
                          aria-label={`${t("catalog.select")} ${product.name}`}
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleOne(product.id)}
                        />
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="font-semibold text-text-primary">
                      {product.name}
                    </div>
                    <TechnicalLabel size="micro">/{product.slug}</TechnicalLabel>
                  </TableCell>
                  <TableCell>
                    {categoryById[product.category_id]?.name || "—"}
                  </TableCell>
                  <TableCell>{product.active_variant_count ?? "—"}</TableCell>
                  <TableCell>{product.pricing_mode}</TableCell>
                  <TableCell>
                    <TechnicalLabel
                      tone={product.active_publication_id ? "success" : "muted"}
                    >
                      {product.workflow_status || "draft"}
                    </TechnicalLabel>
                  </TableCell>
                  <TableCell>{product.stock_visibility}</TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {product.updated_at
                      ? new Date(product.updated_at).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        aria-label={`${t("common.open")} ${product.name}`}
                      >
                        <Link to={`/admin/catalog/${product.id}`}>
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </Button>
                      {actions.includes("archive") &&
                        product.workflow_status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setArchiveTarget(product)}
                            aria-label={`${t("catalog.archive")} ${product.name}`}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SurfacePanel>

      {/* Dialogs */}
      <CategoryEditorDialog
        value={categoryEditor}
        busy={busy}
        onChange={setCategoryEditor}
        onClose={() => setCategoryEditor(null)}
        onSave={saveCategory}
      />
      <ReasonDialog
        open={Boolean(categoryArchiveTarget)}
        title={t("catalog.archiveCategory")}
        target={categoryArchiveTarget?.name}
        reason={categoryArchiveReason}
        setReason={setCategoryArchiveReason}
        busy={busy}
        onClose={() => setCategoryArchiveTarget(null)}
        onConfirm={archiveCategory}
        confirmLabel={t("catalog.archiveCategory")}
      />
      <ReasonDialog
        open={Boolean(archiveTarget)}
        title={t("catalog.archive")}
        target={archiveTarget?.name}
        reason={archiveReason}
        setReason={setArchiveReason}
        busy={busy}
        onClose={() => setArchiveTarget(null)}
        onConfirm={archive}
        confirmLabel={t("catalog.archive")}
      />
      <ReasonDialog
        open={bulkArchiveOpen}
        title={t("catalog.bulkArchive")}
        target={`${selectedInView.length} ${t("catalog.selectedCount")}`}
        reason={bulkReason}
        setReason={setBulkReason}
        busy={busy}
        onClose={() => setBulkArchiveOpen(false)}
        onConfirm={bulkArchive}
        confirmLabel={t("catalog.bulkArchive")}
      />
    </AdminLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Category Editor Dialog
 * ────────────────────────────────────────────────────────────────────────── */

function CategoryEditorDialog({ value, busy, onChange, onClose, onSave }) {
  const { t } = useI18n();
  if (!value) return null;

  const updateField = (field) => (event) =>
    onChange({ ...value, form: { ...value.form, [field]: event.target.value } });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {value.id ? t("catalog.editCategory") : t("catalog.addCategory")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>{t("catalog.categoryName")}</Label>
            <Input
              value={value.form.name}
              onChange={updateField("name")}
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              value={value.form.slug}
              onChange={updateField("slug")}
              maxLength={200}
              placeholder={t("catalog.slugAutoHint")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("catalog.categoryDescription")}</Label>
            <Textarea
              value={value.form.description}
              onChange={updateField("description")}
              maxLength={2000}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("catalog.displayOrder")}</Label>
            <Input
              value={value.form.sort_order}
              onChange={updateField("sort_order")}
              type="number"
              min="0"
              step="1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={busy || !validCategoryDraft(value.form)} onClick={onSave}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Reason Dialog (Archive)
 * ────────────────────────────────────────────────────────────────────────── */

function ReasonDialog({
  open,
  title,
  target,
  reason,
  setReason,
  busy,
  onClose,
  onConfirm,
  confirmLabel,
}) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-text-secondary">{target}</p>

        <div className="space-y-1.5">
          <Label>{t("common.reason")}</Label>
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            minLength={3}
            maxLength={500}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={busy || reason.trim().length < 3}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
