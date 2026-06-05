import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/permissions';

export default function ClientPortalRoute() {
  const { authStatus, isAuthenticated, user } = useAuth();

  if (authStatus === 'INITIALIZING') {
    return null;
  }

  if (!isAuthenticated || authStatus === 'UNAUTHENTICATED') {
    return <Navigate to="/auth/login" replace />;
  }

  // Permit only CLIENT role or SUPER_ADMIN role for support debug actions
  if (user?.role !== ROLES.CLIENT && user?.role !== ROLES.SUPER_ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
