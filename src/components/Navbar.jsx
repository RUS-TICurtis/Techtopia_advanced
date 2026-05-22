import { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  Sun, 
  Moon,
  Menu
} from 'lucide-react';

import './Navbar.css';


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
  const [showMobileSearch, setShowMobileSearch] = useState(false);



  // Map tabs to titles
  const tabTitles = {
    dashboard: 'Overview',
    contacts: 'Contacts & Leads',
    companies: 'Companies & Organizations',
    pipeline: 'Sales Pipeline',
    invoices: 'Billing & Invoices',
    tasks: 'Task Manager',
    calendar: 'Schedule',
    messages: 'Communications',
    support: 'Support Tickets',
    analytics: 'Analytics & Forecasts',
    settings: 'CRM Settings'
  };

  const dummyNotifications = [
    { id: 1, text: "Deal 'Enterprise Cloud Optimization' moved to Qualified stage", time: "5m ago", unread: true },
    { id: 2, text: "New lead 'David Kross' from FutureLogic registered", time: "1h ago", unread: true },
    { id: 3, text: "Task 'Send SLA Proposal' is due tomorrow", time: "4h ago", unread: false }
  ];

  const searchableTabs = ['contacts', 'dashboard', 'pipeline', 'companies', 'invoices', 'messages', 'support'];

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-toggle nav-icon-btn" 
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <h2 className="navbar-title">{tabTitles[currentTab] || 'CRM Hub'}</h2>
      </div>

      <div className="navbar-actions">
        {/* Search */}
        {searchableTabs.includes(currentTab) && (
          <>
            <div className="navbar-search">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search..." 
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            {/* Mobile Search Toggle */}
            <button 
              className="navbar-search-toggle"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search size={18} />
            </button>
          </>
        )}

        <div className="navbar-secondary" style={{ display: 'flex', gap: '12px' }}>
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
        </div>

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
            <div className="nav-notifications-dropdown">
              <div className="nav-notifications-header">
                <span style={{ fontWeight: 700, color: 'var(--text-title)' }}>Recent Notifications</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dummyNotifications.map(n => (
                  <div key={n.id} className={`nav-notification-item ${n.unread ? 'unread' : ''}`}>
                    <span style={{ color: 'var(--text-main)', fontWeight: n.unread ? 600 : 400 }}>{n.text}</span>
                    <span className="nav-notification-time">{n.time}</span>
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

      {/* Mobile Search Overlay */}
      <div className={`navbar-search-overlay ${showMobileSearch ? 'open' : ''}`}>
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search..." 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus={showMobileSearch}
          />
        </div>
        <button className="btn-icon" onClick={() => setShowMobileSearch(false)}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>&times;</span>
        </button>
      </div>
    </header>
  );
}
