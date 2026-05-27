import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { SIDEBAR_CONFIG, GROUP_LABELS } from '../sidebar/sidebar.config';
import { hasPermission } from '../services/auth/authService';
import { 
  LayoutDashboard, Users, Building2, FileText, GitBranch, 
  CheckSquare, Calendar, MessageSquare, LifeBuoy, BarChart3, 
  Settings, ChevronLeft, ChevronRight, Sparkles, LogOut, 
  TrendingUp, FileSignature, UserCircle2, Receipt, ShieldAlert,
  Zap, FolderKanban, FileSpreadsheet, Clock
} from 'lucide-react';
import './Sidebar.css';

const ICON_MAP = {
  'dashboard': LayoutDashboard,
  'leads': TrendingUp,
  'contacts': Users,
  'companies': Building2,
  'pipeline': GitBranch,
  'clients': UserCircle2,
  'projects': FolderKanban,
  'tasks': CheckSquare,
  'calendar': Calendar,
  'activities': Clock,
  'support': LifeBuoy,
  'messages': MessageSquare,
  'billing': Receipt,
  'invoices': FileText,
  'contracts': FileSignature,
  'analytics': BarChart3,
  'reports': FileSpreadsheet,
  'ai-assistant': Sparkles,
  'automations': Zap,
  'team': Users,
  'audit-logs': ShieldAlert,
  'settings': Settings,
};

export default function Sidebar({ 
  isCollapsed, 
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  theme
}) {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  // Enforce central permission evaluation
  const navItems = SIDEBAR_CONFIG.filter(item => hasPermission(user, item.permission));

  // Group nav items by section
  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getUrl = (id) => {
    switch (id) {
      case 'dashboard': return '/';
      case 'ai-assistant': return '/ai';
      default: return `/${id}`;
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        {isCollapsed ? (
          <span className="logo-icon-only text-2xl text-[#00e5ff] font-bold"><img  className='logo' src="favicon.png" alt="" /></span>
        ) : (
          <div className="flex items-center gap-2">
            <span className=""><img className='logo' src="logo-dark.png" alt="" /></span>
          </div>
        )}
      </div>

      <nav className="sidebar-menu custom-scrollbar">
        {Object.entries(GROUP_LABELS).map(([groupKey, label]) => {
          const items = groupedItems[groupKey];
          if (!items || items.length === 0) return null;

          return (
            <React.Fragment key={groupKey}>
              {!isCollapsed && (
                <div className="sidebar-section-label">{label}</div>
              )}
              {items.map((item) => {
                const Icon = ICON_MAP[item.id] || LayoutDashboard;
                return (
                  <NavLink
                    key={item.id}
                    to={getUrl(item.id)}
                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (setMobileOpen) setMobileOpen(false);
                    }}
                  >
                    <Icon size={20} />
                    {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
                    {item.badge && !isCollapsed && (
                      <span className="sidebar-item-badge">{item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          {!isCollapsed && (
            <div className="sidebar-user-details">
              <div className="sidebar-user-avatar">
                {user?.avatar || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="sidebar-user-name" title={user?.name}>{user?.name || 'User'}</div>
                <div className="sidebar-user-role">{user?.roleLabel || 'Guest'}</div>
              </div>
            </div>
          )}
          <button 
            className="sidebar-logout-btn" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
        <button 
          className="sidebar-collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
