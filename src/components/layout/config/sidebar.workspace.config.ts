import { 
  LayoutDashboard, Sparkles, Bell, Clock, Search, ShieldCheck,
  TrendingUp, Users, Building2, UserCircle2, GitBranch, FileText, FileSignature,
  DollarSign, BarChart3, Receipt, LifeBuoy, MessageSquare, Zap, ShieldAlert, Settings,
  FolderKanban, Mail, Layers, GraduationCap, FileSpreadsheet, KeyRound
} from 'lucide-react';
import { PERMISSIONS } from '../../../constants/permissions';

export interface WorkspaceGroup {
  id: string;
  label: string;
  icon: any;
  color: string;
}

export interface WorkspaceItem {
  id: string;
  label: string;
  url: string;
  group: string;
  permission?: string;
  badge?: string;
}

export const WORKSPACE_GROUPS: WorkspaceGroup[] = [
  { id: 'core', label: 'Core Platform', icon: LayoutDashboard, color: '#38BDF8' },
  { id: 'crm', label: 'CRM Lifecycle', icon: UserCircle2, color: '#6366F1' },
  { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp, color: '#EC4899' },
  { id: 'support', label: 'Customer Support', icon: LifeBuoy, color: '#38BDF8' },
  { id: 'marketing', label: 'Marketing Hub', icon: Mail, color: '#FB923C' },
  { id: 'projects', label: 'Projects & Sprints', icon: FolderKanban, color: '#10B981' },
  { id: 'hr', label: 'HR & Operations', icon: Users, color: '#EF4444' },
  { id: 'finance', label: 'Finance & Ledger', icon: Receipt, color: '#F59E0B' },
  { id: 'communications', label: 'Omnichannel Chat', icon: MessageSquare, color: '#10B981' },
  { id: 'documents', label: 'Shared Documents', icon: FileSignature, color: '#6366F1' },
  { id: 'ai', label: 'AI & Automation', icon: Zap, color: '#38BDF8' },
  { id: 'admin', label: 'Access & Governance', icon: ShieldCheck, color: '#EF4444' },
];

export const WORKSPACE_ITEMS: WorkspaceItem[] = [
  // Core Group
  { id: 'dashboard', label: 'Operations Dashboard', url: '/', group: 'core', permission: PERMISSIONS.VIEW_DASHBOARD },
  { id: 'ai-copilot', label: 'AI Assistant', url: '/ai', group: 'core', permission: PERMISSIONS.VIEW_DASHBOARD },
  { id: 'activities', label: 'Activity Feed', url: '/activities', group: 'core', permission: PERMISSIONS.VIEW_DASHBOARD },

  // CRM Group
  { id: 'leads', label: 'Leads Inbox', url: '/leads', group: 'crm', permission: PERMISSIONS.VIEW_LEADS },
  { id: 'contacts', label: 'Contacts Directory', url: '/contacts', group: 'crm', permission: PERMISSIONS.VIEW_CONTACTS },
  { id: 'companies', label: 'Organizations', url: '/companies', group: 'crm', permission: PERMISSIONS.VIEW_CLIENTS },
  { id: 'clients', label: 'Client Accounts', url: '/clients', group: 'crm', permission: PERMISSIONS.VIEW_CLIENTS },

  // Sales Group
  { id: 'pipeline', label: 'Sales Pipelines', url: '/pipeline', group: 'sales', permission: PERMISSIONS.VIEW_PIPELINE },
  { id: 'quotes', label: 'Quotes & Proposals', url: '/crm/quotes', group: 'sales', permission: PERMISSIONS.VIEW_PIPELINE },
  { id: 'catalog', label: 'Product Catalog', url: '/crm/catalog', group: 'sales', permission: PERMISSIONS.VIEW_PIPELINE },
  { id: 'intelligence', label: 'Revenue Intelligence', url: '/intelligence', group: 'sales', permission: PERMISSIONS.VIEW_ANALYTICS },

  // Support Group
  { id: 'support', label: 'SLA Tickets', url: '/support', group: 'support', permission: PERMISSIONS.VIEW_SUPPORT },
  { id: 'tickets', label: 'Support Tickets', url: '/crm/tickets', group: 'support', permission: PERMISSIONS.VIEW_SUPPORT },

  // Marketing Group
  { id: 'automations-mktg', label: 'Marketing Builders', url: '/automations', group: 'marketing', permission: PERMISSIONS.VIEW_AUTOMATIONS },
  { id: 'campaigns', label: 'Campaigns', url: '/crm/campaigns', group: 'marketing', permission: PERMISSIONS.VIEW_AUTOMATIONS },

  // Projects Group
  { id: 'projects', label: 'Workspaces', url: '/projects', group: 'projects', permission: PERMISSIONS.VIEW_PROJECTS },
  { id: 'tasks', label: 'Task Board', url: '/tasks', group: 'projects', permission: PERMISSIONS.VIEW_PROJECTS },
  { id: 'calendar', label: 'Scheduling', url: '/calendar', group: 'projects', permission: PERMISSIONS.VIEW_PROJECTS },

  // HR Group
  { id: 'hr-dashboard', label: 'HR Dashboard', url: '/hr', group: 'hr', permission: PERMISSIONS.HR_VIEW },
  { id: 'hr-employees', label: 'Employees', url: '/hr/employees', group: 'hr', permission: PERMISSIONS.HR_VIEW },
  { id: 'hr-departments', label: 'Departments', url: '/hr/departments', group: 'hr', permission: PERMISSIONS.HR_VIEW },
  { id: 'hr-leave', label: 'Leave Management', url: '/hr/leave', group: 'hr', permission: PERMISSIONS.HR_MANAGE },
  { id: 'hr-attendance', label: 'Attendance', url: '/hr/attendance', group: 'hr', permission: PERMISSIONS.HR_MANAGE },
  { id: 'hr-self-service', label: 'Self Service', url: '/hr/self-service', group: 'hr', permission: PERMISSIONS.HR_SELF_SERVICE },
  { id: 'team', label: 'Admin Team Config', url: '/team', group: 'hr', permission: PERMISSIONS.VIEW_TEAM },

  // Finance Group
  { id: 'finance-overview', label: 'Finance Overview', url: '/finance', group: 'finance', permission: PERMISSIONS.FINANCE_VIEW },
  { id: 'finance-gl', label: 'General Ledger', url: '/finance/gl', group: 'finance', permission: PERMISSIONS.FINANCE_VIEW },
  { id: 'finance-bank', label: 'Bank Reconciliation', url: '/finance/bank', group: 'finance', permission: PERMISSIONS.FINANCE_VIEW },
  { id: 'finance-assets', label: 'Fixed Assets', url: '/finance/assets', group: 'finance', permission: PERMISSIONS.FINANCE_VIEW },
  { id: 'finance-invoices', label: 'Invoices', url: '/finance/invoices', group: 'finance', permission: PERMISSIONS.INVOICE_VIEW },
  { id: 'finance-payments', label: 'Payments', url: '/finance/payments', group: 'finance', permission: PERMISSIONS.PAYMENT_VIEW },
  { id: 'finance-subscriptions', label: 'Subscriptions', url: '/finance/subscriptions', group: 'finance', permission: PERMISSIONS.SUBSCRIPTION_MANAGE },
  { id: 'finance-expenses', label: 'Expenses', url: '/finance/expenses', group: 'finance', permission: PERMISSIONS.EXPENSE_SUBMIT },
  { id: 'finance-vendors', label: 'Vendors', url: '/finance/vendors', group: 'finance', permission: PERMISSIONS.VENDOR_VIEW },
  { id: 'finance-procurement', label: 'Procurement', url: '/finance/procurement', group: 'finance', permission: PERMISSIONS.VENDOR_VIEW },
  { id: 'finance-budgets', label: 'Budgets', url: '/finance/budgets', group: 'finance', permission: PERMISSIONS.BUDGET_VIEW },
  { id: 'finance-revenue', label: 'Revenue Analytics', url: '/finance/revenue', group: 'finance', permission: PERMISSIONS.FINANCE_VIEW },
  { id: 'finance-reports', label: 'Financial Reports', url: '/finance/reports', group: 'finance', permission: PERMISSIONS.REPORT_VIEW },
  { id: 'finance-settlements', label: 'Settlements', url: '/finance/settlements', group: 'finance', permission: PERMISSIONS.PAYMENT_VIEW },
  { id: 'finance-tax', label: 'Tax Records', url: '/finance/tax', group: 'finance', permission: PERMISSIONS.FINANCE_VIEW },
  { id: 'finance-ai-agent', label: 'AI Finance Assistant', url: '/finance/ai-agent', group: 'finance', permission: PERMISSIONS.FINANCE_VIEW },
  
  // Legacy routes kept for contracts
  { id: 'contracts', label: 'Signatures', url: '/contracts', group: 'finance', permission: PERMISSIONS.VIEW_CONTRACTS },

  // Communications Group
  { id: 'messages', label: 'Shared Inboxes', url: '/inbox', group: 'communications', permission: PERMISSIONS.VIEW_SUPPORT },

  // Documents Group
  { id: 'files', label: 'Document Library', url: '/intelligence', group: 'documents', permission: PERMISSIONS.VIEW_CONTRACTS },

  // AI & Automation
  { id: 'ai-agents', label: 'AI Agent Console', url: '/ai/agents', group: 'ai', permission: PERMISSIONS.AI_ADMIN },
  { id: 'automations', label: 'Visual Workflow Builder', url: '/automations', group: 'ai', permission: PERMISSIONS.VIEW_AUTOMATIONS },

  // Admin Group
  { id: 'oversight', label: 'Super Admin Oversight', url: '/admin/oversight', group: 'admin', permission: PERMISSIONS.BILLING_ADMIN_SETTINGS },
  { id: 'integration-dashboard', label: 'Integration Dashboard', url: '/admin/integration-dashboard', group: 'admin', permission: PERMISSIONS.SECURITY_SETTINGS },
  { id: 'audit-logs', label: 'Audit Compliance', url: '/audit-logs', group: 'admin', permission: PERMISSIONS.VIEW_AUDIT },
  { id: 'developer', label: 'Developer Portal', url: '/developer', group: 'admin', permission: PERMISSIONS.VIEW_SETTINGS },
  { id: 'settings', label: 'System Settings', url: '/settings', group: 'admin', permission: PERMISSIONS.VIEW_SETTINGS },
];
