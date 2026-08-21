import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import ScrollToTop from './components/ScrollToTop';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Booking from './pages/Booking';
import Success from './pages/Success';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import MediqoroLogin from './pages/Admin/MediqoroLogin';
import Dashboard from './pages/Admin/Dashboard';
import Appointments from './pages/Admin/Appointments';
import AppointmentDetails from './pages/Admin/AppointmentDetails';
import CompletedHistory from './pages/Admin/CompletedHistory';
import Services from './pages/Admin/Services';
import Branches from './pages/Admin/Branches';
import Holidays from './pages/Admin/Holidays';
import Settings from './pages/Admin/Settings';
import MediqoroSettings from './pages/Admin/MediqoroSettings';
import SaasControl from './pages/Admin/SaasControl';
import UpgradePlan from './pages/Admin/UpgradePlan';
import PaymentHistory from './pages/Admin/PaymentHistory';

import Doctors from './pages/Admin/Doctors';
import Patients from './pages/Admin/Patients';
import Inventory from './pages/Admin/Inventory';
import Billing from './pages/Admin/Billing';
import Accounts from './pages/Admin/Accounts';
import AppointmentHistory from './pages/Admin/AppointmentHistory';
import Subscription from './pages/Admin/Subscription';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          {/* Mediqora Super Admin Suite - Root redirects directly to Mediqora Master Login */}
          <Route path="/" element={<Navigate to="/admin/mediqoro-login" replace />} />
          <Route path="/booking" element={<Navigate to="/admin/mediqoro-login" replace />} />
          <Route path="/booking/success" element={<Navigate to="/admin/mediqoro-login" replace />} />

          {/* Mediqora Master Dedicated Login Routes */}
          <Route path="/mediqoro/login" element={<MediqoroLogin />} />
          <Route path="/admin/mediqoro-login" element={<MediqoroLogin />} />

          {/* Hospital Doctor Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/:id" element={<AppointmentDetails />} />
            <Route path="history" element={<CompletedHistory />} />
            <Route path="appointment-history" element={<AppointmentHistory />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="patients" element={<Patients />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="billing" element={<Billing />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="services" element={<Services />} />
            <Route path="branches" element={<Branches />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="settings" element={<Settings />} />
            <Route path="upgrade" element={<UpgradePlan />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="mediqoro-settings" element={<MediqoroSettings />} />
            <Route path="saas" element={<SaasControl />} />
            <Route path="payments" element={<PaymentHistory />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
