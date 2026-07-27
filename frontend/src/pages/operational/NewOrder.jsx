import React from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { OperationalLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";


/**
 * Compatibility destination for old bookmarks.
 *
 * The former form wrote to the quarantined legacy aggregate and implied an
 * upload/checkout flow that is not approved. Historical orders remain
 * readable; new Retail work starts as discovery or a quote request.
 */
export default function NewOrder() {
  const navigate = useNavigate();

  return (
    <OperationalLayout>
      <div className="mx-auto w-full max-w-2xl border border-status-warning/40 bg-status-warning/10 p-8">
        <AlertTriangle className="mb-4 h-8 w-8 text-status-warning" />
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Pembuatan pesanan belum aktif
        </h1>
        <p className="mt-3 text-text-secondary">
          Form legacy dinonaktifkan. Retail saat ini hanya menyediakan
          discovery produk dan permintaan penawaran; checkout, pembayaran,
          fulfillment, dan production upload belum aktif.
        </p>
        <Button className="mt-6" onClick={() => navigate("/retail")}>
          Lihat katalog Retail
        </Button>
      </div>
    </OperationalLayout>
  );
}
