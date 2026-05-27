import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { 
  Search, Bell, Settings, Sun, Moon, Menu, Sparkles, Command
} from 'lucide-react';
import Dropdown from './ui/Dropdown';
import './Navbar.css';

export default function Navbar({ 
  theme, 
  toggleTheme, 
  profile,
  onSearchChange,
  searchValue,
  onMenuClick
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCommandPaletteOpen, setNotificationCenterOpen, notificationCenterOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Map route paths to page titles
  const getPageTitle = (path) => {
    if (path === '/') return 'Overview';
    const cleanPath = path.substring(1).split('/')[0];
    const titles = {
      leads: 'Leads Inbox',
      contacts: 'Contacts Directory',
      companies: 'Organizations',
      pipeline: 'Sales Pipeline',
      clients: 'Client Management',
      projects: 'Project Hub',
      tasks: 'Task Board',
      calendar: 'Schedule',
      activities: 'Activity Stream',
      support: 'Help & Support',
      messages: 'Inbox & Chat',
      billing: 'Billing Dashboard',
      invoices: 'Invoice Center',
      contracts: 'Contracts',
      analytics: 'Performance Analytics',
      reports: 'Intelligence Reports',
      ai: 'AI Orchestrator',
      automations: 'Automated Workflows',
      team: 'Team Workspace',
      'audit-logs': 'Security Audit Trail',
      settings: 'System Settings',
    };
    return titles[cleanPath] || 'Techtopia CRM';
  };

  const currentTitle = getPageTitle(location.pathname);

  // User Profile Dropdown Configuration
  const profileDropdownItems = [
    { label: 'My Settings', icon: Settings, onClick: () => navigate('/settings') },
    { label: 'AI Assistant', icon: Sparkles, onClick: () => navigate('/ai') },
    { type: 'separator' },
    { label: 'Sign Out', icon: Settings, onClick: () => { logout(); navigate('/auth/login'); }, variant: 'danger' }
  ];

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-toggle nav-icon-btn" 
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <h2 className="navbar-title font-display font-bold text-xl text-white">{currentTitle}</h2>
      </div>

      <div className="navbar-actions">
        {/* Search */}
        <div className="navbar-search" onClick={() => setCommandPaletteOpen(true)}>
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            className="search-input cursor-pointer" 
            placeholder="Search CRM... (Ctrl+K)" 
          />
          <span className="search-kbd-hint font-mono text-[10px] bg-gray-800/80 border border-gray-700/80 rounded px-1.5 py-0.5 text-gray-500 ml-auto">
            Ctrl+K
          </span>
        </div>

        {/* Mobile Search Toggle */}
        <button 
          className="navbar-search-toggle"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search size={18} />
        </button>

        <div className="navbar-secondary flex gap-2">
          {/* Theme Toggle */}
          <button 
            className="nav-icon-btn" 
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AI Quick Button */}
          <button 
            className="nav-icon-btn text-[#01fdf6] hover:bg-[#01fdf6]/10" 
            onClick={() => navigate('/ai')}
            title="Ask AI Assistant"
          >
            <Sparkles size={18} />
          </button>
        </div>

        {/* Notification Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className={`nav-icon-btn ${notificationCenterOpen ? 'bg-gray-800/60' : ''}`}
            onClick={() => setNotificationCenterOpen(!notificationCenterOpen)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="nav-badge-dot animate-pulse"></span>}
          </button>
        </div>

        {/* User profile dropdown */}
        <Dropdown 
          trigger={
            <div className="nav-profile cursor-pointer" title="User Profile">
              <span className="profile-initials font-bold text-xs bg-[#00e5ff]/20 text-[#00e5ff] w-8 h-8 rounded-full flex items-center justify-center border border-[#00e5ff]/35">
                {user?.avatar || 'U'}
              </span>
            </div>
          }
          items={profileDropdownItems}
        />
      </div>
    </header>
  );
}
