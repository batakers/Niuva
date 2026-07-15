import React from "react";

function ShoppingCart({ items, onRemove, onUpdateQuantity, onClose }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1); // 10% tax estimate
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <div className="w-full md:w-full max-w-md bg-surface-page rounded-t-panel md:rounded-panel p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Keranjang Belanja</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">Keranjang Anda kosong</p>
            <p className="text-text-secondary text-sm mt-2">
              Tambahkan produk untuk memulai berbelanja
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex min-h-10 items-center justify-center rounded-control bg-action-primary px-5 py-2 text-sm font-semibold text-text-inverse hover:bg-action-primary-hover"
            >
              Lanjut Belanja
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6 pb-6 border-b border-surface-border">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4">
                  {/* Product Image Placeholder */}
                  <div className="w-20 h-20 rounded-control bg-gradient-to-br from-niuva-blue to-sky-blue flex-shrink-0 flex items-center justify-center text-text-inverse text-xs font-semibold text-center px-2">
                    <span className="line-clamp-2">{item.name}</span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        Ukuran: {item.selectedSize}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded text-sm bg-surface-elevated hover:bg-surface-hover"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded text-sm bg-surface-elevated hover:bg-surface-hover"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-bold text-text-primary text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => onRemove(item.cartItemId)}
                      className="text-xs text-error hover:text-error font-semibold"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-semibold text-text-primary">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Pajak (estimasi 10%)</span>
                <span className="font-semibold text-text-primary">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-surface-border">
                <span className="text-text-primary">Total</span>
                <span className="text-action-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="space-y-2">
              <button className="w-full min-h-11 rounded-control bg-action-primary text-text-inverse font-semibold hover:bg-action-primary-hover transition-colors">
                Lanjut ke Pembayaran
              </button>
              <button
                onClick={onClose}
                className="w-full min-h-11 rounded-control bg-surface-elevated text-text-primary font-semibold hover:bg-surface-hover transition-colors"
              >
                Lanjut Belanja
              </button>
            </div>

            {/* Info */}
            <p className="text-xs text-text-secondary text-center mt-4">
              Ongkos kirim akan dihitung saat checkout
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ShoppingCart;
