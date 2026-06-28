import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LayoutGrid, Package, Layers, Image as ImageIcon, GraduationCap, Mail, Users, Settings as SettingsIcon,
  Download, Plus, Trash2, Pencil, CheckCircle2, Eye,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "../../components/Navbar";
import { StatusBadge } from "../../components/StatusStepper";
import { api, fileUrl, formatApiError } from "../../lib/api";
import { rupiah, fmtDate, fmtDay } from "../../lib/format";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const TABS = [
  ["overview", "admin.overview", LayoutGrid],
  ["orders", "admin.orders", Package],
  ["materials", "admin.materials", Layers],
  ["portfolio", "admin.portfolio", ImageIcon],
  ["internships", "admin.internships", GraduationCap],
  ["contacts", "admin.contacts", Mail],
  ["users", "admin.users", Users],
  ["settings", "admin.settings", SettingsIcon],
];

export default function AdminDashboard() {
  const { t } = useI18n();
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-[#0A0B10]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-20">
        <h1 className="font-heading text-3xl font-bold text-white mb-6">{t("admin.title")}</h1>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-800">
          {TABS.map(([key, label, Icon]) => (
            <button key={key} data-testid={`admin-tab-${key}`} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-md whitespace-nowrap transition-colors border-b-2 -mb-[2px] ${
                tab === key ? "border-blue-500 text-white" : "border-transparent text-slate-400 hover:text-white"}`}>
              <Icon className="h-4 w-4" strokeWidth={1.5} /> {t(label)}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview />}
        {tab === "orders" && <Orders />}
        {tab === "materials" && <Materials />}
        {tab === "portfolio" && <PortfolioAdmin />}
        {tab === "internships" && <SimpleList endpoint="/admin/internships" type="internship" />}
        {tab === "contacts" && <SimpleList endpoint="/admin/contacts" type="contact" />}
        {tab === "users" && <UsersList />}
        {tab === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-lg border border-slate-800 bg-[#13151F] ${className}`}>{children}</div>;
}

function Overview() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {}); }, []);
  if (!stats) return <p className="text-slate-400">{t("common.loading")}</p>;
  const items = [
    ["total_orders", "Total Pesanan", "text-blue-400"],
    ["pending_estimate", t("status.pending_estimate"), "text-amber-400"],
    ["awaiting_payment", t("status.awaiting_payment"), "text-blue-400"],
    ["in_process", t("status.in_process"), "text-purple-400"],
    ["completed", t("status.completed"), "text-emerald-400"],
    ["clients", t("admin.users"), "text-slate-200"],
    ["internships", t("admin.internships"), "text-slate-200"],
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-overview">
      {items.map(([k, label, color]) => (
        <Card key={k} className="p-6 border-t-2 border-t-blue-500/50">
          <p className="text-xs font-mono-tech uppercase text-slate-500">{label}</p>
          <p className={`font-heading text-4xl font-bold mt-2 ${color}`}>{stats[k]}</p>
        </Card>
      ))}
    </div>
  );
}

function Orders() {
  const { t } = useI18n();
  const [orders, setOrders] = useState([]);
  const [sel, setSel] = useState(null);
  const load = () => api.get("/admin/orders").then((r) => setOrders(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  return (
    <Card className="overflow-hidden" >
      <table className="w-full text-sm" data-testid="admin-orders-table">
        <thead className="bg-[#1E2130] text-slate-400 font-mono-tech text-xs uppercase">
          <tr>
            <th className="text-left px-5 py-3">{t("dash.orderNo")}</th>
            <th className="text-left px-5 py-3">Klien</th>
            <th className="text-left px-5 py-3">{t("dash.material")}</th>
            <th className="text-left px-5 py-3">{t("dash.status")}</th>
            <th className="text-left px-5 py-3">{t("dash.date")}</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-slate-800 hover:bg-[#1E2130]/50">
              <td className="px-5 py-3 font-mono-tech text-blue-400">{o.order_number}</td>
              <td className="px-5 py-3 text-slate-300">{o.user_name}</td>
              <td className="px-5 py-3 text-slate-400">{o.material_name}</td>
              <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
              <td className="px-5 py-3 text-slate-500">{fmtDay(o.created_at)}</td>
              <td className="px-5 py-3 text-right">
                <Button size="sm" variant="outline" data-testid={`manage-order-${o.order_number}`} onClick={() => setSel(o)} className="border-slate-700 text-slate-200 bg-transparent h-8"><Eye className="h-3.5 w-3.5" /></Button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No orders</td></tr>}
        </tbody>
      </table>
      {sel && <OrderManageDialog order={sel} onClose={() => setSel(null)} onUpdated={(o) => { setSel(o); load(); }} />}
    </Card>
  );
}

function OrderManageDialog({ order, onClose, onUpdated }) {
  const { t } = useI18n();
  const [amount, setAmount] = useState(order.estimate?.amount || "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const act = async (fn) => {
    setBusy(true);
    try { const { data } = await fn(); onUpdated(data); toast.success("Updated"); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#13151F] border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-heading">{order.order_number}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><span className="text-slate-400 text-sm">{order.user_name} · {order.user_email}</span><StatusBadge status={order.status} /></div>

          <div className="flex items-center justify-between p-3 rounded-md bg-[#1E2130] border border-slate-700">
            <span className="text-sm text-slate-200 truncate">{order.file?.original_filename}</span>
            <a href={fileUrl(order.file?.storage_path)} target="_blank" rel="noreferrer" download data-testid="admin-download-design">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8"><Download className="h-3.5 w-3.5 mr-1" /> {t("detail.download")}</Button>
            </a>
          </div>
          {order.notes && <p className="text-sm text-slate-400"><span className="text-slate-500">{t("detail.notes")}: </span>{order.notes}</p>}

          {/* Estimate */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <Label className="text-slate-300">{t("admin.setEstimate")} (IDR)</Label>
            <Input data-testid="estimate-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-[#1E2130] border-slate-700 text-white" />
            <Input data-testid="estimate-note" placeholder="Catatan estimasi (opsional)" value={note} onChange={(e) => setNote(e.target.value)} className="bg-[#1E2130] border-slate-700 text-white" />
            <Button disabled={busy || !amount} data-testid="submit-estimate" onClick={() => act(() => api.post(`/admin/orders/${order.id}/estimate`, { amount: parseFloat(amount), note }))} className="bg-blue-600 hover:bg-blue-500 w-full">{t("admin.setEstimate")}</Button>
          </div>

          {/* Payment proof */}
          {order.payment && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Label className="text-slate-300">Bukti Transfer</Label>
              <a href={fileUrl(order.payment.proof?.storage_path)} target="_blank" rel="noreferrer" className="block">
                <img src={fileUrl(order.payment.proof?.storage_path)} alt="proof" className="max-h-48 rounded-md border border-slate-700" />
              </a>
              {order.payment.verified ? (
                <p className="text-emerald-400 text-sm flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {t("detail.verified")}</p>
              ) : (
                <Button disabled={busy} data-testid="verify-payment" onClick={() => act(() => api.post(`/admin/orders/${order.id}/verify-payment`))} className="bg-emerald-600 hover:bg-emerald-500 w-full">{t("admin.verifyPayment")}</Button>
              )}
            </div>
          )}

          {/* Status actions */}
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <Button disabled={busy} variant="outline" data-testid="mark-process" onClick={() => act(() => api.post(`/admin/orders/${order.id}/status`, { status: "in_process", note: "Set to in process" }))} className="border-slate-700 text-slate-200 bg-transparent flex-1">{t("admin.markProcess")}</Button>
            <Button disabled={busy} data-testid="mark-complete" onClick={() => act(() => api.post(`/admin/orders/${order.id}/status`, { status: "completed", note: "Order completed" }))} className="bg-emerald-600 hover:bg-emerald-500 flex-1">{t("admin.markComplete")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Materials() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/admin/materials").then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id) => { await api.delete(`/admin/materials/${id}`); load(); toast.success("Deleted"); };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button data-testid="add-material-btn" onClick={() => setEditing({ name: "", description: "", color: "", active: true })} className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-4 w-4" /> {t("admin.addMaterial")}</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => (
          <Card key={m.id} className="p-5" data-testid={`material-card-${m.name}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading font-semibold text-white">{m.name}</p>
                <p className="text-xs text-slate-400 mt-1">{m.description}</p>
                <span className={`inline-block mt-2 text-[11px] px-2 py-0.5 rounded ${m.active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-600/30 text-slate-400"}`}>{m.active ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditing(m)} className="text-slate-400 h-8 w-8 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(m.id)} className="text-red-400 h-8 w-8 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {editing && <MaterialDialog mat={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function MaterialDialog({ mat, onClose, onSaved }) {
  const [form, setForm] = useState({ name: mat.name, description: mat.description || "", color: mat.color || "", active: mat.active });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async () => {
    try {
      if (mat.id) await api.put(`/admin/materials/${mat.id}`, form);
      else await api.post("/admin/materials", form);
      toast.success("Saved"); onSaved();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#13151F] border-slate-700 text-white">
        <DialogHeader><DialogTitle className="font-heading">{mat.id ? "Edit" : "Tambah"} Material</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-slate-300 mb-1.5 block">Nama</Label><Input data-testid="material-name" value={form.name} onChange={set("name")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
          <div><Label className="text-slate-300 mb-1.5 block">Deskripsi</Label><Textarea value={form.description} onChange={set("description")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
          <div><Label className="text-slate-300 mb-1.5 block">Warna</Label><Input value={form.color} onChange={set("color")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
          <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><span className="text-sm text-slate-300">Active</span></div>
          <Button data-testid="save-material" onClick={save} className="bg-blue-600 hover:bg-blue-500 w-full">Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PortfolioAdmin() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/portfolio").then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  const remove = async (id) => { await api.delete(`/admin/portfolio/${id}`); load(); toast.success("Deleted"); };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button data-testid="add-project-btn" onClick={() => setEditing({ title_id: "", title_en: "", client: "", category: "", description_id: "", description_en: "", images: [], featured: false })} className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-4 w-4" /> {t("admin.addProject")}</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-video bg-[#1E2130]"><img src={p.images?.[0]} alt="" className="w-full h-full object-cover" /></div>
            <div className="p-4">
              <p className="font-heading font-semibold text-white">{lang === "id" ? p.title_id : p.title_en}</p>
              <p className="text-xs text-slate-500 mt-0.5">{p.category} · {p.client}</p>
              <div className="flex gap-1 mt-3">
                <Button size="sm" variant="outline" onClick={() => setEditing(p)} className="border-slate-700 text-slate-200 bg-transparent h-8 flex-1"><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-red-400 h-8 w-8 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {editing && <PortfolioDialog item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function PortfolioDialog({ item, onClose, onSaved }) {
  const [form, setForm] = useState({ ...item, image: item.images?.[0] || "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async () => {
    const payload = { title_id: form.title_id, title_en: form.title_en, client: form.client, category: form.category, description_id: form.description_id, description_en: form.description_en, images: form.image ? [form.image] : [], featured: form.featured };
    try {
      if (item.id) await api.put(`/admin/portfolio/${item.id}`, payload);
      else await api.post("/admin/portfolio", payload);
      toast.success("Saved"); onSaved();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#13151F] border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-heading">{item.id ? "Edit" : "Tambah"} Proyek</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300 mb-1.5 block">Judul (ID)</Label><Input data-testid="portfolio-title-id" value={form.title_id} onChange={set("title_id")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300 mb-1.5 block">Title (EN)</Label><Input value={form.title_en} onChange={set("title_en")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300 mb-1.5 block">Klien</Label><Input value={form.client} onChange={set("client")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300 mb-1.5 block">Kategori</Label><Input value={form.category} onChange={set("category")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
          </div>
          <div><Label className="text-slate-300 mb-1.5 block">Deskripsi (ID)</Label><Textarea value={form.description_id} onChange={set("description_id")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
          <div><Label className="text-slate-300 mb-1.5 block">Description (EN)</Label><Textarea value={form.description_en} onChange={set("description_en")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
          <div><Label className="text-slate-300 mb-1.5 block">URL Gambar</Label><Input data-testid="portfolio-image" value={form.image} onChange={set("image")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
          <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><span className="text-sm text-slate-300">Featured</span></div>
          <Button data-testid="save-portfolio" onClick={save} className="bg-blue-600 hover:bg-blue-500 w-full">Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SimpleList({ endpoint, type }) {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  useEffect(() => { api.get(endpoint).then((r) => setItems(r.data)).catch(() => {}); }, [endpoint]);
  return (
    <div className="space-y-3" data-testid={`admin-${type}-list`}>
      {items.length === 0 && <p className="text-slate-500">No data</p>}
      {items.map((it) => (
        <Card key={it.id} className="p-5">
          {type === "internship" ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-heading font-semibold text-white">{it.full_name}</p>
                <span className="text-xs text-slate-500 font-mono-tech">{fmtDate(it.created_at)}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{it.email} · {it.phone}</p>
              <p className="text-sm text-slate-400">{it.university} — {it.major} (Sem {it.semester}) · {it.duration}</p>
              <p className="text-sm text-slate-300 mt-2">{it.motivation}</p>
              {it.portfolio_url && <a href={it.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline">{it.portfolio_url}</a>}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-heading font-semibold text-white">{it.subject}</p>
                <span className="text-xs text-slate-500 font-mono-tech">{fmtDate(it.created_at)}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{it.name} · {it.email}</p>
              <p className="text-sm text-slate-300 mt-2">{it.message}</p>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

function UsersList() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/admin/users").then((r) => setItems(r.data)).catch(() => {}); }, []);
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm" data-testid="admin-users-table">
        <thead className="bg-[#1E2130] text-slate-400 font-mono-tech text-xs uppercase">
          <tr><th className="text-left px-5 py-3">Nama</th><th className="text-left px-5 py-3">Email</th><th className="text-left px-5 py-3">Telepon</th><th className="text-left px-5 py-3">Perusahaan</th><th className="text-left px-5 py-3">Daftar</th></tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-t border-slate-800">
              <td className="px-5 py-3 text-white">{u.name}</td>
              <td className="px-5 py-3 text-slate-300">{u.email}</td>
              <td className="px-5 py-3 text-slate-400">{u.phone || "-"}</td>
              <td className="px-5 py-3 text-slate-400">{u.company || "-"}</td>
              <td className="px-5 py-3 text-slate-500">{fmtDay(u.created_at)}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No clients</td></tr>}
        </tbody>
      </table>
    </Card>
  );
}

function SettingsPanel() {
  const [form, setForm] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  useEffect(() => { api.get("/settings").then((r) => setForm(r.data)).catch(() => {}); }, []);
  const save = async () => {
    try { await api.put("/admin/settings", form); toast.success("Saved"); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };
  if (!form) return null;
  return (
    <Card className="p-7 max-w-lg" data-testid="settings-panel">
      <h3 className="font-heading text-lg font-semibold text-white mb-4">Rekening Pembayaran</h3>
      <div className="space-y-3">
        <div><Label className="text-slate-300 mb-1.5 block">Nama Bank</Label><Input data-testid="settings-bank" value={form.bank_name} onChange={set("bank_name")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
        <div><Label className="text-slate-300 mb-1.5 block">No. Rekening</Label><Input data-testid="settings-account" value={form.account_number} onChange={set("account_number")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
        <div><Label className="text-slate-300 mb-1.5 block">Atas Nama</Label><Input data-testid="settings-holder" value={form.account_holder} onChange={set("account_holder")} className="bg-[#1E2130] border-slate-700 text-white" /></div>
        <Button data-testid="save-settings" onClick={save} className="bg-blue-600 hover:bg-blue-500 w-full">Simpan</Button>
      </div>
    </Card>
  );
}
