import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      // Always show the same success state regardless of whether the email
      // is registered — the backend response is intentionally generic too,
      // to avoid revealing account existence.
      setSent(true);
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell heading={"Account\nRecovery"} tagline="Minta link untuk mereset password akun Anda.">
      <div className="relative overflow-hidden border border-border-default bg-surface-default">
        <div className="p-8">
          <h1 className="mb-2 font-heading text-2xl font-bold uppercase tracking-tight text-text-primary">
            Lupa Password
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-text-secondary">
            Masukkan email akun Anda. Jika terdaftar, kami akan mengirimkan link untuk mereset password.
          </p>

          {sent ? (
            <div className="space-y-6" data-testid="forgot-password-sent" role="status">
              <div className="border border-border-default bg-surface-muted p-4 text-sm text-text-primary">
                Jika email tersebut terdaftar, instruksi reset password telah dikirim. Silakan periksa kotak masuk Anda.
              </div>
              <Link
                to="/admin/login"
                className="block text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
              >
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6" data-testid="forgot-password-form">
              <div className="space-y-2">
                <Label htmlFor="forgot-password-email" className="block font-mono text-[10px] uppercase tracking-widest text-text-secondary">
                  Email
                </Label>
                <Input
                  id="forgot-password-email"
                  data-testid="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                  aria-describedby={error ? "forgot-password-error" : undefined}
                  className="h-12 rounded-none border-border-default bg-surface-page font-mono text-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </div>

              {error && (
                <div id="forgot-password-error" className="flex items-start gap-2 border border-destructive/50 bg-destructive/10 p-3" role="alert">
                  <p className="text-sm text-destructive" data-testid="forgot-password-error">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                data-testid="forgot-password-submit"
                className="h-12 w-full rounded-none bg-primary font-mono text-xs uppercase tracking-widest text-text-on-primary hover:bg-primary/90"
              >
                {submitting ? "MENGIRIM..." : "Kirim Link Reset"}
              </Button>

              <Link
                to="/admin/login"
                className="block text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
              >
                Kembali ke Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
