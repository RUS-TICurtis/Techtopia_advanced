import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { can, ROLES } from '../lib/permissions';

// ─── Lazy Load Pages ────────────────────────────────────────────────────────
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Contacts = lazy(() => import('../pages/Contacts'));
const Companies = lazy(() => import('../pages/Companies'));
const Pipeline = lazy(() => import('../pages/Pipeline'));
const Clients = lazy(() => import('../pages/Clients'));
const Tasks = lazy(() => import('../pages/Tasks'));
const Calendar = lazy(() => import('../pages/Calendar'));
const Support = lazy(() => import('../pages/Support'));
const Messages = lazy(() => import('../pages/Messages'));
const Billing = lazy(() => import('../pages/Billing'));
const Invoices = lazy(() => import('../pages/Invoices'));
const Contracts = lazy(() => import('../pages/Contracts'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Team = lazy(() => import('../pages/Team'));
const Settings = lazy(() => import('../pages/Settings'));
const AiAssistant = lazy(() => import('../pages/AiAssistant'));

// New Modules
const Projects = lazy(() => import('../pages/Projects/Projects'));
const ProjectBoard = lazy(() => import('../pages/Projects/ProjectBoard'));
const ProjectTimeline = lazy(() => import('../pages/Projects/ProjectTimeline'));
const AuditLogs = lazy(() => import('../pages/AuditLogs'));
const Automations = lazy(() => import('../pages/Automations'));
const Reports = lazy(() => import('../pages/Reports'));
const Activities = lazy(() => import('../pages/Activities'));

// Client Portal Pages
const ClientDashboard = lazy(() => import('../pages/ClientPortal/ClientDashboard'));
const ClientInvoices = lazy(() => import('../pages/ClientPortal/ClientInvoices'));
const ClientProjects = lazy(() => import('../pages/ClientPortal/ClientProjects'));
const ClientContracts = lazy(() => import('../pages/ClientPortal/ClientContracts'));
const ClientSupport = lazy(() => import('../pages/ClientPortal/ClientSupport'));

// Auth Pages
const AuthLogin = lazy(() => import('../pages/Auth/Login'));
const MFA = lazy(() => import('../pages/Auth/MFA'));
const DeviceTrust = lazy(() => import('../pages/Auth/DeviceTrust'));

// ─── Loading / Suspense Fallback ──────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 text-sm font-mono tracking-wider">LOADING TECHTOPIA HUB...</p>
    </div>
  </div>
);

// ─── Route Guards ───────────────────────────────────────────────────────────

// Guard for authenticated staff/admin users
const ProtectedRoute = ({ permission }) => {
  const { isAuthenticated, user, mfaRequired } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (mfaRequired) {
    return <Navigate to="/auth/mfa" replace />;
  }

  // Client role users belong in the Client Portal subtree
  if (user?.role === ROLES.CLIENT) {
    return <Navigate to="/client" replace />;
  }

  if (permission && !can(user?.role, permission)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Guard for client-specific portal access
const ClientPortalRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Super admins are allowed inside client portal for debugging
  if (user?.role !== ROLES.CLIENT && user?.role !== ROLES.SUPER_ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Public routing (accessible only when logged out)
const PublicRoute = () => {
  const { isAuthenticated, mfaRequired } = useAuthStore();

  if (isAuthenticated) {
    if (mfaRequired) {
      return <Navigate to="/auth/mfa" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default function AppRoutes({ toggleTheme, theme, profile, onProfileUpdate, searchValue, setSearchValue }) {
  // Navigation wrapper for legacy pages that use setCurrentTab prop
  const currentTabAdapter = (Component) => (props) => {
    const handleSetTab = (tab) => {
      // In real routing, we redirect instead of switching tab state
      const urlMap = {
        'dashboard': '/',
        'leads': '/leads',
        'clients': '/clients',
        'pipeline': '/pipeline',
        'billing': '/billing',
        'contracts': '/contracts',
        'support': '/support',
        'ai-assistant': '/ai',
        'analytics': '/analytics',
        'team': '/team',
        'settings': '/settings',
        'contacts': '/contacts',
        'companies': '/companies',
        'invoices': '/invoices',
        'tasks': '/tasks',
        'calendar': '/calendar',
        'messages': '/messages',
      };
      window.location.hash = urlMap[tab] || '/';
    };
    return <Component setCurrentTab={handleSetTab} {...props} />;
  };

  const LegacyDashboard = currentTabAdapter(Dashboard);
  const LegacySettings = currentTabAdapter(Settings);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/mfa" element={<MFA />} />
          <Route path="/auth/device-trust" element={<DeviceTrust />} />
        </Route>

        {/* Protected App Routes (Internal Staff / Admins) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<LegacyDashboard />} />
          <Route path="/leads" element={<Leads searchValue={searchValue} />} />
          <Route path="/contacts" element={<Contacts searchValue={searchValue} />} />
          <Route path="/companies" element={<Companies searchValue={searchValue} />} />
          <Route path="/pipeline" element={<Pipeline searchValue={searchValue} />} />
          <Route path="/clients" element={<Clients searchValue={searchValue} />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/activities" element={<Activities />} />
          
          {/* Projects Subtree */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/board" element={<ProjectBoard />} />
          <Route path="/projects/timeline" element={<ProjectTimeline />} />

          {/* Core operation modules */}
          <Route path="/support" element={<Support />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/billing" element={<Billing searchValue={searchValue} />} />
          <Route path="/invoices" element={<Invoices searchValue={searchValue} />} />
          <Route path="/contracts" element={<Contracts searchValue={searchValue} />} />
          
          {/* Business Insights */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />

          {/* Intelligence Modules */}
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/automations" element={<Automations />} />

          {/* Admin Panels */}
          <Route path="/team" element={<Team />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<LegacySettings theme={theme} toggleTheme={toggleTheme} onProfileUpdate={onProfileUpdate} />} />
        </Route>

        {/* Client Portal subtree */}
        <Route path="/client" element={<ClientPortalRoute />}>
          <Route index element={<ClientDashboard />} />
          <Route path="invoices" element={<ClientInvoices />} />
          <Route path="projects" element={<ClientProjects />} />
          <Route path="contracts" element={<ClientContracts />} />
          <Route path="support" element={<ClientSupport />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
