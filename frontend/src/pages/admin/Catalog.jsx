import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Edit3, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TechnicalLabel } from "../../components/ui/technical-label";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";
import { formatApiError } from "../../lib/api";
import { catalogApi, visibleCatalogActions } from "../../lib/catalog";
import { AdminLayout } from "./AdminLayout";


const initialFilters = {
  search: "",
  category: "all",
  workflow: "all",
  pricing: "all",
  stock: "all",
  archive: "active",
};

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="space-y-1">
      <TechnicalLabel as="span" size="micro">{label}</TechnicalLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full border border-border bg-background px-3 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {children}
      </select>
    </label>
  );
}

export default function Catalog() {
  const { t } = useI18n();
  const { user } = useAuth();
  const actions = visibleCatalogActions(user?.permissions || []);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");
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

  useEffect(() => { load(); }, [load]);

  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories],
  );
  const filtered = useMemo(() => products.filter((product) => {
    const search = filters.search.trim().toLowerCase();
    const matchesSearch = !search || [product.name, product.slug].some((value) => String(value || "").toLowerCase().includes(search));
    const matchesCategory = filters.category === "all" || product.category_id === filters.category;
    const matchesWorkflow = filters.workflow === "all" || product.workflow_status === filters.workflow;
    const matchesPricing = filters.pricing === "all" || product.pricing_mode === filters.pricing;
    const matchesStock = filters.stock === "all" || product.stock_visibility === filters.stock;
    const matchesArchive = filters.archive === "all"
      || (filters.archive === "archived" ? product.workflow_status === "archived" : product.workflow_status !== "archived");
    return matchesSearch && matchesCategory && matchesWorkflow && matchesPricing && matchesStock && matchesArchive;
  }), [filters, products]);

  const changeFilter = (key) => (valueOrEvent) => {
    const value = valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent;
    setFilters((current) => ({ ...current, [key]: value }));
  };

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

  return (
    <AdminLayout title={t("admin.catalog")} subtitle={t("catalog.subtitle")}>
      <SurfacePanel>
        <SurfacePanelHeader padding="sm" className="flex flex-wrap items-center justify-between gap-3">
          <TechnicalLabel>{t("catalog.registry")}</TechnicalLabel>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> {t("common.refresh")}
            </Button>
            {actions.includes("create") && (
              <Button asChild variant="technical" size="sm">
                <Link to="/admin/catalog/new"><Plus className="mr-2 h-4 w-4" />{t("catalog.create")}</Link>
              </Button>
            )}
          </div>
        </SurfacePanelHeader>
        <div className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
          <label className="space-y-1 md:col-span-2">
            <TechnicalLabel as="span" size="micro">{t("common.search")}</TechnicalLabel>
            <Input value={filters.search} onChange={changeFilter("search")} placeholder={t("catalog.searchPlaceholder")} />
          </label>
          <FilterSelect label={t("catalog.category")} value={filters.category} onChange={changeFilter("category")}>
            <option value="all">{t("common.all")}</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </FilterSelect>
          <FilterSelect label={t("catalog.workflow")} value={filters.workflow} onChange={changeFilter("workflow")}>
            <option value="all">{t("common.all")}</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
          </FilterSelect>
          <FilterSelect label={t("catalog.pricingMode")} value={filters.pricing} onChange={changeFilter("pricing")}>
            <option value="all">{t("common.all")}</option><option value="fixed">Fixed</option><option value="calculated">Calculated</option><option value="quote_required">Quote required</option>
          </FilterSelect>
          <FilterSelect label={t("catalog.stockPolicy")} value={filters.stock} onChange={changeFilter("stock")}>
            <option value="all">{t("common.all")}</option><option value="status_only">Status only</option><option value="made_to_order">Made to order</option>
          </FilterSelect>
        </div>
      </SurfacePanel>

      <SurfacePanel className="mt-4">
        {loading ? (
          <EmptyState frame="solid">{t("common.loading")}</EmptyState>
        ) : error ? (
          <EmptyState frame="dashed"><span role="alert">{error}</span></EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState frame="dashed">{t("catalog.empty")}</EmptyState>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t("catalog.product")}</TableHead><TableHead>{t("catalog.category")}</TableHead>
              <TableHead>{t("catalog.variants")}</TableHead><TableHead>{t("catalog.pricingMode")}</TableHead>
              <TableHead>{t("catalog.publication")}</TableHead><TableHead>{t("catalog.stockPolicy")}</TableHead>
              <TableHead>{t("common.updated")}</TableHead><TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>{filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell><div className="font-semibold text-foreground">{product.name}</div><TechnicalLabel size="micro">/{product.slug}</TechnicalLabel></TableCell>
                <TableCell>{categoryById[product.category_id]?.name || "—"}</TableCell>
                <TableCell>{product.active_variant_count ?? "—"}</TableCell>
                <TableCell>{product.pricing_mode}</TableCell>
                <TableCell><TechnicalLabel tone={product.active_publication_id ? "success" : "muted"}>{product.workflow_status || "draft"}</TechnicalLabel></TableCell>
                <TableCell>{product.stock_visibility}</TableCell>
                <TableCell className="whitespace-nowrap">{product.updated_at ? new Date(product.updated_at).toLocaleString() : "—"}</TableCell>
                <TableCell><div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="sm" aria-label={`${t("common.open")} ${product.name}`}>
                    <Link to={`/admin/catalog/${product.id}`}><Edit3 className="h-4 w-4" /></Link>
                  </Button>
                  {actions.includes("archive") && product.workflow_status !== "archived" && (
                    <Button variant="ghost" size="sm" onClick={() => setArchiveTarget(product)} aria-label={`${t("catalog.archive")} ${product.name}`}><Archive className="h-4 w-4" /></Button>
                  )}
                </div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </SurfacePanel>

      <Dialog open={Boolean(archiveTarget)} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("catalog.archive")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{archiveTarget?.name}</p>
          <label className="space-y-1"><TechnicalLabel>{t("common.reason")}</TechnicalLabel><Input value={archiveReason} onChange={(event) => setArchiveReason(event.target.value)} minLength={3} maxLength={500} /></label>
          <DialogFooter><Button variant="outline" onClick={() => setArchiveTarget(null)}>{t("common.cancel")}</Button><Button variant="destructive" disabled={busy || archiveReason.trim().length < 3} onClick={archive}>{t("catalog.archive")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
