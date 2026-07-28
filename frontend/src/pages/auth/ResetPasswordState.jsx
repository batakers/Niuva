import React from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordState({ success = false }) {
  return (
    <AuthShell heading={"Account\nRecovery"} tagline="Keamanan akun Anda.">
      <div className="border border-border-default bg-surface-default p-8">
        <h1 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight text-text-primary">
          {success ? "Password Berhasil Diubah" : "Link Tidak Valid"}
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-text-secondary" role="status">
          {success
            ? "Sesi lama Anda telah diakhiri. Silakan login dengan password baru."
            : "Link reset tidak valid atau sudah tidak dapat digunakan. Silakan minta link baru."}
        </p>
        <Link
          to={success ? "/admin/login" : "/forgot-password"}
          className="block text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary"
        >
          {success ? "Ke Halaman Login" : "Minta Link Baru"}
        </Link>
      </div>
    </AuthShell>
  );
}
