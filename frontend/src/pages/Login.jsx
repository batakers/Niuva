import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cuboid } from "lucide-react";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { api, formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Login() {
  const { t } = useI18n();
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      nav(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="font-heading text-2xl font-bold text-white mb-1">{t("auth.loginTitle")}</h1>
      <p className="text-slate-400 text-sm mb-7">NIUVA 3D Printing Order Platform</p>
      <form onSubmit={submit} className="space-y-4" data-testid="login-form">
        <div><Label className="text-slate-300 mb-1.5 block">{t("common.email")}</Label>
          <Input data-testid="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
        <div><Label className="text-slate-300 mb-1.5 block">{t("common.password")}</Label>
          <Input data-testid="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
        {error && <p className="text-sm text-red-400" data-testid="login-error">{error}</p>}
        <Button type="submit" disabled={loading} data-testid="login-submit" className="bg-blue-600 hover:bg-blue-500 w-full h-11">
          {loading ? t("common.loading") : t("auth.loginBtn")}
        </Button>
      </form>
      <p className="text-sm text-slate-400 mt-6 text-center">
        {t("auth.noAccount")} <Link to="/register" className="text-blue-400 hover:underline" data-testid="to-register-link">{t("nav.register")}</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0A0B10]">
      <div className="hidden lg:block relative grid-bg border-r border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-md bg-blue-600 grid place-items-center"><Cuboid className="h-5 w-5 text-white" strokeWidth={1.5} /></span>
            <span className="font-heading font-extrabold text-2xl text-white">NIUVA</span>
          </Link>
          <div>
            <h2 className="font-heading text-3xl font-bold text-white leading-tight max-w-sm">Dari file desain ke produk nyata.</h2>
            <p className="text-slate-400 mt-4 max-w-sm">Upload STL/OBJ, pilih material, lacak pesanan Anda dengan SLA 1x24 jam.</p>
          </div>
          <p className="font-mono-tech text-xs text-slate-600">PT NIUVA INOVASI UTAMA · BANDUNG</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
