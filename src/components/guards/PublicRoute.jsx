import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/permissions';

export default function PublicRoute() {
  const { authStatus, isAuthenticated, user } = useAuth();

  if (authStatus === 'INITIALIZING') {
    return null;
  }

  if (isAuthenticated) {
    if (authStatus === 'MFA_REQUIRED') {
      return <Navigate to="/auth/mfa" replace />;
    }
    if (user?.role === ROLES.CLIENT) {
      return <Navigate to="/client" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
