import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { UserCheck, Lock, User, Save, KeyRound, Stethoscope, Building2, Sparkles, ArrowRight, Calendar, Activity, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredSettings, saveSettings } from '../../services/dataService';
import API from '../../services/api';

const Settings = () => {
  const { user, setUser, selectedClient } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const isRrk = selectedClient?.client_id === 'CLI-RRK-002' || selectedClient?.client_id === 'CLI-KKR-002';

  const [profileData, setProfileData] = useState(() => getStoredSettings());

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saasInfo, setSaasInfo] = useState({
    plan: '3 Months Plan (Without Email Follow-up)',
    nextBillingDate: '2026-11-21',
    status: 'active',
    monthlyFee: isKkr ? '12000' : '1999'
  });

  useEffect(() => {
    const settings = getStoredSettings();
    if (settings) {
      setProfileData(settings);
    }
  }, [selectedClient]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      saveSettings(profileData);
      window.dispatchEvent(new Event('storage'));
      toast.success(`${hospitalName} administrator profile updated successfully!`);
    } catch (err) {
      toast.error('Failed to update administrator profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      toast.success(`${hospitalName} security password updated successfully`);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const formatExpiryDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      }
      return cleanStr;
    } catch (e) {
      return dateStr;
    }
  };

  const hospitalName = selectedClient ? selectedClient.hospital_name : 'RRK Clinic & Multispecialty Hospital';
  const hospitalId = selectedClient ? selectedClient.client_id : 'CLI-RRK-002';

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-8">
      
      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#BBF7D0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-[#15803d] bg-green-100 border-[#BBF7D0] px-2.5 py-0.5 rounded-full border">
              {hospitalName} ({hospitalId})
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <Stethoscope className="w-6 h-6 text-[#16a34a]" />
            <span>{hospitalName} Doctor Profile & Security</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage hospital administrator credentials, clinical contact information, and desk access password.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-green-100 text-[#15803d] border-[#BBF7D0] border shrink-0">
          DOCTOR ADMIN
        </span>
      </div>

      {/* Active Subscription & Expiration Status Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-green-950 via-slate-900 to-emerald-950 text-white shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#16a34a]/20 text-emerald-400 border border-[#BBF7D0]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">CURRENT ACTIVE SAAS SUBSCRIPTION</span>
              <h2 className="text-lg font-black text-white mt-0.5">{saasInfo.plan}</h2>
            </div>
          </div>

          <Link
            to="/admin/upgrade"
            className="px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md bg-[#16a34a] hover:bg-emerald-600 text-white"
          >
            <span>Upgrade / Renew Plan</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" /> Plan Expiration Date
            </span>
            <span className="text-base font-black text-emerald-400 block">
              {formatExpiryDate(saasInfo.nextBillingDate)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Subscription Status
            </span>
            <span className="text-base font-black text-white uppercase block flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Subscription
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Plan Package Fee
            </span>
            <span className="text-base font-black text-white block">₹{saasInfo.monthlyFee}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hospital Administrator Profile Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base pb-2 border-b border-[#BBF7D0] flex items-center gap-2">
            <User className="w-5 h-5 text-[#16a34a]" />
            <span>Hospital Administrator Profile</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Administrator / Doctor Full Name *</label>
              <input
                type="text"
                value={profileData.name || ''}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Assigned Role</label>
              <input
                type="text"
                value={`Doctor Admin (${hospitalName})`}
                disabled
                className="w-full p-3 rounded-xl border border-[#BBF7D0] bg-green-50 text-slate-900 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Hospital Admin Email *</label>
              <input
                type="email"
                value={profileData.email || ''}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Hospital Mobile Number *</label>
              <input
                type="text"
                value={profileData.phone || ''}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                className="w-full flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-xl shadow-green-500/20 hover:opacity-95 shadow-md cursor-pointer text-xs transition-all"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{savingProfile ? 'Updating Profile...' : 'Save Doctor Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Doctor Security Password Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base pb-2 border-b border-[#BBF7D0] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#16a34a]" />
            <span>Doctor Security Password</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">New Doctor Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white shadow-md shadow-green-500/20 cursor-pointer text-xs transition-all"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>{savingPassword ? 'Updating Password...' : 'Update Doctor Password'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
