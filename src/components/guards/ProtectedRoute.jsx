import React, { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../services/auth/authService';
const Unauthorized = lazy(() => import('../../pages/admin/Unauthorized'));
import { ROLES } from '../../constants/permissions';

export default function ProtectedRoute({ permission }) {
  const { authStatus, user, isAuthenticated } = useAuth();

  // If still checking authentication, do not render or flash contents
  if (authStatus === 'INITIALIZING') {
    return null;
  }

  if (!isAuthenticated || authStatus === 'UNAUTHENTICATED') {
    return <Navigate to="/auth/login" replace />;
  }

  // Client role users must be kept in the Client Portal subtree
  if (user?.role === ROLES.CLIENT) {
    return <Navigate to="/client" replace />;
  }

  // Strict permission gating using centralized RBAC
  if (permission && !hasPermission(user, permission)) {
    return (
      <Suspense fallback={null}>
        <Unauthorized />
      </Suspense>
    );
  }

  return <Outlet />;
}
