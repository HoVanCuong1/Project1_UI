import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Dùng kèm ProtectedRoute. Giả định user đã đăng nhập và có mảng roles.
 * allowed: mảng role được phép, ví dụ ["ADMIN","MANAGER"]
 */
export default function RoleRoute({ allowed = [], children }) {
  const { user } = useAuth(); // user.roles: string[]
  const ok =
    user?.roles?.some(r => allowed.includes(r)) ?? false;

  if (!ok) return <Navigate to="/403" replace />;
  return children;
}
