import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { mockDb } from './utils/mockDb';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('crm-theme') || 'light');
  const [profile, setProfile] = useState(mockDb.getUserProfile());
  const [searchValue, setSearchValue] = useState('');

  // Sync theme attribute on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crm-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  // Render correct page viewport
  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'contacts':
        return <Contacts searchValue={searchValue} />;
      case 'pipeline':
        return <Pipeline searchValue={searchValue} />;
      case 'tasks':
        return <Tasks />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return (
          <Settings 
            theme={theme} 
            toggleTheme={toggleTheme} 
            onProfileUpdate={handleProfileUpdate} 
          />
        );
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="app-wrapper">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Navigation Sidebar Panel */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSearchValue(''); // Clear search on tab switch
        }}
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Panel Viewport */}
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Navbar 
          currentTab={currentTab} 
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setSearchValue('');
          }}
          theme={theme} 
          toggleTheme={toggleTheme} 
          profile={profile}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;
