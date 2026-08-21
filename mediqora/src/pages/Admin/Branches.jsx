import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Clock, Loader2, Lock, Eye, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredBranches, saveBranches, defaultBranches } from '../../services/dataService';
import API from '../../services/api';

const Branches = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  const [branches, setBranches] = useState(() => getStoredBranches() || defaultBranches);
  const [showModal, setShowModal] = useState(false);
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
    try {
      const res = await API.get('/branches');
      if (res.data && res.data.success && Array.isArray(res.data.branches) && res.data.branches.length > 0) {
        const mapped = res.data.branches.map(b => ({
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
      } else {
        const local = getStoredBranches();
        if (local) setBranches(local);
      }
    } catch (err) {
      const local = getStoredBranches();
      if (local) setBranches(local);
    }
  };

  useEffect(() => {
    syncData();
    const handleStorage = () => syncData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      morningOpen: '09:00 AM',
      morningClose: '01:00 PM',
      eveningOpen: '05:00 PM',
      eveningClose: '09:00 PM',
      isSundayOpen: false
    });
    setShowModal(true);
  };

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
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Branch Name is required.');
      return;
    }

    let updated;
    if (editingBranch) {
      updated = branches.map(b => (b.id === editingBranch.id ? { ...b, ...formData } : b));
      try {
        await API.put(`/branches/${editingBranch.id}`, {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          morningOpen: formData.morningOpen,
          morningClose: formData.morningClose,
          eveningOpen: formData.eveningOpen,
          eveningClose: formData.eveningClose,
          isSundayOpen: formData.isSundayOpen,
          isActive: true
        });
      } catch (err) {
        console.warn('Backend API branch sync:', err.message);
      }
      toast.success(`Branch "${formData.name}" details & timings updated.`);
    } else {
      const newBranch = {
        id: Date.now(),
        ...formData
      };
      updated = [...branches, newBranch];
      try {
        await API.post('/branches', {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          morningOpen: formData.morningOpen,
          morningClose: formData.morningClose,
          eveningOpen: formData.eveningOpen,
          eveningClose: formData.eveningClose,
          isSundayOpen: formData.isSundayOpen,
          isActive: true
        });
      } catch (err) {
        console.warn('Backend API branch sync:', err.message);
      }
      toast.success(`New Branch "${formData.name}" created successfully.`);
    }

    setBranches(updated);
    saveBranches(updated);
    window.dispatchEvent(new Event('storage'));
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (branches.length <= 1) {
      toast.error('At least 1 active clinic branch must remain.');
      return;
    }
    if (window.confirm('Are you sure you want to remove this clinic branch location?')) {
      const updated = branches.filter(b => b.id !== id);
      try {
        await API.delete(`/branches/${id}`);
      } catch (err) {}
      setBranches(updated);
      saveBranches(updated);
      window.dispatchEvent(new Event('storage'));
      toast.success('Clinic branch location deleted.');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-8">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm">
        <div>
          <span className="text-xs font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block mb-1">
            Clinic Locations & Operating Hours
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#16a34a]" /> Clinic Branch Management & Timings
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage clinic locations, contact info, and consultation operating hours.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" /> Add New Branch
        </button>
      </div>

      {/* BRANCHES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((b) => (
          <div key={b.id} className="bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-4 relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{b.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1 bg-green-100 text-[#15803d] border border-[#BBF7D0]">
                    Active Branch
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-green-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Branch & Timings"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Branch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 bg-green-50/60 p-4 rounded-2xl border border-[#BBF7D0]/60">
                <p className="flex items-start gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </p>
                <p className="flex items-center gap-2 font-bold text-slate-900">
                  <Phone className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>{b.phone}</span>
                </p>
              </div>

              {/* Consultation Hours Display */}
              <div className="space-y-2 pt-1 border-t border-[#BBF7D0]/40">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#16a34a]" /> Visiting Consultation Hours:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#BBF7D0]/50">
                    <span className="text-[10px] font-extrabold uppercase text-[#16a34a] block">Mon - Sat Morning</span>
                    <span className="font-bold text-slate-800">{b.morningOpen || '09:00 AM'} - {b.morningClose || '01:00 PM'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#BBF7D0]/50">
                    <span className="text-[10px] font-extrabold uppercase text-[#16a34a] block">Mon - Sat Evening</span>
                    <span className="font-bold text-slate-800">{b.eveningOpen || '05:00 PM'} - {b.eveningClose || '09:00 PM'}</span>
                  </div>
                  <div className="sm:col-span-2 bg-white p-2.5 rounded-xl border border-[#BBF7D0]/50 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-700">Sunday Status</span>
                    {b.isSundayOpen ? (
                      <span className="font-extrabold text-[#16a34a] text-xs">Open: 10:00 AM - 01:00 PM</span>
                    ) : (
                      <span className="font-extrabold text-rose-600 text-xs">Closed / Holiday</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT BRANCH MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 my-8">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-[#BBF7D0]/50 flex items-center justify-between">
              <span>{editingBranch ? 'Edit Branch & Operating Timings' : 'Add New Branch Location'}</span>
              <span className="text-[10px] bg-green-100 text-[#15803d] px-2 py-0.5 rounded-full uppercase font-extrabold">Active</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KKR Clinic - Anna Nagar Main"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Full street address..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 44 2621 1122"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                />
              </div>

              <div className="bg-green-50/70 p-4 rounded-2xl border border-[#BBF7D0]/80 space-y-3">
                <h4 className="font-extrabold text-[#16a34a] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#16a34a]" /> Branch Operating Hours Management
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Morning Open</label>
                    <input
                      type="text"
                      value={formData.morningOpen}
                      onChange={(e) => setFormData({ ...formData, morningOpen: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Morning Close</label>
                    <input
                      type="text"
                      value={formData.morningClose}
                      onChange={(e) => setFormData({ ...formData, morningClose: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Evening Open</label>
                    <input
                      type="text"
                      value={formData.eveningOpen}
                      onChange={(e) => setFormData({ ...formData, eveningOpen: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Evening Close</label>
                    <input
                      type="text"
                      value={formData.eveningClose}
                      onChange={(e) => setFormData({ ...formData, eveningClose: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#BBF7D0]/50">
                  <label className="flex items-center gap-2 font-extrabold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSundayOpen}
                      onChange={(e) => setFormData({ ...formData, isSundayOpen: e.target.checked })}
                      className="w-4 h-4 accent-[#16a34a] rounded"
                    />
                    <span>Open on Sundays</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#16a34a] text-white font-extrabold shadow-md hover:bg-[#15803d] cursor-pointer"
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
