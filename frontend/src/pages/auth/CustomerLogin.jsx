import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiError } from "@/lib/api";


export default function CustomerLogin() {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requestedDestination = location.state?.from;
  const destination =
    typeof requestedDestination === "string" &&
    (requestedDestination === "/dashboard" ||
      requestedDestination === "/order" ||
      requestedDestination.startsWith("/orders/"))
      ? requestedDestination
      : "/dashboard";

  useEffect(() => {
    document.title = "Login Pelanggan - Niuva";
  }, []);

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
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="overflow-hidden rounded-panel border border-border-default bg-surface-default shadow-surface">
        <div className="border-b border-border-default bg-surface-muted px-6 py-4">
          <p className="type-label text-text-secondary">PORTAL PELANGGAN</p>
        </div>
        <div className="p-8">
          <h1 className="mb-2 font-heading text-2xl font-bold tracking-tight text-text-primary">
            Login pelanggan
          </h1>
          <p className="mb-8 type-body-small text-text-secondary">
            Masuk untuk melihat pesanan yang terhubung dengan akun Anda.
          </p>
          <form onSubmit={submit} className="space-y-5" data-testid="customer-login-form">
            <div className="space-y-1.5">
              <Label htmlFor="customer-login-email">Email</Label>
              <Input
                id="customer-login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-login-password">Password</Label>
              <Input
                id="customer-login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <Alert className="type-body-small">{error}</Alert>}
            <Button type="submit" className="w-full" size="lg" disabled={submitting || loading}>
              {submitting ? "Memverifikasi…" : "Masuk"}
            </Button>
            <Link
              to="/forgot-password"
              className="block text-center type-body-small text-text-secondary hover:text-text-primary"
            >
              Lupa password?
            </Link>
          </form>
        </div>
      </div>
    </AuthShell>
  );
}
