import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireRole({ role, children }) {
  const { user, initializing } = useContext(AuthContext);
  const location = useLocation();

  // Wait until AuthContext restores the saved session
  if (initializing) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-sm text-gray-500">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Normalize role values
  const userRole = String(user.role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/-/g, "_");

  const requiredRole = String(role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/-/g, "_");

  // Role doesn't match
  if (userRole !== requiredRole) {
    console.warn("RequireRole: role mismatch", {
      userRole,
      requiredRole,
      user,
    });

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}