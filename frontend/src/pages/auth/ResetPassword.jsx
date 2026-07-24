import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { api, formatApiError } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const tooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const canSubmit = Boolean(token) && newPassword.length >= MIN_PASSWORD_LENGTH && newPassword === confirmPassword;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: newPassword });
      setDone(true);
    } catch (requestError) {
      // The backend intentionally returns one generic message whether the
      // token is unknown, expired, or already used — do not try to guess
      // the reason here either.
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell heading={"Account\nRecovery"} tagline="Reset password akun Anda.">
        <div className="border border-border bg-surface-1 p-8">
          <h1 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
            Link Tidak Valid
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground" role="alert" data-testid="reset-password-missing-token">
            Link reset password ini tidak lengkap atau tidak valid. Silakan minta link baru.
          </p>
          <Link
            to="/forgot-password"
            className="block text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Minta Link Baru
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell heading={"Account\nRecovery"} tagline="Buat password baru untuk akun Anda.">
      <div className="border border-border bg-surface-1 p-8">
        <h1 className="mb-2 font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          Masukkan password baru untuk akun Anda.
        </p>

        {done ? (
          <div className="space-y-6" data-testid="reset-password-success" role="status">
            <div className="border border-border bg-surface-2 p-4 text-sm text-foreground">
              Password berhasil diubah. Sesi lama Anda telah diakhiri untuk keamanan — silakan login dengan password baru.
            </div>
            <Button
              onClick={() => navigate("/admin/login", { replace: true })}
              className="h-12 w-full rounded-none bg-primary font-mono text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              Ke Halaman Login
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6" data-testid="reset-password-form">
            <div className="space-y-2">
              <Label htmlFor="reset-password-new" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Password Baru
              </Label>
              <Input
                id="reset-password-new"
                data-testid="reset-password-new"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                className="h-12 rounded-none border-border bg-background font-mono text-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
              {tooShort && <p className="text-xs text-destructive">Minimal {MIN_PASSWORD_LENGTH} karakter.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Konfirmasi Password
              </Label>
              <Input
                id="reset-password-confirm"
                data-testid="reset-password-confirm"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
                className="h-12 rounded-none border-border bg-background font-mono text-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
              {mismatch && <p className="text-xs text-destructive">Password tidak cocok.</p>}
            </div>

            {error && (
              <div className="flex items-start gap-2 border border-destructive/50 bg-destructive/10 p-3" role="alert">
                <p className="text-sm text-destructive" data-testid="reset-password-error">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !canSubmit}
              data-testid="reset-password-submit"
              className="h-12 w-full rounded-none bg-primary font-mono text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? "MEMPROSES..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
