import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  History,
  Briefcase,
  Building2,
  CalendarOff,
  UserCheck,
  LogOut,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Crown,
  ChevronDown,
  Sparkles,
  X,
  LayoutGrid,
  Stethoscope,
  Sliders,
  CreditCard,
  Users,
  Pill,
  FileText,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import logoImg from '../assets/LOGO-EDIT 1.png';
import mediqoraLogo from '../assets/mediqora.png';

const AdminSidebar = ({ mobileOpen, closeMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, selectedClient, selectClient } = useAuth();
  const [clientsList, setClientsList] = React.useState([]);
  const [clientsExpanded, setClientsExpanded] = React.useState(true);

  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  React.useEffect(() => {
    if (isSuperAdmin) {
      API.get('/saas/clients').then(res => {
        if (res.data.success && res.data.clients) {
          setClientsList(res.data.clients);
          if (!selectedClient) {
            const defaultClient = res.data.clients.find(c => c.client_id === 'CLI-RRK-002') || res.data.clients[0];
            if (defaultClient) selectClient(defaultClient);
          }
        }
      }).catch(err => console.error('Failed to load clients in sidebar', err));
    }
  }, [isSuperAdmin]);

  const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  // Mediqoro Super Admin Main Menu (SaaS Dashboard, Clinic Saas Setting, Clinic Desks, SaaS Settings, Payment History, Security)
  const mediqoroMenuItems = [
    { label: 'SaaS Dashboard', path: '/admin/saas?tab=dashboard', icon: LayoutGrid, tabKey: 'dashboard' },
    { label: `Clinic Saas Setting (${clientsList.length || 1})`, path: '/admin/saas?tab=hospitals', icon: Building2, tabKey: 'hospitals' },
    { label: `Clinic Desks (${clientsList.length || 1})`, path: '/admin/saas?tab=clinics', icon: Stethoscope, tabKey: 'clinics' },
    { label: 'SaaS Settings', path: '/admin/saas?tab=settings', icon: Sliders, tabKey: 'settings' },
    { label: 'Payment History', path: '/admin/saas?tab=payments', icon: CreditCard, tabKey: 'payments' },
    { label: 'Mediqoro Profile & Security', path: '/admin/mediqoro-settings', icon: UserCheck }
  ];

  const isRRKClinic = selectedClient?.client_id === 'CLI-RRK-002' || selectedClient?.hospital_name?.includes('RRK');

  // Complete RRK Clinic Sub-Sidebar Menu (All 13 HMS features for RRK Clinic)
  const hospitalSubMenuItems = [
    { label: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Appointment Master', path: '/admin/appointments', icon: CalendarCheck },
    { label: 'Completed History', path: '/admin/appointment-history', icon: History },
    { label: 'Doctors Directory', path: '/admin/doctors', icon: Stethoscope },
    { label: 'Patient Registry', path: '/admin/patients', icon: Users },
    { label: 'Pharmacy Stock Manager', path: '/admin/inventory', icon: Pill },
    { label: 'Itemized Billing Desk', path: '/admin/billing', icon: FileText },
    { label: 'Income Accounts & Profits', path: '/admin/accounts', icon: TrendingUp },
    { label: 'Service Management', path: '/admin/services', icon: Briefcase },
    { label: 'Holidays & Closures', path: '/admin/holidays', icon: CalendarOff },
    { label: 'Branch Management', path: '/admin/branches', icon: Building2 },
    { label: 'Upgrade Subscription Plan', path: '/admin/subscription', icon: Crown },
    { label: 'Hospital Doctor Profile', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate(isSuperAdmin ? '/mediqoro/login' : '/admin/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 h-screen flex flex-col border-r shrink-0 transition-transform duration-300 ${
          isSuperAdmin
            ? 'bg-white text-slate-900 border-[#BBF7D0]'
            : 'bg-[#F0FDF4] text-slate-800 border-[#BBF7D0]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isSuperAdmin ? 'bg-green-50/50 border-[#BBF7D0]' : 'bg-white border-[#BBF7D0]'
        }`}>
          {isSuperAdmin ? (
            <img src={mediqoraLogo} alt="Mediqora Logo" className="h-10 w-auto object-contain" />
          ) : (
            <img src={logoImg} alt="Shree Ram Homeo Logo" className="h-10 w-auto object-contain" />
          )}

          <div className="flex items-center gap-2">
            {!isSuperAdmin && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border bg-[#16a34a] text-white border-[#16a34a]">
                DOCTOR ADMIN
              </span>
            )}
            <button
              onClick={closeMobile}
              className="md:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CASE 1: MEDIQORO SUPER ADMIN SIDEBAR (WHITE & EMERALD GREEN THEME) */}
        {/* ========================================================================= */}
        {isSuperAdmin ? (
          <div className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
            
            {/* Mediqoro Main Master Menu */}
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-[#15803d] tracking-wider px-2 block">
                MEDIQORO MASTER CONTROL
              </span>
              {mediqoroMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.tabKey
                  ? location.pathname === '/admin/saas' && currentTab === item.tabKey
                  : location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobile}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#16a34a] text-white shadow-md shadow-green-500/20'
                        : 'text-slate-700 hover:bg-green-50 hover:text-[#16a34a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#16a34a]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                  </Link>
                );
              })}
            </div>

            {/* ACTIVE SELECTED CLINIC DESK MENU (Shown ONLY when inside a clinic desk, NOT on Master Control pages!) */}
            {selectedClient && !['/admin/saas', '/admin/mediqoro-settings'].includes(location.pathname) && (
              <div className="p-3 bg-green-50/90 text-slate-900 rounded-2xl border border-[#BBF7D0] space-y-2 shadow-xs">
                {/* Active Clinic Header Banner */}
                <div className="p-2.5 rounded-xl bg-[#16a34a] text-white shadow-xs flex items-center justify-between gap-2">
                  <div className="truncate pr-1">
                    <span className="block truncate text-xs font-extrabold">{selectedClient.hospital_name}</span>
                    <span className="block text-[9px] font-mono text-green-100">{selectedClient.client_id}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      selectClient(null);
                      navigate('/admin/saas');
                    }}
                    className="text-[9px] font-black uppercase bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded cursor-pointer transition-all shrink-0"
                    title="Exit Clinic Desk"
                  >
                    Exit Desk
                  </button>
                </div>

                {/* CLINIC DESK OPERATIONAL FEATURES */}
                <div className="pt-1 space-y-1">
                  <span className="text-[9px] font-black uppercase text-[#15803d] block px-1 tracking-wider">
                    {selectedClient.hospital_name} Features:
                  </span>
                  {hospitalSubMenuItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={closeMobile}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                          isSubActive
                            ? 'bg-[#16a34a] text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-green-100/60 hover:text-[#15803d] border border-[#BBF7D0]/60'
                        }`}
                      >
                        <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-white' : 'text-[#16a34a]'}`} />
                        <span className="truncate">{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ========================================================================= */
          /* CASE 2: DOCTOR ADMIN SIDEBAR (SHREE RAM HOMEO CLINIC DESK ONLY) */
          /* ========================================================================= */
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {hospitalSubMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isReadOnlyForDoctor = ['/admin/services', '/admin/branches', '/admin/holidays'].includes(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  style={
                    isActive
                      ? {
                          backgroundColor: '#16a34a',
                          color: '#ffffff'
                        }
                      : {}
                  }
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'shadow-md shadow-green-500/20'
                      : 'text-slate-700 hover:bg-white hover:text-[#16a34a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#16a34a]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Logout button */}
        <div className={`p-4 border-t shrink-0 ${
          isSuperAdmin ? 'bg-green-50/30 border-[#BBF7D0]' : 'bg-[#F0FDF4] border-[#BBF7D0]'
        }`}>
          <button
            onClick={() => { closeMobile(); handleLogout(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-xs"
          >
            <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
