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
import { EmptyState } from "../../components/ui/empty-state";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { TechnicalLabel } from "../../components/ui/technical-label";

export default function AdminMaterials() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/materials").then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await api.delete(`/admin/materials/${id}`);
    load();
    toast.success("SYSTEM_UPDATED");
  };

  return (
    <AdminLayout title={t("admin.materials")} subtitle="Material Specifications Database">
      <div className="flex justify-between items-end mb-6">
        <TechnicalLabel className="border border-border bg-surface-1 px-3 py-1">
          AVAILABLE_CONFIGS // {items.length}
        </TechnicalLabel>
        <Button data-testid="add-material-btn" onClick={() => setEditing({ name: "", description: "", color: "", active: true })} variant="technical" size="sm" className="h-9 px-4">
          <Plus className="mr-2 h-4 w-4" /> ADD_MATERIAL
        </Button>
      </div>

      {loading ? (
        <EmptyState frame="solid">[ FETCHING_DATA... ]</EmptyState>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => (
            <SurfacePanel key={m.id} className="relative group" data-testid={`material-card-${m.name}`}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-tight">{m.name}</h3>
                    <TechnicalLabel size="micro" tone={m.active ? "success" : "muted"} className={`inline-block mt-1 px-2 py-0.5 border ${
                      m.active ? "border-status-success/50 bg-status-success/10" : "border-border bg-surface-2"
                    }`}>
                      {m.active ? "STATUS_ACTIVE" : "STATUS_INACTIVE"}
                    </TechnicalLabel>
                  </div>
                  <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity border border-border bg-background p-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(m)} className="text-foreground hover:bg-surface-2 hover:text-primary rounded-none h-6 w-6 p-0">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(m.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-none h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed h-10 line-clamp-2">{m.description}</p>

                {m.color && (
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2">
                    <TechnicalLabel>COLOR_HEX:</TechnicalLabel>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border border-border" style={{ backgroundColor: m.color }} />
                      <span className="font-mono text-[10px] text-foreground">{m.color}</span>
                    </div>
                  </div>
                )}
              </div>
            </SurfacePanel>
          ))}
          {items.length === 0 && (
            <EmptyState frame="dashed" className="col-span-full">NO_MATERIALS_CONFIGURED</EmptyState>
          )}
        </div>
      )}

      {editing && <MaterialDialog mat={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </AdminLayout>
  );
}

function MaterialDialog({ mat, onClose, onSaved }) {
  const [form, setForm] = useState({ name: mat.name, description: mat.description || "", color: mat.color || "", active: mat.active });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      if (mat.id) await api.put(`/admin/materials/${mat.id}`, form);
      else await api.post("/admin/materials", form);
      toast.success("SYSTEM_UPDATED");
      onSaved();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-surface-1 border-border text-foreground max-w-md p-0 rounded-none">
        <SurfacePanelHeader padding="lg">
          <DialogHeader className="p-0 space-y-0 text-left">
            <DialogTitle asChild>
              <TechnicalLabel as="h2" className="mb-1">MATERIAL_CONFIGURATION</TechnicalLabel>
            </DialogTitle>
            <h2 className="font-heading text-xl font-bold text-foreground uppercase tracking-tight">
              {mat.id ? "MODIFY_RECORD" : "CREATE_RECORD"}
            </h2>
          </DialogHeader>
        </SurfacePanelHeader>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <TechnicalLabel as={Label} className="block">IDENTIFIER (NAME)</TechnicalLabel>
            <Input data-testid="material-name" value={form.name} onChange={set("name")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" />
          </div>
          <div className="space-y-2">
            <TechnicalLabel as={Label} className="block">SPECIFICATION (DESCRIPTION)</TechnicalLabel>
            <Textarea value={form.description} onChange={set("description")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm resize-none" rows={3} />
          </div>
          <div className="space-y-2">
            <TechnicalLabel as={Label} className="block">VISUAL_HEX (COLOR)</TechnicalLabel>
            <Input value={form.color} onChange={set("color")} placeholder="#000000" className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <TechnicalLabel size="sm" tone="foreground">DEPLOY_TO_PRODUCTION</TechnicalLabel>
          </div>
        </div>

        <div className="border-t border-border bg-background p-4">
          <Button disabled={busy} data-testid="save-material" onClick={save} variant="technical" className="w-full h-10">
            {busy ? "WRITING..." : "COMMIT_CHANGES"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
