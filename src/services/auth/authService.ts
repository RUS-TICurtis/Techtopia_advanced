import { User, Permission } from '../../types/auth';
import { ROLES, PERMISSION_MATRIX } from '../../constants/permissions';

/**
 * Maps backend role string to frontend ROLES constant
 */
export function mapBackendRoleToFrontend(backendRole: string): string {
  if (!backendRole) return 'guest';
  const roleLower = backendRole.toLowerCase();
  if (roleLower.includes('super_admin') || roleLower.includes('super admin') || roleLower === 'administrator') return 'super_admin';
  if (roleLower.includes('platform_owner') || roleLower.includes('platform owner')) return 'platform_owner';
  if (roleLower.includes('tenant_admin') || roleLower.includes('tenant admin')) return 'tenant_admin';
  if (roleLower === 'client') return 'client';
  if (roleLower === 'support') return 'support';
  if (roleLower === 'sales' || roleLower.includes('sales')) return 'sales';
  if (roleLower === 'developer') return 'developer';
  if (roleLower === 'ai_operator' || roleLower.includes('ai operator') || roleLower.includes('ai_operator')) return 'ai_operator';
  if (roleLower === 'hr') return 'hr';
  if (roleLower === 'finance') return 'finance';
  if (roleLower === 'project_manager' || roleLower.includes('project manager') || roleLower.includes('project_manager')) return 'project_manager';
  if (roleLower === 'operations') return 'operations';
  return backendRole;
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null | undefined, role: string): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some(
    r => r.toLowerCase() === role.toLowerCase() || mapBackendRoleToFrontend(r) === role.toLowerCase()
  );
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null | undefined, roles: string[]): boolean {
  if (!user || !user.roles) return false;
  return roles.some(role => hasRole(user, role));
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  
  // Super Admins bypass all standard permission checks
  if (hasAnyRole(user, ['Administrator', 'SuperAdmin', 'super_admin', 'platform_owner', 'Platform Owner'])) {
    return true;
  }
  
  // Direct check in permissions list returned from backend
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }

  // Fallback check against frontend matrix using mapped roles
  const allowedRoles = PERMISSION_MATRIX[permission];
  if (allowedRoles && user.roles) {
    const mappedUserRoles = user.roles.map(mapBackendRoleToFrontend);
    if (mappedUserRoles.some(r => allowedRoles.includes(r))) return true;
  }
  
  return false;
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
  if (hasAnyRole(user, ['Administrator', 'SuperAdmin', 'super_admin', 'platform_owner', 'Platform Owner'])) {
    return true;
  }
  
  return user.tenantId === targetTenantId;
}
