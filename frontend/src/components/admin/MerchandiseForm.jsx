import React, { useState, useEffect } from "react";

function MerchandiseForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    product || {
      name: "",
      basePrice: 0,
      description: "",
      image: "👕",
      sizes: [],
      colors: [],
      printMethods: [],
    }
  );

  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newMethod, setNewMethod] = useState({ name: "", price: 0, minOrder: 1 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "basePrice" ? parseInt(value) || 0 : value,
    });
  };

  const addSize = () => {
    if (newSize.trim()) {
      setFormData({
        ...formData,
        sizes: [...(formData.sizes || []), newSize],
      });
      setNewSize("");
    }
  };

  const removeSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  const addColor = () => {
    if (newColor.trim()) {
      setFormData({
        ...formData,
        colors: [...(formData.colors || []), newColor],
      });
      setNewColor("");
    }
  };

  const removeColor = (index) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const addPrintMethod = () => {
    if (newMethod.name.trim() && newMethod.price > 0) {
      setFormData({
        ...formData,
        printMethods: [
          ...(formData.printMethods || []),
          { ...newMethod, price: parseInt(newMethod.price) || 0 },
        ],
      });
      setNewMethod({ name: "", price: 0, minOrder: 1 });
    }
  };

  const removePrintMethod = (index) => {
    setFormData({
      ...formData,
      printMethods: formData.printMethods.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Nama Produk *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary"
            required
          />
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Harga Dasar (Rp) *
          </label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Deskripsi Produk
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary resize-none"
          rows="3"
        />
      </div>

      {/* Icon/Emoji */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Icon/Emoji
        </label>
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleInputChange}
          maxLength="2"
          className="w-full px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary text-3xl"
        />
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Ukuran
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="Cth: M, L, XL"
            className="flex-1 px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
          />
          <button
            type="button"
            onClick={addSize}
            className="px-4 py-2 rounded-control bg-action-primary text-text-inverse font-semibold hover:bg-action-primary-hover"
          >
            Tambah
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.sizes?.map((size, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-surface-elevated px-3 py-1 rounded-control"
            >
              <span className="text-sm font-semibold">{size}</span>
              <button
                type="button"
                onClick={() => removeSize(idx)}
                className="text-error hover:text-error/80 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Warna
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Cth: Midnight Blue"
            className="flex-1 px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
          />
          <button
            type="button"
            onClick={addColor}
            className="px-4 py-2 rounded-control bg-action-primary text-text-inverse font-semibold hover:bg-action-primary-hover"
          >
            Tambah
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.colors?.map((color, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-surface-elevated px-3 py-1 rounded-control"
            >
              <span className="text-sm font-semibold">{color}</span>
              <button
                type="button"
                onClick={() => removeColor(idx)}
                className="text-error hover:text-error/80 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Print Methods */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Metode Cetak/Sablon
        </label>
        <div className="space-y-2 mb-3 p-4 border border-surface-border rounded-control">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              value={newMethod.name}
              onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
              placeholder="Nama metode"
              className="px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary"
            />
            <input
              type="number"
              value={newMethod.price}
              onChange={(e) =>
                setNewMethod({ ...newMethod, price: parseInt(e.target.value) || 0 })
              }
              placeholder="Harga"
              className="px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary"
            />
            <input
              type="number"
              value={newMethod.minOrder}
              onChange={(e) =>
                setNewMethod({ ...newMethod, minOrder: parseInt(e.target.value) || 1 })
              }
              placeholder="Min order"
              className="px-4 py-2 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary"
            />
          </div>
          <button
            type="button"
            onClick={addPrintMethod}
            className="w-full px-4 py-2 rounded-control bg-action-primary text-text-inverse font-semibold hover:bg-action-primary-hover"
          >
            Tambah Metode Cetak
          </button>
        </div>

        <div className="space-y-2">
          {formData.printMethods?.map((method, idx) => (
            <div key={idx} className="flex items-center justify-between bg-surface-elevated p-3 rounded-control">
              <div className="text-sm">
                <div className="font-semibold text-text-primary">{method.name}</div>
                <div className="text-text-secondary">
                  Rp {method.price?.toLocaleString("id-ID")} | Min: {method.minOrder} pcs
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePrintMethod(idx)}
                className="text-error hover:text-error/80 font-bold text-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 min-h-11 rounded-control bg-action-primary text-text-inverse font-semibold hover:bg-action-primary-hover"
        >
          {product ? "Update Produk" : "Tambah Produk"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-11 rounded-control bg-surface-elevated text-text-primary font-semibold hover:bg-surface-hover"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

export default MerchandiseForm;
