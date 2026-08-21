import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Clock, CheckCircle2, Lock, Edit } from 'lucide-react';
import { getStoredBranches, defaultBranches, saveBranches } from '../../services/dataService';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

const Branches = () => {
  const [branches, setBranches] = useState(() => getStoredBranches() || defaultBranches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    morningOpen: '09:00 AM',
    morningClose: '01:00 PM',
    eveningOpen: '05:00 PM',
    eveningClose: '09:00 PM',
    isSundayOpen: false
  });

  const syncData = async () => {
    // 1. First check LocalStorage for live changes
    const local = getStoredBranches();
    if (local && local.length > 0) {
      setBranches(local);
    }
    // 2. Fetch from Backend API as secondary sync
    try {
      const res = await apiService.fetchBranches();
      if (res && res.success && Array.isArray(res.branches) && res.branches.length > 0) {
        const mapped = res.branches.map(b => ({
          id: b.id,
          name: b.name,
          address: b.address || '',
          phone: b.phone || '',
          morningOpen: b.morning_open || '09:00 AM',
          morningClose: b.morning_close || '01:00 PM',
          eveningOpen: b.evening_open || '05:00 PM',
          eveningClose: b.evening_close || '09:00 PM',
          isSundayOpen: Boolean(b.is_sunday_open)
        }));
        setBranches(mapped);
        saveBranches(mapped);
      }
    } catch (err) {}
  };

  useEffect(() => {
    syncData();

    const handleStorage = () => syncData();
    window.addEventListener('storage', handleStorage);
    // Poll every 3 seconds for cross-origin sync (e.g. 192.168.1.3 vs localhost)
    const interval = setInterval(syncData, 3000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const openEditModal = (b) => {
    setEditingBranch(b);
    setFormData({
      name: b.name || '',
      address: b.address || '',
      phone: b.phone || '',
      morningOpen: b.morningOpen || '09:00 AM',
      morningClose: b.morningClose || '01:00 PM',
      eveningOpen: b.eveningOpen || '05:00 PM',
      eveningClose: b.eveningClose || '09:00 PM',
      isSundayOpen: Boolean(b.isSundayOpen)
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingBranch) return;

    const updated = branches.map(b => (b.id === editingBranch.id ? { ...b, ...formData } : b));
    setBranches(updated);
    saveBranches(updated);
    window.dispatchEvent(new Event('storage'));
    toast.success(`Branch "${formData.name}" details & timings updated.`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans pb-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block mb-1">
            Clinic Locations & Operating Hours
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#16a34a]" /> RRK Clinic Operational Branches
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Live branch locations, contact helpline, and OPD operating schedules.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Adding New Branch Locations is managed by Mediqora Super Admin. You can edit existing branch details below.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(b => (
          <div key={b.id} className="bg-white p-6 rounded-3xl border border-green-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#16a34a] text-white font-black flex items-center justify-center text-xl shadow-md shrink-0">
                    K
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{b.name}</h3>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OPD Active
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(b)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-400 hover:bg-slate-800 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Branch
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-green-50/60 border border-green-100 space-y-2 text-xs">
                <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" /> <strong>Address:</strong> {b.address}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#16a34a]" /> <strong>Helpline:</strong> {b.phone}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#16a34a]" /> <strong>OPD Hours:</strong> {b.morningOpen || '09:00 AM'} - {b.morningClose || '01:00 PM'} & {b.eveningOpen || '05:00 PM'} - {b.eveningClose || '09:00 PM'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT BRANCH MODAL */}
      {isModalOpen && editingBranch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 my-8">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Edit Branch & Operating Timings</span>
              <span className="text-[10px] bg-green-100 text-[#166534] px-2 py-0.5 rounded-full uppercase font-extrabold">Active</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                ></textarea>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#16a34a] text-white font-extrabold shadow-md hover:bg-emerald-700 cursor-pointer"
                >
                  Save Branch & Timings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
