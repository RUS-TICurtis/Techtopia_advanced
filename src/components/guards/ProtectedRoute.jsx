import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../services/auth/authService';
import Unauthorized from '../../pages/admin/Unauthorized';
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

  // Enforce MFA checks first
  if (authStatus === 'MFA_REQUIRED') {
    return <Navigate to="/auth/mfa" replace />;
  }

  // Client role users must be kept in the Client Portal subtree
  if (user?.role === ROLES.CLIENT) {
    return <Navigate to="/client" replace />;
  }

  // Strict permission gating using centralized RBAC
  if (permission && !hasPermission(user, permission)) {
    return <Unauthorized />;
  }

  return <Outlet />;
}
