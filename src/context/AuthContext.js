import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  const isAdmin = () => {
    return currentUser?.role === 'ADMIN';
  };

  const isClient = () => {
    return currentUser?.role === 'CLIENT';
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isClient,
    loading
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};