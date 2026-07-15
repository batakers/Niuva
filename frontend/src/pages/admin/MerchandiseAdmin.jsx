import React, { useState } from "react";
import { useMerchandiseCatalog } from "@/hooks/useMerchandiseCatalog";
import MerchandiseForm from "@/components/admin/MerchandiseForm";

function MerchandiseAdmin() {
  const { catalog, addProduct, updateProduct, deleteProduct, resetToDefault } =
    useMerchandiseCatalog();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSave = (formData) => {
    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct(formData);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      deleteProduct(id);
    }
  };

  const filteredCatalog = catalog.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const editingProduct = catalog.find((p) => p.id === editingId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Management Merchandise
          </h2>
          <p className="text-text-secondary mt-1">
            Kelola katalog produk apparel dan merchandise
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`min-h-11 rounded-control px-6 py-3 font-semibold text-sm transition-colors ${
            showForm
              ? "bg-surface-elevated text-text-primary hover:bg-surface-hover"
              : "bg-action-primary text-text-inverse hover:bg-action-primary-hover"
          }`}
        >
          {showForm ? "Tutup Form" : "+ Tambah Produk"}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="rounded-panel bg-surface-elevated p-6 border border-surface-border">
          <h3 className="text-lg font-bold text-text-primary mb-6">
            {editingId ? "Edit Produk" : "Tambah Produk Baru"}
          </h3>
          <MerchandiseForm
            product={editingProduct}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary"
        />
        <button
          onClick={() => {
            if (window.confirm("Reset ke katalog default?")) {
              resetToDefault();
            }
          }}
          className="min-h-11 rounded-control px-6 py-3 text-sm font-semibold bg-surface-elevated text-text-secondary hover:bg-surface-hover"
        >
          Reset
        </button>
        <span className="text-sm font-semibold text-text-secondary">
          Total: {filteredCatalog.length}
        </span>
      </div>

      {/* Products Table */}
      <div className="rounded-panel border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-elevated border-b border-surface-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Produk
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Harga Dasar
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Ukuran
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Warna
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Metode Cetak
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCatalog.length > 0 ? (
                filteredCatalog.map((product, idx) => (
                  <tr
                    key={product.id}
                    className={`border-b border-surface-border ${
                      idx % 2 === 0 ? "bg-surface-page" : "bg-surface-elevated/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{product.image}</div>
                        <div>
                          <div className="font-semibold text-text-primary">
                            {product.name}
                          </div>
                          <div className="text-xs text-text-secondary line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                      Rp {product.basePrice?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes?.slice(0, 2).map((size, i) => (
                          <span
                            key={i}
                            className="text-xs bg-action-primary/20 text-action-primary px-2 py-1 rounded"
                          >
                            {size}
                          </span>
                        ))}
                        {product.sizes?.length > 2 && (
                          <span className="text-xs text-text-secondary">
                            +{product.sizes.length - 2} lagi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.colors?.slice(0, 2).map((color, i) => (
                          <span
                            key={i}
                            className="text-xs bg-surface-elevated text-text-secondary px-2 py-1 rounded"
                          >
                            {color}
                          </span>
                        ))}
                        {product.colors?.length > 2 && (
                          <span className="text-xs text-text-secondary">
                            +{product.colors.length - 2} lagi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {product.printMethods?.slice(0, 2).map((method, i) => (
                          <div key={i} className="text-xs text-text-secondary">
                            <span className="font-semibold">{method.name}</span>
                            <span className="ml-1">Rp {method.price?.toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                        {product.printMethods?.length > 2 && (
                          <div className="text-xs text-text-secondary">
                            +{product.printMethods.length - 2} metode lagi
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-2 rounded-control bg-action-primary text-text-inverse text-xs font-semibold hover:bg-action-primary-hover"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-2 rounded-control bg-error text-text-inverse text-xs font-semibold hover:bg-error/80"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-text-secondary">
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-panel bg-action-primary/10 border border-action-primary/20 p-4">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-action-primary">💡 Info:</span> Data katalog
          merchandise disimpan di browser Anda menggunakan localStorage. Perubahan akan
          langsung terlihat di halaman merchandise pelanggan.
        </p>
      </div>
    </div>
  );
}

export default MerchandiseAdmin;
