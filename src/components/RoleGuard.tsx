import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: string;
};

export default function RoleGuard({ children, allowedRoles, fallback = "/unauthorized" }: RoleGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
