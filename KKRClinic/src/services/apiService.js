// RRK CLINIC BACKEND API INTEGRATION SERVICE
// Connects to Express Node.js API Server running on port 5000 (http://localhost:5000/api)

const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000/api' : 'https://mediqora-hms.onrender.com/api');

// Helper to add JWT token header
const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('rrk_token');
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const apiService = {
  // Backend Health Check
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      console.warn('Backend API offline or unreachable:', err.message);
      return { success: false, offline: true };
    }
  },

  // Auth: Login via Backend
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('rrk_token', data.token);
      }
      return data;
    } catch (err) {
      console.warn('Backend Auth Login error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Auth: Get Profile
  getMe: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Appointments API
  fetchAppointments: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  updateAppointmentStatus: async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Services API
  fetchServices: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/services`, {
        headers: getHeaders(false)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Branches API
  fetchBranches: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches`, {
        headers: getHeaders(false)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Holidays API
  fetchHolidays: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/holidays`, {
        headers: getHeaders(false)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // SaaS Subscription & Status API (Connected to Mediqora Super Admin)
  fetchSubscription: async (clientId = 'CLI-RRK-002') => {
    try {
      const res = await fetch(`${API_BASE_URL}/saas/status?clientId=${encodeURIComponent(clientId)}`, {
        headers: getHeaders(false)
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend subscription fetch fallback:', err.message);
      return { success: false };
    }
  },

  // Razorpay SaaS Order APIs
  createRazorpayOrder: async (planName, customAmount, durationDays) => {
    try {
      const res = await fetch(`${API_BASE_URL}/saas/create-razorpay-order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ planName, customAmount, durationDays, clientId: 'CLI-RRK-002' })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  verifyRazorpayPayment: async (paymentData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/saas/verify-razorpay-payment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...paymentData, clientId: 'CLI-RRK-002' })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
};
