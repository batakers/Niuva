import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMerchandiseCatalog } from "@/hooks/useMerchandiseCatalog";
import { api, formatApiError } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const WHATSAPP_NUMBER = "6285117678901";

function MerchandiseCalculator() {
  const { catalog, loading, error: catalogError } = useMerchandiseCatalog();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(10);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedPrintMethod, setSelectedPrintMethod] = useState(null);
  const [designNote, setDesignNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (!catalog.length) return;
    const current = catalog.find((product) => product.id === selectedProduct?.id) || catalog[0];
    setSelectedProduct(current);
    setSelectedColor((color) => current.colors.includes(color) ? color : (current.colors[0] || ""));
    setSelectedSize((size) => current.sizes.includes(size) ? size : (current.sizes[0] || ""));
    setSelectedPrintMethod((method) => current.printMethods.find((item) => item.name === method?.name) || current.printMethods[0] || null);
  }, [catalog, selectedProduct?.id]);

  if (loading) return <div className="rounded-panel border border-surface-border p-8 text-center text-text-secondary">Memuat katalog...</div>;
  if (catalogError) return <div className="rounded-panel border border-error/30 p-8 text-center text-error">{catalogError}</div>;
  if (!selectedProduct || !selectedPrintMethod) return <div className="rounded-panel border border-surface-border p-8 text-center text-text-secondary">Katalog belum tersedia.</div>;

  const pricePerUnit = selectedProduct.basePrice + selectedPrintMethod.price;
  const subtotal = pricePerUnit * quantity;
  const discount = quantity >= 50 ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal - discount + tax;
  const quantityError = quantity < selectedPrintMethod.minOrder ? `Minimal order: ${selectedPrintMethod.minOrder} pcs` : "";
  const outOfStock = selectedProduct.stock < quantity;

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0] || "");
    setSelectedSize(product.sizes[0] || "");
    setSelectedPrintMethod(product.printMethods[0] || null);
    setQuantity((value) => Math.max(product.printMethods[0]?.minOrder || 1, value));
  };

  const saveOrder = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/merchandise/orders", {
        product_id: selectedProduct.id,
        quantity,
        color: selectedColor,
        size: selectedSize,
        print_method: selectedPrintMethod.name,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        notes: designNote,
      });
      setSavedOrder(data);
      setConfirmOpen(false);
      toast.success("Pesanan tersimpan. Lanjutkan konfirmasi via WhatsApp.");
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const order = savedOrder;
    const message = `Halo Niuva, saya sudah membuat pesanan merchandise.\n\nNomor pesanan: ${order.order_number}\nProduk: ${order.product_name}\nJumlah: ${order.quantity} pcs\nTotal estimasi: Rp ${order.pricing.total.toLocaleString("id-ID")}\n\nMohon konfirmasi pesanan saya.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const newOrder = () => {
    setSavedOrder(null);
    setCustomer({ name: "", email: "", phone: "" });
    setDesignNote("");
  };

  if (savedOrder) {
    return (
      <div className="rounded-panel border border-success/30 bg-success/10 p-8 text-center">
        <p className="font-mono-tech text-sm font-semibold text-success">PESANAN_TERSIMPAN</p>
        <h3 className="mt-3 text-2xl font-bold text-text-primary">Pesanan {savedOrder.order_number} berhasil dibuat</h3>
        <p className="mx-auto mt-3 max-w-xl text-text-secondary">Data pesanan telah masuk ke sistem admin. Silakan lanjutkan ke WhatsApp agar tim NIUVA dapat mengonfirmasi detail dan proses produksi.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={openWhatsApp} className="min-h-12 rounded-control bg-action-primary px-6 py-3 font-semibold text-text-inverse hover:bg-action-primary-hover">💬 Konfirmasi via WhatsApp</button>
          <button type="button" onClick={newOrder} className="min-h-12 rounded-control border border-surface-border bg-surface-elevated px-6 py-3 font-semibold text-text-primary hover:bg-surface-hover">Buat pesanan baru</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div><label className="mb-4 block text-sm font-semibold text-text-primary">Pilih Produk</label><div className="grid grid-cols-2 gap-3">{catalog.map((product) => <button type="button" key={product.id} onClick={() => selectProduct(product)} className={`rounded-control border-2 p-4 text-center transition-all ${selectedProduct.id === product.id ? "border-action-primary bg-action-primary/10" : "border-surface-border bg-surface-elevated hover:border-action-primary/50"}`}><div className="mb-2 text-3xl">{product.image}</div><div className="text-sm font-semibold text-text-primary">{product.name}</div><div className="mt-1 text-xs text-text-secondary">Rp {product.basePrice.toLocaleString("id-ID")}</div><div className={`mt-1 text-[11px] font-semibold ${product.stock > 0 ? "text-success" : "text-error"}`}>{product.stock > 0 ? `Stok: ${product.stock}` : "Stok habis"}</div></button>)}</div></div>
          <OptionGroup label="Pilih Warna" options={selectedProduct.colors} selected={selectedColor} onSelect={setSelectedColor} />
          {selectedProduct.sizes[0] !== "One Size" && <OptionGroup label="Pilih Ukuran" options={selectedProduct.sizes} selected={selectedSize} onSelect={setSelectedSize} />}
          <div><label className="mb-3 block text-sm font-semibold text-text-primary">Metode Cetak / Sablon</label><div className="space-y-2">{selectedProduct.printMethods.map((method) => <button type="button" key={method.name} onClick={() => { setSelectedPrintMethod(method); setQuantity((value) => Math.max(method.minOrder, value)); }} className={`w-full rounded-control border-2 p-4 text-left transition-all ${selectedPrintMethod.name === method.name ? "border-action-primary bg-action-primary/10" : "border-surface-border bg-surface-elevated hover:border-action-primary/50"}`}><div className="flex items-center justify-between"><div><div className="font-semibold text-text-primary">{method.name}</div><div className="mt-1 text-xs text-text-secondary">Min. order: {method.minOrder} pcs</div></div><div className="font-semibold text-action-primary">+Rp {method.price.toLocaleString("id-ID")}</div></div></button>)}</div></div>
        </div>
        <div className="space-y-6">
          <div className="flex min-h-48 items-center justify-center rounded-panel bg-gradient-to-br from-niuva-blue to-sky-blue p-12"><div className="text-center"><div className="mb-4 text-9xl">{selectedProduct.image}</div><h3 className="text-2xl font-bold text-text-inverse">{selectedProduct.name}</h3><p className="mt-2 text-text-inverse/80">{selectedColor}</p></div></div>
          <div><label className="mb-3 block text-sm font-semibold text-text-primary">Jumlah Pesanan</label><div className="flex items-center gap-3"><button type="button" onClick={() => setQuantity(Math.max(selectedPrintMethod.minOrder, quantity - 10))} className="rounded-control bg-surface-elevated px-4 py-3 font-semibold hover:bg-surface-hover">−10</button><input type="number" value={quantity} onChange={(event) => setQuantity(Math.max(selectedPrintMethod.minOrder, parseInt(event.target.value, 10) || 1))} className="min-w-0 flex-1 rounded-control border border-surface-border px-4 py-3 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-action-primary" min={selectedPrintMethod.minOrder} max={selectedProduct.stock} /><button type="button" onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 10))} className="rounded-control bg-surface-elevated px-4 py-3 font-semibold hover:bg-surface-hover">+10</button><span className="text-sm text-text-secondary">pcs</span></div>{quantityError && <p className="mt-2 text-sm text-error">⚠️ {quantityError}</p>}{outOfStock && <p className="mt-2 text-sm text-error">⚠️ Stok tidak mencukupi. Stok tersedia: {selectedProduct.stock}.</p>}</div>
          <div><label className="mb-3 block text-sm font-semibold text-text-primary">Catatan Desain / Khusus (opsional)</label><textarea value={designNote} onChange={(event) => setDesignNote(event.target.value)} placeholder="Misalnya: Posisi logo, ukuran desain, warna cetak khusus, dll" className="w-full resize-none rounded-control border border-surface-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action-primary" rows="3" /></div>
          <PriceSummary basePrice={selectedProduct.basePrice} printMethod={selectedPrintMethod} quantity={quantity} subtotal={subtotal} discount={discount} tax={tax} total={total} />
          <button type="button" onClick={() => setConfirmOpen(true)} disabled={Boolean(quantityError) || outOfStock} className="w-full min-h-12 rounded-control bg-action-primary font-semibold text-text-inverse transition-colors hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:opacity-50">Lanjutkan & konfirmasi pesanan</button>
          <p className="text-center text-xs text-text-secondary">Pesanan akan disimpan terlebih dahulu. WhatsApp hanya dibuka setelah pesanan berhasil dibuat.</p>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent className="max-h-[90vh] overflow-y-auto bg-surface-page text-text-primary"><DialogHeader><DialogTitle>Konfirmasi pesanan</DialogTitle><DialogDescription>Lengkapi data berikut. Pesanan disimpan ke admin sebelum Anda diarahkan untuk konfirmasi WhatsApp.</DialogDescription></DialogHeader><form onSubmit={saveOrder} className="space-y-4"><div className="rounded-control bg-surface-elevated p-4 text-sm"><p className="font-semibold">{selectedProduct.name} · {quantity} pcs</p><p className="mt-1 text-text-secondary">{selectedColor}{selectedSize ? ` · ${selectedSize}` : ""} · {selectedPrintMethod.name}</p><p className="mt-2 font-bold text-action-primary">Total estimasi: Rp {total.toLocaleString("id-ID")}</p></div><CustomerInput label="Nama lengkap" value={customer.name} onChange={(value) => setCustomer({ ...customer, name: value })} /><CustomerInput label="Email" type="email" value={customer.email} onChange={(value) => setCustomer({ ...customer, email: value })} /><CustomerInput label="Nomor WhatsApp" type="tel" value={customer.phone} onChange={(value) => setCustomer({ ...customer, phone: value })} /><div className="flex gap-3 pt-2"><button type="button" onClick={() => setConfirmOpen(false)} className="min-h-11 flex-1 rounded-control border border-surface-border bg-surface-elevated font-semibold">Kembali</button><button disabled={submitting} type="submit" className="min-h-11 flex-1 rounded-control bg-action-primary font-semibold text-text-inverse disabled:opacity-50">{submitting ? "Menyimpan..." : "Simpan pesanan"}</button></div></form></DialogContent></Dialog>
    </div>
  );
}

function OptionGroup({ label, options, selected, onSelect }) { return <div><label className="mb-3 block text-sm font-semibold text-text-primary">{label}</label><div className="flex flex-wrap gap-2">{options.map((option) => <button type="button" key={option} onClick={() => onSelect(option)} className={`rounded-control border-2 px-4 py-2 text-sm font-semibold transition-all ${selected === option ? "border-action-primary bg-action-primary text-text-inverse" : "border-surface-border bg-surface-elevated text-text-primary hover:border-action-primary/50"}`}>{option}</button>)}</div></div>; }
function CustomerInput({ label, type = "text", value, onChange }) { return <label className="block text-sm font-semibold">{label}<input required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-control border border-surface-border bg-surface-elevated px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-action-primary" /></label>; }
function PriceSummary({ basePrice, printMethod, quantity, subtotal, discount, tax, total }) { return <div className="space-y-3 rounded-panel border border-surface-border bg-surface-elevated p-6"><h4 className="mb-4 font-bold text-text-primary">Perhitungan Harga</h4><div className="space-y-2 text-sm"><Line label="Harga Produk" value={basePrice} /><Line label={`Biaya Cetak (${printMethod.name})`} value={printMethod.price} /><Line label="Harga per Unit" value={basePrice + printMethod.price} accent /><div className="border-t border-surface-border pt-2"><Line label={`Subtotal (${quantity} pcs)`} value={subtotal} /></div>{discount > 0 && <Line label="Diskon (10%)" value={-discount} />}<Line label="Pajak (10%)" value={tax} /><div className="border-t border-surface-border pt-3"><Line label="Total Harga" value={total} total /></div></div></div>; }
function Line({ label, value, accent, total }) { return <div className="flex justify-between"><span className={total ? "font-bold text-text-primary" : "text-text-secondary"}>{label}</span><span className={total ? "text-2xl font-bold text-action-primary" : accent ? "font-semibold text-action-primary" : "font-semibold text-text-primary"}>{value < 0 ? "-" : ""}Rp {Math.abs(value).toLocaleString("id-ID")}</span></div>; }

export default MerchandiseCalculator;
