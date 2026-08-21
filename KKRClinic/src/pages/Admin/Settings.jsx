import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, UserCheck, Lock, Save, ShieldCheck, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredSettings, saveSettings } from '../../services/dataService';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(() => getStoredSettings());
  const [password, setPassword] = useState('');

  const syncData = () => {
    const s = getStoredSettings();
    if (s) setProfileData(s);
  };

  useEffect(() => {
    syncData();
    window.addEventListener('storage', syncData);
    const interval = setInterval(syncData, 3000);
    return () => {
      window.removeEventListener('storage', syncData);
      clearInterval(interval);
    };
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('Administrator Name is required.');
      return;
    }

    saveSettings(profileData);
    window.dispatchEvent(new Event('storage'));
    toast.success('Hospital Admin profile settings updated successfully.');
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm">
        <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block mb-1">
          Account Profile & Portal Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-[#16a34a]" /> Account & Clinic Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage logged in user credentials and clinic parameters ({user?.roleLabel || 'Hospital Admin'}).
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center font-black text-2xl shadow-md">
            {profileData.name ? profileData.name.charAt(0) : 'A'}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">{profileData.name}</h3>
            <p className="text-xs font-extrabold text-[#16a34a] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Hospital Admin ({profileData.title || 'Executive Clinic Director'})
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Administrator / Doctor Full Name *</label>
            <input
              type="text"
              required
              value={profileData.name || ''}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Hospital Admin Email *</label>
            <input
              type="email"
              required
              value={profileData.email || ''}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Hospital Mobile Number *</label>
            <input
              type="text"
              required
              value={profileData.phone || ''}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Change Security Password</label>
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
