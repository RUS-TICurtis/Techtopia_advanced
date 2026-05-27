import { Permission } from '../types/auth';
import { PERMISSIONS } from '../constants/permissions';

export interface SidebarItem {
  id: string;
  label: string;
  permission: Permission;
  group: 'main' | 'crm' | 'operations' | 'finance' | 'insights' | 'intelligence' | 'admin';
  badge?: string;
}

export const GROUP_LABELS: Record<string, string> = {
  main: 'Home',
  crm: 'Customer Relations',
  operations: 'Operations',
  finance: 'Finance & Billing',
  insights: 'Business Insights',
  intelligence: 'AI & Automations',
  admin: 'Administration',
};

export const SIDEBAR_CONFIG: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', permission: PERMISSIONS.VIEW_DASHBOARD, group: 'main' },
  { id: 'leads', label: 'Leads', permission: PERMISSIONS.VIEW_LEADS, group: 'crm' },
  { id: 'contacts', label: 'Contacts', permission: PERMISSIONS.VIEW_CONTACTS, group: 'crm' },
  { id: 'companies', label: 'Companies', permission: PERMISSIONS.VIEW_CONTACTS, group: 'crm' },
  { id: 'pipeline', label: 'Pipeline', permission: PERMISSIONS.VIEW_PIPELINE, group: 'crm' },
  { id: 'clients', label: 'Clients', permission: PERMISSIONS.VIEW_CLIENTS, group: 'crm' },
  { id: 'projects', label: 'Projects', permission: PERMISSIONS.VIEW_PROJECTS, group: 'operations' },
  { id: 'tasks', label: 'Tasks', permission: PERMISSIONS.VIEW_DASHBOARD, group: 'operations' },
  { id: 'calendar', label: 'Calendar', permission: PERMISSIONS.VIEW_DASHBOARD, group: 'operations' },
  { id: 'activities', label: 'Activities', permission: PERMISSIONS.VIEW_DASHBOARD, group: 'operations' },
  { id: 'support', label: 'Support', permission: PERMISSIONS.VIEW_SUPPORT, group: 'operations' },
  { id: 'messages', label: 'Messages', permission: PERMISSIONS.VIEW_DASHBOARD, group: 'operations' },
  { id: 'billing', label: 'Billing', permission: PERMISSIONS.VIEW_BILLING, group: 'finance' },
  { id: 'invoices', label: 'Invoices', permission: PERMISSIONS.VIEW_BILLING, group: 'finance' },
  { id: 'contracts', label: 'Contracts', permission: PERMISSIONS.VIEW_CONTRACTS, group: 'finance' },
  { id: 'analytics', label: 'Analytics', permission: PERMISSIONS.VIEW_ANALYTICS, group: 'insights' },
  { id: 'reports', label: 'Reports', permission: PERMISSIONS.EXPORT_ANALYTICS, group: 'insights' },
  { id: 'ai-assistant', label: 'AI Assistant', permission: PERMISSIONS.AI_CHAT, group: 'intelligence' },
  { id: 'automations', label: 'Automations', permission: PERMISSIONS.VIEW_AUTOMATIONS, group: 'intelligence' },
  { id: 'team', label: 'Team', permission: PERMISSIONS.VIEW_TEAM, group: 'admin' },
  { id: 'audit-logs', label: 'Audit Logs', permission: PERMISSIONS.VIEW_AUDIT, group: 'admin' },
  { id: 'settings', label: 'Settings', permission: PERMISSIONS.VIEW_SETTINGS, group: 'admin' },
];
