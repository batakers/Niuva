import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  api,
  clearAdminCsrfToken,
  clearStoredToken,
  setAdminCsrfToken,
  getStoredToken,
} from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { pathname } = useLocation();
  const adminSurface = pathname.startsWith("/admin");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessExpiresAt, setAccessExpiresAt] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setUser(null);
    setAccessExpiresAt(null);
    if (adminSurface) clearStoredToken();
    else clearAdminCsrfToken();
    const customerToken = getStoredToken();
    if (!adminSurface && !customerToken) {
      setLoading(false);
      return () => { active = false; };
    }
    const bootstrap = adminSurface
      ? api.post("/auth/admin/session/refresh")
      : api.get("/auth/me");
    bootstrap
      .then(({ data }) => {
        if (!active) return;
        if (adminSurface) setAdminCsrfToken(data.csrf_token);
        setUser(adminSurface ? data.user : data);
        if (adminSurface) setAccessExpiresAt(data.access_expires_at);
      })
      .catch(() => {
        if (!active) return;
        clearAdminCsrfToken();
        setUser(null);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [adminSurface]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 401 &&
          error.response?.data?.detail?.code === "admin_session_expired"
        ) {
          clearAdminCsrfToken();
          setUser(null);
          setAccessExpiresAt(null);
        }
        return Promise.reject(error);
      },
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = useCallback((userData, csrfToken, expiresAt) => {
    setAdminCsrfToken(csrfToken);
    setUser(userData);
    setAccessExpiresAt(expiresAt);
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await api.post("/auth/admin/session/refresh");
    setAdminCsrfToken(data.csrf_token);
    setUser(data.user);
    setAccessExpiresAt(data.access_expires_at);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (adminSurface) await api.post("/auth/admin/logout");
    } finally {
      clearStoredToken();
      clearAdminCsrfToken();
      setUser(null);
      setAccessExpiresAt(null);
    }
  }, [adminSurface]);

  useEffect(() => {
    if (!user || !accessExpiresAt || !adminSurface) {
      return undefined;
    }
    const delay = Math.max(Date.parse(accessExpiresAt) - Date.now() - 60_000, 0);
    const timer = window.setTimeout(() => {
      refreshSession().catch(() => {
        clearAdminCsrfToken();
        setUser(null);
        setAccessExpiresAt(null);
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [accessExpiresAt, adminSurface, refreshSession, user]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshSession }),
    [user, loading, login, logout, refreshSession],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
