import React, { useState } from "react";
import { useMerchandiseCatalog } from "@/hooks/useMerchandiseCatalog";

function MerchandiseCalculator() {
  const { catalog } = useMerchandiseCatalog();
  
  const [selectedProduct, setSelectedProduct] = useState(catalog[0]);
  const [quantity, setQuantity] = useState(10);
  const [selectedColor, setSelectedColor] = useState(selectedProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState(selectedProduct.sizes[0]);
  const [selectedPrintMethod, setSelectedPrintMethod] = useState(selectedProduct.printMethods[0]);
  const [designNote, setDesignNote] = useState("");

  const handleProductChange = (productId) => {
    const product = catalog.find((p) => p.id === productId);
    setSelectedProduct(product);
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes[0]);
    setSelectedPrintMethod(product.printMethods[0]);
  };

  const validateQuantity = (method) => {
    if (quantity < method.minOrder) {
      return `Minimal order: ${method.minOrder} pcs`;
    }
    return null;
  };

  const pricePerUnit =
    selectedProduct.basePrice + selectedPrintMethod.price;
  const subtotal = pricePerUnit * quantity;
  const discount = quantity >= 50 ? subtotal * 0.1 : 0; // 10% discount for 50+ units
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal - discount + tax;

  const error = validateQuantity(selectedPrintMethod);

  const handleWhatsApp = () => {
    const message = `Halo Niuva, saya ingin pesan merchandise:
- Produk: ${selectedProduct.name}
- Jumlah: ${quantity} pcs
- Warna: ${selectedColor}
- Ukuran: ${selectedSize}
- Metode Cetak: ${selectedPrintMethod.name}
- Estimasi Total: Rp ${total.toLocaleString("id-ID")}
${designNote ? `- Catatan: ${designNote}` : ""}

Saya ingin diskusikan detail lebih lanjut.`;
    
    const phoneNumber = "6281234567890";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product Selection */}
        <div className="space-y-6">
          {/* Product Grid */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-4">
              Pilih Produk
            </label>
            <div className="grid grid-cols-2 gap-3">
              {catalog.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductChange(product.id)}
                  className={`p-4 rounded-control border-2 transition-all text-center ${
                    selectedProduct.id === product.id
                      ? "border-action-primary bg-action-primary/10"
                      : "border-surface-border bg-surface-elevated hover:border-action-primary/50"
                  }`}
                >
                  <div className="text-3xl mb-2">{product.image}</div>
                  <div className="font-semibold text-sm text-text-primary">
                    {product.name}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    Rp {product.basePrice.toLocaleString("id-ID")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Pilih Warna
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedProduct.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-control text-sm font-semibold transition-all border-2 ${
                    selectedColor === color
                      ? "border-action-primary bg-action-primary text-text-inverse"
                      : "border-surface-border bg-surface-elevated text-text-primary hover:border-action-primary/50"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          {selectedProduct.sizes[0] !== "One Size" && (
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                Pilih Ukuran
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-control text-sm font-semibold transition-all border-2 ${
                      selectedSize === size
                        ? "border-action-primary bg-action-primary text-text-inverse"
                        : "border-surface-border bg-surface-elevated text-text-primary hover:border-action-primary/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Print Method Selection */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Metode Cetak / Sablon
            </label>
            <div className="space-y-2">
              {selectedProduct.printMethods.map((method) => (
                <button
                  key={method.name}
                  onClick={() => setSelectedPrintMethod(method)}
                  className={`w-full p-4 rounded-control border-2 text-left transition-all ${
                    selectedPrintMethod.name === method.name
                      ? "border-action-primary bg-action-primary/10"
                      : "border-surface-border bg-surface-elevated hover:border-action-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-text-primary">
                        {method.name}
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        Min. order: {method.minOrder} pcs
                      </div>
                    </div>
                    <div className="font-semibold text-action-primary">
                      +Rp {method.price.toLocaleString("id-ID")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quantity & Calculator */}
        <div className="space-y-6">
          {/* Product Preview */}
          <div className="rounded-panel bg-gradient-to-br from-niuva-blue to-sky-blue p-12 flex items-center justify-center min-h-48">
            <div className="text-center">
              <div className="text-9xl mb-4">{selectedProduct.image}</div>
              <h3 className="text-2xl font-bold text-text-inverse">
                {selectedProduct.name}
              </h3>
              <p className="text-text-inverse/80 mt-2">{selectedColor}</p>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Jumlah Pesanan
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(selectedPrintMethod.minOrder, quantity - 10))}
                className="px-4 py-3 rounded-control bg-surface-elevated hover:bg-surface-hover font-semibold"
              >
                −10
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(selectedPrintMethod.minOrder, parseInt(e.target.value) || 1))}
                className="flex-1 px-4 py-3 text-center border border-surface-border rounded-control text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-action-primary"
                min={selectedPrintMethod.minOrder}
              />
              <button
                onClick={() => setQuantity(quantity + 10)}
                className="px-4 py-3 rounded-control bg-surface-elevated hover:bg-surface-hover font-semibold"
              >
                +10
              </button>
              <span className="text-sm text-text-secondary">pcs</span>
            </div>
            {error && (
              <p className="text-error text-sm mt-2">⚠️ {error}</p>
            )}
          </div>

          {/* Design Notes */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Catatan Desain / Khusus (opsional)
            </label>
            <textarea
              value={designNote}
              onChange={(e) => setDesignNote(e.target.value)}
              placeholder="Misalnya: Posisi logo, ukuran desain, warna cetak khusus, dll"
              className="w-full px-4 py-3 border border-surface-border rounded-control focus:outline-none focus:ring-2 focus:ring-action-primary resize-none"
              rows="3"
            />
          </div>

          {/* Price Breakdown */}
          <div className="rounded-panel bg-surface-elevated p-6 space-y-3 border border-surface-border">
            <h4 className="font-bold text-text-primary mb-4">Perhitungan Harga</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Harga Produk</span>
                <span className="font-semibold text-text-primary">
                  Rp {selectedProduct.basePrice.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Biaya Cetak ({selectedPrintMethod.name})</span>
                <span className="font-semibold text-text-primary">
                  Rp {selectedPrintMethod.price.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Harga per Unit</span>
                <span className="font-semibold text-action-primary">
                  Rp {pricePerUnit.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="border-t border-surface-border pt-2 flex justify-between">
                <span className="text-text-secondary">Subtotal ({quantity} pcs)</span>
                <span className="font-semibold text-text-primary">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span className="text-text-secondary">Diskon (10%)</span>
                  <span className="font-semibold">-Rp {discount.toLocaleString("id-ID")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-text-secondary">Pajak (10%)</span>
                <span className="font-semibold text-text-primary">
                  Rp {tax.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="border-t border-surface-border pt-3 flex justify-between">
                <span className="font-bold text-text-primary">Total Harga</span>
                <span className="text-2xl font-bold text-action-primary">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {discount > 0 && (
              <div className="bg-success/10 border border-success rounded-control p-3 mt-4">
                <p className="text-sm text-success font-semibold">
                  ✓ Anda mendapat diskon 10% untuk order 50+ unit!
                </p>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleWhatsApp}
            disabled={error}
            className="w-full min-h-12 rounded-control bg-action-primary text-text-inverse font-semibold hover:bg-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            💬 Pesan via WhatsApp
          </button>

          <p className="text-xs text-text-secondary text-center">
            Klik tombol di atas untuk menghubungi tim kami dan mengkonfirmasi pesanan dengan desain spesifik Anda.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MerchandiseCalculator;
