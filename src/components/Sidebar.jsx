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
  LogOut
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
  const menuSections = [
    {
      title: 'Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'pipeline', label: 'Deals Board', icon: GitBranch },
      ]
    },
    {
      title: 'Productivity',
      items: [
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 1 },
      ]
    },
    {
      title: 'Business',
      items: [
        { id: 'invoices', label: 'Invoices', icon: FileText },
        { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

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
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="sidebar-section">
            {!isCollapsed && (
              <div className="sidebar-section-label">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
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
                  <Icon size={24} />
                  <span className="sidebar-item-label">{item.label}</span>
                  {item.badge && !isCollapsed && (
                    <span className="sidebar-item-badge">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && isCollapsed && (
                    <span className="sidebar-item-dot"></span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="sidebar-collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <button 
          className="sidebar-logout-btn" 
          onClick={useAuthStore(state => state.logout)}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
