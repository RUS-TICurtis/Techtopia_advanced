import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PERMISSIONS } from '../constants/permissions';
import ProtectedRoute from '../components/guards/ProtectedRoute';
import ClientPortalRoute from '../components/guards/ClientPortalRoute';
import PublicRoute from '../components/guards/PublicRoute';

// ─── Core Pages ───────────────────────────────────────────────────────────
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Contacts = lazy(() => import('../pages/Contacts'));
const Companies = lazy(() => import('../pages/Companies'));
const Pipeline = lazy(() => import('../pages/Pipeline'));
const Clients = lazy(() => import('../pages/Clients'));
const Tasks = lazy(() => import('../pages/Tasks'));
const Calendar = lazy(() => import('../pages/Calendar'));
const Support = lazy(() => import('../pages/Support'));
const Billing = lazy(() => import('../pages/Billing'));
const Contracts = lazy(() => import('../pages/Contracts'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Team = lazy(() => import('../pages/Team'));
const Settings = lazy(() => import('../pages/Settings'));
const AiAssistant = lazy(() => import('../pages/AiAssistant'));
const Projects = lazy(() => import('../pages/Projects/Projects'));
const ProjectBoard = lazy(() => import('../pages/Projects/ProjectBoard'));
const ProjectTimeline = lazy(() => import('../pages/Projects/ProjectTimeline'));
const AuditLogs = lazy(() => import('../pages/AuditLogs'));
const Automations = lazy(() => import('../pages/Automations'));
const Reports = lazy(() => import('../pages/Reports'));
const Activities = lazy(() => import('../pages/Activities'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const AIAgents = lazy(() => import('../pages/AIAgents'));
const SuperAdminOversight = lazy(() => import('../pages/SuperAdminOversight'));
const OmnichannelInbox = lazy(() => import('../pages/OmnichannelInbox'));
const ExecutiveIntelligence = lazy(() => import('../pages/ExecutiveIntelligence'));
const DeveloperConsole = lazy(() => import('../pages/DeveloperConsole'));

// ─── Finance Module Pages ─────────────────────────────────────────────────
const FinanceOverview = lazy(() => import('../pages/Finance/FinanceOverview'));
const FinanceInvoices = lazy(() => import('../pages/Finance/FinanceInvoices'));
const FinancePayments = lazy(() => import('../pages/Finance/FinancePayments'));
const FinanceSubscriptions = lazy(() => import('../pages/Finance/FinanceSubscriptions'));
const FinanceExpenses = lazy(() => import('../pages/Finance/FinanceExpenses'));
const FinanceVendors = lazy(() => import('../pages/Finance/FinanceVendors'));
const FinanceProcurement = lazy(() => import('../pages/Finance/FinanceProcurement'));
const FinanceBudgets = lazy(() => import('../pages/Finance/FinanceBudgets'));
const FinanceRevenueAnalytics = lazy(() => import('../pages/Finance/FinanceRevenueAnalytics'));
const FinancialReports = lazy(() => import('../pages/Finance/FinancialReports'));
const FinanceSettlements = lazy(() => import('../pages/Finance/FinanceSettlements'));
const FinanceTaxRecords = lazy(() => import('../pages/Finance/FinanceTaxRecords'));
const AIFinanceAgent = lazy(() => import('../pages/Finance/AIFinanceAgent'));

// ─── Client Portal Pages ──────────────────────────────────────────────────
const ClientDashboard = lazy(() => import('../pages/ClientPortal/ClientDashboard'));
const ClientInvoices = lazy(() => import('../pages/ClientPortal/ClientInvoices'));
const ClientProjects = lazy(() => import('../pages/ClientPortal/ClientProjects'));
const ClientContracts = lazy(() => import('../pages/ClientPortal/ClientContracts'));
const ClientSupport = lazy(() => import('../pages/ClientPortal/ClientSupport'));

// ─── Auth Pages ───────────────────────────────────────────────────────────
const AuthLogin = lazy(() => import('../pages/Auth/Login'));
const MFA = lazy(() => import('../pages/Auth/MFA'));
const DeviceTrust = lazy(() => import('../pages/Auth/DeviceTrust'));

// ─── Loading Fallback ─────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 text-sm font-mono tracking-wider">LOADING TECHTOPIA HUB...</p>
    </div>
  </div>
);

export default function AppRoutes({ toggleTheme, theme, onProfileUpdate, searchValue }) {
  const currentTabAdapter = (Component) => (props) => {
    const handleSetTab = (tab) => {
      const urlMap = {
        'dashboard': '/', 'leads': '/leads', 'clients': '/clients',
        'pipeline': '/pipeline', 'billing': '/billing', 'contracts': '/contracts',
        'support': '/support', 'ai-assistant': '/ai', 'analytics': '/analytics',
        'team': '/team', 'settings': '/settings', 'contacts': '/contacts',
        'companies': '/companies', 'invoices': '/finance/invoices',
        'tasks': '/tasks', 'calendar': '/calendar', 'messages': '/messages',
      };
      window.location.href = urlMap[tab] || '/';
    };
    return <Component setCurrentTab={handleSetTab} {...props} />;
  };

  const LegacyDashboard = currentTabAdapter(Dashboard);
  const LegacySettings = currentTabAdapter(Settings);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public Routes ─────────────────────────────────────────── */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/mfa" element={<MFA />} />
          <Route path="/auth/device-trust" element={<DeviceTrust />} />
        </Route>

        {/* ── Protected App Routes ──────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<LegacyDashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/messages" element={<OmnichannelInbox />} />
          <Route path="/inbox" element={<OmnichannelInbox />} />

          {/* Legacy redirects */}
          <Route path="/invoices" element={<Navigate to="/finance/invoices" replace />} />

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_LEADS} />}>
            <Route path="/leads" element={<Leads searchValue={searchValue} />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_CONTACTS} />}>
            <Route path="/contacts" element={<Contacts searchValue={searchValue} />} />
            <Route path="/companies" element={<Companies searchValue={searchValue} />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_PIPELINE} />}>
            <Route path="/pipeline" element={<Pipeline searchValue={searchValue} />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_CLIENTS} />}>
            <Route path="/clients" element={<Clients searchValue={searchValue} />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_PROJECTS} />}>
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/board" element={<ProjectBoard />} />
            <Route path="/projects/timeline" element={<ProjectTimeline />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_SUPPORT} />}>
            <Route path="/support" element={<Support />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_BILLING} />}>
            <Route path="/billing" element={<Billing searchValue={searchValue} />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_CONTRACTS} />}>
            <Route path="/contracts" element={<Contracts searchValue={searchValue} />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_ANALYTICS} />}>
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/intelligence" element={<ExecutiveIntelligence />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.EXPORT_ANALYTICS} />}>
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.AI_CHAT} />}>
            <Route path="/ai" element={<AiAssistant />} />
            <Route path="/ai/agents" element={<AIAgents />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_AUTOMATIONS} />}>
            <Route path="/automations" element={<Automations />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_TEAM} />}>
            <Route path="/team" element={<Team />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_AUDIT} />}>
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.VIEW_SETTINGS} />}>
            <Route path="/settings" element={<LegacySettings theme={theme} toggleTheme={toggleTheme} onProfileUpdate={onProfileUpdate} />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.SECURITY_SETTINGS} />}>
            <Route path="/admin/oversight" element={<SuperAdminOversight />} />
            <Route path="/developer" element={<DeveloperConsole />} />
          </Route>

          {/* ── Finance Module Routes ────────────────────────────────── */}
          <Route element={<ProtectedRoute permission={PERMISSIONS.FINANCE_VIEW} />}>
            <Route path="/finance" element={<FinanceOverview />} />
            <Route path="/finance/invoices" element={<FinanceInvoices />} />
            <Route path="/finance/payments" element={<FinancePayments />} />
            <Route path="/finance/subscriptions" element={<FinanceSubscriptions />} />
            <Route path="/finance/expenses" element={<FinanceExpenses />} />
            <Route path="/finance/vendors" element={<FinanceVendors />} />
            <Route path="/finance/procurement" element={<FinanceProcurement />} />
            <Route path="/finance/budgets" element={<FinanceBudgets />} />
            <Route path="/finance/revenue" element={<FinanceRevenueAnalytics />} />
            <Route path="/finance/reports" element={<FinancialReports />} />
            <Route path="/finance/settlements" element={<FinanceSettlements />} />
            <Route path="/finance/tax" element={<FinanceTaxRecords />} />
            <Route path="/finance/ai-agent" element={<AIFinanceAgent />} />
          </Route>
        </Route>

        {/* ── Client Portal ─────────────────────────────────────────── */}
        <Route path="/client" element={<ClientPortalRoute />}>
          <Route index element={<ClientDashboard />} />
          <Route path="invoices" element={<ClientInvoices />} />
          <Route path="projects" element={<ClientProjects />} />
          <Route path="contracts" element={<ClientContracts />} />
          <Route path="support" element={<ClientSupport />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
