import React from "react";
import { Link } from "react-router-dom";

import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

export default function ResetPasswordState({ success = false }) {
  return (
    <AuthShell audience="recovery">
      <AuthCard
        eyebrow="Pemulihan akun"
        title={success ? "Password berhasil diubah" : "Link tidak valid"}
        description={
          success
            ? "Sesi lama telah diakhiri. Pilih halaman login yang sesuai untuk masuk dengan password baru."
            : "Link reset tidak valid atau sudah tidak dapat digunakan. Anda dapat meminta link baru."
        }
      >
        {success ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link to="/login">Login pelanggan</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/login">Login admin</Link>
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full" size="lg">
            <Link to="/forgot-password">Minta link baru</Link>
          </Button>
        )}
      </AuthCard>
    </AuthShell>
  );
}
