import { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  Sun, 
  Moon,
  Menu
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab,
  theme, 
  toggleTheme, 
  profile,
  onSearchChange,
  searchValue,
  onMenuClick
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Map tabs to titles
  const tabTitles = {
    dashboard: 'Overview',
    contacts: 'Contacts & Leads',
    pipeline: 'Sales Pipeline',
    tasks: 'Task Manager',
    analytics: 'Analytics & Forecasts',
    settings: 'CRM Settings'
  };

  const dummyNotifications = [
    { id: 1, text: "Deal 'Enterprise Cloud Optimization' moved to Qualified stage", time: "5m ago", unread: true },
    { id: 2, text: "New lead 'David Kross' from FutureLogic registered", time: "1h ago", unread: true },
    { id: 3, text: "Task 'Send SLA Proposal' is due tomorrow", time: "4h ago", unread: false }
  ];

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="mobile-menu-toggle nav-icon-btn" 
          onClick={onMenuClick}
          style={{ width: '40px', height: '40px' }}
        >
          <Menu size={20} />
        </button>
        <h2 className="navbar-title">{tabTitles[currentTab] || 'CRM Hub'}</h2>
      </div>

      <div className="navbar-actions">
        {/* Search */}
        {(currentTab === 'contacts' || currentTab === 'dashboard' || currentTab === 'pipeline') && (
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search leads, companies..." 
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          className="nav-icon-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Settings Button */}
        <button 
          className="nav-icon-btn" 
          onClick={() => setCurrentTab('settings')}
          title="Go to Settings"
        >
          <Settings size={20} />
        </button>

        {/* Notification Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className="nav-icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            <span className="nav-badge-dot"></span>
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '55px',
              right: 0,
              width: '320px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              padding: '16px',
              animation: 'fadeIn var(--transition-fast) ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-title)' }}>Recent Notifications</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dummyNotifications.map(n => (
                  <div key={n.id} style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: n.unread ? 'var(--bg-app)' : 'transparent',
                    fontSize: '13px',
                    borderLeft: n.unread ? '3px solid var(--primary)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: n.unread ? 600 : 400 }}>{n.text}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', alignSelf: 'flex-end' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div 
          className="nav-profile" 
          onClick={() => setCurrentTab('settings')}
          title="User Profile"
        >
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
            alt={profile?.name || "Profile Avatar"} 
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/100";
            }}
          />
        </div>
      </div>
    </header>
  );
}
