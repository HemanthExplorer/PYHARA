import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState('login'); // 'login' or 'register'

  const initAuth = useCallback(async () => {
    setLoading(true);
    const storedToken = authService.getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser(storedToken);
      if (currentUser && currentUser.is_active) {
        setUser(currentUser);
        setToken(storedToken);
      } else {
        authService.removeStoredToken();
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Failed to validate authentication session:', err.message);
      authService.removeStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleLogin = async (usernameOrEmail, password) => {
    const data = await authService.login(usernameOrEmail, password);
    if (!data || !data.access_token) {
      throw new Error('Invalid credentials');
    }
    setToken(data.access_token);

    const currentUser = await authService.getCurrentUser(data.access_token);
    if (!currentUser || !currentUser.is_active) {
      authService.removeStoredToken();
      setToken(null);
      setUser(null);
      throw new Error('Account inactive or invalid credentials');
    }

    setUser(currentUser);
    setIsAuthModalOpen(false);
    return currentUser;
  };

  const handleRegister = async (fullName, email, phone, password) => {
    await authService.register(fullName, email, phone, password);
    // Auto-login upon registration
    return await handleLogin(email, password);
  };

  const handleUpdateProfile = async (updateData) => {
    const updated = await authService.updateProfile(updateData);
    setUser(updated);
    return updated;
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.is_admin);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        isAuthModalOpen,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
        login: handleLogin,
        register: handleRegister,
        updateProfile: handleUpdateProfile,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
