import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function captureToken() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token") || "";
  url.searchParams.delete("token");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return token;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const capturedToken = useRef(null);
  const [token, setToken] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [validating, setValidating] = useState(true);
  const [preparationError, setPreparationError] = useState(false);
  const [preparationAttempt, setPreparationAttempt] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef(null);

  useLayoutEffect(() => {
    if (capturedToken.current === null) capturedToken.current = captureToken();
    setToken(capturedToken.current);
  }, []);

  useEffect(() => {
    let active = true;
    async function prepare() {
      if (token === null) return;
      setValidating(true);
      setPreparationError(false);
      if (!token) {
        navigate("/reset-password/error", { replace: true });
        return;
      }
      try {
        const validation = await api.post("/auth/reset-password/validate", { token });
        if (!active) return;
        if (!validation.data?.valid) {
          navigate("/reset-password/error", { replace: true });
          return;
        }
        const policyResponse = await api.get("/auth/password-policy");
        if (!active) return;
        setPolicy(policyResponse.data);
        setValidating(false);
      } catch {
        if (!active) return;
        setPreparationError(true);
        setValidating(false);
      }
    }
    prepare();
    return () => { active = false; };
  }, [navigate, preparationAttempt, token]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const codePoints = Array.from(newPassword).length;
  const utf8Bytes = new TextEncoder().encode(newPassword).length;
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const lengthValid = policy
    && codePoints >= policy.min_code_points
    && codePoints <= policy.max_code_points
    && utf8Bytes <= policy.max_utf8_bytes;
  const canSubmit = lengthValid && newPassword === confirmPassword;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: newPassword });
      navigate("/reset-password/success", { replace: true });
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell heading={"Account\nRecovery"} tagline="Buat password baru untuk akun Anda.">
      <div className="border border-border-default bg-surface-default p-8">
        <h1 className="mb-2 font-heading text-2xl font-bold uppercase tracking-tight text-text-primary">
          Reset Password
        </h1>
        {preparationError ? (
          <div className="space-y-6" role="alert">
            <p className="text-sm text-text-secondary">Link belum dapat diperiksa. Periksa koneksi, lalu coba lagi.</p>
            <Button type="button" onClick={() => setPreparationAttempt((attempt) => attempt + 1)} className="h-12 w-full rounded-none bg-action-primary font-mono text-xs uppercase tracking-widest text-text-inverse hover:bg-action-primary-hover">
              Coba Lagi
            </Button>
          </div>
        ) : validating ? (
          <p className="text-sm text-text-secondary" role="status" aria-live="polite">Memeriksa link reset...</p>
        ) : (
          <form onSubmit={submit} className="space-y-6" data-testid="reset-password-form">
            <p className="text-sm leading-relaxed text-text-secondary">Masukkan password baru untuk akun Anda.</p>
            <div className="space-y-2">
              <Label htmlFor="reset-password-new" className="block font-mono text-[10px] uppercase tracking-widest text-text-secondary">
                Password Baru
              </Label>
              <div className="flex">
                <Input
                  id="reset-password-new"
                  data-testid="reset-password-new"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={policy.min_code_points}
                  autoComplete="new-password"
                  aria-describedby="reset-password-rules"
                  aria-invalid={newPassword.length > 0 && !lengthValid ? "true" : undefined}
                  className="h-12 rounded-none border-border-default bg-surface-page font-mono text-sm focus-visible:border-action-primary focus-visible:ring-1 focus-visible:ring-action-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="min-h-12 border border-l-0 border-border-default px-3 font-mono text-[10px] uppercase tracking-wider text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
              <ul id="reset-password-rules" aria-live="polite" className="space-y-1 text-xs text-text-secondary">
                <li className={newPassword && codePoints < policy.min_code_points ? "text-destructive" : ""}>
                  {policy.min_code_points}-{policy.max_code_points} karakter Unicode.
                </li>
                <li>Maksimal {policy.max_utf8_bytes} byte; tanpa aturan kombinasi karakter.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm" className="block font-mono text-[10px] uppercase tracking-widest text-text-secondary">
                Konfirmasi Password
              </Label>
              <Input
                id="reset-password-confirm"
                data-testid="reset-password-confirm"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
                aria-invalid={mismatch || undefined}
                aria-describedby={mismatch ? "reset-password-mismatch" : undefined}
                className="h-12 rounded-none border-border-default bg-surface-page font-mono text-sm focus-visible:border-action-primary focus-visible:ring-1 focus-visible:ring-action-primary/20"
              />
              {mismatch && <p id="reset-password-mismatch" className="text-xs text-destructive">Password tidak cocok.</p>}
            </div>

            {error && (
              <div ref={errorRef} tabIndex={-1} className="border border-destructive/50 bg-destructive/10 p-3" role="alert">
                <p className="text-sm text-destructive" data-testid="reset-password-error">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !canSubmit}
              data-testid="reset-password-submit"
              className="h-12 w-full rounded-none bg-action-primary font-mono text-xs uppercase tracking-widest text-text-inverse hover:bg-action-primary-hover"
            >
              {submitting ? "MEMPROSES..." : "Reset Password"}
            </Button>
            <Link to="/forgot-password" className="block text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary">
              Minta Link Baru
            </Link>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
