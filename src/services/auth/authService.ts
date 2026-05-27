import { User, Permission, Role } from '../../types/auth';
import { ROLES, PERMISSION_MATRIX } from '../../constants/permissions';

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  
  const userRole = user.role;
  
  // Super Admins bypass all standard permission checks
  if (userRole === ROLES.SUPER_ADMIN) return true;
  
  const allowedRoles = PERMISSION_MATRIX[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
}

/**
 * Check if a user has ANY of the specified permissions
 */
export function hasAnyPermission(user: User | null | undefined, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has ALL of the specified permissions
 */
export function hasAllPermissions(user: User | null | undefined, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Helper to verify if a user belongs to the same tenant or has global platform ownership
 */
export function canAccessTenantData(user: User | null | undefined, targetTenantId: string): boolean {
  if (!user) return false;
  
  // Platform Owner and Super Admin can access all tenant boundaries
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.PLATFORM_OWNER) {
    return true;
  }
  
  return user.tenantId === targetTenantId;
}
