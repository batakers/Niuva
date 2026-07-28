import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, clearAdminCsrfToken, setAdminCsrfToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const adminSurface = window.location.pathname.startsWith("/admin");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessExpiresAt, setAccessExpiresAt] = useState(null);
  const adminBootstrapRefreshRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setUser(null);
    setAccessExpiresAt(null);
    if (!adminSurface) clearAdminCsrfToken();
    let bootstrap;
    if (adminSurface) {
      if (!adminBootstrapRefreshRef.current) {
        const request = api.post("/auth/admin/session/refresh");
        adminBootstrapRefreshRef.current = request;
        request.then(
          () => {
            if (adminBootstrapRefreshRef.current === request) {
              adminBootstrapRefreshRef.current = null;
            }
          },
          () => {
            if (adminBootstrapRefreshRef.current === request) {
              adminBootstrapRefreshRef.current = null;
            }
          },
        );
      }
      bootstrap = adminBootstrapRefreshRef.current;
    } else {
      bootstrap = api.get("/auth/me");
    }
    bootstrap
      .then(({ data }) => {
        if (!active) return;
        if (adminSurface) {
          setAdminCsrfToken(data.csrf_token);
          setAccessExpiresAt(data.access_expires_at);
          setUser(data.user);
        } else {
          setUser(data);
        }
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
        if (error.response?.status === 401) {
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
    if (csrfToken) setAdminCsrfToken(csrfToken);
    setUser(userData);
    setAccessExpiresAt(expiresAt || null);
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
      await api.post(adminSurface ? "/auth/admin/logout" : "/auth/logout");
    } finally {
      clearAdminCsrfToken();
      setUser(null);
      setAccessExpiresAt(null);
    }
  }, [adminSurface]);

  useEffect(() => {
    if (!adminSurface || !user || !accessExpiresAt) return undefined;
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
