import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RESEND_SECONDS = 60;

function maskEmail(email) {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return "email Anda";
  return `${local.slice(0, 2)}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(location.pathname.endsWith("/check-email"));
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const requestReset = async () => {
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setMaskedEmail(maskEmail(email));
      setSent(true);
      setCooldown(RESEND_SECONDS);
      navigate("/forgot-password/check-email", { replace: true });
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    await requestReset();
  };

  return (
    <AuthShell heading={"Account\nRecovery"} tagline="Minta link untuk mereset password akun Anda.">
      <div className="relative overflow-hidden border border-border-default bg-surface-default p-8">
        {sent ? (
          <div className="space-y-6" data-testid="forgot-password-sent" role="status">
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-primary">Periksa Email</h1>
            <div className="border border-border-default bg-surface-muted p-4 text-sm text-text-primary">
              Jika email {maskedEmail || "yang Anda masukkan"} terdaftar, instruksi reset password telah dikirim.
            </div>
            {email && (
            <Button
              type="button"
              onClick={requestReset}
              disabled={submitting || cooldown > 0}
              className="h-12 w-full rounded-none bg-action-primary font-mono text-xs uppercase tracking-widest text-text-inverse hover:bg-action-primary-hover"
            >
              {submitting ? "MENGIRIM..." : cooldown > 0 ? `Kirim ulang (${cooldown})` : "Kirim Ulang"}
            </Button>
            )}
            <Link to="/forgot-password" className="block text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary">
              Gunakan Email Lain
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-2 font-heading text-2xl font-bold uppercase tracking-tight text-text-primary">Lupa Password</h1>
            <p className="mb-8 text-sm leading-relaxed text-text-secondary">
              Masukkan email akun Anda. Jika terdaftar, kami akan mengirimkan link untuk mereset password.
            </p>
            <form onSubmit={submit} className="space-y-6" data-testid="forgot-password-form">
              <div className="space-y-2">
                <Label htmlFor="forgot-password-email" className="block font-mono text-[10px] uppercase tracking-widest text-text-secondary">Email</Label>
                <Input
                  id="forgot-password-email"
                  data-testid="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                  aria-describedby={error ? "forgot-password-error" : undefined}
                  className="h-12 rounded-none border-border-default bg-surface-page font-mono text-sm focus-visible:border-action-primary focus-visible:ring-1 focus-visible:ring-action-primary/20"
                />
              </div>
              {error && <p id="forgot-password-error" className="border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
              <Button type="submit" disabled={submitting} data-testid="forgot-password-submit" className="h-12 w-full rounded-none bg-action-primary font-mono text-xs uppercase tracking-widest text-text-inverse hover:bg-action-primary-hover">
                {submitting ? "MENGIRIM..." : "Kirim Link Reset"}
              </Button>
              <Link to="/admin/login" className="block text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary">Kembali ke Login</Link>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}
