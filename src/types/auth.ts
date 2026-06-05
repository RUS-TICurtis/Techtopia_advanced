export type Role =
  | 'guest'
  | 'client'
  | 'support'
  | 'sales'
  | 'developer'
  | 'ai_operator'
  | 'hr'
  | 'finance'
  | 'project_manager'
  | 'operations'
  | 'tenant_admin'
  | 'platform_owner'
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleLabel: string;
  avatar: string;
  department: string | null;
  tenantId: string;
  clientCompany?: string;
  roles?: string[];
  permissions?: string[];
  phone?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
}

export interface UserSession {
  user: User | null;
  isAuthenticated: boolean;
  lastActivity: number | null;
}

export type Permission =
  | 'dashboard.view'
  | 'dashboard.customize'
  | 'leads.view'
  | 'leads.create'
  | 'leads.edit'
  | 'leads.delete'
  | 'leads.assign'
  | 'leads.export'
  | 'contacts.view'
  | 'contacts.create'
  | 'contacts.edit'
  | 'contacts.delete'
  | 'pipeline.view'
  | 'pipeline.edit'
  | 'pipeline.manage_stages'
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.manage_team'
  | 'billing.view'
  | 'billing.create_invoice'
  | 'billing.edit_invoice'
  | 'billing.delete_invoice'
  | 'billing.manage_subscriptions'
  | 'contracts.view'
  | 'contracts.create'
  | 'contracts.send'
  | 'contracts.delete'
  | 'support.view'
  | 'support.manage'
  | 'support.assign'
  | 'analytics.view'
  | 'analytics.export'
  | 'analytics.executive'
  | 'ai.chat'
  | 'ai.generate'
  | 'ai.admin'
  | 'team.view'
  | 'team.manage'
  | 'team.invite'
  | 'audit.view'
  | 'audit.export'
  | 'automations.view'
  | 'automations.create'
  | 'automations.delete'
  | 'settings.view'
  | 'settings.tenant'
  | 'settings.security'
  | 'settings.billing_admin'
  | 'client_portal.view'
  | 'client_portal.invoices'
  | 'client_portal.contracts'
  | 'client_portal.projects'
  | 'client_portal.support';
