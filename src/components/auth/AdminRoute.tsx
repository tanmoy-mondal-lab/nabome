import { type ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
}
