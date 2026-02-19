import React, { createContext, useState, useContext, useEffect } from 'react';
import { isAuthenticated, getUserData, logout as apiLogout } from '../simulationAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authenticated = isAuthenticated();
    if (authenticated) {
      const userData = getUserData();
      setUser(userData);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    window.location.href = '/';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: isAuthenticated(),
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};