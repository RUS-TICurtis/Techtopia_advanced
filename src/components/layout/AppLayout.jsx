import React from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import BottomNav from '../BottomNav';
import CommandPalette from '../ui/CommandPalette';
import NotificationCenter from './NotificationCenter';
import { Toaster } from 'react-hot-toast';

export default function AppLayout({ 
  children,
  theme,
  toggleTheme,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen
}) {
  return (
    <div className="app-wrapper">
      {/* Toast Notification Provider */}
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Global Interactive Utilities */}
      <CommandPalette />
      <NotificationCenter />

      {mobileSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        theme={theme}
      />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
      
      <BottomNav />
    </div>
  );
}
