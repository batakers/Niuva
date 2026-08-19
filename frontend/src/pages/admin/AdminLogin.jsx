import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError } from "../../lib/api";
import { hasPermission } from "../../lib/permissions";
import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { FormField } from "../../components/ui/form-field";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useI18n } from "../../i18n";

const ADMIN_LOGIN_PATH = "/admin/login";
const SAFE_URL_ORIGIN = "https://niuva.local";

export function getAdminDestination(requestedDestination) {
  if (typeof requestedDestination !== "string" || !requestedDestination.startsWith("/")) {
    return "/admin";
  }

  if (requestedDestination.startsWith("//") || requestedDestination.includes("\\")) {
    return "/admin";
  }

  let parsed;
  try {
    parsed = new URL(requestedDestination, SAFE_URL_ORIGIN);
  } catch {
    return "/admin";
  }

  if (
    parsed.origin !== SAFE_URL_ORIGIN
    || parsed.username
    || parsed.password
  ) {
    return "/admin";
  }

  const { pathname } = parsed;
  if (
    /%(?:2f|5c|2e)/i.test(pathname)
    || (pathname !== "/admin" && !pathname.startsWith("/admin/"))
    || pathname === ADMIN_LOGIN_PATH
    || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  ) {
    return "/admin";
  }

  return `${pathname}${parsed.search}${parsed.hash}`;
}

export default function AdminLogin() {
  const { t } = useI18n();
  const { user, loading: authLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requestedDestination = location.state?.from;
  const destination = getAdminDestination(requestedDestination);
  const invitationAccepted = location.state?.invitationAccepted === true;

  useEffect(() => {
    document.title = `${t("auth.adminLogin")} - Niuva`;
    document.querySelector('link[rel="canonical"]')?.remove();

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");

    return () => robots.remove();
  }, [t]);

  if (!authLoading && hasPermission(user, "admin.access")) {
    return <Navigate to={destination} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/admin/login", {
        email,
        password,
        remember_me: rememberMe,
      });
      login(data.user, data.csrf_token, data.access_expires_at);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell audience="staff">
      <AuthCard
        eyebrow={t("admin.console")}
        title={t("auth.adminLogin")}
        description={t("auth.adminLoginSubtitle")}
      >
        <form onSubmit={submit} className="space-y-5" data-testid="admin-login-form">
          <FormField label={t("common.email")} required>
            <Input
              id="admin-login-email"
              data-testid="admin-login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </FormField>

          <FormField label={t("common.password")} required>
            <Input
              id="admin-login-password"
              data-testid="admin-login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </FormField>

          <div className="flex items-center gap-3">
            <input
              id="admin-login-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded-control border-border-strong text-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
            />
            <Label htmlFor="admin-login-remember-me" className="type-body-small text-text-secondary">
              {t("auth.rememberMe")}
            </Label>
          </div>

          {invitationAccepted && (
            <Alert tone="success" data-testid="admin-login-invitation-success">
              {t("auth.invitationAccepted")}
            </Alert>
          )}

          {error && (
            <Alert className="type-body-small" data-testid="admin-login-error">
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            disabled={submitting || authLoading}
            data-testid="admin-login-submit"
            className="w-full"
            size="lg"
          >
            {submitting ? t("auth.verifying") : t("auth.loginAction")}
          </Button>

          <Button asChild variant="link" className="w-full">
            <Link to="/forgot-password?audience=staff">
              {t("auth.forgotPassword")}
            </Link>
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
