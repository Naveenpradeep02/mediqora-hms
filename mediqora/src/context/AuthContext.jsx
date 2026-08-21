import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sri_ram_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sri_ram_token') || null);
  const [loading, setLoading] = useState(true);

  const [saasInfo, setSaasInfo] = useState({ isPaused: false, pauseReason: '' });

  const checkSaasStatus = async () => {
    try {
      if (token) {
        const res = await API.get('/saas/status');
        if (res.data.success) {
          setSaasInfo({
            isPaused: res.data.isPaused,
            pauseReason: res.data.pauseReason
          });
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('sri_ram_user', JSON.stringify(res.data.user));
            await checkSaasStatus();
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const cleanEmail = email ? email.trim() : '';
      const res = await API.post('/auth/login', { email: cleanEmail, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('sri_ram_token', res.data.token);
        localStorage.setItem('sri_ram_user', JSON.stringify(res.data.user));
        toast.success(`Welcome back, ${res.data.user.name}!`);
        await checkSaasStatus();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Login failed. Invalid email or password.';
      toast.error(msg);
      return false;
    }
  };

  const [selectedClient, setSelectedClient] = useState(() => {
    const savedClient = localStorage.getItem('mediqoro_selected_client');
    return savedClient ? JSON.parse(savedClient) : null;
  });

  const selectClient = (client) => {
    setSelectedClient(client);
    if (client) {
      localStorage.setItem('mediqoro_selected_client', JSON.stringify(client));
    } else {
      localStorage.removeItem('mediqoro_selected_client');
    }
  };

  const clearSelectedClient = () => {
    setSelectedClient(null);
    localStorage.removeItem('mediqoro_selected_client');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSelectedClient(null);
    setSaasInfo({ isPaused: false, pauseReason: '' });
    localStorage.removeItem('sri_ram_token');
    localStorage.removeItem('sri_ram_user');
    localStorage.removeItem('mediqoro_selected_client');
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      loading,
      saasInfo,
      selectedClient,
      selectClient,
      clearSelectedClient,
      checkSaasStatus,
      login,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
