import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
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
      <div className="relative overflow-hidden rounded-feature bg-surface-default p-6 shadow-overlay ring-1 ring-border-default sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-decoration-brand-soft" />
        <div className="relative">
          <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-control bg-decoration-brand-soft text-action-primary ring-1 ring-border-default">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-action-primary">Portal internal</p>
          <h1 className="brand-heading mt-3 text-3xl leading-tight text-text-primary sm:text-4xl">
            Selamat datang kembali.
          </h1>
          <p className="mt-3 max-w-md text-base leading-7 text-text-secondary">
            Masuk untuk mengelola operasional dan layanan Niuva.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="admin-login-form">
            <div className="space-y-2.5">
              <Label className="block text-sm font-semibold text-text-primary">Email admin</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-action-primary" aria-hidden="true" />
                <Input
                  data-testid="admin-login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                  placeholder="nama@niuva.com"
                  className="h-14 rounded-control border-border-default bg-surface-page pl-12 text-base text-text-primary placeholder:text-text-tertiary focus-visible:border-action-primary focus-visible:ring-2 focus-visible:ring-focus-ring"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="block text-sm font-semibold text-text-primary">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7c5ce7]" aria-hidden="true" />
                <Input
                  data-testid="admin-login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  className="h-14 rounded-control border-border-default bg-surface-page pl-12 text-base text-text-primary placeholder:text-text-tertiary focus-visible:border-action-primary focus-visible:ring-2 focus-visible:ring-focus-ring"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-control border border-destructive/30 bg-destructive/10 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                <p className="text-sm text-destructive" data-testid="admin-login-error">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || authLoading}
              data-testid="admin-login-submit"
              className="group h-14 w-full rounded-control bg-action-primary text-sm font-semibold text-text-inverse shadow-sm transition-all duration-emphasis ease-snap hover:bg-action-primary-hover hover:shadow-card"
            >
              {submitting ? "Memverifikasi..." : "Masuk ke Admin"}
              {!submitting && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-1 text-xs text-text-tertiary">
              <LockKeyhole className="h-3.5 w-3.5 text-[#21a179]" aria-hidden="true" />
              Akses terbatas khusus administrator Niuva
            </div>
          </form>
        </div>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-page selection:bg-decoration-brand-soft selection:text-text-primary">
      <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-decoration-brand-soft opacity-60" />

      <div className="relative mx-auto grid min-h-screen max-w-[var(--container-wide)] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-0 lg:px-8 lg:py-8">
        <div className="relative hidden min-h-[44rem] overflow-hidden rounded-feature bg-action-primary p-12 text-text-inverse shadow-overlay lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border-[44px] border-white/[0.08]" />
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-control bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
            </Link>
          </div>

          <div className="relative z-10 max-w-[34rem] border-l-2 border-white/40 pl-7">
            <p className="text-sm font-semibold text-white/80">Niuva Admin Studio</p>
            <h2 className="brand-heading mt-4 text-4xl leading-tight text-white xl:text-5xl">
              Kelola pekerjaan dengan lebih terarah.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
              Satu ruang kerja untuk memantau layanan, pelanggan, konten, dan aktivitas operasional Niuva.
            </p>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
              {["Akses terproteksi", "Operasional terintegrasi"].map((item, index) => (
                <div key={item} className="flex items-center gap-2.5 text-sm font-semibold text-white/90">
                  <CheckCircle2 className={`h-4 w-4 ${index === 0 ? "text-[#7ee2b8]" : "text-[#ffd166]"}`} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid gap-3 border-t border-white/20 pt-7 text-xs font-semibold leading-6 text-white/65 sm:grid-cols-[0.75fr_1.25fr] sm:items-start sm:gap-8">
            <p>(c) {new Date().getFullYear()} PT Niuva Inovasi Utama</p>
            <p>Bandung Techno Park - Mitra inovasi dan pengembangan produk</p>
          </div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-5 py-24 sm:px-10 lg:min-h-0 lg:px-12 xl:px-16">
          <div className="absolute left-5 top-6 sm:left-10 lg:hidden">
            <BrandIdentity />
          </div>
          <div className="absolute right-5 top-6 sm:right-10 lg:hidden">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Beranda
            </Link>
          </div>
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </div>
    </div>
  );
}
