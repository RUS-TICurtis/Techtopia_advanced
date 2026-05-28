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
  { id: 'core', label: 'Core Platform', icon: LayoutDashboard, color: '#01FDF6' },
  { id: 'crm', label: 'CRM Lifecycle', icon: UserCircle2, color: '#bd93f9' },
  { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp, color: '#ff79c6' },
  { id: 'support', label: 'Customer Support', icon: LifeBuoy, color: '#8be9fd' },
  { id: 'marketing', label: 'Marketing Hub', icon: Mail, color: '#ffb86c' },
  { id: 'projects', label: 'Projects & Sprints', icon: FolderKanban, color: '#50fa7b' },
  { id: 'hr', label: 'HR & Operations', icon: Users, color: '#ff5555' },
  { id: 'finance', label: 'Finance & Ledger', icon: Receipt, color: '#f1fa8c' },
  { id: 'communications', label: 'Omnichannel Chat', icon: MessageSquare, color: '#a6e22e' },
  { id: 'documents', label: 'Shared Documents', icon: FileSignature, color: '#ae81ff' },
  { id: 'ai', label: 'AI & Automation', icon: Zap, color: '#01FDF6' },
  { id: 'admin', label: 'Access & Governance', icon: ShieldCheck, color: '#ff0055' },
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
  { id: 'intelligence', label: 'Revenue Intelligence', url: '/intelligence', group: 'sales' },

  // Support Group
  { id: 'support', label: 'SLA Tickets', url: '/support', group: 'support' },

  // Marketing Group
  { id: 'automations-mktg', label: 'Marketing Builders', url: '/automations', group: 'marketing' },

  // Projects Group
  { id: 'projects', label: 'Workspaces', url: '/projects', group: 'projects' },
  { id: 'tasks', label: 'Task Board', url: '/tasks', group: 'projects' },
  { id: 'calendar', label: 'Scheduling', url: '/calendar', group: 'projects' },

  // HR Group
  { id: 'team', label: 'Employee Workspace', url: '/team', group: 'hr' },

  // Finance Group
  { id: 'billing', label: 'Contracts & Billing', url: '/billing', group: 'finance' },
  { id: 'invoices', label: 'Invoice Registry', url: '/invoices', group: 'finance' },
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
