import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { api, formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AuthShell } from "./Login";

export default function Register() {
  const { t } = useI18n();
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", company: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      nav("/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="font-heading text-2xl font-bold text-white mb-1">{t("auth.registerTitle")}</h1>
      <p className="text-slate-400 text-sm mb-7">Buat akun untuk memesan jasa 3D printing.</p>
      <form onSubmit={submit} className="space-y-4" data-testid="register-form">
        <div><Label className="text-slate-300 mb-1.5 block">{t("common.name")}</Label>
          <Input data-testid="register-name" value={form.name} onChange={set("name")} required className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
        <div><Label className="text-slate-300 mb-1.5 block">{t("common.email")}</Label>
          <Input data-testid="register-email" type="email" value={form.email} onChange={set("email")} required className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 mb-1.5 block">{t("common.phone")}</Label>
            <Input data-testid="register-phone" value={form.phone} onChange={set("phone")} className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
          <div><Label className="text-slate-300 mb-1.5 block">{t("auth.company")}</Label>
            <Input data-testid="register-company" value={form.company} onChange={set("company")} className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
        </div>
        <div><Label className="text-slate-300 mb-1.5 block">{t("common.password")}</Label>
          <Input data-testid="register-password" type="password" value={form.password} onChange={set("password")} required minLength={6} className="bg-[#1E2130] border-slate-700 text-white focus-visible:ring-blue-500/50" /></div>
        {error && <p className="text-sm text-red-400" data-testid="register-error">{error}</p>}
        <Button type="submit" disabled={loading} data-testid="register-submit" className="bg-blue-600 hover:bg-blue-500 w-full h-11">
          {loading ? t("common.loading") : t("auth.registerBtn")}
        </Button>
      </form>
      <p className="text-sm text-slate-400 mt-6 text-center">
        {t("auth.haveAccount")} <Link to="/login" className="text-blue-400 hover:underline" data-testid="to-login-link">{t("nav.login")}</Link>
      </p>
    </AuthShell>
  );
}
