import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError } from "../../lib/api";
import { hasPermission } from "../../lib/permissions";
import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useI18n } from "../../i18n";

export default function AdminLogin() {
  const { t } = useI18n();
  const { user, loading: authLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requestedDestination = location.state?.from;
  const destination =
    typeof requestedDestination === "string" &&
    requestedDestination.startsWith("/admin") &&
    !requestedDestination.startsWith("/admin/login")
      ? requestedDestination
      : "/admin";

  useEffect(() => {
    document.title = "Admin Authentication - Niuva";
    document.querySelector('link[rel="canonical"]')?.remove();

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");

    return () => robots.remove();
  }, []);

  if (!authLoading && hasPermission(user, "admin.access")) {
    return <Navigate to={destination} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/admin/login", { email, password });
      login(data.token, data.user);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="rounded-panel border border-border-default bg-surface-default shadow-surface overflow-hidden">
        <div className="bg-surface-muted border-b border-border-default px-6 py-4">
          <p className="type-label text-text-secondary">{t("admin.console")}</p>
        </div>

        <div className="p-8">
          <h1 className="mb-2 font-heading text-2xl font-bold tracking-tight text-text-primary">
            {t("auth.adminLogin")}
          </h1>
          <p className="mb-8 type-body-small text-text-secondary">
            {t("auth.adminLoginSubtitle")}
          </p>

          <form onSubmit={submit} className="space-y-5" data-testid="admin-login-form">
            <div className="space-y-1.5">
              <Label htmlFor="admin-login-email" className="type-label text-text-secondary">
                {t("common.email")}
              </Label>
              <Input
                id="admin-login-email"
                data-testid="admin-login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-login-password" className="type-label text-text-secondary">
                {t("common.password")}
              </Label>
              <Input
                id="admin-login-password"
                data-testid="admin-login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

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

            <Link
              to="/forgot-password"
              className="block text-center type-body-small text-text-secondary transition-colors hover:text-text-primary"
            >
              {t("auth.forgotPassword")}
            </Link>
          </form>
        </div>
      </div>
    </AuthShell>
  );
}
