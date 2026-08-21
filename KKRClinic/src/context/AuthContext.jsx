import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const demoAccounts = [
  {
    id: 'USR-ADM-001',
    name: 'RRK Hospital Administrator',
    email: 'admin@rrkclinic.com',
    password: 'admin123',
    role: 'admin',
    roleLabel: 'Hospital Admin',
    title: 'Executive Clinic Director',
    avatar: 'A',
    badgeColor: 'bg-[#16a34a] text-white'
  },
  {
    id: 'USR-DOC-001',
    name: 'Dr. R.R. Rajan',
    email: 'dr.rajan@rrkclinic.com',
    password: 'doctor123',
    role: 'doctor',
    roleLabel: 'Senior Doctor 1',
    title: 'MD - General Medicine & Cardiology',
    avatar: 'R',
    badgeColor: 'bg-indigo-600 text-white',
    doctorId: 'DOC-RAJAN',
    specialty: 'General Medicine & Cardiology',
    roomNo: 'OPD Desk #101'
  },
  {
    id: 'USR-DOC-002',
    name: 'Dr. Anitha Rajan',
    email: 'dr.anitha@rrkclinic.com',
    password: 'doctor123',
    role: 'doctor',
    roleLabel: 'Senior Doctor 2',
    title: 'DCH, DGO - Pediatrics & Gynaecology',
    avatar: 'A',
    badgeColor: 'bg-sky-600 text-white',
    doctorId: 'DOC-ANITHA',
    specialty: 'Pediatrics & Gynaecology',
    roomNo: 'OPD Desk #102'
  },
  {
    id: 'USR-REC-001',
    name: 'Priya Sundaram',
    email: 'receptionist@rrkclinic.com',
    password: 'reception123',
    role: 'receptionist',
    roleLabel: 'Front Desk Receptionist',
    title: 'Patient Registrar & Billing Desk',
    avatar: 'P',
    badgeColor: 'bg-teal-600 text-white',
    deskId: 'DESK-FRONT-01'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rrk_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline'
  const [loading, setLoading] = useState(false);

  // Check Backend Server Health on load
  useEffect(() => {
    async function checkHealth() {
      const res = await apiService.checkHealth();
      if (res.success) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }
    }
    checkHealth();
  }, []);

  // Sync profile settings live when updated in Mediqora or RRK Admin Settings
  useEffect(() => {
    const syncProfile = () => {
      const savedSettings = localStorage.getItem('rrk_settings');
      if (savedSettings && user && user.role === 'admin') {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.name && (parsed.name !== user.name || parsed.email !== user.email || parsed.phone !== user.phone)) {
            setUser(prev => ({
              ...prev,
              name: parsed.name,
              email: parsed.email || prev.email,
              phone: parsed.phone || prev.phone
            }));
          }
        } catch (e) {}
      }
    };
    syncProfile();
    window.addEventListener('storage', syncProfile);
    const interval = setInterval(syncProfile, 3000);
    return () => {
      window.removeEventListener('storage', syncProfile);
      clearInterval(interval);
    };
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const demoFound = demoAccounts.find(a => a.email.toLowerCase() === cleanEmail && a.password === password);

    // 1. Try Backend API Auth First
    try {
      const backendRes = await apiService.login(cleanEmail, password);
      if (backendRes && backendRes.success && backendRes.user) {
        const u = backendRes.user;
        const mergedUser = {
          ...u,
          roleLabel: u.role === 'admin' ? 'Hospital Admin' : u.role === 'doctor' ? 'Senior Doctor' : 'Front Desk Staff',
          badgeColor: u.role === 'admin' ? 'bg-[#16a34a] text-white' : u.role === 'doctor' ? 'bg-indigo-600 text-white' : 'bg-teal-600 text-white',
          title: demoFound?.title || (u.role === 'admin' ? 'Executive Clinic Director' : 'Consultant'),
          doctorId: demoFound?.doctorId,
          roomNo: demoFound?.roomNo,
          token: backendRes.token
        };

        setUser(mergedUser);
        localStorage.setItem('rrk_user', JSON.stringify(mergedUser));
        toast.success(`Connected to Backend! Welcome ${mergedUser.name}.`);
        setLoading(false);
        return { success: true, user: mergedUser };
      }
    } catch (err) {
      console.warn('Backend API login fallback to local demo mode:', err.message);
    }

    // 2. Fallback to Local Auth if offline or demo credentials
    if (demoFound) {
      setUser(demoFound);
      localStorage.setItem('rrk_user', JSON.stringify(demoFound));
      toast.success(`Welcome to RRK Clinic, ${demoFound.name}! Signed in as ${demoFound.roleLabel}.`);
      setLoading(false);
      return { success: true, user: demoFound };
    } else {
      toast.error('Invalid email or password. Please check your credentials.');
      setLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rrk_user');
    localStorage.removeItem('rrk_token');
    toast.success('Logged out from RRK Clinic Portal.');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      backendStatus,
      login,
      logout,
      demoAccounts
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
