import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getAuthCopy } from "@/components/auth/AuthShell";
import { useI18n } from "@/i18n";

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

function LoginDestinations({ audience, copy }) {
  if (audience === "customer") {
    return (
      <Button asChild variant="link" className="w-full">
        <Link to="/login">{copy.customerLogin}</Link>
      </Button>
    );
  }

  if (audience === "staff") {
    return (
      <Button asChild variant="link" className="w-full">
        <Link to="/admin/login">{copy.staffLogin}</Link>
      </Button>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button asChild variant="outline">
        <Link to="/login">{copy.customerDestination}</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/admin/login">{copy.staffDestination}</Link>
      </Button>
    </div>
  );
}

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useI18n();
  const copy = getAuthCopy(lang).recovery;
  const audience = recoveryAudience(searchParams);
  const preservedSearch = audienceSearch(audience);
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(location.pathname.endsWith("/check-email"));
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    document.title = `${copy.title} - Niuva`;
  }, [copy.title]);

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
      const status = requestError?.response?.status;
      setError(
        requestError?.response && (status == null || status < 500)
          ? copy.errors.requestFailed
          : copy.errors.unavailable,
      );
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
        eyebrow={copy.eyebrow}
        title={sent ? copy.sentTitle : copy.requestTitle}
        description={sent ? copy.sentDescription : copy.requestDescription}
      >
        {sent ? (
          <div className="space-y-5" data-testid="forgot-password-sent">
            <Alert tone="default" role="status">
              {copy.maskedPrefix} {maskedEmail || (lang === "en" ? "the email you entered" : "yang Anda masukkan")} {copy.maskedSuffix}
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
                  ? copy.sending
                  : cooldown > 0
                    ? copy.resend(cooldown)
                    : copy.resendReady}
              </Button>
            )}
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={useAnotherEmail}
            >
              {copy.anotherEmail}
            </Button>
            <LoginDestinations audience={audience} copy={copy} />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" data-testid="forgot-password-form">
            <FormField label={copy.email} required>
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
              {submitting ? copy.sending : copy.request}
            </Button>
            <LoginDestinations audience={audience} copy={copy} />
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
