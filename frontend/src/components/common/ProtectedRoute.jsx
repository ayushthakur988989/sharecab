import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * ProtectedRoute — Redirects to /login if user is not authenticated.
 * Optionally checks for required role (passenger | driver | admin).
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, activeRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save where user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based guard: e.g. admin page requires role === 'admin'
  if (requiredRole && user?.role !== requiredRole && activeRole !== requiredRole) {
    // Redirect to their home based on actual role
    if (user?.role === 'driver') return <Navigate to="/driver" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/app" replace />;
  }

  return children;
}
