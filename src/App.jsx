import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CommandPalette from './components/ui/CommandPalette';
import NotificationCenter from './components/layout/NotificationCenter';
import AppRoutes from './router';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme, sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Don't render layout shell on auth pages
  const isAuthPage = location.pathname.startsWith('/auth');

  if (!isAuthenticated || isAuthPage) {
    return (
      <div className="app-wrapper auth-only">
        <AppRoutes 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    );
  }

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
          <AppRoutes 
            theme={theme} 
            toggleTheme={toggleTheme} 
          />
        </main>
      </div>
      
      <BottomNav />
    </div>
  );
}

export default App;
