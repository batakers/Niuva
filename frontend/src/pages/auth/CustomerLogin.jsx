import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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
    <AuthShell audience="customer">
      <AuthCard
        eyebrow="Portal pelanggan"
        title="Masuk ke akun Anda"
        description="Lihat pesanan dan perkembangan pekerjaan yang terhubung dengan akun Anda."
      >
        <form onSubmit={submit} className="space-y-5" data-testid="customer-login-form">
          <FormField label="Email" required>
            <Input
              id="customer-login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </FormField>
          <FormField label="Password" required>
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
            {submitting ? "Memverifikasi…" : "Masuk"}
          </Button>
          <Button asChild variant="link" className="w-full">
            <Link to="/forgot-password?audience=customer">Lupa password?</Link>
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
