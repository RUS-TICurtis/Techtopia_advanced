import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { WORKSPACE_GROUPS, WORKSPACE_ITEMS } from './config/sidebar.workspace.config';
import { hasPermission } from '../../services/auth/authService';
import { 
  LayoutDashboard, Users, Building2, FileText, GitBranch, 
  CheckSquare, Calendar, MessageSquare, LifeBuoy, BarChart3, 
  Settings, ChevronLeft, ChevronRight, ChevronDown, Sparkles, LogOut, 
  TrendingUp, FileSignature, UserCircle2, Receipt, ShieldAlert,
  Zap, FolderKanban, FileSpreadsheet, Clock, Search, Pin, PinOff,
  Building, ShieldCheck, HelpCircle, LogIn
} from 'lucide-react';
import './Sidebar.css';

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

  // Multi-Tenant State
  const [activeTenant, setActiveTenant] = useState('Techtopia Corp');
  const [showTenantMenu, setShowTenantMenu] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pinned/Favorites state
  const [pinnedItems, setPinnedItems] = useState(() => {
    const saved = localStorage.getItem('crm_pinned_sidebar');
    return saved ? JSON.parse(saved) : ['dashboard', 'ai-copilot', 'pipeline'];
  });

  // Collapsible Groups state (Default HR, Admin, Marketing, Finance collapsed)
  const [collapsedGroups, setCollapsedGroups] = useState({
    marketing: true,
    hr: true,
    finance: true,
    documents: true,
    admin: true,
  });

  // Toggle Collapse Group
  const toggleGroup = (groupId) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Toggle Pinned status
  const togglePin = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedItems(prev => {
      const next = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem('crm_pinned_sidebar', JSON.stringify(next));
      return next;
    });
  };

  // Filter Items
  const filteredItems = WORKSPACE_ITEMS.filter(item => {
    // Scoped Permissions check
    const matchesPermission = !item.permission || hasPermission(user, item.permission);
    // Search matching
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPermission && matchesSearch;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
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

  const handleTenantSwitch = (tenantName) => {
    setActiveTenant(tenantName);
    setShowTenantMenu(false);
    
    // Auto-navigate to dashboard to re-orient workspace
    navigate('/');
  };

  // Identify Pinned list
  const activePinned = WORKSPACE_ITEMS.filter(item => 
    pinnedItems.includes(item.id) && (!item.permission || hasPermission(user, item.permission))
  );

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
          {isCollapsed ? (
            <span className="logo-icon-only text-2xl text-[#01FDF6] font-bold">
            <img className="logo" src="favicon.png" alt="T" />
            </span>
          ) : (
            <div className="flex items-center justify-between w-full pr-1">
              <span><img className="logo" src={theme === 'dark' ? 'logo-dark.png' : 'logo-light.png'} alt="Techtopia OS" /></span>
            </div>
          )}
      </div>

      {/* Tenant Switcher Module */}
      {!isCollapsed && (
        <div className="tenant-switcher-wrapper px-3 mb-2 relative">
          <button 
            className="tenant-selector-btn flex items-center justify-between w-full bg-gray-900/60 border border-gray-800 hover:border-[#01FDF6]/40 px-3 py-2.5 rounded-xl transition-all"
            onClick={() => setShowTenantMenu(!showTenantMenu)}
          >
            <div className="flex items-center gap-2 text-left min-w-0">
              <Building size={16} className="text-[#01FDF6] flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Workspace</span>
                <span className="text-white text-xs font-semibold truncate block">{activeTenant}</span>
              </div>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showTenantMenu ? 'rotate-180' : ''}`} />
          </button>

          {showTenantMenu && (
            <div className="tenant-dropdown-menu absolute top-[100%] left-3 right-3 bg-[#0a0f1e] border border-gray-800 rounded-xl shadow-2xl z-[900] py-1 mt-1 font-sans text-xs">
              <button 
                onClick={() => handleTenantSwitch('Techtopia Corp')}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-850 flex items-center justify-between ${activeTenant === 'Techtopia Corp' ? 'text-[#01FDF6] bg-gray-900/40' : 'text-gray-300'}`}
              >
                <span>Techtopia Corp (HQ)</span>
                {activeTenant === 'Techtopia Corp' && <span className="w-1.5 h-1.5 rounded-full bg-[#01FDF6]"></span>}
              </button>
              <button 
                onClick={() => handleTenantSwitch('Acme Enterprises')}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-850 flex items-center justify-between ${activeTenant === 'Acme Enterprises' ? 'text-[#01FDF6] bg-gray-900/40' : 'text-gray-300'}`}
              >
                <span>Acme Enterprises</span>
                {activeTenant === 'Acme Enterprises' && <span className="w-1.5 h-1.5 rounded-full bg-[#01FDF6]"></span>}
              </button>
              {(user?.role === 'super_admin' || user?.role === 'platform_owner') && (
                <button 
                  onClick={() => handleTenantSwitch('Platform Super Admin')}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-850 flex items-center justify-between ${activeTenant === 'Platform Super Admin' ? 'text-[#ff0055] bg-gray-900/40' : 'text-[#ff0055]/85'}`}
                >
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Platform Operations
                  </span>
                  {activeTenant === 'Platform Super Admin' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff0055]"></span>}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Module Search Input */}
      {!isCollapsed && (
        <div className="px-3 mb-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-500" size={12} />
            <input 
              type="text" 
              placeholder="Search workspaces... (/) " 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#01FDF6]/50 transition-all font-sans"
            />
          </div>
        </div>
      )}

      {/* Main Sidebar Navigation Menu */}
      <nav className="sidebar-menu custom-scrollbar flex-1 overflow-y-auto">
        {/* Pinned / Favorites Section */}
        {activePinned.length > 0 && !isCollapsed && (
          <div className="sidebar-workspace-group mb-4">
            <div className="sidebar-section-label flex items-center gap-1.5 text-gray-500 font-bold uppercase tracking-wider text-[10px] px-4 py-1">
              <Pin size={10} className="text-[#01FDF6]" /> Favorites
            </div>
            {activePinned.map(item => (
              <NavLink
                key={`pinned-${item.id}`}
                to={item.url}
                className={({ isActive }) => `sidebar-item sidebar-item-sub active-pinned ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (setMobileOpen) setMobileOpen(false);
                }}
              >
                <Pin size={12} className="text-gray-600 mr-2 flex-shrink-0" />
                <span className="sidebar-item-label text-xs truncate flex-1">{item.label}</span>
                <button 
                  className="pin-toggle-btn text-gray-600 hover:text-[#ff3860] opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                  onClick={(e) => togglePin(e, item.id)}
                  title="Remove from favorites"
                >
                  <PinOff size={10} />
                </button>
              </NavLink>
            ))}
          </div>
        )}

        {/* Collapsible Category Groups */}
        {WORKSPACE_GROUPS.map(group => {
          const items = groupedItems[group.id];
          if (!items || items.length === 0) return null;

          const isCollapsedGroup = collapsedGroups[group.id];
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="sidebar-workspace-group mb-2">
              {/* Group Folders Header */}
              {isCollapsed ? (
                <div className="flex justify-center py-2 text-gray-500" title={group.label}>
                  <GroupIcon size={18} style={{ color: group.color }} />
                </div>
              ) : (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="sidebar-section-folder w-full flex items-center justify-between px-4 py-2 hover:bg-gray-900/30 text-gray-400 hover:text-white rounded-lg transition-all"
                  style={{ '--group-hover-color': group.color }}
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon size={14} style={{ color: group.color, filter: `drop-shadow(0 0 4px ${group.color}44)` }} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{group.label}</span>
                  </div>
                  {isCollapsedGroup ? (
                    <ChevronRight size={12} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={12} className="text-gray-600" />
                  )}
                </button>
              )}

              {/* Group Nested Links */}
              {(!isCollapsedGroup || isCollapsed) && (
                <div className="group-items-list mt-1 pl-1">
                  {items.map(item => (
                    <NavLink
                      key={item.id}
                      to={item.url}
                      className={({ isActive }) => `sidebar-item group ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (setMobileOpen) setMobileOpen(false);
                      }}
                      style={{ '--active-border-color': group.color }}
                    >
                      <span className="bullet-indicator w-1 h-1 rounded-full bg-gray-700 mr-3 flex-shrink-0 group-hover:bg-white transition-colors" style={{ backgroundColor: `${group.color}44` }} />
                      {!isCollapsed && (
                        <>
                          <span className="sidebar-item-label text-xs truncate flex-1">{item.label}</span>
                          <button 
                            className="pin-toggle-btn p-0.5 text-gray-700 hover:text-[#01FDF6] opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                            onClick={(e) => togglePin(e, item.id)}
                            title={pinnedItems.includes(item.id) ? "Unpin workspace" : "Pin workspace to favorites"}
                          >
                            <Pin size={10} className={pinnedItems.includes(item.id) ? 'text-[#01FDF6]' : ''} />
                          </button>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Footer Panel */}
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          {!isCollapsed && (
            <div className="sidebar-user-details flex-1 min-w-0 pr-2">
              <div className="sidebar-user-avatar">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  user?.avatar || 'U'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="sidebar-user-name truncate" title={user?.name}>
                  {user?.name || 'Super Admin'}
                </div>
                <div className="sidebar-user-role text-[10px] text-gray-500 font-semibold truncate uppercase tracking-wider block">
                  {activeTenant === 'Platform Super Admin' ? 'Platform Operator' : (user?.roleLabel || 'Operator')}
                </div>
              </div>
            </div>
          )}
          <button 
            className="sidebar-logout-btn hover:text-red-500 flex-shrink-0" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
        
        {/* Collapse Drawer toggle */}
        <button 
          className="sidebar-collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
