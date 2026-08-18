import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { getAuthCopy } from "@/components/auth/AuthShell";
import { useI18n } from "@/i18n";

export function getCustomerDestination(requestedDestination) {
  if (typeof requestedDestination !== "string") return "/dashboard";
  if (requestedDestination === "/dashboard" || requestedDestination === "/order") {
    return requestedDestination;
  }
  if (/^\/orders\/[^/?#]+(?:[?#].*)?$/.test(requestedDestination)) {
    return requestedDestination;
  }
  return "/dashboard";
}

function loginError(requestError, copy) {
  const status = requestError?.response?.status;
  if (status === 401) return copy.errors.invalidCredentials;
  if (!requestError?.response || status >= 500) return copy.errors.unavailable;
  return copy.errors.generic;
}

function googleLoginError(requestError, copy) {
  const code = requestError?.response?.data?.detail?.code;
  if (code === "google_provider_unavailable") return copy.providerUnavailable;
  if (code === "google_link_required") return copy.googleLinkRequired;
  if (code === "google_registration_required") return copy.googleRegistrationRequired;
  if (code === "google_state_invalid") return copy.googleStateInvalid;
  if (code === "google_verification_failed") return copy.googleVerificationFailed;
  if (!requestError?.response || requestError.response.status >= 500) return copy.providerUnavailable;
  return copy.errors.generic;
}

function googleCallbackError(code, copy) {
  if (code === "google_provider_unavailable") return copy.providerUnavailable;
  if (code === "google_link_required") return copy.googleLinkRequired;
  if (code === "google_registration_required") return copy.googleRegistrationRequired;
  if (code === "google_state_invalid") return copy.googleStateInvalid;
  if (code === "google_verification_failed") return copy.googleVerificationFailed;
  return "";
}


export default function CustomerLogin() {
  const { user, loading, login } = useAuth();
  const { lang } = useI18n();
  const copy = getAuthCopy(lang).login;
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = new URLSearchParams(location.search);
  const callbackCode = searchParams.get("auth");
  const [error, setError] = useState(() => googleCallbackError(callbackCode, copy));
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const requestedDestination = location.state?.from || searchParams.get("return_to");
  const destination = getCustomerDestination(requestedDestination);

  useEffect(() => {
    document.title = `${copy.title} - Niuva`;
  }, [copy.title]);

  if (!loading && user) {
    return <Navigate to={destination} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.user);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(loginError(requestError, copy));
    } finally {
      setSubmitting(false);
    }
  };

  const startGoogleLogin = async () => {
    setError("");
    setGoogleSubmitting(true);
    try {
      const { data } = await api.post("/auth/google/start", {
        mode: "login",
        return_to: destination,
      });
      if (!data?.authorization_url) throw new Error("google_authorization_missing");
      window.location.assign(data.authorization_url);
    } catch (requestError) {
      setError(googleLoginError(requestError, copy));
      setGoogleSubmitting(false);
    }
  };

  return (
    <AuthShell audience="customer">
      <AuthCard
        eyebrow={copy.eyebrow}
        title={copy.heading}
        description={copy.description}
      >
        <form onSubmit={submit} className="space-y-5" data-testid="customer-login-form">
          <FormField label={copy.email} required>
            <Input
              id="customer-login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </FormField>
          <FormField label={copy.password} required>
            <Input
              id="customer-login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </FormField>
          {error && <Alert>{error}</Alert>}
          <Button type="submit" className="w-full" size="lg" disabled={submitting || loading}>
            {submitting ? copy.verifying : copy.submit}
          </Button>
          <Button type="button" variant="outline" className="w-full" size="lg" onClick={startGoogleLogin} disabled={submitting || googleSubmitting || loading}>
            {copy.google}
          </Button>
          <Button asChild variant="link" className="w-full">
            <Link to="/forgot-password?audience=customer">{copy.forgot}</Link>
          </Button>
          <p className="text-center text-sm leading-6 text-text-secondary">
            {copy.registerPrompt} {" "}
            <Link className="font-semibold text-action-primary underline-offset-4 hover:underline" to="/register" state={{ from: destination }}>
              {copy.register}
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
