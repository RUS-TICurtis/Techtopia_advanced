import { 
  LayoutDashboard, 
  Users, 
  Building2,
  FileText,
  GitBranch, 
  CheckSquare, 
  Calendar,
  MessageSquare,
  LifeBuoy,
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  LogOut,
  TrendingUp,
  FileSignature,
  UserCircle2,
  Receipt
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import './Sidebar.css';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  isCollapsed, 
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  theme
}) {
  const logout = useAuthStore(state => state.logout);

  const menuItems = [
    { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'leads',        label: 'Leads',        icon: TrendingUp },
    { id: 'clients',      label: 'Clients',      icon: UserCircle2 },
    { id: 'pipeline',     label: 'Pipeline',     icon: GitBranch },
    { id: 'billing',      label: 'Billing',      icon: Receipt },
    { id: 'contracts',    label: 'Contracts',    icon: FileSignature },
    { id: 'support',      label: 'Support',      icon: LifeBuoy },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'analytics',    label: 'Analytics',    icon: BarChart3 },
    { id: 'team',         label: 'Team',         icon: Users },
    { id: 'settings',     label: 'Settings',     icon: Settings },
  ];

  // Hidden extras still in the app but not in the primary nav
  const hiddenItems = [
    { id: 'contacts',  label: 'Contacts',  icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'invoices',  label: 'Invoices',  icon: FileText },
    { id: 'calendar',  label: 'Calendar',  icon: Calendar },
    { id: 'tasks',     label: 'Tasks',     icon: CheckSquare },
    { id: 'messages',  label: 'Messages',  icon: MessageSquare },
  ];

  const allItems = [...menuItems, ...hiddenItems];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        {isCollapsed ? (
          <img src="/src/assets/logomark.png" alt="Techtopia" style={{ height: '32px' }} />
        ) : (
          <img 
            src={theme === 'dark' ? '/src/assets/logo-dark.png' : '/src/assets/logo-light.png'} 
            alt="Techtopia CRM" 
            style={{ height: '32px', maxWidth: '100%', objectFit: 'contain' }} 
          />
        )}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab(item.id);
                if (setMobileOpen) setMobileOpen(false);
              }}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
              {isCollapsed && isActive && <span className="sidebar-item-dot"></span>}
              {item.badge && !isCollapsed && (
                <span className="sidebar-item-badge">{item.badge}</span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          {!isCollapsed && (
            <div className="sidebar-user-details">
              <div className="sidebar-user-avatar">
                <UserCircle2 size={28} />
              </div>
              <div>
                <div className="sidebar-user-name">User</div>
                <div className="sidebar-user-role">Client</div>
              </div>
            </div>
          )}
          <button 
            className="sidebar-logout-btn" 
            onClick={logout}
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
