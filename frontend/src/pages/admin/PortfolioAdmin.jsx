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
    await api.delete(`/admin/portfolio/${id}`); 
    load(); 
    toast.success("RECORD_DELETED"); 
  };

  return (
    <AdminLayout title={t("admin.portfolio")} subtitle="Public Asset Registry">
      <div className="flex justify-between items-end mb-6">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-border bg-surface-1 px-3 py-1">
          PUBLISHED_RECORDS // {items.length}
        </div>
        <Button data-testid="add-project-btn" onClick={() => setEditing({ title_id: "", title_en: "", client: "", category: "", description_id: "", description_en: "", images: [], featured: false })} className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-widest h-9 px-4">
          <Plus className="mr-2 h-4 w-4" /> NEW_PROJECT
        </Button>
      </div>

      {loading ? (
        <div className="border border-border bg-surface-1 p-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
          [ FETCHING_ASSETS... ]
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <div key={p.id} className="border border-border bg-surface-1 flex flex-col group">
              <div className="relative aspect-video bg-surface-2 border-b border-border overflow-hidden">
                <img src={p.images?.[0]} alt="" className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500" />
                <div className="absolute top-2 left-2 font-mono text-[10px] uppercase tracking-widest bg-background/90 px-2 py-0.5 border border-border/50 text-foreground">
                  ID: {p.id.substring(0,6)}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="font-heading font-bold text-foreground text-lg uppercase tracking-tight">{lang === "id" ? p.title_id : p.title_en}</p>
                  <p className="font-mono text-[10px] text-primary uppercase tracking-widest mt-1">{p.category} // {p.client}</p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border/50 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)} className="flex-1 rounded-none border-border bg-background hover:bg-surface-2 text-foreground font-mono text-[10px] uppercase tracking-widest h-8">
                    <Pencil className="h-3 w-3 mr-2" /> MODIFY
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="shrink-0 rounded-none border border-border bg-background hover:bg-red-500 hover:border-red-500 text-red-400 hover:text-white h-8 w-10 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full border border-dashed border-border bg-surface-1/50 p-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
              NO_PROJECTS_FOUND
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-surface-1 border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-none">
        <div className="border-b border-border bg-surface-2 p-5">
          <DialogHeader className="p-0 space-y-0 text-left">
            <DialogTitle className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
              PORTFOLIO_ASSET_MANAGER
            </DialogTitle>
            <h2 className="font-heading text-xl font-bold text-foreground uppercase tracking-tight">
              {item.id ? "MODIFY_ASSET_RECORD" : "CREATE_NEW_ASSET"}
            </h2>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">TITLE (ID)</Label>
              <Input data-testid="portfolio-title-id" value={form.title_id} onChange={set("title_id")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">TITLE (EN)</Label>
              <Input value={form.title_en} onChange={set("title_en")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">CLIENT_ENTITY</Label>
              <Input value={form.client} onChange={set("client")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">CATEGORY_TAG</Label>
              <Input value={form.category} onChange={set("category")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">DESCRIPTION_BLOB (ID)</Label>
            <Textarea value={form.description_id} onChange={set("description_id")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm resize-none" rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">DESCRIPTION_BLOB (EN)</Label>
            <Textarea value={form.description_en} onChange={set("description_en")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm resize-none" rows={3} />
          </div>
          
          <div className="space-y-2">
            <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">ASSET_URL (IMAGE)</Label>
            <Input data-testid="portfolio-image" value={form.image} onChange={set("image")} className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-10" />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            <span className="font-mono text-xs text-foreground uppercase tracking-widest">MARK_FEATURED</span>
          </div>
        </div>
        
        <div className="border-t border-border bg-background p-4 flex justify-end">
          <Button data-testid="save-portfolio" disabled={busy} onClick={save} className="rounded-none h-10 px-8 font-mono text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">
            {busy ? "WRITING..." : "COMMIT_RECORD"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
