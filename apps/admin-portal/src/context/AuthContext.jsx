import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await apiClient('/auth/me');
        if (res.success && res.data?.user) {
          if (res.data.user.role === 'admin') {
            setUser(res.data.user);
          } else {
            console.warn('⚠️ Non-admin session detected. Admin Portal rejects access.');
          }
        }
      } catch (error) {
        console.log('ℹ️ No active session found.');
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const loginMock = async () => {
    setLoading(true);
    try {
      const res = await apiClient('/auth/mock-login', {
        method: 'POST',
        body: { role: 'admin' }
      });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (error) {
      console.error('Admin mock login failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginCredentials = async (username, password) => {
    setLoading(true);
    try {
      const res = await apiClient('/auth/admin-login', {
        method: 'POST',
        body: { username, password }
      });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (error) {
      console.error('Admin credentials login failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    loginMock,
    loginCredentials,
    logout,
    isAuthenticated: !!user && user.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be nested within AuthProvider.');
  }
  return context;
}
