import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Power,
  RefreshCw,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Loader2,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  Building2,
  Users,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Search,
  ExternalLink,
  Crown,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Activity,
  UserCheck,
  Zap,
  Sliders,
  BellRing,
  MessageSquare,
  Check,
  Eye,
  Stethoscope
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mediqoraLogo from '../../assets/mediqora.png';
import PaymentHistory from './PaymentHistory';

const SaasControl = () => {
  const { user, selectClient } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard');

  useEffect(() => {
    if (tabParam && ['dashboard', 'hospitals', 'clinics', 'settings', 'payments'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [featuresModalClient, setFeaturesModalClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editTab, setEditTab] = useState('details');

  // Platform Settings State
  const [settingsForm, setSettingsForm] = useState({
    defaultMonthlyFee: '12000',
    defaultTrialDays: '4',
    defaultPlan: '3 Months Plan (Without Email Follow-up)',
    globalPauseMessage: 'Hospital SaaS subscription is currently paused. Please contact Mediqoro Super Admin to renew monthly subscription.',
    supportPhone: '+91 73735 09585',
    supportEmail: 'info@mediqora.in',
    autoRenewReminders: true
  });

  // Pricing Table State
  const [pricingRates, setPricingRates] = useState({
    p3m_noemail: '12000',
    p3m_wemail: '14000',
    p6m_noemail: '20000',
    p6m_wemail: '22000',
    p12m_noemail: '38000',
    p12m_wemail: '42000',
    whatsapp: '4000',
    sms: '3000'
  });

  // Client Form State
  const [clientForm, setClientForm] = useState({
    hospitalName: '',
    contactPerson: '',
    email: '',
    phone: '',
    planName: '3 Months Plan (Without Email Follow-up)',
    monthlyFee: '12000',
    status: 'active',
    nextBillingDate: '2026-09-07',
    pauseReason: 'Hospital SaaS subscription is currently paused. Please contact Mediqoro Super Admin to renew monthly subscription.'
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const [resC, resS] = await Promise.all([
        API.get('/saas/clients'),
        API.get('/saas/status')
      ]);
      if (resC.data.success) {
        setClients(resC.data.clients);
      }
      if (resS.data.success) {
        if (resS.data.pricingRates) {
          setPricingRates(resS.data.pricingRates);
        }
        setSettingsForm({
          defaultMonthlyFee: resS.data.defaultMonthlyFee || resS.data.monthlyFee || '1999',
          defaultTrialDays: String(resS.data.defaultTrialDays || resS.data.trialDays || '4'),
          defaultPlan: resS.data.defaultPlan || resS.data.plan || '3 Months Plan (Without Email Follow-up)',
          globalPauseMessage: resS.data.globalPauseMessage || resS.data.pauseReason || 'Hospital SaaS subscription is currently paused. Please contact Mediqoro Super Admin to renew monthly subscription.',
          supportPhone: resS.data.supportPhone || '+91 73735 09585',
          supportEmail: resS.data.supportEmail || 'info@mediqora.in',
          autoRenewReminders: resS.data.autoRenewReminders !== undefined ? resS.data.autoRenewReminders : true
        });
      }
    } catch (err) {
      toast.error('Failed to load Mediqoro hospital clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openAddClientModal = () => {
    setClientForm({
      hospitalName: '',
      contactPerson: '',
      email: '',
      phone: '',
      planName: '3 Months Plan (With Email Follow-up)',
      monthlyFee: '2499',
      status: 'active',
      nextBillingDate: '2026-09-07',
      pauseReason: 'Hospital SaaS subscription is currently paused. Please contact Mediqoro Super Admin to renew monthly subscription.'
    });
    setShowAddModal(true);
  };

  const openEditClientModal = (c) => {
    setSelectedClient(c);
    if (c.pricing_rates) {
      try {
        const parsedRates = typeof c.pricing_rates === 'string' ? JSON.parse(c.pricing_rates) : c.pricing_rates;
        if (parsedRates && typeof parsedRates === 'object') {
          setPricingRates(prev => ({ ...prev, ...parsedRates }));
        }
      } catch (e) {}
    }
    setClientForm({
      hospitalName: c.hospital_name,
      contactPerson: c.contact_person || '',
      email: c.email || '',
      phone: c.phone || '',
      planName: c.plan_name || '3 Months Plan (With Email Follow-up)',
      monthlyFee: c.monthly_fee || '2499',
      status: c.status || 'active',
      nextBillingDate: c.next_billing_date ? c.next_billing_date.split('T')[0] : '2026-09-07',
      pauseReason: c.pause_reason || 'Hospital SaaS subscription is currently paused. Please contact Mediqoro Super Admin.',
      brevoApiKey: c.brevo_api_key || '',
      brevoSenderEmail: c.brevo_sender_email || 'no-reply@shreeramhomeo.com',
      brevoSenderName: c.brevo_sender_name || 'Shree Ram Homeo Hospital',
      whatsappApiKey: c.whatsapp_api_key || '',
      whatsappPhoneNumberId: c.whatsapp_phone_number_id || '',
      smsApiKey: c.sms_api_key || '',
      smsSenderId: c.sms_sender_id || '',
      feedbackUrl: c.feedback_url || 'https://shreeramhomeo.com/feedback'
    });
    setEditTab('details');
    setShowEditModal(true);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post('/saas/clients', { ...clientForm, pricingRates });
      if (res.data.success) {
        toast.success(`Hospital Client "${clientForm.hospitalName}" added to Mediqoro!`);
        setShowAddModal(false);
        fetchClients();
      }
    } catch (err) {
      toast.error('Failed to add new hospital client');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSaving(true);
    try {
      const res = await API.put(`/saas/clients/${selectedClient.id}`, { ...clientForm, pricingRates });
      if (res.data.success) {
        toast.success(`Client "${clientForm.hospitalName}" rates & details updated successfully!`);
        setShowEditModal(false);
        fetchClients();
      }
    } catch (err) {
      toast.error('Failed to update client details');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleClientStatus = async (client, newStatus) => {
    try {
      const res = await API.put(`/saas/clients/${client.id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(
          newStatus === 'paused'
            ? `🛑 Access PAUSED for "${client.hospital_name}". Doctor access is suspended!`
            : `🟢 Access ACTIVATED for "${client.hospital_name}". Doctor can log in.`
        );
        fetchClients();
      }
    } catch (err) {
      toast.error('Failed to update client access status');
    }
  };

  const handleRenewClient = async (client) => {
    try {
      const res = await API.post(`/saas/clients/${client.id}/renew`);
      if (res.data.success) {
        toast.success(`⚡ Subscription renewed for "${client.hospital_name}" (+30 Days)! Status is ACTIVE.`);
        fetchClients();
      }
    } catch (err) {
      toast.error('Failed to renew client subscription');
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Are you sure you want to remove "${client.hospital_name}" from Mediqoro platform?`)) return;
    try {
      const res = await API.delete(`/saas/clients/${client.id}`);
      if (res.data.success) {
        toast.success('Hospital client removed');
        fetchClients();
      }
    } catch (err) {
      toast.error('Failed to delete client record');
    }
  };

  const handleSaveSaasSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/saas/status', {
        defaultMonthlyFee: settingsForm.defaultMonthlyFee,
        defaultTrialDays: settingsForm.defaultTrialDays,
        defaultPlan: settingsForm.defaultPlan,
        globalPauseMessage: settingsForm.globalPauseMessage,
        supportPhone: settingsForm.supportPhone,
        supportEmail: settingsForm.supportEmail,
        autoRenewReminders: settingsForm.autoRenewReminders,
        pricingRates,
        monthlyFee: settingsForm.defaultMonthlyFee,
        plan: settingsForm.defaultPlan,
        pauseReason: settingsForm.globalPauseMessage
      });
      if (res.data.success) {
        localStorage.setItem('saasSettings', JSON.stringify({ settingsForm, pricingRates }));
        toast.success('Mediqoro SaaS Settings & Pricing Table updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save SaaS settings');
    } finally {
      setSaving(false);
    }
  };

  // Metrics calculation
  const totalHospitals = clients.length;
  const activeHospitals = clients.filter(c => c.status === 'active').length;
  const trialHospitals = clients.filter(c => c.status === 'trial').length;
  const expiredHospitals = clients.filter(c => c.status === 'paused' || c.status === 'expired').length;
  const totalDoctors = totalHospitals * 2 + 1; // Estimated active onboarded doctors
  const totalPatients = totalHospitals * 145 + 320; // Estimated total registered patients across clinics
  const totalRevenue = clients.reduce((acc, c) => acc + (parseInt(c.monthly_fee) || 2999), 0);

  const filteredClients = clients.filter(c =>
    c.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.client_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <Lock className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-lg font-extrabold text-slate-900">Mediqoro Access Denied</h2>
        <p className="text-xs text-slate-600">The Mediqoro SaaS Controller is restricted exclusively to Master Platform Super Administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Mediqoro Brand Header Banner */}
      <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#16a34a]"></div>
        <div className="pl-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#15803d] uppercase tracking-widest flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-[#16a34a]" /> MEDIQORO SAAS PLATFORM
            </span>
            <span className="bg-green-100 text-[#15803d] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-[#BBF7D0]">
              Master Super Admin Platform Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 flex items-center gap-2.5 text-slate-900">
            <img src={mediqoraLogo} alt="Mediqora Logo" className="h-9 w-auto object-contain" />
            <span>Mediqora SaaS Controller</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium max-w-2xl">
            Overarching multi-hospital platform management. Monitor metrics, control active/trial licenses, manage hospital clients, and configure SaaS platform settings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAddClientModal}
            className="inline-flex items-center gap-2 font-black px-5 py-3 rounded-2xl text-xs bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-green-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" /> Register Hospital
          </button>
          <button
            onClick={fetchClients}
            className="p-3 bg-green-50 text-[#15803d] border border-[#BBF7D0] rounded-2xl hover:bg-green-100 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MEDIQORO 4-TAB NAVIGATION BAR */}
      <div className="flex items-center gap-2 border-b border-[#BBF7D0] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => changeTab('dashboard')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#16a34a] text-white shadow-md shadow-green-500/20'
              : 'bg-white text-slate-700 hover:bg-green-50 border border-[#BBF7D0]'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-[#16a34a]'}`} />
          <span>SaaS Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => changeTab('hospitals')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'hospitals'
              ? 'bg-[#16a34a] text-white shadow-md shadow-green-500/20'
              : 'bg-white text-slate-700 hover:bg-green-50 border border-[#BBF7D0]'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === 'hospitals' ? 'text-white' : 'text-[#16a34a]'}`} />
          <span>Clinic Saas Setting ({clients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => changeTab('clinics')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'clinics'
              ? 'bg-[#16a34a] text-white shadow-md shadow-green-500/20'
              : 'bg-white text-slate-700 hover:bg-green-50 border border-[#BBF7D0]'
          }`}
        >
          <Stethoscope className={`w-4 h-4 ${activeTab === 'clinics' ? 'text-white' : 'text-[#16a34a]'}`} />
          <span>Clinic Desks ({clients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => changeTab('settings')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#16a34a] text-white shadow-md shadow-green-500/20'
              : 'bg-white text-slate-700 hover:bg-green-50 border border-[#BBF7D0]'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-[#16a34a]'}`} />
          <span>SaaS Settings</span>
        </button>

        <button
          type="button"
          onClick={() => changeTab('payments')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-[#16a34a] text-white shadow-md shadow-green-500/20'
              : 'bg-white text-slate-700 hover:bg-green-50 border border-[#BBF7D0]'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${activeTab === 'payments' ? 'text-white' : 'text-[#16a34a]'}`} />
          <span>Payment History</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE SAAS DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* TOP STATS GRID matching user specification */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* 1. Total Hospitals */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Hospitals</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{totalHospitals}</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5 text-[#16a34a]" />
              </div>
            </div>

            {/* 2. Active Hospitals */}
            <div className="bg-white p-5 rounded-3xl border border-[#BBF7D0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Hospitals</span>
                <span className="text-2xl font-black text-[#16a34a] mt-1 block">{activeHospitals}</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-green-100/70 text-[#16a34a] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
              </div>
            </div>

            {/* 3. Trial Hospitals */}
            <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Trial Hospitals</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">{trialHospitals}</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>

            {/* 4. Expired Hospitals */}
            <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Expired Hospitals</span>
                <span className="text-2xl font-black text-rose-600 mt-1 block">{expiredHospitals}</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
            </div>

            {/* 5. Total Doctors */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Doctors</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{totalDoctors}</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5 text-teal-600" />
              </div>
            </div>

            {/* 6. Total Patients */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Patients</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{totalPatients}</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-[#16a34a]" />
              </div>
            </div>

            {/* 7. Revenue */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl border border-[#16a34a]/30 shadow-sm flex items-center justify-between col-span-2">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Monthly Platform Revenue</span>
                <span className="text-2xl font-black text-white mt-1 block">₹{totalRevenue.toLocaleString()} / mo</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#16a34a]/20 text-emerald-400 flex items-center justify-center font-bold border border-[#16a34a]/30">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

          </div>

          {/* 8. RECENT ACTIVITIES FEED & PLATFORM OVERVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Activities List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#16a34a]" /> Live Platform Recent Activities
                </h2>
                <span className="text-[10px] font-extrabold text-[#16a34a] bg-green-50 px-2.5 py-0.5 rounded-full">
                  Real-time Feed
                </span>
              </div>

              <div className="space-y-3">
                {clients && clients.length > 0 ? (
                  clients.map((c, idx) => (
                    <div key={c.id || idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        c.status === 'active' 
                          ? 'bg-green-100 text-[#16a34a]' 
                          : c.status === 'paused' 
                          ? 'bg-rose-100 text-rose-600' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.status === 'active' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                        ) : c.status === 'paused' ? (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-slate-900">{c.hospital_name} ({c.client_id})</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {c.plan_name || 'Hospital Subscription'} • Contact: {c.contact_person || 'Administrator'} • Status: <strong className="capitalize">{c.status}</strong>
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Live</span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No hospital activities yet. Registered clients will appear here.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action & Health Summary */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" /> Platform Quick Launch
              </h3>
              <p className="text-xs text-slate-300 font-medium">Select a hospital client below to jump directly into its operational desk.</p>

              <div className="space-y-2 pt-2">
                {clients.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      selectClient(c);
                      toast.success(`Entered ${c.hospital_name}`);
                      navigate('/admin/appointments');
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-800 hover:bg-[#16a34a] text-white font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer border border-slate-700 hover:border-[#16a34a]"
                  >
                    <span className="truncate pr-2">{c.hospital_name}</span>
                    <span className="text-[10px] bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-md font-mono shrink-0">Open →</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOSPITAL LIST (Shree Ram Homeo, ABC Multispeciality, XYZ Clinic) */}
      {/* ========================================================================= */}
      {activeTab === 'hospitals' && (
        <div className="space-y-4">
          
          {/* SEARCH BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#16a34a] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search registered hospital list by name, contact doctor, or client ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-xs font-medium text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* HOSPITAL DIRECTORY GRID */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#16a34a]" /> Hospital Directory
                </h2>
                <p className="text-xs text-slate-500 font-medium">List of all medical clinics & hospital clients managed on the Mediqoro platform.</p>
              </div>
              <span className="text-xs font-bold bg-green-50 text-[#16a34a] px-3 py-1 rounded-full border border-[#BBF7D0]">
                {filteredClients.length} Hospitals Registered
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[#16a34a] font-bold flex items-center justify-center gap-2 text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-[#16a34a]" /> Loading Mediqoro Hospital Directory...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-medium">No registered hospital clients match your search query.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase font-black tracking-wider text-slate-500">
                      <th className="py-3.5 px-4 whitespace-nowrap">Hospital Client Info</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Subscription Plan</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Custom Fee</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Expiry Date</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">License Status</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredClients.map((client) => {
                      const isPaused = client.status === 'paused';
                      const isTrial = client.status === 'trial';
                      return (
                        <tr
                          key={client.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isPaused ? 'bg-rose-50/40' : isTrial ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          {/* Hospital Name & ID */}
                          <td className="py-4 px-4 align-middle min-w-[280px]">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                                isPaused
                                  ? 'bg-rose-600 text-white'
                                  : isTrial
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-900 text-emerald-400'
                              }`}>
                                {client.hospital_name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tight">{client.hospital_name}</span>
                                  <span className="font-mono text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                                    {client.client_id}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span>{client.contact_person}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-[#16a34a] font-bold">{client.phone}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Subscription Plan */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className="font-bold text-slate-900 block text-xs">{client.plan_name || 'Standard Enterprise'}</span>
                            <span className="text-[10px] font-medium flex items-center gap-1 mt-0.5">
                              {client.plan_name?.includes('With Email') && !client.plan_name?.includes('Without Email') ? (
                                <>
                                  <Mail className="w-3 h-3 text-[#16a34a] inline-block" />
                                  <span className="text-[#16a34a] font-bold">Includes Email</span>
                                </>
                              ) : (
                                <>
                                  <Mail className="w-3 h-3 text-slate-400 inline-block" />
                                  <span className="text-slate-500 font-semibold">Without Email</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Price / Fee */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className="font-black text-[#16a34a] block text-sm">₹{client.monthly_fee || '2999'}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                              Last: {client.last_payment_date ? client.last_payment_date.split('T')[0] : 'N/A'}
                            </span>
                          </td>

                          {/* Expiry Date */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className="font-bold text-slate-800 block text-xs">
                              {client.next_billing_date ? client.next_billing_date.split('T')[0] : 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Renewal Date</span>
                          </td>

                          {/* License Status */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                              isPaused
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : isTrial
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-green-100 text-[#15803d] border-[#BBF7D0]'
                            }`}>
                              {isPaused ? (
                                <>
                                  <ShieldAlert className="w-3 h-3 text-rose-700" />
                                  <span>PAUSED</span>
                                </>
                              ) : isTrial ? (
                                <>
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  <span>TRIAL</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-[#15803d]" />
                                  <span>ACTIVE</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Action Controls */}
                          <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  selectClient(client);
                                  toast.success(`Entered Hospital Desk: ${client.hospital_name}`);
                                  navigate('/admin/appointments');
                                }}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-extrabold text-[11px] inline-flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                                title="Enter Hospital Portal"
                              >
                                <Eye className="w-4 h-4 text-emerald-400" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setFeaturesModalClient(client)}
                                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-extrabold text-[11px] inline-flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                                title="View Enabled Hospital Modules & Features"
                              >
                                <Sparkles className="w-4 h-4 text-purple-600" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditClientModal(client)}
                                className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-extrabold text-[11px] inline-flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                                title="Edit License Info & Fees"
                              >
                                <Edit className="w-4 h-4 text-slate-600" />
                              </button>

                              {isPaused ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleClientStatus(client, 'active')}
                                  className="px-3 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                                  title="Unpause Access"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Unpause
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleClientStatus(client, 'paused')}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                                  title="Pause Access"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-white" /> Pause
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteClient(client)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer inline-flex items-center justify-center transition-all"
                                title="Delete Client"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CLINIC DESKS & SIDEBAR SWITCHER */}
      {/* ========================================================================= */}
      {activeTab === 'clinics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0]">
                Hospital Clinic Switcher
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#16a34a]" /> Select Clinic to Open Portal & Sidebar
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Click any hospital clinic below to select it and immediately open its specialized doctor desk & sidebar features.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {clients.map((c) => {
              const isSelected = selectedClient?.id === c.id || selectedClient?.client_id === c.client_id;
              const isPaused = c.status === 'paused';
              const isTrial = c.status === 'trial';

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    selectClient(c);
                    toast.success(`Entered Clinic Desk: ${c.hospital_name}`);
                    navigate('/admin/appointments');
                  }}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 relative overflow-hidden group shadow-sm hover:shadow-lg ${
                    isSelected
                      ? 'bg-green-50/80 border-[#16a34a] ring-2 ring-[#16a34a]/30'
                      : 'bg-white border-slate-200 hover:border-[#BBF7D0] hover:bg-green-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-xs ${
                        isPaused ? 'bg-rose-600 text-white' : isTrial ? 'bg-amber-600 text-white' : 'bg-slate-900 text-emerald-400'
                      }`}>
                        {c.hospital_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#16a34a] transition-colors">
                          {c.hospital_name}
                        </h3>
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                          {c.client_id}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      isPaused ? 'bg-rose-100 text-rose-800 border-rose-300' : isTrial ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-green-100 text-[#15803d] border-[#BBF7D0]'
                    }`}>
                      {isPaused ? 'PAUSED' : isTrial ? 'TRIAL' : 'ACTIVE'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100 font-medium">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Doctor / Contact:</span>
                      <span className="font-bold text-slate-800">{c.contact_person || 'Dr. Selvakumar'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-bold text-[#16a34a]">{c.phone || '+91 95515 19766'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Subscription Plan:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[150px]">{c.plan_name || 'Enterprise'}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-[#16a34a] text-white shadow-md'
                        : 'bg-slate-900 text-emerald-400 group-hover:bg-[#16a34a] group-hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Clinic Desk Active ✓' : 'Open Clinic Desk & Sidebar →'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SAAS SETTINGS & GLOBAL CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#16a34a]" /> Mediqoro SaaS Platform Settings
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Configure platform global parameters, trial periods, default subscription fees, and support credentials.</p>
          </div>

          <form onSubmit={handleSaveSaasSettings} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-extrabold uppercase text-slate-700 mb-1">Default Monthly Subscription Fee (₹)</label>
                <input
                  type="text"
                  value={settingsForm.defaultMonthlyFee}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultMonthlyFee: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold uppercase text-slate-700 mb-1">Default Free Trial Duration (Days)</label>
                <input
                  type="number"
                  value={settingsForm.defaultTrialDays}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultTrialDays: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold uppercase text-slate-700 mb-1">Default Subscription Plan</label>
                <select
                  value={settingsForm.defaultPlan || '3 Months Plan (Without Email Follow-up)'}
                  onChange={(e) => {
                    const selectedPlan = e.target.value;
                    const feeMap = {
                      '3 Months Plan (Without Email Follow-up)': pricingRates.p3m_noemail || '1999',
                      '3 Months Plan (With Email Follow-up)': pricingRates.p3m_wemail || '2499',
                      '6 Months Plan (Without Email Follow-up)': pricingRates.p6m_noemail || '3499',
                      '6 Months Plan (With Email Follow-up)': pricingRates.p6m_wemail || '4499',
                      '12 Months Plan (Without Email Follow-up)': pricingRates.p12m_noemail || '5999',
                      '12 Months Plan (With Email Follow-up)': pricingRates.p12m_wemail || '7999',
                    };
                    const autoFee = feeMap[selectedPlan] || settingsForm.defaultMonthlyFee;
                    setSettingsForm({
                      ...settingsForm,
                      defaultPlan: selectedPlan,
                      defaultMonthlyFee: autoFee
                    });
                  }}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold bg-white"
                >
                  <option value="3 Months Plan (Without Email Follow-up)">3 Months Package (Without Follow-up)</option>
                  <option value="3 Months Plan (With Email Follow-up)">3 Months Package (With Email Follow-up)</option>
                  <option value="6 Months Plan (Without Email Follow-up)">6 Months Package (Without Follow-up)</option>
                  <option value="6 Months Plan (With Email Follow-up)">6 Months Package (With Email Follow-up)</option>
                  <option value="12 Months Plan (Without Email Follow-up)">12 Months Package (Without Follow-up)</option>
                  <option value="12 Months Plan (With Email Follow-up)">12 Months Package (With Email Follow-up)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Global Suspended License Notice (Shown to Blocked Doctors)</label>
              <textarea
                rows={3}
                value={settingsForm.globalPauseMessage}
                onChange={(e) => setSettingsForm({ ...settingsForm, globalPauseMessage: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-extrabold uppercase text-slate-700 mb-1">Mediqoro Support Phone</label>
                <input
                  type="text"
                  value={settingsForm.supportPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-extrabold uppercase text-slate-700 mb-1">Mediqoro Support Email</label>
                <input
                  type="email"
                  value={settingsForm.supportEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* CUSTOMIZABLE SUBSCRIPTION & ADD-ON RATES TABLE */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between pb-1">
                <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-[#15803d]">
                  CUSTOMIZABLE SUBSCRIPTION & ADD-ON RATES TABLE
                </h4>
                <span className="text-[10px] font-extrabold text-[#16a34a] bg-green-50 px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                  Fully Editable Rates
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950 text-white p-4 shadow-xl">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400">
                      <th className="pb-2.5 px-3">Plan Duration</th>
                      <th className="pb-2.5 px-3">Email Variant</th>
                      <th className="pb-2.5 px-3 text-right">Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-medium">
                    <tr className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">3 Months Plan</td>
                      <td className="py-3 px-3 text-slate-400">Without Email Follow-up</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-slate-400">₹ </span>
                        <input
                          type="text"
                          value={pricingRates.p3m_noemail}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newRates = { ...pricingRates, p3m_noemail: val };
                            setPricingRates(newRates);
                            if (settingsForm.defaultPlan === '3 Months Plan (Without Email Follow-up)') {
                              setSettingsForm(prev => ({ ...prev, defaultMonthlyFee: val }));
                            }
                          }}
                          className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">3 Months Plan</td>
                      <td className="py-3 px-3 text-slate-400">With Email Follow-up</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-slate-400">₹ </span>
                        <input
                          type="text"
                          value={pricingRates.p3m_wemail}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newRates = { ...pricingRates, p3m_wemail: val };
                            setPricingRates(newRates);
                            if (settingsForm.defaultPlan === '3 Months Plan (With Email Follow-up)') {
                              setSettingsForm(prev => ({ ...prev, defaultMonthlyFee: val }));
                            }
                          }}
                          className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">6 Months Plan</td>
                      <td className="py-3 px-3 text-slate-400">Without Email Follow-up</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-slate-400">₹ </span>
                        <input
                          type="text"
                          value={pricingRates.p6m_noemail}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newRates = { ...pricingRates, p6m_noemail: val };
                            setPricingRates(newRates);
                            if (settingsForm.defaultPlan === '6 Months Plan (Without Email Follow-up)') {
                              setSettingsForm(prev => ({ ...prev, defaultMonthlyFee: val }));
                            }
                          }}
                          className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">6 Months Plan</td>
                      <td className="py-3 px-3 text-slate-400">With Email Follow-up</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-slate-400">₹ </span>
                        <input
                          type="text"
                          value={pricingRates.p6m_wemail}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newRates = { ...pricingRates, p6m_wemail: val };
                            setPricingRates(newRates);
                            if (settingsForm.defaultPlan === '6 Months Plan (With Email Follow-up)') {
                              setSettingsForm(prev => ({ ...prev, defaultMonthlyFee: val }));
                            }
                          }}
                          className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">12 Months (1 Year)</td>
                      <td className="py-3 px-3 text-slate-400">Without Email Follow-up</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-slate-400">₹ </span>
                        <input
                          type="text"
                          value={pricingRates.p12m_noemail}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newRates = { ...pricingRates, p12m_noemail: val };
                            setPricingRates(newRates);
                            if (settingsForm.defaultPlan === '12 Months Plan (Without Email Follow-up)') {
                              setSettingsForm(prev => ({ ...prev, defaultMonthlyFee: val }));
                            }
                          }}
                          className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">12 Months (1 Year)</td>
                      <td className="py-3 px-3 text-slate-400">With Email Follow-up</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-slate-400">₹ </span>
                        <input
                          type="text"
                          value={pricingRates.p12m_wemail}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newRates = { ...pricingRates, p12m_wemail: val };
                            setPricingRates(newRates);
                            if (settingsForm.defaultPlan === '12 Months Plan (With Email Follow-up)') {
                              setSettingsForm(prev => ({ ...prev, defaultMonthlyFee: val }));
                            }
                          }}
                          className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#16a34a] flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#16a34a]" /> WhatsApp Add-on
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">Instant WhatsApp Reminders</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-[#16a34a] font-bold">+₹ </span>
                        <input
                          type="text"
                          value={pricingRates.whatsapp}
                          onChange={(e) => setPricingRates({ ...pricingRates, whatsapp: e.target.value })}
                          className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-amber-400" /> SMS Add-on
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-bold">Mobile Text SMS Alerts</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-amber-400 font-bold">+₹ </span>
                        <input
                          type="text"
                          value={pricingRates.sms}
                          onChange={(e) => setPricingRates({ ...pricingRates, sms: e.target.value })}
                          className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-green-50/80 border border-[#BBF7D0] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
                <span className="text-slate-700 font-medium">
                  Selected Plan: <strong className="text-slate-900 font-extrabold">{settingsForm.defaultPlan}</strong>
                </span>
                <span className="font-extrabold text-[#16a34a]">
                  Assigned Fee: <strong className="text-sm font-black">₹{settingsForm.defaultMonthlyFee}</strong>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-green-500/20 cursor-pointer flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-white" />}
                <span>{saving ? 'Saving Settings...' : 'Save SaaS Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SAAS PAYMENT HISTORY AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <PaymentHistory />
      )}

      {/* ADD NEW HOSPITAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 my-8">
            <h3 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Register New Hospital (Mediqoro)</span>
              <span className="text-[10px] bg-slate-900 text-emerald-400 px-2.5 py-0.5 rounded-full uppercase font-black">Mediqoro SaaS</span>
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Hospital / Clinic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Multispeciality Hospital"
                  value={clientForm.hospitalName}
                  onChange={(e) => setClientForm({ ...clientForm, hospitalName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Doctor / Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Name"
                    value={clientForm.contactPerson}
                    onChange={(e) => setClientForm({ ...clientForm, contactPerson: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="doctor@hospital.com"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Subscription Plan & Duration *</label>
                <select
                  value={clientForm.planName}
                  onChange={(e) => {
                    const selectedPlan = e.target.value;
                    const isTrial = selectedPlan.includes('4-Day') || selectedPlan.includes('Trial');
                    const d = new Date();
                    if (isTrial) {
                      d.setDate(d.getDate() + 4);
                    } else if (selectedPlan.includes('3 Month')) {
                      d.setDate(d.getDate() + 90);
                    } else if (selectedPlan.includes('6 Month')) {
                      d.setDate(d.getDate() + 180);
                    } else if (selectedPlan.includes('12 Month')) {
                      d.setDate(d.getDate() + 365);
                    } else {
                      d.setDate(d.getDate() + 30);
                    }
                    const newDate = d.toISOString().split('T')[0];
                    setClientForm({
                      ...clientForm,
                      planName: selectedPlan,
                      status: isTrial ? 'trial' : 'active',
                      nextBillingDate: newDate
                    });
                  }}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold bg-white"
                >
                  <option value="3 Months Plan (Without Email Follow-up)">3 Months Plan (Without Email Follow-up)</option>
                  <option value="3 Months Plan (With Email Follow-up)">3 Months Plan (With Email Follow-up)</option>
                  <option value="6 Months Plan (Without Email Follow-up)">6 Months Plan (Without Email Follow-up)</option>
                  <option value="6 Months Plan (With Email Follow-up)">6 Months Plan (With Email Follow-up)</option>
                  <option value="12 Months Plan (Without Email Follow-up)">12 Months Plan (Without Email Follow-up)</option>
                  <option value="12 Months Plan (With Email Follow-up)">12 Months Plan (With Email Follow-up)</option>
                  <option value="4-Day Free Trial">4-Day Free Trial Period</option>
                  <option value="Custom Enterprise Plan">Custom Enterprise Plan</option>
                </select>
              </div>

              {/* Add-on Channels */}
              <div className="p-3.5 bg-green-50/60 border border-[#BBF7D0] rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-[#15803d] tracking-wider block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Add-on Channels (Additional Charges Apply)</span>
                </span>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-800">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clientForm.pauseReason.includes('WhatsApp Integration')}
                      onChange={(e) => {
                        let current = clientForm.pauseReason;
                        if (e.target.checked) {
                          current += ' [Add-on: WhatsApp Integration Active]';
                        } else {
                          current = current.replace(' [Add-on: WhatsApp Integration Active]', '');
                        }
                        setClientForm({ ...clientForm, pauseReason: current });
                      }}
                      className="rounded text-[#16a34a] focus:ring-green-500"
                    />
                    <span>WhatsApp Patient Reminders (+ Add-on Fee)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clientForm.pauseReason.includes('SMS Integration')}
                      onChange={(e) => {
                        let current = clientForm.pauseReason;
                        if (e.target.checked) {
                          current += ' [Add-on: SMS Integration Active]';
                        } else {
                          current = current.replace(' [Add-on: SMS Integration Active]', '');
                        }
                        setClientForm({ ...clientForm, pauseReason: current });
                      }}
                      className="rounded text-[#16a34a] focus:ring-green-500"
                    />
                    <span>SMS Message Reminders (+ Add-on Fee)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Custom Subscription Fee (₹)</label>
                  <input
                    type="text"
                    required
                    placeholder="2999"
                    value={clientForm.monthlyFee}
                    onChange={(e) => setClientForm({ ...clientForm, monthlyFee: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-extrabold text-[#16a34a]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Next Billing Date</label>
                  <input
                    type="date"
                    required
                    value={clientForm.nextBillingDate}
                    onChange={(e) => setClientForm({ ...clientForm, nextBillingDate: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-extrabold bg-[#16a34a] text-white shadow-md hover:bg-[#16a34a] cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" />}
                  <span>Register Hospital</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HOSPITAL MODAL */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 my-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit License: {selectedClient.hospital_name}</h3>
                <p className="text-xs text-slate-500 font-medium">Manage hospital info, custom pricing rates, and multi-tenant API keys</p>
              </div>
              <span className="text-[10px] bg-slate-900 text-emerald-400 px-3 py-1 rounded-full uppercase font-black tracking-wider">
                {selectedClient.client_id}
              </span>
            </div>

            {/* TAB TOGGLE NAVIGATION */}
            <div className="flex border border-slate-200 bg-slate-100 p-1.5 rounded-2xl gap-1.5">
              <button
                type="button"
                onClick={() => setEditTab('details')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  editTab === 'details'
                    ? 'bg-white text-slate-900 shadow-md border border-[#BBF7D0]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#16a34a]" />
                <span>1. Hospital & License Info</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab('pricing')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  editTab === 'pricing'
                    ? 'bg-white text-slate-900 shadow-md border border-[#BBF7D0]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <DollarSign className="w-4 h-4 text-[#16a34a]" />
                <span>2. Custom Plan Pricing</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab('api')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  editTab === 'api'
                    ? 'bg-white text-slate-900 shadow-md border border-[#BBF7D0]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Settings className="w-4 h-4 text-[#16a34a]" />
                <span>3. Brevo & API Gateway Keys</span>
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-5 text-xs">
              
              {/* TAB 1: HOSPITAL DETAILS & LICENSE CONTROL */}
              {editTab === 'details' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-[#15803d]">
                      Hospital & Contact Information
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500">Step 1 of 3</span>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Hospital / Clinic Name *</label>
                    <input
                      type="text"
                      required
                      value={clientForm.hospitalName}
                      onChange={(e) => setClientForm({ ...clientForm, hospitalName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">Doctor / Contact Person</label>
                      <input
                        type="text"
                        required
                        value={clientForm.contactPerson}
                        onChange={(e) => setClientForm({ ...clientForm, contactPerson: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Active Subscription Plan & Duration *</label>
                    <select
                      value={clientForm.planName}
                      onChange={(e) => {
                        const selectedPlan = e.target.value;
                        let fee = '2499';
                        if (selectedPlan.includes('3 Months Plan (Without Email')) fee = pricingRates.p3m_noemail;
                        else if (selectedPlan.includes('3 Months Plan (With Email')) fee = pricingRates.p3m_wemail;
                        else if (selectedPlan.includes('6 Months Plan (Without Email')) fee = pricingRates.p6m_noemail;
                        else if (selectedPlan.includes('6 Months Plan (With Email')) fee = pricingRates.p6m_wemail;
                        else if (selectedPlan.includes('12 Months Plan (Without Email')) fee = pricingRates.p12m_noemail;
                        else if (selectedPlan.includes('12 Months Plan (With Email')) fee = pricingRates.p12m_wemail;
                        else if (selectedPlan.includes('4-Day')) fee = '0';

                        const isTrial = selectedPlan.includes('4-Day') || selectedPlan.includes('Trial');
                        const d = new Date();
                        if (isTrial) d.setDate(d.getDate() + 4);
                        else if (selectedPlan.includes('3 Month')) d.setDate(d.getDate() + 90);
                        else if (selectedPlan.includes('6 Month')) d.setDate(d.getDate() + 180);
                        else if (selectedPlan.includes('12 Month')) d.setDate(d.getDate() + 365);
                        else d.setDate(d.getDate() + 30);

                        const newDate = d.toISOString().split('T')[0];
                        setClientForm({
                          ...clientForm,
                          planName: selectedPlan,
                          monthlyFee: fee,
                          status: isTrial ? 'trial' : 'active',
                          nextBillingDate: newDate
                        });
                      }}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold bg-white"
                    >
                      <option value="3 Months Plan (Without Email Follow-up)">3 Months Plan (Without Email Follow-up)</option>
                      <option value="3 Months Plan (With Email Follow-up)">3 Months Plan (With Email Follow-up)</option>
                      <option value="6 Months Plan (Without Email Follow-up)">6 Months Plan (Without Email Follow-up)</option>
                      <option value="6 Months Plan (With Email Follow-up)">6 Months Plan (With Email Follow-up)</option>
                      <option value="12 Months Plan (Without Email Follow-up)">12 Months Plan (Without Email Follow-up)</option>
                      <option value="12 Months Plan (With Email Follow-up)">12 Months Plan (With Email Follow-up)</option>
                      <option value="4-Day Free Trial">4-Day Free Trial Period</option>
                      <option value="Custom Enterprise Plan">Custom Enterprise Plan</option>
                    </select>
                  </div>

                  {/* Add-on Channels */}
                  <div className="p-3.5 bg-green-50/60 border border-[#BBF7D0] rounded-2xl space-y-2">
                    <span className="text-[10px] font-black uppercase text-[#15803d] tracking-wider block flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#16a34a]" />
                      <span>Add-on Messaging Channels</span>
                    </span>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clientForm.pauseReason.includes('WhatsApp Integration')}
                          onChange={(e) => {
                            let current = clientForm.pauseReason;
                            if (e.target.checked) {
                              current += ' [Add-on: WhatsApp Integration Active]';
                            } else {
                              current = current.replace(' [Add-on: WhatsApp Integration Active]', '');
                            }
                            setClientForm({ ...clientForm, pauseReason: current });
                          }}
                          className="rounded text-[#16a34a] focus:ring-green-500"
                        />
                        <span>WhatsApp Patient Reminders (+ Add-on Fee)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clientForm.pauseReason.includes('SMS Integration')}
                          onChange={(e) => {
                            let current = clientForm.pauseReason;
                            if (e.target.checked) {
                              current += ' [Add-on: SMS Integration Active]';
                            } else {
                              current = current.replace(' [Add-on: SMS Integration Active]', '');
                            }
                            setClientForm({ ...clientForm, pauseReason: current });
                          }}
                          className="rounded text-[#16a34a] focus:ring-green-500"
                        />
                        <span>SMS Message Reminders (+ Add-on Fee)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Custom Notice (Shown when Paused)</label>
                    <input
                      type="text"
                      value={clientForm.pauseReason}
                      onChange={(e) => setClientForm({ ...clientForm, pauseReason: e.target.value })}
                      placeholder="Subscription currently paused..."
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM PRICING RATES TABLE */}
              {editTab === 'pricing' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-[#15803d]">
                      Customizable Subscription & Add-on Rates Table
                    </h4>
                    <span className="text-[10px] font-extrabold text-[#16a34a] bg-green-50 px-2 py-0.5 rounded border border-[#BBF7D0]">
                      Fully Editable Rates
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950 text-white p-4 shadow-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400">
                          <th className="pb-2.5 px-3">Plan Duration</th>
                          <th className="pb-2.5 px-3">Email Variant</th>
                          <th className="pb-2.5 px-3 text-right">Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 font-medium">
                        <tr
                          onClick={() => setClientForm(prev => ({ ...prev, planName: '3 Months Plan (Without Email Follow-up)', monthlyFee: pricingRates.p3m_noemail }))}
                          className={`transition-colors cursor-pointer ${clientForm.planName.includes('3 Months Plan (Without Email') ? 'bg-emerald-950/50 text-white font-extrabold border-l-4 border-l-emerald-500' : 'hover:bg-slate-900/80'}`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-200">3 Months Plan</td>
                          <td className="py-3 px-3 text-slate-400">Without Email Follow-up</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400">₹ </span>
                            <input
                              type="text"
                              value={pricingRates.p3m_noemail}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPricingRates(prev => ({ ...prev, p3m_noemail: val }));
                                setClientForm(prev => {
                                  if (prev.planName.includes('3 Months Plan (Without Email')) {
                                    return { ...prev, monthlyFee: val };
                                  }
                                  return prev;
                                });
                              }}
                              className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                            />
                          </td>
                        </tr>
                        <tr
                          onClick={() => setClientForm(prev => ({ ...prev, planName: '3 Months Plan (With Email Follow-up)', monthlyFee: pricingRates.p3m_wemail }))}
                          className={`transition-colors cursor-pointer ${clientForm.planName.includes('3 Months Plan (With Email') ? 'bg-emerald-950/50 text-white font-extrabold border-l-4 border-l-emerald-500' : 'hover:bg-slate-900/80'}`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-200">3 Months Plan</td>
                          <td className="py-3 px-3 text-slate-400">With Email Follow-up</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400">₹ </span>
                            <input
                              type="text"
                              value={pricingRates.p3m_wemail}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPricingRates(prev => ({ ...prev, p3m_wemail: val }));
                                setClientForm(prev => {
                                  if (prev.planName.includes('3 Months Plan (With Email')) {
                                    return { ...prev, monthlyFee: val };
                                  }
                                  return prev;
                                });
                              }}
                              className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                            />
                          </td>
                        </tr>
                        <tr
                          onClick={() => setClientForm(prev => ({ ...prev, planName: '6 Months Plan (Without Email Follow-up)', monthlyFee: pricingRates.p6m_noemail }))}
                          className={`transition-colors cursor-pointer ${clientForm.planName.includes('6 Months Plan (Without Email') ? 'bg-emerald-950/50 text-white font-extrabold border-l-4 border-l-emerald-500' : 'hover:bg-slate-900/80'}`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-200">6 Months Plan</td>
                          <td className="py-3 px-3 text-slate-400">Without Email Follow-up</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400">₹ </span>
                            <input
                              type="text"
                              value={pricingRates.p6m_noemail}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPricingRates(prev => ({ ...prev, p6m_noemail: val }));
                                setClientForm(prev => {
                                  if (prev.planName.includes('6 Months Plan (Without Email')) {
                                    return { ...prev, monthlyFee: val };
                                  }
                                  return prev;
                                });
                              }}
                              className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                            />
                          </td>
                        </tr>
                        <tr
                          onClick={() => setClientForm(prev => ({ ...prev, planName: '6 Months Plan (With Email Follow-up)', monthlyFee: pricingRates.p6m_wemail }))}
                          className={`transition-colors cursor-pointer ${clientForm.planName.includes('6 Months Plan (With Email') ? 'bg-emerald-950/50 text-white font-extrabold border-l-4 border-l-emerald-500' : 'hover:bg-slate-900/80'}`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-200">6 Months Plan</td>
                          <td className="py-3 px-3 text-slate-400">With Email Follow-up</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400">₹ </span>
                            <input
                              type="text"
                              value={pricingRates.p6m_wemail}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPricingRates(prev => ({ ...prev, p6m_wemail: val }));
                                setClientForm(prev => {
                                  if (prev.planName.includes('6 Months Plan (With Email')) {
                                    return { ...prev, monthlyFee: val };
                                  }
                                  return prev;
                                });
                              }}
                              className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                            />
                          </td>
                        </tr>
                        <tr
                          onClick={() => setClientForm(prev => ({ ...prev, planName: '12 Months Plan (Without Email Follow-up)', monthlyFee: pricingRates.p12m_noemail }))}
                          className={`transition-colors cursor-pointer ${clientForm.planName.includes('12 Months Plan (Without Email') ? 'bg-emerald-950/50 text-white font-extrabold border-l-4 border-l-emerald-500' : 'hover:bg-slate-900/80'}`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-200">12 Months (1 Year)</td>
                          <td className="py-3 px-3 text-slate-400">Without Email Follow-up</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400">₹ </span>
                            <input
                              type="text"
                              value={pricingRates.p12m_noemail}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPricingRates(prev => ({ ...prev, p12m_noemail: val }));
                                setClientForm(prev => {
                                  if (prev.planName.includes('12 Months Plan (Without Email')) {
                                    return { ...prev, monthlyFee: val };
                                  }
                                  return prev;
                                });
                              }}
                              className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                            />
                          </td>
                        </tr>
                        <tr
                          onClick={() => setClientForm(prev => ({ ...prev, planName: '12 Months Plan (With Email Follow-up)', monthlyFee: pricingRates.p12m_wemail }))}
                          className={`transition-colors cursor-pointer ${clientForm.planName.includes('12 Months Plan (With Email') ? 'bg-emerald-950/50 text-white font-extrabold border-l-4 border-l-emerald-500' : 'hover:bg-slate-900/80'}`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-200">12 Months (1 Year)</td>
                          <td className="py-3 px-3 text-slate-400">With Email Follow-up</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400">₹ </span>
                            <input
                              type="text"
                              value={pricingRates.p12m_wemail}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPricingRates(prev => ({ ...prev, p12m_wemail: val }));
                                setClientForm(prev => {
                                  if (prev.planName.includes('12 Months Plan (With Email')) {
                                    return { ...prev, monthlyFee: val };
                                  }
                                  return prev;
                                });
                              }}
                              className="w-24 bg-slate-900 border-b border-slate-700 focus:border-[#BBF7D0] text-white font-extrabold text-right px-2 py-1 rounded"
                            />
                          </td>
                        </tr>
                        <tr className="bg-slate-900/40">
                          <td className="py-3 px-3 font-bold text-emerald-400 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp Add-on</span>
                          </td>
                          <td className="py-3 px-3 text-emerald-300/80">Instant WhatsApp Reminders</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-emerald-400 font-bold">+₹ </span>
                            <input
                              type="text"
                              value={pricingRates.whatsapp}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setPricingRates(prev => ({ ...prev, whatsapp: e.target.value }))}
                              className="w-24 bg-slate-900 border-b border-[#16a34a]/50 focus:border-[#BBF7D0] text-emerald-300 font-extrabold text-right px-2 py-1 rounded"
                            />
                          </td>
                        </tr>
                        <tr className="bg-slate-900/40">
                          <td className="py-3 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            <span>SMS Add-on</span>
                          </td>
                          <td className="py-3 px-3 text-amber-300/80">Mobile Text SMS Alerts</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-amber-400 font-bold">+₹ </span>
                            <input
                              type="text"
                              value={pricingRates.sms}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setPricingRates(prev => ({ ...prev, sms: e.target.value }))}
                              className="w-24 bg-slate-900 border-b border-amber-500/50 focus:border-amber-400 text-amber-300 font-extrabold text-right px-2 py-1 rounded"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-center justify-between font-medium">
                    <span>Selected Plan: <strong className="text-slate-900">{clientForm.planName}</strong></span>
                    <span>Assigned Fee: <strong className="text-[#16a34a] font-extrabold text-xs">₹{clientForm.monthlyFee}</strong></span>
                  </div>
                </div>
              )}

              {/* TAB 3: BREVO EMAIL, WHATSAPP & SMS GATEWAY CREDENTIALS */}
              {editTab === 'api' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-[#15803d]">
                      Multi-Tenant Brevo Email, WhatsApp & SMS Gateway Keys
                    </h4>
                    <span className="text-[10px] font-bold text-[#16a34a] bg-green-50 px-2 py-0.5 rounded border border-[#BBF7D0]">
                      5-Stage Automated Flow
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-4 shadow-xl border border-slate-800">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                          <Mail className="w-4 h-4 text-emerald-400" /> Brevo Transactional Email API (v3)
                        </span>
                        <span className="text-[10px] bg-[#16a34a]/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                          api.brevo.com/v3
                        </span>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Brevo API Key (xkeysib-...)</label>
                        <input
                          type="password"
                          value={clientForm.brevoApiKey || ''}
                          onChange={(e) => setClientForm({ ...clientForm, brevoApiKey: e.target.value })}
                          placeholder="xkeysib-..."
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-[#BBF7D0] font-mono text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Brevo Sender Name</label>
                          <input
                            type="text"
                            value={clientForm.brevoSenderName || ''}
                            onChange={(e) => setClientForm({ ...clientForm, brevoSenderName: e.target.value })}
                            placeholder="Shree Ram Homeo Hospital"
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-[#BBF7D0] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Brevo Sender Email</label>
                          <input
                            type="email"
                            value={clientForm.brevoSenderEmail || ''}
                            onChange={(e) => setClientForm({ ...clientForm, brevoSenderEmail: e.target.value })}
                            placeholder="no-reply@shreeramhomeo.com"
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-[#BBF7D0] text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Business API Key
                          </label>
                          <input
                            type="text"
                            value={clientForm.whatsappApiKey || ''}
                            onChange={(e) => setClientForm({ ...clientForm, whatsappApiKey: e.target.value })}
                            placeholder="EAAG..."
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-[#BBF7D0] text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> SMS Gateway API Key
                          </label>
                          <input
                            type="text"
                            value={clientForm.smsApiKey || ''}
                            onChange={(e) => setClientForm({ ...clientForm, smsApiKey: e.target.value })}
                            placeholder="sms-key-..."
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Patient Feedback Survey Link (Stage 5 Post-Consultation)
                        </label>
                        <input
                          type="url"
                          value={clientForm.feedbackUrl || ''}
                          onChange={(e) => setClientForm({ ...clientForm, feedbackUrl: e.target.value })}
                          placeholder="https://shreeramhomeo.com/feedback"
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-[#BBF7D0] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL FOOTER BUTTONS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  {editTab === 'details' && (
                    <button
                      type="button"
                      onClick={() => setEditTab('pricing')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Next: Custom Prices →
                    </button>
                  )}
                  {editTab === 'pricing' && (
                    <button
                      type="button"
                      onClick={() => setEditTab('api')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Next: API Keys →
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check className="w-4 h-4 text-white" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOSPITAL FEATURES & MODULE CAPABILITIES INSPECTION MODAL */}
      {featuresModalClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Mediqora SaaS Active HMS Features
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{featuresModalClient.hospital_name}</h2>
                <p className="text-xs text-slate-500 font-mono">Client ID: {featuresModalClient.client_id} • Plan: {featuresModalClient.plan_name || 'Professional Pro'}</p>
              </div>
              <button
                onClick={() => setFeaturesModalClient(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 font-bold cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* FEATURE MODULE CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-green-50/70 border border-green-200 space-y-1.5">
                <span className="font-extrabold text-[#14532d] flex items-center gap-1.5 text-xs">
                  <Stethoscope className="w-4 h-4 text-[#16a34a]" /> Multi-Doctor OPD Consoles
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Senior Doctor OPD Desks (Dr. K.K. Rajan #101, Dr. Anitha Rajan #102), live token queue, patient caller.
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-green-100 text-[#166534]">
                  <CheckCircle2 className="w-3 h-3 text-[#15803d]" /> Active & Operational
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                <span className="font-extrabold text-indigo-900 flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-indigo-600" /> E-Prescriptions & Case History
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Electronic Health Records (EHR), clinical diagnosis, medicine dosage instructions & PDF Rx printing.
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800">
                  <CheckCircle2 className="w-3 h-3 text-indigo-700" /> Active & Operational
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <span className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Appointment History Page
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Dedicated history archive tab separating active OPD patient queue from completed/cancelled records.
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Active & Operational
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <span className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs">
                  <Activity className="w-4 h-4 text-amber-600" /> Pharmacy FEFO Stock Manager
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Multi-expiry date batch tracking per medicine, stock purchase builder & FEFO (First Expired, First Out).
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">
                  <CheckCircle2 className="w-3 h-3 text-amber-700" /> Active & Operational
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-4 h-4 text-slate-700" /> Itemized GST Patient Billing
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Doctor consultation fees, pharmacy items, lab charges & printable GST invoices.
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-800">
                  <CheckCircle2 className="w-3 h-3 text-slate-700" /> Active & Operational
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                <span className="font-extrabold text-purple-900 flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-4 h-4 text-purple-600" /> Accounts & Profit Analysis
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Daily/Weekly/Monthly profit timelines, Morning (09-01 PM) vs Evening (05-09 PM) OPD split & SVG graphs.
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">
                  <CheckCircle2 className="w-3 h-3 text-purple-700" /> Active & Operational
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
                <span className="font-extrabold text-teal-900 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-4 h-4 text-teal-600" /> Clinic Holidays & Closure Sync
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Public holidays, rain emergency closures, partial OPD suspensions & patient warning banners.
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-teal-100 text-teal-800">
                  <CheckCircle2 className="w-3 h-3 text-teal-700" /> Active & Operational
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <span className="font-extrabold text-rose-900 flex items-center gap-1.5 text-xs">
                  <Lock className="w-4 h-4 text-rose-600" /> Admin-Only Customization Guard
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Doctor Consultation Fees & Service Rates customizable ONLY when logged in as Hospital Admin.
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800">
                  <Lock className="w-3 h-3 text-rose-700" /> Admin Role Guard
                </span>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-emerald-400 hover:bg-slate-800 font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer w-full sm:w-auto justify-center"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" /> Launch KKR Clinic Direct Portal (Port 3001)
              </a>

              <button
                onClick={() => setFeaturesModalClient(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs cursor-pointer w-full sm:w-auto"
              >
                Close Feature Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SaasControl;
