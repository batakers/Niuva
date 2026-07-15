import React, { useState } from "react";
import { Button } from "@/components/ui/button";

function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(product, quantity, selectedSize);
    
    // Reset form
    setTimeout(() => {
      setQuantity(1);
      setIsAdding(false);
    }, 500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col h-full rounded-panel bg-surface-elevated overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-niuva-blue to-sky-blue flex items-center justify-center text-text-inverse text-sm font-semibold">
        <span className="text-center px-4">{product.name}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Badge */}
        <span className="inline-block w-fit px-2 py-1 bg-action-primary text-text-inverse text-xs font-semibold rounded-control mb-2 capitalize">
          {product.category === "apparel" ? "Apparel" : "Merchandise"}
        </span>

        {/* Name & Description */}
        <h3 className="font-bold text-text-primary mb-1">{product.name}</h3>
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <p className="text-lg font-bold text-action-primary mb-4">
          {formatPrice(product.price)}
        </p>

        {/* Size Selection */}
        {product.sizes.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Ukuran
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-3 py-2 border border-surface-border rounded-control text-sm bg-surface-page text-text-primary focus:outline-none focus:ring-2 focus:ring-action-primary"
            >
              {product.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity Selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-secondary mb-2">
            Jumlah
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity === 1}
              className="px-3 py-2 rounded-control bg-surface-page border border-surface-border text-text-primary hover:bg-surface-hover disabled:opacity-50"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-2 py-2 text-center border border-surface-border rounded-control text-sm bg-surface-page text-text-primary focus:outline-none focus:ring-2 focus:ring-action-primary"
              min="1"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 rounded-control bg-surface-page border border-surface-border text-text-primary hover:bg-surface-hover"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full min-h-10 rounded-control bg-action-primary text-text-inverse font-semibold text-sm hover:bg-action-primary-hover disabled:opacity-50 transition-colors"
        >
          {isAdding ? "✓ Ditambahkan" : "Tambah ke Keranjang"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
