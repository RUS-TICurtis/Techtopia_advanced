import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasAnyRole } from '../../services/auth/authService';

export default function RoleGuard({ roles, fallback = null, children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback;
  }

  if (hasAnyRole(user, roles)) {
    return children;
  }

  return fallback;
}
