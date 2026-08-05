import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { api, formatApiError } from "@/lib/api";

const RESEND_SECONDS = 60;

function maskEmail(email) {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return "email Anda";
  return `${local.slice(0, 2)}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

function recoveryAudience(searchParams) {
  const audience = searchParams.get("audience");
  return audience === "customer" || audience === "staff"
    ? audience
    : "recovery";
}

function audienceSearch(audience) {
  return audience === "recovery" ? "" : `?audience=${audience}`;
}

function LoginDestinations({ audience }) {
  if (audience === "customer") {
    return (
      <Button asChild variant="link" className="w-full">
        <Link to="/login">Kembali ke login pelanggan</Link>
      </Button>
    );
  }

  if (audience === "staff") {
    return (
      <Button asChild variant="link" className="w-full">
        <Link to="/admin/login">Kembali ke login admin</Link>
      </Button>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button asChild variant="outline">
        <Link to="/login">Login pelanggan</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/admin/login">Login admin</Link>
      </Button>
    </div>
  );
}

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const audience = recoveryAudience(searchParams);
  const preservedSearch = audienceSearch(audience);
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
      navigate(`/forgot-password/check-email${preservedSearch}`, {
        replace: true,
      });
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

  const useAnotherEmail = () => {
    setEmail("");
    setMaskedEmail("");
    setSent(false);
    setCooldown(0);
    navigate(`/forgot-password${preservedSearch}`, { replace: true });
  };

  return (
    <AuthShell audience={audience}>
      <AuthCard
        eyebrow="Pemulihan akun"
        title={sent ? "Periksa email Anda" : "Lupa password?"}
        description={
          sent
            ? "Instruksi reset dikirim dengan respons yang sama untuk setiap permintaan."
            : "Masukkan email akun. Jika terdaftar dan memenuhi syarat, kami akan mengirimkan link reset."
        }
      >
        {sent ? (
          <div className="space-y-5" data-testid="forgot-password-sent">
            <Alert tone="default" role="status">
              Jika email {maskedEmail || "yang Anda masukkan"} terdaftar,
              instruksi reset password telah dikirim.
            </Alert>
            {error && <Alert id="forgot-password-error">{error}</Alert>}
            {email && (
              <Button
                type="button"
                onClick={requestReset}
                disabled={submitting || cooldown > 0}
                className="w-full"
                size="lg"
              >
                {submitting
                  ? "Mengirim…"
                  : cooldown > 0
                    ? `Kirim ulang (${cooldown})`
                    : "Kirim ulang"}
              </Button>
            )}
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={useAnotherEmail}
            >
              Gunakan email lain
            </Button>
            <LoginDestinations audience={audience} />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" data-testid="forgot-password-form">
            <FormField label="Email" required>
              <Input
                data-testid="forgot-password-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
              />
            </FormField>
            {error && <Alert id="forgot-password-error">{error}</Alert>}
            <Button
              type="submit"
              disabled={submitting}
              data-testid="forgot-password-submit"
              className="w-full"
              size="lg"
            >
              {submitting ? "Mengirim…" : "Kirim link reset"}
            </Button>
            <LoginDestinations audience={audience} />
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
