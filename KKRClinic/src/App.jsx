import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Booking from './pages/Booking';
import Success from './pages/Success';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Admin Dashboards & Management Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import DoctorDashboard from './pages/Admin/DoctorDashboard';
import ReceptionistDashboard from './pages/Admin/ReceptionistDashboard';
import Appointments from './pages/Admin/Appointments';
import AppointmentDetails from './pages/Admin/AppointmentDetails';
import Doctors from './pages/Admin/Doctors';
import Patients from './pages/Admin/Patients';
import Services from './pages/Admin/Services';
import Branches from './pages/Admin/Branches';
import Settings from './pages/Admin/Settings';

// New Features: Inventory, Billing, Accounts, Holidays, Appointment History, Subscription
import Inventory from './pages/Admin/Inventory';
import Billing from './pages/Admin/Billing';
import Accounts from './pages/Admin/Accounts';
import Holidays from './pages/Admin/Holidays';
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
            background: '#1e3a8a',
            color: '#fff',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 'bold'
          },
        }}
      />
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Public Patient Booking Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Booking />} />
            <Route path="booking" element={<Booking />} />
            <Route path="booking/success" element={<Success />} />
          </Route>

          {/* Multi-Role Staff Login (Admin, Doctor 1, Doctor 2, Receptionist) */}
          <Route path="/login" element={<Login />} />

          {/* Role-Based Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="receptionist-dashboard" element={<ReceptionistDashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointment-history" element={<AppointmentHistory />} />
            <Route path="appointments/:id" element={<AppointmentDetails />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="patients" element={<Patients />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="billing" element={<Billing />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="services" element={<Services />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="branches" element={<Branches />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
