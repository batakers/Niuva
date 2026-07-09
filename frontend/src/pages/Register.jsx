import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TerminalSquare } from "lucide-react";
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
      <div className="relative border border-border bg-surface-1 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-8 bg-surface-2 border-b border-border flex items-center px-4 gap-2">
          <TerminalSquare className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">USER_REGISTRATION</span>
        </div>

        <div className="p-8 pt-16">
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight mb-2 uppercase">{t("auth.registerTitle")}</h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-8">Create Profile // Client Access</p>
          
          <form onSubmit={submit} className="space-y-6" data-testid="register-form">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">ENTITY_NAME</Label>
              <Input 
                data-testid="register-name" 
                value={form.name} 
                onChange={set("name")} 
                required 
                className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">CREDENTIAL_ID (EMAIL)</Label>
              <Input 
                data-testid="register-email" 
                type="email" 
                value={form.email} 
                onChange={set("email")} 
                required 
                className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">COMMS (PHONE)</Label>
                <Input 
                  data-testid="register-phone" 
                  value={form.phone} 
                  onChange={set("phone")} 
                  className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">ORG (COMPANY)</Label>
                <Input 
                  data-testid="register-company" 
                  value={form.company} 
                  onChange={set("company")} 
                  className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">AUTHORIZATION_KEY (PASS)</Label>
              <Input 
                data-testid="register-password" 
                type="password" 
                value={form.password} 
                onChange={set("password")} 
                required 
                minLength={6} 
                className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
              />
            </div>
            
            {error && (
              <div className="border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
                <span className="font-mono text-[10px] text-destructive uppercase tracking-widest block mt-0.5">ERR:</span>
                <p className="text-sm text-destructive" data-testid="register-error">{error}</p>
              </div>
            )}
            
            <Button type="submit" disabled={loading} data-testid="register-submit" className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-mono uppercase tracking-widest text-xs">
              {loading ? "INITIALIZING..." : "CREATE_PROFILE"}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              ACTIVE_USER? <Link to="/login" className="text-primary hover:underline ml-1" data-testid="to-login-link">AUTHENTICATE_SYSTEM</Link>
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
