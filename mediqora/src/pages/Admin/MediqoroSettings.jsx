import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UserCheck, Lock, User, Save, KeyRound, Crown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const MediqoroSettings = () => {
  const { user, setUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Srija',
    phone: user?.phone || '+91 73735 09585'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || 'Srija',
        phone: user.phone || '+91 73735 09585'
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await API.put('/auth/profile', profileData);
      if (res.data.success) {
        toast.success('Mediqoro Master profile updated successfully!');
        setUser(res.data.user);
        localStorage.setItem('sri_ram_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      toast.error('Failed to update Mediqoro profile');
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
      const res = await API.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        toast.success('Mediqoro Master security password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      
      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-[#BBF7D0] shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#16a34a]"></div>
        <div className="pl-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0]">
              MEDIQORO SAAS OWNER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Crown className="w-7 h-7 text-[#16a34a]" /> Mediqoro Master Profile & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium max-w-2xl">
            Manage Mediqoro SaaS Platform Owner account credentials, master email, contact phone number, and security password.
          </p>
        </div>

        <span className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-green-100 text-[#15803d] border border-[#BBF7D0] shrink-0 shadow-xs">
          MEDIQORO MASTER
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Profile Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base pb-2 border-b border-[#BBF7D0] flex items-center gap-2">
            <User className="w-5 h-5 text-[#16a34a]" />
            <span>Mediqoro Master Profile</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Master Owner Name *</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Assigned Role</label>
              <input
                type="text"
                value="Mediqoro SaaS Master Platform Owner (Full System Access)"
                disabled
                className="w-full p-3 rounded-xl border border-[#BBF7D0] bg-green-50 text-slate-900 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Master Email Address (Read Only)</label>
              <input
                type="email"
                value={user?.email || 'info@mediqora.in'}
                disabled
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1">Contact Mobile Number *</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-green-500/20 transition-all text-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{savingProfile ? 'Updating Profile...' : 'Save Master Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Master Security Password Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base pb-2 border-b border-slate-100 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#16a34a]" />
            <span>Mediqoro Master Security Password</span>
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
              <label className="block font-extrabold uppercase text-slate-700 mb-1">New Master Password</label>
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
                className="w-full flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-green-500/20 transition-all text-xs cursor-pointer"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>{savingPassword ? 'Updating Password...' : 'Update Master Password'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};

export default MediqoroSettings;
