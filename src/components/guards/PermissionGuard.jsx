import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasAnyPermission } from '../../services/auth/authService';

export default function PermissionGuard({ permissions, fallback = null, children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback;
  }

  if (hasAnyPermission(user, permissions)) {
    return children;
  }

  return fallback;
}
