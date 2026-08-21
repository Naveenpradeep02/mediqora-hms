import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, UserCheck, ShieldCheck, Stethoscope, Clock, ShieldAlert, Lock, Crown, ArrowRight, Phone, Mail, RefreshCw } from 'lucide-react';
import { getStoredSubscription, syncSubscriptionWithBackend } from '../services/dataService';

const AdminLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subscription, setSubscription] = useState(getStoredSubscription);

  const fetchSub = async () => {
    try {
      const live = await syncSubscriptionWithBackend();
      if (live) setSubscription(live);
    } catch (e) {
      const stored = getStoredSubscription();
      if (stored) setSubscription(stored);
    }
  };

  useEffect(() => {
    fetchSub();
    window.addEventListener('storage', fetchSub);
    const interval = setInterval(fetchSub, 4000);
    return () => {
      window.removeEventListener('storage', fetchSub);
      clearInterval(interval);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if subscription has ended or is paused
  const todayStr = new Date().toISOString().split('T')[0];
  const renewalDateStr = subscription.renewalDate ? String(subscription.renewalDate).split('T')[0] : '';
  const isDateExpired = Boolean(renewalDateStr && renewalDateStr < todayStr && subscription.status !== 'Active');
  const isPaused = subscription.isPaused || subscription.status?.toLowerCase() === 'paused';
  const isExpired = subscription.status?.toLowerCase() === 'expired' || isDateExpired;
  const isLocked = isPaused || isExpired;

  const isSubscriptionPage = location.pathname === '/admin/subscription';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-800 font-sans">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden border-b border-green-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 bg-white shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#16a34a] text-white font-black flex items-center justify-center text-sm shadow-xs">
            K
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight block leading-tight">RRK CLINIC</span>
            <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-wider block">{user?.roleLabel}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl border border-green-200 bg-green-50 text-[#15803d] cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        closeMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Warning Banner if SaaS Subscription is Locked */}
        {isLocked && !isSubscriptionPage && (
          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-md text-xs font-bold shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                {isPaused 
                  ? `SaaS Access Paused by Mediqora Admin: ${subscription.pauseReason || 'Subscription is paused'}`
                  : `Hospital SaaS Plan Expired on ${renewalDateStr}. Clinical data & operations are locked.`}
              </span>
            </div>
            <Link
              to="/admin/subscription"
              className="px-3 py-1 rounded-xl bg-white text-rose-800 font-extrabold text-[11px] hover:bg-rose-50 transition-all flex items-center gap-1 shrink-0 ml-3"
            >
              <span>Renew Now</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-green-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs gap-4">
          
          {/* Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                disabled={isLocked && !isSubscriptionPage}
                placeholder={isLocked ? "SaaS Access Locked..." : "Search appointments, patients, medical cases..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() && !isLocked) {
                    navigate(`/admin/appointments?search=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#16a34a] transition-all ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
          </div>

          {/* Right User Profile Card & Backend Status */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* SaaS Status Badge */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-black shadow-2xs border ${
              isLocked 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLocked ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span>{isLocked ? (isPaused ? 'SaaS Paused' : 'SaaS Expired') : 'SaaS Active'}</span>
            </div>

            <div className="flex items-center gap-3 p-1.5 px-3 bg-green-50/80 border border-green-200 rounded-2xl shadow-2xs">
              <div className={`w-8 h-8 rounded-xl ${user?.badgeColor || 'bg-[#16a34a] text-white'} flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
                {user?.avatar || 'R'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  {user?.name || 'RRK User'}
                </p>
                <p className="text-[10px] font-bold text-[#15803d] capitalize flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#16a34a]" />
                  {user?.roleLabel || 'Staff'} {user?.roomNo ? `(${user.roomNo})` : ''}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet or Subscription Lockout Screen */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLocked && !isSubscriptionPage ? (
            <div className="min-h-[70vh] flex items-center justify-center py-12">
              <div className="max-w-2xl w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-rose-500/30 text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                  {/* Lock Icon */}
                  <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/10">
                    <Lock className="w-10 h-10 text-rose-400" />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-500/30">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {isPaused ? 'SaaS Subscription Suspended' : 'SaaS Subscription Expired'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {isPaused ? 'Clinical Access Temporarily Paused' : 'Subscription Has Ended — Data Locked'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                      {isPaused 
                        ? (subscription.pauseReason || 'Your hospital SaaS access has been paused by the Mediqora Super Admin. All clinical workflows are temporarily suspended.')
                        : `Your RRK Clinic SaaS subscription license expired on ${renewalDateStr}. Clinical records, patient appointments, prescription desks, and billing data are locked until renewal.`}
                    </p>
                  </div>

                  {/* Pricing / Plan Details Box */}
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-left text-xs max-w-md mx-auto space-y-2">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Hospital Client:</span>
                      <strong className="text-white">RRK Clinic & Multispecialty Hospital</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Last Active Plan:</span>
                      <strong className="text-amber-400">{subscription.planName || '3 Months Plan'}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Next Expiry / Due Date:</span>
                      <strong className="text-rose-400">{renewalDateStr || 'Overdue'}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      to="/admin/subscription"
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#16a34a] to-emerald-600 hover:from-green-600 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-amber-300" />
                      <span>Renew / Upgrade Subscription Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={fetchSub}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Check Status Again</span>
                    </button>
                  </div>

                  {/* Support Info */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Support: <strong>+91 73735 09585</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      Email: <strong>info@mediqora.in</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
