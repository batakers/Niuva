import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMerchandiseCatalog } from "@/hooks/useMerchandiseCatalog";
import MerchandiseForm from "@/components/admin/MerchandiseForm";
import { api, formatApiError } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";
import { EmptyState } from "@/components/ui/empty-state";

function MerchandiseAdmin() {
  const { catalog, loading, error, addProduct, updateProduct, deleteProduct } = useMerchandiseCatalog({ admin: true });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingId) await updateProduct(editingId, formData);
      else await addProduct(formData);
      toast.success(editingId ? "Produk diperbarui" : "Produk ditambahkan");
      closeForm();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus produk ini dari katalog?")) return;
    try {
      await deleteProduct(id);
      toast.success("Produk dihapus");
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    }
  };

  const filteredCatalog = catalog.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const editingProduct = catalog.find((product) => product.id === editingId);

  return (
    <AdminLayout title="Merchandise" subtitle="Katalog publik, harga, stok, dan metode cetak">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Perubahan tersimpan di server dan langsung digunakan oleh katalog publik.</p>
          <button
            type="button"
            onClick={() => { setEditingId(null); setShowForm((visible) => !visible); }}
            className="min-h-11 rounded-control bg-action-primary px-5 py-3 text-sm font-semibold text-text-inverse hover:bg-action-primary-hover"
          >
            {showForm ? "Tutup form" : "+ Tambah produk"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-panel border border-surface-border bg-surface-elevated p-6">
            <h2 className="mb-6 text-lg font-bold text-text-primary">{editingId ? "Edit produk" : "Produk baru"}</h2>
            <MerchandiseForm product={editingProduct} onSave={handleSave} onCancel={closeForm} saving={saving} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="min-h-11 flex-1 rounded-control border border-surface-border px-4 focus:outline-none focus:ring-2 focus:ring-action-primary"
          />
          <span className="text-sm font-semibold text-text-secondary">Total: {filteredCatalog.length}</span>
        </div>

        {loading ? (
          <EmptyState frame="solid">[ MEMUAT_KATALOG... ]</EmptyState>
        ) : error ? (
          <EmptyState frame="dashed">{error}</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded-panel border border-surface-border">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-surface-border bg-surface-elevated text-left text-sm text-text-primary">
                <tr><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Harga</th><th className="px-4 py-3">Stok</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Variasi</th><th className="px-4 py-3 text-center">Aksi</th></tr>
              </thead>
              <tbody>
                {filteredCatalog.map((product) => (
                  <tr key={product.id} className="border-b border-surface-border last:border-0">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="text-2xl">{product.image}</span><div><p className="font-semibold text-text-primary">{product.name}</p><p className="max-w-xs truncate text-xs text-text-secondary">{product.description}</p></div></div></td>
                    <td className="px-4 py-3 text-sm font-semibold">Rp {product.basePrice.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-sm">{product.stock} pcs</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${product.active ? "bg-success/10 text-success" : "bg-surface-elevated text-text-secondary"}`}>{product.active ? "Tayang" : "Disembunyikan"}</span></td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{product.sizes.length} ukuran · {product.colors.length} warna · {product.printMethods.length} metode</td>
                    <td className="px-4 py-3"><div className="flex justify-center gap-2"><button type="button" onClick={() => { setEditingId(product.id); setShowForm(true); }} className="rounded-control bg-action-primary px-3 py-2 text-xs font-semibold text-text-inverse">Edit</button><button type="button" onClick={() => handleDelete(product.id)} className="rounded-control bg-error px-3 py-2 text-xs font-semibold text-text-inverse">Hapus</button></div></td>
                  </tr>
                ))}
                {!filteredCatalog.length && <tr><td colSpan="6"><EmptyState frame="dashed">BELUM_ADA_PRODUK</EmptyState></td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <MerchandiseOrdersPanel />
      </div>
    </AdminLayout>
  );
}

export default MerchandiseAdmin;

const ORDER_STATUS_LABELS = {
  submitted: "Pesanan baru",
  confirmed: "Dikonfirmasi",
  in_process: "Diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

function MerchandiseOrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/merchandise/orders");
      setOrders(data);
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (order, status) => {
    setUpdating(order.id);
    try {
      const { data } = await api.put(`/admin/merchandise/orders/${order.id}/status`, { status, note: "Status diperbarui oleh admin" });
      setOrders((current) => current.map((item) => item.id === data.id ? data : item));
      toast.success("Status pesanan diperbarui");
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setUpdating("");
    }
  };

  return (
    <section className="space-y-4 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border pt-8">
        <div><h2 className="text-xl font-bold text-text-primary">Pesanan merchandise</h2><p className="text-sm text-text-secondary">Pesanan dari halaman publik yang menunggu konfirmasi.</p></div>
        <button type="button" onClick={load} className="rounded-control border border-surface-border bg-surface-elevated px-4 py-2 text-sm font-semibold">Muat ulang</button>
      </div>
      {loading ? <EmptyState frame="solid">[ MEMUAT_PESANAN... ]</EmptyState> : <div className="overflow-x-auto rounded-panel border border-surface-border"><table className="w-full min-w-[930px]"><thead className="border-b border-surface-border bg-surface-elevated text-left text-sm"><tr><th className="px-4 py-3">Nomor / tanggal</th><th className="px-4 py-3">Pelanggan</th><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ubah status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-surface-border last:border-0"><td className="px-4 py-3 text-sm"><p className="font-semibold text-action-primary">{order.order_number}</p><p className="text-xs text-text-secondary">{new Date(order.created_at).toLocaleString("id-ID")}</p></td><td className="px-4 py-3 text-sm"><p className="font-semibold">{order.customer_name}</p><p className="text-xs text-text-secondary">{order.customer_phone}<br />{order.customer_email}</p></td><td className="px-4 py-3 text-sm"><p className="font-semibold">{order.product_image} {order.product_name} · {order.quantity} pcs</p><p className="text-xs text-text-secondary">{order.color}{order.size ? ` · ${order.size}` : ""} · {order.print_method.name}</p>{order.notes && <p className="mt-1 max-w-xs text-xs text-text-secondary">Catatan: {order.notes}</p>}</td><td className="px-4 py-3 text-sm font-semibold">Rp {order.pricing.total.toLocaleString("id-ID")}</td><td className="px-4 py-3 text-sm"><span className="rounded bg-action-primary/10 px-2 py-1 font-semibold text-action-primary">{ORDER_STATUS_LABELS[order.status]}</span></td><td className="px-4 py-3"><select disabled={updating === order.id || order.status === "cancelled"} value={order.status} onChange={(event) => updateStatus(order, event.target.value)} className="rounded-control border border-surface-border bg-surface-elevated px-3 py-2 text-sm disabled:opacity-50">{Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}{!orders.length && <tr><td colSpan="6"><EmptyState frame="dashed">BELUM_ADA_PESANAN_MERCHANDISE</EmptyState></td></tr>}</tbody></table></div>}
    </section>
  );
}
