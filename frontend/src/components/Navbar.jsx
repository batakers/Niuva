import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Globe, LogOut, LayoutDashboard, Cuboid } from "lucide-react";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const navItems = [
  ["/", "nav.home"],
  ["/about", "nav.about"],
  ["/services", "nav.services"],
  ["/portfolio", "nav.portfolio"],
  ["/ecosystem", "nav.ecosystem"],
  ["/internship", "nav.internship"],
  ["/contact", "nav.contact"],
];

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  const goDash = () => nav(user?.role === "admin" ? "/admin" : "/dashboard");

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#0A0B10]/70 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
          <span className="h-8 w-8 rounded-md bg-blue-600 grid place-items-center">
            <Cuboid className="h-5 w-5 text-white" strokeWidth={1.5} />
          </span>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">NIUVA</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(([path, key]) => (
            <Link
              key={path}
              to={path}
              data-testid={`nav-${key.split(".")[1]}`}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                loc.pathname === path ? "text-blue-400" : "text-slate-300 hover:text-white"
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            data-testid="language-toggle"
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono-tech uppercase text-slate-300 hover:text-white border border-slate-700 rounded-md transition-colors"
          >
            <Globe className="h-3.5 w-3.5" strokeWidth={1.5} /> {lang}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button data-testid="nav-dashboard-btn" onClick={goDash} variant="outline"
                className="border-slate-700 text-slate-200 hover:text-white h-9">
                <LayoutDashboard className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                {user.role === "admin" ? t("nav.admin") : t("nav.dashboard")}
              </Button>
              <Button data-testid="nav-logout-btn" onClick={() => { logout(); nav("/"); }} variant="ghost"
                className="text-slate-400 hover:text-white h-9 w-9 p-0">
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" data-testid="nav-login-link">
                <Button variant="ghost" className="text-slate-200 hover:text-white h-9">{t("nav.login")}</Button>
              </Link>
              <Link to="/order" data-testid="nav-order-link">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white h-9">{t("nav.order")}</Button>
              </Link>
            </div>
          )}

          <button data-testid="mobile-menu-toggle" className="lg:hidden text-slate-200 p-1" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0A0B10] px-5 py-4 space-y-1">
          {navItems.map(([path, key]) => (
            <Link key={path} to={path} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm text-slate-300 hover:text-white rounded-md">
              {t(key)}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Button onClick={() => { setOpen(false); goDash(); }} className="bg-blue-600 hover:bg-blue-500 w-full">
                  {user.role === "admin" ? t("nav.admin") : t("nav.dashboard")}
                </Button>
                <Button onClick={() => { logout(); nav("/"); setOpen(false); }} variant="outline" className="border-slate-700 w-full">
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" className="border-slate-700 w-full">{t("nav.login")}</Button></Link>
                <Link to="/order" onClick={() => setOpen(false)}><Button className="bg-blue-600 hover:bg-blue-500 w-full">{t("nav.order")}</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
