import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import AppRoutes from './router';
import { useAuth } from './context/AuthContext';
import { useUIStore } from './store/uiStore';

function App() {
  const { isAuthenticated } = useAuth();
  const {
    theme,
    toggleTheme,
  } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Don't render layout shell on auth pages
  const isAuthPage = location.pathname.startsWith('/auth');

  if (!isAuthenticated || isAuthPage) {
    return (
      <div className="app-wrapper auth-only">
        <Toaster position="bottom-right" reverseOrder={false} />
        <AppRoutes 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      </div>
    );
  }

  return (
    <AppLayout
      theme={theme}
      toggleTheme={toggleTheme}
    >
      <AppRoutes 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
    </AppLayout>
  );
}

export default App;
