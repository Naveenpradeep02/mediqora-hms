import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { Loader2, Menu, X, AlertTriangle, LogOut, ShieldAlert, Phone, Building2, ArrowLeft, CreditCard, Sparkles, Search, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';
import logoImg from '../assets/LOGO-EDIT 1.png';
import mediqoraLogo from '../assets/mediqora.png';

const AdminLayout = () => {
  const { user, isAuthenticated, loading, saasInfo, selectedClient, clearSelectedClient, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const isDoctorPaused = !isSuperAdmin && saasInfo?.isPaused && location.pathname !== '/admin/upgrade';

  const handleRazorpayPayAndRenew = async () => {
    setIsPaying(true);
    try {
      const res = await API.post('/saas/create-razorpay-order');
      if (!res.data.success) {
        toast.error(res.data.message || 'Failed to create payment order');
        setIsPaying(false);
        return;
      }

      const { orderId, keyId, amount, currency, hospitalName, monthlyFee, clientId } = res.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: hospitalName || 'Shree Ram Homeo Renewal',
        description: `Monthly Subscription License Renewal (₹${monthlyFee || 2999})`,
        order_id: orderId,
        prefill: {
          name: user?.name || 'Dr. Selvakumar',
          email: user?.email || 'dr.selvakumarr@gmail.com',
          contact: user?.phone || '+91 95515 19766'
        },
        theme: {
          color: '#16a34a'
        },
        handler: async function (response) {
          try {
            const verifyRes = await API.post('/saas/verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              clientId
            });

            if (verifyRes.data.success) {
              toast.success('🎉 Payment Successful! Doctor Portal Access fully unpaused.');
              window.location.reload();
            } else {
              toast.error(verifyRes.data.message || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            toast.error('Payment verification failed.');
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
            toast('Payment cancelled', { icon: 'ℹ️' });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      toast.error('Failed to initiate online Razorpay payment');
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#16a34a] font-bold gap-2 text-sm font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-[#16a34a]" /> Verifying Admin Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${
      isSuperAdmin && ['/admin/saas', '/admin/mediqoro-settings'].includes(location.pathname) ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#F0FDF4] text-slate-800'
    }`}>
      
      {/* Mobile Header Bar */}
      <div className={`md:hidden border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs ${
        isSuperAdmin ? 'bg-white border-[#BBF7D0] text-slate-900' : 'bg-white border-[#BBF7D0] text-slate-900'
      }`}>
        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <div className="flex items-center gap-2">
              <img src={mediqoraLogo} alt="Mediqora Logo" className="h-8 w-auto object-contain" />
              <span className="font-black text-[#15803d] text-base tracking-tight">MEDIQORA</span>
              <span className="text-[9px] font-black bg-green-100 text-[#15803d] px-2 py-0.5 rounded-full border border-[#BBF7D0] uppercase">
                MASTER
              </span>
            </div>
          ) : (
            <>
              <img src={logoImg} alt="Shree Ram Homeo Logo" className="h-9 w-auto object-contain" />
              <span
                style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
              >
                ADMIN
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className={`p-2 rounded-xl border cursor-pointer ${
            isSuperAdmin ? 'bg-green-50 border-[#BBF7D0] text-[#16a34a]' : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16a34a]'
          }`}
          aria-label="Toggle Navigation Menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        closeMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#BBF7D0] px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs gap-4">
          
          {/* Search Option */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search appointments, patients, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/admin/appointments?search=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a] transition-all"
              />
            </div>
          </div>

          {/* Right Corner Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* User Profile Pill Card */}
            <div className="flex items-center gap-3 p-1.5 px-3 bg-green-50/80 border border-[#BBF7D0] rounded-2xl shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16a34a] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0) : (isSuperAdmin ? 'S' : 'D')}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  {user?.name || (isSuperAdmin ? 'Srija' : 'Dr. Selvakumar')}
                </p>
                <p className="text-[10px] font-bold text-[#16a34a] capitalize flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#16a34a]" />
                  {isSuperAdmin ? 'Mediqoro SaaS Owner' : 'Doctor Admin'}
                </p>
              </div>
            </div>

          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Top Mediqoro Client Portal Banner for Super Admin (Shown ONLY when inside a Hospital Client Desk) */}
          {isSuperAdmin && !['/admin/saas', '/admin/mediqoro-settings'].includes(location.pathname) && (
            <div className="mb-6 p-4 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-black">
                  <Building2 className="w-5 h-5 text-[#FB923C]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400">Mediqoro Hospital Portal</span>
                    <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                      {selectedClient ? selectedClient.client_id : 'CLI-RRK-002'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm mt-0.5">
                    {selectedClient ? selectedClient.hospital_name : 'RRK Clinic & Multispecialty Hospital'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearSelectedClient();
                  navigate('/admin/saas');
                }}
                className="px-4 py-2 rounded-xl bg-[#16a34a] hover:opacity-90 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Mediqoro Clients Directory</span>
              </button>
            </div>
          )}

          {/* PAUSED ACCESS NOTICE BANNER FOR DOCTOR ADMIN */}
          {isDoctorPaused ? (
            <div className="bg-rose-50 border-2 border-rose-300 p-8 rounded-3xl shadow-xl space-y-5 text-center max-w-2xl mx-auto my-8 font-sans">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-9 h-9 text-rose-600" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                  Subscription Suspended
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Hospital Access Paused</h2>
                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-2 leading-relaxed">
                  {saasInfo?.reason || 'Hospital SaaS subscription is currently paused. Please contact Mediqoro Super Admin to renew monthly subscription.'}
                </p>
              </div>

              {/* Online Razorpay Payment & Unpause Button */}
              <div className="p-5 bg-white rounded-2xl border border-[#BBF7D0] text-left space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#16a34a]" /> Instant Online Renewal via Razorpay
                  </span>
                  <span className="text-[10px] font-extrabold bg-[#16a34a] text-white px-2 py-0.5 rounded-full">
                    Auto Unpause
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  Pay your hospital subscription online via UPI, Credit/Debit Card, or Netbanking to instantly unpause and restore Doctor Desk access.
                </p>
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleRazorpayPayAndRenew}
                    disabled={isPaying}
                    style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-xs shadow-lg shadow-green-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" /> Connecting to Razorpay...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-white" />
                        <span>Pay Online Now</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/admin/upgrade')}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white border border-[#BBF7D0] text-[#16a34a] hover:bg-[#F0FDF4] font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#16a34a]" />
                    <span>Browse All Plans & Upgrade →</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-rose-200 text-xs text-slate-700 space-y-2 text-left">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Need Help Renewing Access?
                </p>
                <p className="text-slate-600 font-medium">
                  Please reach out to Mediqoro SaaS Platform Administrator:
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-bold text-slate-900">
                  <span className="flex items-center gap-1 text-[#16a34a]">
                    <Phone className="w-3.5 h-3.5 text-[#16a34a]" /> +91 73735 09585
                  </span>
                  <span className="text-slate-600">info@mediqora.in</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 transition-all shadow-md cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-white" /> Sign Out from Doctor Portal
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>

        {/* Footer */}
        <footer className="p-4 border-t border-[#BBF7D0] bg-white/70 text-center text-xs text-slate-500 font-medium font-sans">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>&copy; 2026 Shree Ram Homeo Admin Portal. All rights reserved.</p>
            <p className="text-slate-600 font-semibold">
              Designed & Developed by{' '}
              <a
                href="http://medgrowdigi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#16a34a] hover:underline font-extrabold"
              >
                Medgrow Marketing Agency
              </a>
            </p>
          </div>
        </footer>
      </div>

    </div>
  );
};

export default AdminLayout;
