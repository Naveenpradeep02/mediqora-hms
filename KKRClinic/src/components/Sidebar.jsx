import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Stethoscope,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  UserCheck,
  PlusCircle,
  Clock,
  Activity,
  Pill,
  FileText,
  TrendingUp,
  CalendarOff,
  History,
  Crown,
  ShieldCheck,
  ShieldAlert,
  Lock,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredSubscription, syncSubscriptionWithBackend } from '../services/dataService';

const Sidebar = ({ mobileOpen, closeMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState(getStoredSubscription);

  useEffect(() => {
    const fetchSub = async () => {
      const live = await syncSubscriptionWithBackend();
      if (live) setSubscription(live);
    };
    fetchSub();
    const interval = setInterval(fetchSub, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic Navigation Items based on Logged-in User Role & Strict Permissions
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Admin Master Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Master Appointments', path: '/admin/appointments', icon: CalendarCheck },
        { label: 'Appointment History', path: '/admin/appointment-history', icon: History },
        { label: 'Doctors Directory', path: '/admin/doctors', icon: Stethoscope },
        { label: 'Patient Registry', path: '/admin/patients', icon: Users },
        { label: 'Pharmacy & Stock Manager', path: '/admin/inventory', icon: Pill },
        { label: 'Itemized Billing Desk', path: '/admin/billing', icon: FileText },
        { label: 'Income Accounts & Profits', path: '/admin/accounts', icon: TrendingUp },
        { label: 'Services & Fee Schedule', path: '/admin/services', icon: Activity },
        { label: 'Subscription & SaaS Plan', path: '/admin/subscription', icon: Crown },
        { label: 'Holidays & Closures', path: '/admin/holidays', icon: CalendarOff },
        { label: 'Clinic Branches', path: '/admin/branches', icon: Building2 },
        { label: 'Clinic Settings', path: '/admin/settings', icon: Settings },
      ];
    } else if (user?.role === 'doctor') {
      return [
        { label: 'Doctor OPD Desk', path: '/admin/doctor-dashboard', icon: Stethoscope },
        { label: 'My Patient Appointments', path: '/admin/appointments', icon: CalendarCheck },
        { label: 'Appointment History', path: '/admin/appointment-history', icon: History },
        { label: 'Patient Medical Records', path: '/admin/patients', icon: Users },
        { label: 'Holidays & Closures', path: '/admin/holidays', icon: CalendarOff },
        { label: 'Doctor Profile & Timings', path: '/admin/settings', icon: UserCheck },
      ];
    } else if (user?.role === 'receptionist') {
      return [
        { label: 'Front Desk Queue & Tokens', path: '/admin/receptionist-dashboard', icon: Clock },
        { label: 'New Walk-In Booking', path: '/booking', icon: PlusCircle },
        { label: 'Appointments List', path: '/admin/appointments', icon: CalendarCheck },
        { label: 'Appointment History', path: '/admin/appointment-history', icon: History },
        { label: 'Itemized Billing Desk', path: '/admin/billing', icon: FileText },
        { label: 'Inventory & Expiry Updates', path: '/admin/inventory', icon: Pill },
        { label: 'Holidays & Closures', path: '/admin/holidays', icon: CalendarOff },
        { label: 'Patient Registry', path: '/admin/patients', icon: Users },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 h-screen flex flex-col border-r border-emerald-900/20 bg-slate-900 text-white shrink-0 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16a34a] to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
              R
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">RRK CLINIC</h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1">Smart Healthcare</p>
            </div>
          </div>

          <button
            onClick={closeMobile}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Banner Badge */}
        <div className="px-4 py-3 bg-emerald-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-extrabold text-emerald-200">
              {user?.roleLabel || 'Hospital Admin'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/50">
            {user?.role === 'admin' ? 'Master' : user?.role === 'doctor' ? user?.roomNo : 'Desk 01'}
          </span>
        </div>

        {/* Role Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSubItem = item.path === '/admin/subscription';
            const isActive = location.pathname === item.path;
            const isItemLocked = (subscription.isPaused || subscription.status?.toLowerCase() === 'paused' || subscription.status?.toLowerCase() === 'expired') && !isSubItem;

            return (
              <Link
                key={item.path}
                to={isItemLocked ? '/admin/subscription' : item.path}
                onClick={closeMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-[#16a34a] text-white shadow-lg shadow-emerald-600/30'
                    : isSubItem && (subscription.isPaused || subscription.status?.toLowerCase() === 'expired' || subscription.status?.toLowerCase() === 'paused')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : isItemLocked
                    ? 'text-slate-500 opacity-60 hover:bg-slate-900 hover:text-slate-400'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isItemLocked ? 'text-slate-600' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isItemLocked ? (
                  <span className="p-1 bg-rose-950/80 text-rose-400 rounded-md border border-rose-800/60 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-rose-400" />
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-4 h-4 text-white" />
                ) : null}
              </Link>
            );
          })}
        </nav>


        {/* Subscription Plan Status Mini Card */}
        {(() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let daysRemaining = null;
          if (subscription?.renewalDate) {
            const renewalDateObj = new Date(subscription.renewalDate);
            if (!isNaN(renewalDateObj.getTime())) {
              renewalDateObj.setHours(0, 0, 0, 0);
              daysRemaining = Math.ceil((renewalDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            }
          }

          const isPaused = Boolean(subscription?.isPaused || subscription?.status?.toLowerCase() === 'paused');
          const isExpired = Boolean((daysRemaining !== null && daysRemaining <= 0) || subscription?.status?.toLowerCase() === 'expired');

          return (
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
              <Link
                to="/admin/subscription"
                onClick={closeMobile}
                className={`block p-2.5 rounded-xl border transition-all ${
                  isPaused || isExpired
                    ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800/60 shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Mediqora SaaS</span>
                  </span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                    isPaused
                      ? 'bg-rose-500/20 text-rose-300'
                      : isExpired
                      ? 'bg-rose-500/30 text-rose-200'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    ● {isPaused ? 'PAUSED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-200 mt-1 truncate">
                  {subscription?.planName || 'Standard Plan'}
                </p>
                <p className="text-[9px] font-medium mt-0.5 flex items-center justify-between">
                  <span className="text-slate-400">Exp: {subscription?.renewalDate ? String(subscription.renewalDate).split('T')[0] : 'Active'}</span>
                  {isPaused ? (
                    <span className="text-rose-400 font-bold">Suspended</span>
                  ) : isExpired ? (
                    <span className="text-rose-400 font-bold">Overdue</span>
                  ) : daysRemaining !== null ? (
                    <span className="text-emerald-400 font-bold">{daysRemaining}d left</span>
                  ) : null}
                </p>
              </Link>
            </div>
          );
        })()}

        {/* Sign Out Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0">
          <button
            onClick={() => { closeMobile(); handleLogout(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
          >
            <LogOut className="w-4 h-4 text-rose-400" /> Sign Out Portal
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
