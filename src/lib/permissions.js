/**
 * Enterprise Permission Engine — RBAC + ABAC
 * Techtopia CRM Hub
 */

// ============================================================
// Role Hierarchy (higher index = more privileged)
// ============================================================
export const ROLES = {
  GUEST: 'guest',
  CLIENT: 'client',
  SUPPORT: 'support',
  SALES: 'sales',
  DEVELOPER: 'developer',
  AI_OPERATOR: 'ai_operator',
  HR: 'hr',
  FINANCE: 'finance',
  PROJECT_MANAGER: 'project_manager',
  OPERATIONS: 'operations',
  TENANT_ADMIN: 'tenant_admin',
  PLATFORM_OWNER: 'platform_owner',
  SUPER_ADMIN: 'super_admin',
};

const ROLE_HIERARCHY = [
  ROLES.GUEST,
  ROLES.CLIENT,
  ROLES.SUPPORT,
  ROLES.SALES,
  ROLES.DEVELOPER,
  ROLES.AI_OPERATOR,
  ROLES.HR,
  ROLES.FINANCE,
  ROLES.PROJECT_MANAGER,
  ROLES.OPERATIONS,
  ROLES.TENANT_ADMIN,
  ROLES.PLATFORM_OWNER,
  ROLES.SUPER_ADMIN,
];

export function getRoleLevel(role) {
  return ROLE_HIERARCHY.indexOf(role);
}

export function hasMinRole(userRole, minRole) {
  return getRoleLevel(userRole) >= getRoleLevel(minRole);
}

// ============================================================
// Permission Matrix
// Format: { 'resource.action': [roles] }
// ============================================================
export const PERMISSION_MATRIX = {
  // Dashboard
  'dashboard.view': [ROLES.GUEST, ROLES.CLIENT, ROLES.SUPPORT, ROLES.SALES, ROLES.DEVELOPER, ROLES.AI_OPERATOR, ROLES.HR, ROLES.FINANCE, ROLES.PROJECT_MANAGER, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'dashboard.customize': [ROLES.SALES, ROLES.DEVELOPER, ROLES.AI_OPERATOR, ROLES.HR, ROLES.FINANCE, ROLES.PROJECT_MANAGER, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Leads
  'leads.view': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'leads.create': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'leads.edit': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'leads.delete': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'leads.assign': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'leads.export': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Contacts
  'contacts.view': [ROLES.SALES, ROLES.SUPPORT, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'contacts.create': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'contacts.edit': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'contacts.delete': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Pipeline
  'pipeline.view': [ROLES.SALES, ROLES.OPERATIONS, ROLES.FINANCE, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'pipeline.edit': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'pipeline.manage_stages': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Clients
  'clients.view': [ROLES.SALES, ROLES.SUPPORT, ROLES.OPERATIONS, ROLES.FINANCE, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'clients.create': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'clients.edit': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'clients.delete': [ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Projects
  'projects.view': [ROLES.DEVELOPER, ROLES.PROJECT_MANAGER, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'projects.create': [ROLES.PROJECT_MANAGER, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'projects.edit': [ROLES.PROJECT_MANAGER, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'projects.delete': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'projects.manage_team': [ROLES.PROJECT_MANAGER, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Billing
  'billing.view': [ROLES.FINANCE, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'billing.create_invoice': [ROLES.FINANCE, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'billing.edit_invoice': [ROLES.FINANCE, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'billing.delete_invoice': [ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'billing.manage_subscriptions': [ROLES.FINANCE, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Contracts
  'contracts.view': [ROLES.SALES, ROLES.FINANCE, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'contracts.create': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'contracts.send': [ROLES.SALES, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'contracts.delete': [ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Support
  'support.view': [ROLES.SUPPORT, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'support.manage': [ROLES.SUPPORT, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'support.assign': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Analytics
  'analytics.view': [ROLES.SALES, ROLES.FINANCE, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'analytics.export': [ROLES.FINANCE, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'analytics.executive': [ROLES.FINANCE, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // AI
  'ai.chat': [ROLES.SALES, ROLES.SUPPORT, ROLES.DEVELOPER, ROLES.AI_OPERATOR, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'ai.generate': [ROLES.SALES, ROLES.AI_OPERATOR, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'ai.admin': [ROLES.AI_OPERATOR, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Team
  'team.view': [ROLES.HR, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'team.manage': [ROLES.HR, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'team.invite': [ROLES.HR, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Audit Logs
  'audit.view': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'audit.export': [ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Automations
  'automations.view': [ROLES.OPERATIONS, ROLES.AI_OPERATOR, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'automations.create': [ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'automations.delete': [ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Settings
  'settings.view': [ROLES.SALES, ROLES.SUPPORT, ROLES.DEVELOPER, ROLES.AI_OPERATOR, ROLES.HR, ROLES.FINANCE, ROLES.PROJECT_MANAGER, ROLES.OPERATIONS, ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'settings.tenant': [ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'settings.security': [ROLES.TENANT_ADMIN, ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],
  'settings.billing_admin': [ROLES.PLATFORM_OWNER, ROLES.SUPER_ADMIN],

  // Client Portal
  'client_portal.view': [ROLES.CLIENT, ROLES.GUEST],
  'client_portal.invoices': [ROLES.CLIENT],
  'client_portal.contracts': [ROLES.CLIENT],
  'client_portal.projects': [ROLES.CLIENT],
  'client_portal.support': [ROLES.CLIENT],
};

// ============================================================
// Core Permission Check
// ============================================================
/**
 * @param {string} userRole
 * @param {string} permission - e.g. 'leads.create'
 * @returns {boolean}
 */
export function can(userRole, permission) {
  if (!userRole) return false;
  // Super admin can do everything
  if (userRole === ROLES.SUPER_ADMIN) return true;
  const allowedRoles = PERMISSION_MATRIX[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Check multiple permissions (any)
 * @param {string} userRole
 * @param {string[]} permissions
 */
export function canAny(userRole, permissions) {
  return permissions.some(p => can(userRole, p));
}

/**
 * Check multiple permissions (all)
 * @param {string} userRole
 * @param {string[]} permissions
 */
export function canAll(userRole, permissions) {
  return permissions.every(p => can(userRole, p));
}

// ============================================================
// Sidebar Nav Filter
// ============================================================
export function getNavItemsForRole(role) {
  const allItems = [
    { id: 'dashboard', label: 'Dashboard', permission: 'dashboard.view', group: 'main' },
    { id: 'leads', label: 'Leads', permission: 'leads.view', group: 'crm' },
    { id: 'contacts', label: 'Contacts', permission: 'contacts.view', group: 'crm' },
    { id: 'companies', label: 'Companies', permission: 'contacts.view', group: 'crm' },
    { id: 'pipeline', label: 'Pipeline', permission: 'pipeline.view', group: 'crm' },
    { id: 'clients', label: 'Clients', permission: 'clients.view', group: 'crm' },
    { id: 'projects', label: 'Projects', permission: 'projects.view', group: 'operations' },
    { id: 'tasks', label: 'Tasks', permission: 'dashboard.view', group: 'operations' },
    { id: 'calendar', label: 'Calendar', permission: 'dashboard.view', group: 'operations' },
    { id: 'activities', label: 'Activities', permission: 'dashboard.view', group: 'operations' },
    { id: 'support', label: 'Support', permission: 'support.view', group: 'operations' },
    { id: 'messages', label: 'Messages', permission: 'dashboard.view', group: 'operations' },
    { id: 'billing', label: 'Billing', permission: 'billing.view', group: 'finance' },
    { id: 'invoices', label: 'Invoices', permission: 'billing.view', group: 'finance' },
    { id: 'contracts', label: 'Contracts', permission: 'contracts.view', group: 'finance' },
    { id: 'analytics', label: 'Analytics', permission: 'analytics.view', group: 'insights' },
    { id: 'reports', label: 'Reports', permission: 'analytics.export', group: 'insights' },
    { id: 'ai-assistant', label: 'AI Assistant', permission: 'ai.chat', group: 'intelligence' },
    { id: 'automations', label: 'Automations', permission: 'automations.view', group: 'intelligence' },
    { id: 'team', label: 'Team', permission: 'team.view', group: 'admin' },
    { id: 'audit-logs', label: 'Audit Logs', permission: 'audit.view', group: 'admin' },
    { id: 'settings', label: 'Settings', permission: 'settings.view', group: 'admin' },
  ];
  return allItems.filter(item => can(role, item.permission));
}
