import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return import.meta.env.VITE_API_URL || 'https://sri-ram-homeo-appointment-booking.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sri_ram_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sri_ram_token');
      localStorage.removeItem('sri_ram_user');
      // If currently on an admin route, redirect to login respecting base URL
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin') && !currentPath.includes('/admin/login')) {
        const basePath = import.meta.env.BASE_URL || '/';
        const loginPath = `${basePath}admin/login`.replace(/\/+/g, '/');
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default API;
