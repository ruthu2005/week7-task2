import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

/**
 * Route Guard for Authenticated Pages
 * Restricts unauthenticated access to private dashboard and protected routes.
 * Preserves target route in location.state.from for smooth post-login redirection.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading indicator while session token is being validated with backend
  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="page-loader-spinner" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={18} color="var(--accent-primary)" />
          <span>Verifying secure session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to /login and preserve requested path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children or nested route Outlet
  return children ? children : <Outlet />;
}

