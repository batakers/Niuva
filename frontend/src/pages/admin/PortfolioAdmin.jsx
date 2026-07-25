import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { api, formatApiError } from "../../lib/api";
import { AdminLayout } from "./AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export default function AdminPortfolio() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/portfolio").then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);
  
  const remove = async (id) => {
    try {
      await api.delete(`/admin/portfolio/${id}`);
      toast.success("RECORD_DELETED");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <AdminLayout title={t("admin.portfolio")} subtitle={t("portfolio.subtitle")}>
      <div className="flex justify-between items-center mb-6">
        <p className="type-label text-text-secondary">{t("portfolio.published")}: <span className="font-heading font-semibold text-text-primary">{items.length}</span></p>
        <Button data-testid="add-project-btn" onClick={() => setEditing({ title_id: "", title_en: "", client: "", category: "", description_id: "", description_en: "", images: [], featured: false })}>
          <Plus className="mr-2 h-4 w-4" /> {t("portfolio.addProject")}
        </Button>
      </div>

      {loading ? (
        <div className="rounded-panel border border-border-default bg-surface-default shadow-surface p-12 text-center">
          <p className="type-body-small text-text-secondary">{t("common.loading")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => (
            <div key={p.id} className="rounded-card border border-border-default bg-surface-default shadow-surface flex flex-col group overflow-hidden">
              <div className="relative aspect-video bg-surface-muted border-b border-border-default overflow-hidden">
                <img src={p.images?.[0]} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-2 left-2 rounded-control bg-surface-default/90 px-2 py-0.5 border border-border-default font-mono text-[10px] text-text-secondary">
                  {p.id.substring(0,6)}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="font-heading font-bold text-text-primary text-base tracking-tight">{lang === "id" ? p.title_id : p.title_en}</p>
                  <p className="type-body-small text-text-secondary mt-1">{p.category} / {p.client}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-border-default flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)} className="flex-1">
                    <Pencil className="h-3 w-3 mr-2" /> {t("common.edit")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)} aria-label={`${t("common.delete")}: ${lang === "id" ? p.title_id : p.title_en}`} className="shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground w-9 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full rounded-panel border border-dashed border-border-default bg-surface-page p-12 text-center">
              <p className="type-body-small text-text-secondary">{t("portfolio.empty")}</p>
            </div>
          )}
        </div>
      )}

      {editing && <PortfolioDialog item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </AdminLayout>
  );
}

function PortfolioDialog({ item, onClose, onSaved }) {
  const [form, setForm] = useState({ ...item, image: item.images?.[0] || "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    const payload = { title_id: form.title_id, title_en: form.title_en, client: form.client, category: form.category, description_id: form.description_id, description_en: form.description_en, images: form.image ? [form.image] : [], featured: form.featured };
    try {
      if (item.id) await api.put(`/admin/portfolio/${item.id}`, payload);
      else await api.post("/admin/portfolio", payload);
      toast.success("REGISTRY_UPDATED"); 
      onSaved();
    } catch (err) { 
      toast.error(formatApiError(err.response?.data?.detail)); 
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-panel border border-border-default bg-surface-default text-text-primary max-w-2xl max-h-[90vh] overflow-y-auto p-0 shadow-overlay">
        <div className="border-b border-border-default bg-surface-muted p-5 rounded-t-panel">
          <DialogHeader className="p-0 space-y-0 text-left">
            <DialogTitle className="type-label text-text-secondary mb-1">
              {t("admin.portfolio")}
            </DialogTitle>
            <h2 className="font-heading text-xl font-bold text-text-primary tracking-tight">
              {item.id ? t("portfolio.editProject") : t("portfolio.addProject")}
            </h2>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="type-label text-text-secondary">{t("portfolio.titleId")}</Label>
              <Input data-testid="portfolio-title-id" value={form.title_id} onChange={set("title_id")} />
            </div>
            <div className="space-y-1.5">
              <Label className="type-label text-text-secondary">{t("portfolio.titleEn")}</Label>
              <Input value={form.title_en} onChange={set("title_en")} />
            </div>
            <div className="space-y-1.5">
              <Label className="type-label text-text-secondary">{t("portfolio.client")}</Label>
              <Input value={form.client} onChange={set("client")} />
            </div>
            <div className="space-y-1.5">
              <Label className="type-label text-text-secondary">{t("portfolio.category")}</Label>
              <Input value={form.category} onChange={set("category")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="type-label text-text-secondary">{t("portfolio.descriptionId")}</Label>
            <Textarea value={form.description_id} onChange={set("description_id")} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="type-label text-text-secondary">{t("portfolio.descriptionEn")}</Label>
            <Textarea value={form.description_en} onChange={set("description_en")} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label className="type-label text-text-secondary">{t("portfolio.imageUrl")}</Label>
            <Input data-testid="portfolio-image" value={form.image} onChange={set("image")} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            <span className="type-body-small text-text-primary">{t("portfolio.markFeatured")}</span>
          </div>
        </div>

        <div className="border-t border-border-default bg-surface-page p-4 flex justify-end rounded-b-panel">
          <Button data-testid="save-portfolio" disabled={busy} onClick={save}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
