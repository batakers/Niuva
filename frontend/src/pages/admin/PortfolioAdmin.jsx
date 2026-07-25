import React, { useEffect, useState } from "react";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";

export default function AdminPortfolio() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/portfolio")
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/portfolio/${deleteTarget.id}`);
      toast.success(t("portfolio.deleted"));
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setDeleting(false);
    }
  };

  const openNew = () => {
    setEditing({
      title_id: "",
      title_en: "",
      client: "",
      category: "",
      description_id: "",
      description_en: "",
      images: [],
      featured: false,
    });
  };

  return (
    <AdminLayout
      title={t("admin.portfolio")}
      subtitle={t("portfolio.subtitle")}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="type-label text-text-secondary">
          {t("portfolio.published")}: {items.length}
        </p>
        <Button data-testid="add-project-btn" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> {t("portfolio.addProject")}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={FolderOpen} frame="dashed">{t("portfolio.empty")}</EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => (
            <SurfacePanel
              key={p.id}
              className={`flex flex-col group overflow-hidden border-l-4 p-0 ${
                p.featured ? "border-l-status-warning" : "border-l-border-default"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-video bg-surface-muted border-b border-border-default overflow-hidden">
                <img
                  src={p.images?.[0]}
                  alt=""
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="absolute top-2 left-2 rounded-control bg-surface-default/90 px-2 py-0.5 border border-border-default font-mono text-[10px] tabular-nums text-text-secondary">
                  {p.id.substring(0, 6)}
                </span>
                {p.featured && (
                  <TechnicalLabel
                    tone="warning"
                    className="absolute top-2 right-2 rounded-control bg-surface-default/90 px-2 py-0.5 border border-border-default"
                  >
                    {t("portfolio.featuredBadge")}
                  </TechnicalLabel>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="font-heading font-bold text-text-primary text-base tracking-tight">
                    {lang === "id" ? p.title_id : p.title_en}
                  </p>
                  <p className="type-body-small text-text-secondary mt-1">
                    {p.category} / {p.client}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-border-default flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(p)}
                    className="flex-1"
                  >
                    <Pencil className="h-3 w-3 mr-2" /> {t("common.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(p)}
                    aria-label={`${t("common.delete")}: ${lang === "id" ? p.title_id : p.title_en}`}
                    className="shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SurfacePanel>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editing && (
        <PortfolioDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("portfolio.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("portfolio.deleteConfirmDesc")}
              {deleteTarget && (
                <span className="mt-2 block font-semibold text-text-primary">
                  {lang === "id" ? deleteTarget.title_id : deleteTarget.title_en}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Portfolio Dialog
 * ────────────────────────────────────────────────────────────────────────── */

function PortfolioDialog({ item, onClose, onSaved }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    ...item,
    // One URL per line; preserves every image instead of dropping images[1..].
    imagesText: (item.images || []).join("\n"),
  });
  const [busy, setBusy] = useState(false);

  const updateField = (field) => (e) =>
    setForm((current) => ({ ...current, [field]: e.target.value }));

  const save = async () => {
    setBusy(true);
    const images = form.imagesText
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);
    const payload = {
      title_id: form.title_id,
      title_en: form.title_en,
      client: form.client,
      category: form.category,
      description_id: form.description_id,
      description_en: form.description_en,
      images,
      featured: form.featured,
    };
    try {
      if (item.id) {
        await api.put(`/admin/portfolio/${item.id}`, payload);
      } else {
        await api.post("/admin/portfolio", payload);
      }
      toast.success(t("portfolio.saved"));
      onSaved();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="border-b border-border-default bg-surface-muted p-5">
          <DialogHeader className="p-0 space-y-0 text-left">
            <DialogTitle className="type-label text-text-secondary mb-1">
              {t("admin.portfolio")}
            </DialogTitle>
            <h2 className="font-heading text-xl font-bold text-text-primary tracking-tight">
              {item.id ? t("portfolio.editProject") : t("portfolio.addProject")}
            </h2>
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("portfolio.titleId")}</Label>
              <Input
                data-testid="portfolio-title-id"
                value={form.title_id}
                onChange={updateField("title_id")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("portfolio.titleEn")}</Label>
              <Input value={form.title_en} onChange={updateField("title_en")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("portfolio.client")}</Label>
              <Input value={form.client} onChange={updateField("client")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("portfolio.category")}</Label>
              <Input value={form.category} onChange={updateField("category")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("portfolio.descriptionId")}</Label>
            <Textarea
              value={form.description_id}
              onChange={updateField("description_id")}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("portfolio.descriptionEn")}</Label>
            <Textarea
              value={form.description_en}
              onChange={updateField("description_en")}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("portfolio.imageUrls")}</Label>
            <Textarea
              data-testid="portfolio-image"
              value={form.imagesText}
              onChange={updateField("imagesText")}
              rows={4}
              placeholder={t("portfolio.imageUrlsHint")}
              className="font-mono text-xs"
            />
            <p className="type-body-small text-text-secondary">
              {t("portfolio.imageUrlsHint")}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              checked={form.featured}
              onCheckedChange={(v) =>
                setForm((current) => ({ ...current, featured: v }))
              }
            />
            <span className="type-body-small text-text-primary">
              {t("portfolio.markFeatured")}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border-default bg-surface-page p-4 flex justify-end">
          <Button data-testid="save-portfolio" disabled={busy} onClick={save}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
