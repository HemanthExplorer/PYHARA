import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(true);

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
      if (currentUser && currentUser.is_active && currentUser.is_admin) {
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

  const handleLogin = async (username, password) => {
    const data = await authService.login(username, password);
    if (!data || !data.access_token) {
      throw new Error('Invalid username or password');
    }
    setToken(data.access_token);

    // Fetch user profile immediately using fresh token to prevent race condition
    const currentUser = await authService.getCurrentUser(data.access_token);
    if (!currentUser || !currentUser.is_active || !currentUser.is_admin) {
      authService.removeStoredToken();
      setToken(null);
      setUser(null);
      throw new Error('Invalid username or password');
    }

    setUser(currentUser);
    return currentUser;
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
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
        login: handleLogin,
        logout: handleLogout,
        loading,
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
