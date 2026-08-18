import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";

const MIN_PASSWORD_LENGTH = 15;

export function getRegistrationDestination(value) {
  if (typeof value !== "string" || !value.startsWith("/")) return "/dashboard";
  let path = value;
  try {
    const parsed = new URL(value, "https://niuva.invalid");
    if (parsed.origin !== "https://niuva.invalid") return "/dashboard";
    path = parsed.pathname;
  } catch {
    return "/dashboard";
  }
  if (path === "/dashboard" || path === "/order" || path === "/retail") {
    return path;
  }
  if (/^\/orders\/[^/?#]+$/.test(path)) return path;
  if (/^\/retail\/products\/[^/?#]+$/.test(path)) return path;
  return "/dashboard";
}

function detailCode(requestError) {
  const detail = requestError?.response?.data?.detail;
  return detail && typeof detail === "object" ? detail.code : null;
}

function registrationError(requestError, copy) {
  const code = detailCode(requestError);
  if (code === "google_provider_unavailable") return copy.providerUnavailable;
  if (code === "registration_consent_required") return copy.consentRequired;
  if (code === "registration_verification_invalid") return copy.verificationInvalid;
  if (code === "google_link_required") return copy.googleLinkRequired;
  if (code === "google_registration_required") return copy.googleRegistrationRequired;
  if (code === "google_verification_failed") return copy.googleVerificationFailed;
  if (code === "google_state_invalid") return copy.googleStateInvalid;
  if (code === "session_expired") return copy.sessionExpired;
  if (requestError?.response?.status === 429) return copy.rateLimited;
  if (!requestError?.response || requestError.response.status >= 500) {
    return copy.unavailable;
  }
  return copy.generic;
}

function callbackError(code, copy) {
  if (code === "google_provider_unavailable") return copy.providerUnavailable;
  if (code === "google_link_required") return copy.googleLinkRequired;
  if (code === "google_registration_required") return copy.googleRegistrationRequired;
  if (code === "google_verification_failed") return copy.googleVerificationFailed;
  if (code === "google_state_invalid") return copy.googleStateInvalid;
  if (code === "session_expired") return copy.sessionExpired;
  return copy.generic;
}

function maskedEmail(value) {
  const [local = "", domain = ""] = value.split("@");
  if (!domain) return value;
  return `${local.slice(0, 2)}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

export default function CustomerRegistration() {
  const { lang, t } = useI18n();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const copy = useMemo(() => ({
    title: t("auth.registration.title"),
    eyebrow: t("auth.registration.eyebrow"),
    heading: t("auth.registration.heading"),
    description: t("auth.registration.description"),
    name: t("auth.registration.name"),
    email: t("auth.registration.email"),
    password: t("auth.registration.password"),
    confirmPassword: t("auth.registration.confirmPassword"),
    consent: t("auth.registration.consent"),
    privacy: t("auth.registration.privacy"),
    submit: t("auth.registration.submit"),
    submitting: t("auth.registration.submitting"),
    google: t("auth.registration.google"),
    orEmail: t("auth.registration.orEmail"),
    existing: t("auth.registration.existing"),
    login: t("auth.registration.login"),
    pendingTitle: t("auth.registration.pendingTitle"),
    pendingDescription: t("auth.registration.pendingDescription"),
    resend: t("auth.registration.resend"),
    resending: t("auth.registration.resending"),
    verifiedTitle: t("auth.registration.verifiedTitle"),
    verifiedDescription: t("auth.registration.verifiedDescription"),
    verifyChecking: t("auth.registration.verifyChecking"),
    verificationInvalid: t("auth.registration.verificationInvalid"),
    providerUnavailable: t("auth.registration.providerUnavailable"),
    unavailable: t("auth.registration.unavailable"),
    generic: t("auth.registration.generic"),
    consentRequired: t("auth.registration.consentRequired"),
    passwordMismatch: t("auth.registration.passwordMismatch"),
    passwordHint: t("auth.registration.passwordHint"),
    returnTo: t("auth.registration.returnTo"),
    rateLimited: t("auth.registration.rateLimited"),
    googleLinkRequired: t("auth.registration.googleLinkRequired"),
    googleRegistrationRequired: t("auth.registration.googleRegistrationRequired"),
    googleVerificationFailed: t("auth.registration.googleVerificationFailed"),
    googleStateInvalid: t("auth.registration.googleStateInvalid"),
    sessionExpired: t("auth.registration.sessionExpired"),
  }), [t]);
  const destination = getRegistrationDestination(
    location.state?.from || searchParams.get("return_to"),
  );
  const token = searchParams.get("token");
  const authCallback = searchParams.get("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [view, setView] = useState(token ? "verifying" : "form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState(authCallback ? callbackError(authCallback, copy) : "");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const verificationStarted = useRef(false);
  const privacyRoute = lang === "en" ? "/en/privacy" : "/privasi";

  useEffect(() => {
    document.title = `${copy.title} - Niuva`;
  }, [copy.title]);

  useEffect(() => {
    if (!token || verificationStarted.current) return undefined;
    verificationStarted.current = true;
    let active = true;
    api.post("/auth/register/verify", { token })
      .then(({ data }) => {
        if (!active) return;
        setView("verified");
        setError("");
        if (data?.return_to) {
          window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}?return_to=${encodeURIComponent(getRegistrationDestination(data.return_to))}`,
          );
        }
      })
      .catch((requestError) => {
        if (!active) return;
        setView("invalid");
        setError(registrationError(requestError, copy));
      });
    return () => {
      active = false;
    };
  }, [copy, token]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const normalizedName = name.trim();
    if (normalizedName.length < 2) {
      setError(copy.generic);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(copy.passwordHint);
      return;
    }
    if (password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }
    if (!consent) {
      setError(copy.consentRequired);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        name: normalizedName,
        email: email.trim().toLowerCase(),
        password,
        privacy_consent: true,
        return_to: destination,
      });
      setPendingEmail(email.trim().toLowerCase());
      setView("pending");
      setError("");
    } catch (requestError) {
      setError(registrationError(requestError, copy));
    } finally {
      setSubmitting(false);
    }
  };

  const startGoogle = async () => {
    setError("");
    if (!consent) {
      setError(copy.consentRequired);
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/google/start", {
        mode: "register",
        return_to: destination,
        privacy_consent: true,
      });
      if (!data?.authorization_url) throw new Error("google_authorization_missing");
      window.location.assign(data.authorization_url);
    } catch (requestError) {
      setError(registrationError(requestError, copy));
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError("");
    setResending(true);
    try {
      await api.post("/auth/register/resend", { email: pendingEmail });
    } catch (requestError) {
      setError(registrationError(requestError, copy));
    } finally {
      setResending(false);
    }
  };

  const loginLink = (
    <Button asChild variant="link" className="w-full">
      <Link to="/login" state={{ from: destination }}>{copy.login}</Link>
    </Button>
  );

  return (
    <AuthShell audience="customer" heading={copy.heading} tagline={copy.description}>
      <AuthCard eyebrow={copy.eyebrow} title={view === "pending" ? copy.pendingTitle : view === "verified" ? copy.verifiedTitle : copy.title} description={view === "pending" ? copy.pendingDescription : view === "verified" ? copy.verifiedDescription : copy.description}>
        {view === "verifying" && (
          <Alert tone="default" role="status" aria-live="polite">{copy.verifyChecking}</Alert>
        )}

        {view === "invalid" && (
          <div className="space-y-5">
            <Alert>{error || copy.verificationInvalid}</Alert>
            {loginLink}
          </div>
        )}

        {view === "verified" && (
          <div className="space-y-5" data-testid="customer-registration-verified">
            <Alert tone="success" role="status">{copy.verifiedDescription}</Alert>
            <p className="text-sm leading-6 text-text-secondary">{copy.returnTo}</p>
            {loginLink}
          </div>
        )}

        {view === "pending" && (
          <div className="space-y-5" data-testid="customer-registration-pending">
            <Alert tone="default" role="status">{copy.pendingDescription}</Alert>
            <p className="text-sm leading-6 text-text-secondary">{maskedEmail(pendingEmail)}</p>
            {error && <Alert>{error}</Alert>}
            <Button type="button" onClick={resend} disabled={resending} className="w-full" size="lg">
              {resending ? copy.resending : copy.resend}
            </Button>
            {loginLink}
          </div>
        )}

        {view === "form" && (
          <div className="space-y-5">
            {error && <Alert>{error}</Alert>}
            <Button type="button" variant="outline" className="w-full" size="lg" onClick={startGoogle} disabled={submitting} data-testid="customer-registration-google">
              {copy.google}
            </Button>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-text-muted" aria-hidden="true">
              <span className="h-px flex-1 bg-border-default" />
              <span>{copy.orEmail}</span>
              <span className="h-px flex-1 bg-border-default" />
            </div>
            <form onSubmit={submit} className="space-y-5" data-testid="customer-registration-form">
              <FormField label={copy.name} required>
                <Input id="customer-registration-name" type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
              </FormField>
              <FormField label={copy.email} required>
                <Input id="customer-registration-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </FormField>
              <FormField label={copy.password} hint={copy.passwordHint} required>
                <Input id="customer-registration-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required />
              </FormField>
              <FormField label={copy.confirmPassword} required>
                <Input id="customer-registration-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required />
              </FormField>
              <div className="flex items-start gap-3">
                <input id="customer-registration-consent" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} aria-invalid={error === copy.consentRequired} className="mt-1 h-5 w-5 rounded border-border-control accent-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" />
                <label htmlFor="customer-registration-consent" className="text-sm leading-6 text-text-secondary">
                  {copy.consent} {" "}
                  <Link className="font-semibold text-action-primary underline-offset-4 hover:underline" to={privacyRoute}>{copy.privacy}</Link>
                </label>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? copy.submitting : copy.submit}
              </Button>
            </form>
            <p className="text-center text-sm leading-6 text-text-secondary">
              {copy.existing} {" "}
              <Link className="font-semibold text-action-primary underline-offset-4 hover:underline" to="/login" state={{ from: destination }}>
                {copy.login}
              </Link>
            </p>
          </div>
        )}
      </AuthCard>
    </AuthShell>
  );
}
