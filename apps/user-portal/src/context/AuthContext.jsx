import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check active session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await apiClient('/auth/me');
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        }
      } catch (error) {
        // Safe to ignore 401 on boot checks
        console.log('ℹ️ No active session found on boot.');
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // Handler for mock logins during local development
  const loginMock = async (role) => {
    setLoading(true);
    try {
      const res = await apiClient('/auth/mock-login', {
        method: 'POST',
        body: { role }
      });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (error) {
      console.error('Mock login failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerConfirm = async (payload) => {
    setLoading(true);
    try {
      const res = await apiClient('/auth/register-confirm', {
        method: 'POST',
        body: payload
      });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (error) {
      console.error('Registration confirmation API failure:', error.message);
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
      console.error('Logout API failure:', error.message);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    loginMock,
    registerConfirm,
    logout,
    updateUser,
    isAuthenticated: !!user,
    role: user?.role || null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be nested within an AuthProvider.');
  }
  return context;
}
