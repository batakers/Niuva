import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, TerminalSquare } from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError } from "../../lib/api";
import { hasPermission } from "../../lib/permissions";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function AdminLogin() {
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
      <div className="relative overflow-hidden border border-border bg-surface-1">
        <div className="absolute left-0 right-0 top-0 flex h-8 items-center gap-2 border-b border-border bg-surface-2 px-4">
          <TerminalSquare className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            ADMIN_AUTHENTICATION
          </span>
        </div>

        <div className="p-8 pt-16">
          <h1 className="mb-2 font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
            Admin Login
          </h1>
          <p className="mb-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Internal Niuva Administration
          </p>

          <form onSubmit={submit} className="space-y-6" data-testid="admin-login-form">
            <div className="space-y-2">
              <Label htmlFor="admin-login-email" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                CREDENTIAL_ID (EMAIL)
              </Label>
              <Input
                id="admin-login-email"
                data-testid="admin-login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
                className="h-12 rounded-none border-border bg-background font-mono text-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-login-password" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                AUTHORIZATION_KEY
              </Label>
              <Input
                id="admin-login-password"
                data-testid="admin-login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="h-12 rounded-none border-border bg-background font-mono text-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 border border-destructive/50 bg-destructive/10 p-3">
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-destructive">
                  ERR:
                </span>
                <p className="text-sm text-destructive" data-testid="admin-login-error">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || authLoading}
              data-testid="admin-login-submit"
              className="h-12 w-full rounded-none bg-primary font-mono text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? "VERIFYING..." : "ACCESS_ADMIN_SYSTEM"}
            </Button>
          </form>
        </div>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen bg-background selection:bg-primary/20 selection:text-foreground lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface-1 lg:flex">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
        <div className="absolute left-0 top-1/4 h-px w-full border-dashed bg-border" />
        <div className="absolute left-0 top-3/4 h-px w-full border-dashed bg-border" />
        <div className="absolute bottom-0 left-1/4 top-0 w-px border-dashed bg-border" />

        <div className="relative z-10 flex h-full flex-col p-12">
          <div>
            <Link
              to="/"
              className="-ml-3 mb-12 inline-flex items-center gap-2 border border-transparent bg-surface-2/0 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-border hover:bg-surface-2 hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> RETURN_TO_SITE
            </Link>
            <LogoWordmark className="mb-16 h-8 text-foreground" />

            <div className="border-l-2 border-primary pl-6">
              <h2 className="max-w-md font-heading text-4xl font-extrabold uppercase leading-tight tracking-tight text-foreground">
                Internal<br />Administration<br />System
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">
                Restricted operational access for authorized Niuva administrators.
              </p>
            </div>
          </div>

          <div className="mt-auto border-t border-border/50 pt-8">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              ACCESS_SCOPE
            </span>
            <span className="block font-mono text-sm text-primary">AUTHORIZED_PERSONNEL_ONLY</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-4 sm:p-12">
        <div className="absolute left-6 top-6 lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> SITE
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
