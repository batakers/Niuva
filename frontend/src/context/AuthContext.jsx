import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  api,
  clearAdminCsrfToken,
  clearStoredToken,
  setAdminCsrfToken,
  getStoredToken,
} from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessExpiresAt, setAccessExpiresAt] = useState(null);

  useEffect(() => {
    const adminSurface = window.location.pathname.startsWith("/admin");
    if (adminSurface) clearStoredToken();
    const customerToken = getStoredToken();
    if (!adminSurface && !customerToken) {
      setLoading(false);
      return;
    }
    const bootstrap = adminSurface
      ? api.post("/auth/admin/session/refresh")
      : api.get("/auth/me");
    bootstrap
      .then(({ data }) => {
        if (adminSurface) setAdminCsrfToken(data.csrf_token);
        setUser(adminSurface ? data.user : data);
        if (adminSurface) setAccessExpiresAt(data.access_expires_at);
      })
      .catch(() => {
        clearAdminCsrfToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

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
      await api.post("/auth/admin/logout");
    } finally {
      clearAdminCsrfToken();
      setUser(null);
      setAccessExpiresAt(null);
    }
  }, []);

  useEffect(() => {
    if (!user || !accessExpiresAt || !window.location.pathname.startsWith("/admin")) {
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
  }, [accessExpiresAt, refreshSession, user]);

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
