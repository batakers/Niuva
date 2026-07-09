import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, TerminalSquare } from "lucide-react";
import { LogoWordmark } from "../components/ui/logo";
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
      <div className="relative border border-border bg-surface-1 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-8 bg-surface-2 border-b border-border flex items-center px-4 gap-2">
          <TerminalSquare className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">SYSTEM_AUTHENTICATION</span>
        </div>

        <div className="p-8 pt-16">
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight mb-2 uppercase">{t("auth.loginTitle")}</h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-8">Niuva Manufacturing Portal</p>
          
          <form onSubmit={submit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">CREDENTIAL_ID (EMAIL)</Label>
              <Input 
                data-testid="login-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">AUTHORIZATION_KEY</Label>
              <Input 
                data-testid="login-password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="rounded-none border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 bg-background font-mono text-sm h-12"
              />
            </div>
            
            {error && (
              <div className="border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
                <span className="font-mono text-[10px] text-destructive uppercase tracking-widest block mt-0.5">ERR:</span>
                <p className="text-sm text-destructive" data-testid="login-error">{error}</p>
              </div>
            )}
            
            <Button type="submit" disabled={loading} data-testid="login-submit" className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-mono uppercase tracking-widest text-xs">
              {loading ? "VERIFYING..." : "ACCESS_SYSTEM"}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              UNREGISTERED_USER? <Link to="/register" className="text-primary hover:underline ml-1" data-testid="to-register-link">INITIATE_REGISTRATION</Link>
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-primary/20 selection:text-foreground">
      {/* Visual Identity Side */}
      <div className="hidden lg:flex relative border-r border-border bg-surface-1 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        
        {/* Floating engineering lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-border border-dashed" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-border border-dashed" />
        <div className="absolute top-0 bottom-0 left-1/4 w-px bg-border border-dashed" />
        
        <div className="relative p-12 z-10 flex flex-col h-full">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-12 text-muted-foreground hover:text-foreground transition-colors font-mono text-[10px] uppercase tracking-widest border border-transparent hover:border-border bg-surface-2/0 hover:bg-surface-2 px-3 py-1.5 -ml-3">
              <ArrowLeft className="h-3 w-3" /> RETURN_TO_BASE
            </Link>
            <LogoWordmark className="h-8 text-foreground mb-16" />
            
            <div className="border-l-2 border-primary pl-6">
              <h2 className="font-heading text-4xl font-extrabold text-foreground leading-tight tracking-tight max-w-md uppercase">
                Precision<br/>Manufacturing<br/>Platform
              </h2>
              <p className="text-muted-foreground mt-6 text-lg max-w-sm leading-relaxed">
                Industrial-grade 3D printing and prototyping services. Upload CAD data, configure materials, and track production.
              </p>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex gap-8 border-t border-border/50 pt-8">
              <div>
                <span className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">SYSTEM_STATUS</span>
                <span className="block font-mono text-sm text-primary">ONLINE</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">SLA_TARGET</span>
                <span className="block font-mono text-sm text-foreground">24_HOURS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Side */}
      <div className="flex items-center justify-center p-4 sm:p-12 relative">
        <div className="absolute top-6 left-6 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
            <ArrowLeft className="h-3 w-3" /> BASE
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
