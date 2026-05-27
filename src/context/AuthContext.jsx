import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { 
    user, 
    isAuthenticated, 
    mfaRequired, 
    mfaVerified, 
    authStatus, 
    login, 
    logout, 
    verifyMfa, 
    hydrateAuth 
  } = useAuthStore();

  useEffect(() => {
    // Hydrate session and permissions state on application boot
    hydrateAuth();
  }, [hydrateAuth]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      mfaRequired, 
      mfaVerified, 
      authStatus, 
      login, 
      logout, 
      verifyMfa 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
