import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

import { StatusBadge } from "@/components/operational/StatusStepper";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

export default function AdminPortfolio() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const canWrite = hasPermission(user, "content.write");
  const canArchive = hasPermission(user, "content.archive");
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/portfolio")
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const move = async (index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const ordered = items.map((entry) => entry.id);
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setReordering(true);
    try {
      // The whole sequence goes up, never a single swap: the server rejects a
      // partial order, so two people reordering at once cannot interleave.
      const { data } = await api.post("/admin/portfolio/reorder", {
        ordered_ids: ordered,
        expected_versions: Object.fromEntries(
          items.map((entry) => [entry.id, entry.version]),
        ),
      });
      setItems(data);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setReordering(false);
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.post(`/admin/portfolio/${deleteTarget.id}/transitions`, {
        target_status: "archived",
        expected_version: deleteTarget.version,
        reason: t("portfolio.archiveReason"),
      });
      toast.success(t("portfolio.archived"));
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
        {canWrite && (
          <Button data-testid="add-project-btn" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> {t("portfolio.addProject")}
          </Button>
        )}
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
          {items.map((p, index) => (
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
                  <h3 className="font-heading text-lg font-bold text-text-primary tracking-tight">
                    {lang === "id" ? p.title_id : p.title_en}
                  </h3>
                  <div className="mt-2">
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="type-body-small text-text-secondary mt-1">
                    {p.category}
                  </p>
                </div>

                <div className="mt-auto space-y-2 border-t border-border-default pt-4">
                  {/* Buttons, not drag handles: reordering has to be reachable
                      by keyboard, and each press sends the whole sequence so a
                      concurrent reorder cannot interleave. */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-text-disabled">
                      #{index + 1}
                    </span>
                    {canWrite && <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-11 w-11"
                        disabled={index === 0 || reordering}
                        onClick={() => move(index, -1)}
                        aria-label={`${t("portfolio.moveUp")}: ${lang === "id" ? p.title_id : p.title_en}`}
                        data-testid={`portfolio-move-up-${p.id}`}
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-11 w-11"
                        disabled={index === items.length - 1 || reordering}
                        onClick={() => move(index, 1)}
                        aria-label={`${t("portfolio.moveDown")}: ${lang === "id" ? p.title_id : p.title_en}`}
                        data-testid={`portfolio-move-down-${p.id}`}
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>}
                  </div>
                  <Link
                    to={`/admin/portfolio/${p.id}`}
                    className="inline-flex min-h-11 w-full items-center justify-between rounded-control border border-border-default px-3 text-sm font-semibold text-action-primary"
                    data-testid={`portfolio-open-${p.id}`}
                  >
                    {t("portfolio.openLifecycle")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                {(canWrite || canArchive) && <div className="flex gap-2">
                  {canWrite && ["draft", "review", "preview"].includes(p.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(p)}
                    className="flex-1"
                  >
                    <Pencil className="h-3 w-3 mr-2" /> {t("common.edit")}
                  </Button>
                  )}
                  {canArchive && p.status !== "archived" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteTarget(p)}
                    aria-label={`${t("common.delete")}: ${lang === "id" ? p.title_id : p.title_en}`}
                    className="shrink-0 h-11 w-11 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  )}
                </div>}
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
      {canArchive && <AlertDialog
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
      </AlertDialog>}
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
      category: form.category,
      description_id: form.description_id,
      description_en: form.description_en,
      images,
      featured: form.featured,
    };
    try {
      if (item.id) {
        // Editing an entry appends a revision, so it carries the version it
        // was read at and the reason the change was made.
        await api.put(`/admin/portfolio/${item.id}`, {
          ...payload,
          expected_version: item.version,
          reason: form.reason?.trim() || "",
        });
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
        <div className="border-b border-border-default bg-surface-muted p-6">
          <DialogHeader className="p-0 space-y-0 text-left">
            <DialogTitle className="type-label text-text-secondary mb-1">
              {t("admin.portfolio")}
            </DialogTitle>
            <h2 className="font-heading text-2xl font-bold text-text-primary tracking-tight">
              {item.id ? t("portfolio.editProject") : t("portfolio.addProject")}
            </h2>
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t("portfolio.titleId")}>
              <Input
                data-testid="portfolio-title-id"
                value={form.title_id}
                onChange={updateField("title_id")}
              />
            </FormField>
            <FormField label={t("portfolio.titleEn")}>
              <Input value={form.title_en} onChange={updateField("title_en")} />
            </FormField>
            <FormField label={t("portfolio.category")}>
              <Input value={form.category} onChange={updateField("category")} />
            </FormField>
          </div>

          {/* Every edit appends a revision, so it needs a stated reason. */}
          {item.id && (
            <FormField label={t("b2b.reason")}>
              <Input
                data-testid="portfolio-reason"
                value={form.reason || ""}
                onChange={updateField("reason")}
                placeholder={t("b2b.reasonPlaceholder")}
              />
            </FormField>
          )}

          <FormField label={t("portfolio.descriptionId")}>
            <Textarea
              value={form.description_id}
              onChange={updateField("description_id")}
              rows={3}
            />
          </FormField>

          <FormField label={t("portfolio.descriptionEn")}>
            <Textarea
              value={form.description_en}
              onChange={updateField("description_en")}
              rows={3}
            />
          </FormField>

          <FormField label={t("portfolio.imageUrls")} hint={t("portfolio.imageUrlsHint")}>
            <Textarea
              data-testid="portfolio-image"
              value={form.imagesText}
              onChange={updateField("imagesText")}
              rows={4}
              placeholder={t("portfolio.imageUrlsHint")}
              className="font-mono text-xs"
            />
          </FormField>

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
