import { 
  LayoutDashboard, Sparkles, Bell, Clock, Search, ShieldCheck,
  TrendingUp, Users, Building2, UserCircle2, GitBranch, FileText, FileSignature,
  DollarSign, BarChart3, Receipt, LifeBuoy, MessageSquare, Zap, ShieldAlert, Settings,
  FolderKanban, Mail, Layers, GraduationCap, FileSpreadsheet, KeyRound
} from 'lucide-react';

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
  { id: 'dashboard', label: 'Operations Dashboard', url: '/', group: 'core' },
  { id: 'ai-copilot', label: 'AI Assistant', url: '/ai', group: 'core' },
  { id: 'activities', label: 'Activity Feed', url: '/activities', group: 'core' },

  // CRM Group
  { id: 'leads', label: 'Leads Inbox', url: '/leads', group: 'crm' },
  { id: 'contacts', label: 'Contacts Directory', url: '/contacts', group: 'crm' },
  { id: 'companies', label: 'Organizations', url: '/companies', group: 'crm' },
  { id: 'clients', label: 'Client Accounts', url: '/clients', group: 'crm' },

  // Sales Group
  { id: 'pipeline', label: 'Sales Pipelines', url: '/pipeline', group: 'sales' },
  { id: 'quotes', label: 'Quotes & Proposals', url: '/crm/quotes', group: 'sales' },
  { id: 'catalog', label: 'Product Catalog', url: '/crm/catalog', group: 'sales' },
  { id: 'intelligence', label: 'Revenue Intelligence', url: '/intelligence', group: 'sales' },

  // Support Group
  { id: 'support', label: 'SLA Tickets', url: '/support', group: 'support' },
  { id: 'tickets', label: 'Support Tickets', url: '/crm/tickets', group: 'support' },

  // Marketing Group
  { id: 'automations-mktg', label: 'Marketing Builders', url: '/automations', group: 'marketing' },
  { id: 'campaigns', label: 'Campaigns', url: '/crm/campaigns', group: 'marketing' },

  // Projects Group
  { id: 'projects', label: 'Workspaces', url: '/projects', group: 'projects' },
  { id: 'tasks', label: 'Task Board', url: '/tasks', group: 'projects' },
  { id: 'calendar', label: 'Scheduling', url: '/calendar', group: 'projects' },

  // HR Group
  { id: 'team', label: 'Employee Workspace', url: '/team', group: 'hr' },

  // Finance Group
  { id: 'finance-overview', label: 'Finance Overview', url: '/finance', group: 'finance' },
  { id: 'finance-gl', label: 'General Ledger', url: '/finance/gl', group: 'finance' },
  { id: 'finance-bank', label: 'Bank Reconciliation', url: '/finance/bank', group: 'finance' },
  { id: 'finance-assets', label: 'Fixed Assets', url: '/finance/assets', group: 'finance' },
  { id: 'finance-invoices', label: 'Invoices', url: '/finance/invoices', group: 'finance' },
  { id: 'finance-payments', label: 'Payments', url: '/finance/payments', group: 'finance' },
  { id: 'finance-subscriptions', label: 'Subscriptions', url: '/finance/subscriptions', group: 'finance' },
  { id: 'finance-expenses', label: 'Expenses', url: '/finance/expenses', group: 'finance' },
  { id: 'finance-vendors', label: 'Vendors', url: '/finance/vendors', group: 'finance' },
  { id: 'finance-procurement', label: 'Procurement', url: '/finance/procurement', group: 'finance' },
  { id: 'finance-budgets', label: 'Budgets', url: '/finance/budgets', group: 'finance' },
  { id: 'finance-revenue', label: 'Revenue Analytics', url: '/finance/revenue', group: 'finance' },
  { id: 'finance-reports', label: 'Financial Reports', url: '/finance/reports', group: 'finance' },
  { id: 'finance-settlements', label: 'Settlements', url: '/finance/settlements', group: 'finance' },
  { id: 'finance-tax', label: 'Tax Records', url: '/finance/tax', group: 'finance' },
  { id: 'finance-ai-agent', label: 'AI Finance Assistant', url: '/finance/ai-agent', group: 'finance' },
  
  // Legacy routes kept for contracts
  { id: 'contracts', label: 'Signatures', url: '/contracts', group: 'finance' },

  // Communications Group
  { id: 'messages', label: 'Shared Inboxes', url: '/inbox', group: 'communications' },

  // Documents Group
  { id: 'files', label: 'Document Library', url: '/intelligence', group: 'documents' },

  // AI & Automation
  { id: 'ai-agents', label: 'AI Agent Console', url: '/ai/agents', group: 'ai' },
  { id: 'automations', label: 'Visual Workflow Builder', url: '/automations', group: 'ai' },

  // Admin Group
  { id: 'oversight', label: 'Super Admin Oversight', url: '/admin/oversight', group: 'admin' },
  { id: 'audit-logs', label: 'Audit Compliance', url: '/audit-logs', group: 'admin' },
  { id: 'developer', label: 'Developer Portal', url: '/developer', group: 'admin' },
  { id: 'settings', label: 'System Settings', url: '/settings', group: 'admin' },
];
