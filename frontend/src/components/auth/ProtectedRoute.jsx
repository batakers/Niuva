import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";
import ForbiddenPage from "@/pages/admin/ForbiddenPage";

export function ProtectedRoute({ children, permission }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface-page">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) {
    const loginPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }
  if (!permission && hasPermission(user, "admin.access")) {
    return <Navigate to="/admin" replace />;
  }
  if (permission && !hasPermission(user, permission)) {
    return <ForbiddenPage />;
  }
  return children;
}
