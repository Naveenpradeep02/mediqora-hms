import React, { useState, useEffect } from 'react';
import {
  CalendarOff,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Building2,
  CheckCircle2,
  Trash2,
  Edit,
  ShieldAlert,
  Megaphone,
  Sun,
  Moon,
  Calendar,
  Sparkles,
  Bell,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredHolidays, saveHolidays } from '../../services/dataService';
import toast from 'react-hot-toast';

const Holidays = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [holidays, setHolidays] = useState(getStoredHolidays);

  useEffect(() => {
    const syncData = () => {
      const stored = getStoredHolidays();
      if (stored) setHolidays(stored);
    };
    syncData();

    window.addEventListener('storage', syncData);
    const interval = setInterval(syncData, 3000);
    return () => {
      window.removeEventListener('storage', syncData);
      clearInterval(interval);
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'Public Holiday' | 'Exceptional Emergency' | 'Partial OPD Session Closure' | 'Doctor Leave'
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Public Holiday',
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    sessionScope: 'Full Day Closed',
    branch: 'All Branches',
    reason: '',
    showBookingBanner: true
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Counts & Summaries
  const publicHolidaysCount = holidays.filter(h => h.category === 'Public Holiday').length;
  const emergencyClosuresCount = holidays.filter(h => h.category === 'Exceptional Emergency').length;
  const activeBannersCount = holidays.filter(h => h.showBookingBanner).length;

  // Filtered Holidays
  const filteredHolidays = holidays.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.reason && h.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.branch && h.branch.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || h.category === typeFilter;
    const matchesBranch = branchFilter === 'ALL' || h.branch.includes(branchFilter);

    return matchesSearch && matchesType && matchesBranch;
  });

  // Open Modal (Add / Edit)
  const openModal = (holiday = null) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        title: holiday.title,
        category: holiday.category,
        startDate: holiday.startDate,
        endDate: holiday.endDate,
        sessionScope: holiday.sessionScope || 'Full Day Closed',
        branch: holiday.branch || 'All Branches',
        reason: holiday.reason || '',
        showBookingBanner: !!holiday.showBookingBanner
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        title: '',
        category: 'Public Holiday',
        startDate: todayStr,
        endDate: todayStr,
        sessionScope: 'Full Day Closed',
        branch: 'All Branches',
        reason: '',
        showBookingBanner: true
      });
    }
    setIsModalOpen(true);
  };

  // Toggle Patient Warning Banner Broadcast
  const handleToggleBanner = (id) => {
    const updated = holidays.map(h => {
      if (h.id === id) {
        const nextState = !h.showBookingBanner;
        toast.success(nextState 
          ? `Broadcasting patient warning banner for "${h.title}".` 
          : `Deactivated patient warning banner for "${h.title}".`
        );
        return { ...h, showBookingBanner: nextState };
      }
      return h;
    });

    setHolidays(updated);
    saveHolidays(updated);
  };

  // Delete Closure
  const handleDeleteHoliday = (id) => {
    const target = holidays.find(h => h.id === id);
    const updated = holidays.filter(h => h.id !== id);
    setHolidays(updated);
    saveHolidays(updated);
    toast.success(`Removed closure entry: "${target?.title || 'Holiday'}"`);
  };

  // Form Submit (Add / Edit)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) {
      toast.error('Title and Start Date are required.');
      return;
    }

    const newClosure = {
      id: editingHoliday ? editingHoliday.id : `HOL-${Date.now().toString().slice(-4)}`,
      title: formData.title.trim(),
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      sessionScope: formData.sessionScope,
      branch: formData.branch,
      reason: formData.reason.trim(),
      showBookingBanner: formData.showBookingBanner,
      status: formData.category === 'Exceptional Emergency' ? 'Emergency Alert' : 'Scheduled'
    };

    let updated;
    if (editingHoliday) {
      updated = holidays.map(h => h.id === editingHoliday.id ? newClosure : h);
      toast.success(`Updated clinic closure: "${formData.title}"`);
    } else {
      updated = [newClosure, ...holidays];
      toast.success(`Scheduled new closure: "${formData.title}"`);
    }

    setHolidays(updated);
    saveHolidays(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block">
              Clinic Calendar & Operational Schedule
            </span>
            <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Patient Booking Banners Sync
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarOff className="w-7 h-7 text-[#16a34a]" /> Clinic Holidays & Exceptional Closures
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Schedule public holidays, emergency weather closures, partial OPD session suspensions & doctor summit leaves.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" /> Schedule New Clinic Closure / Holiday
        </button>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-3xl border border-green-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Total Closures</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{holidays.length} Entries</span>
            <span className="text-[11px] font-bold text-[#15803d] mt-0.5 inline-block">Scheduled in Calendar</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black">
            <Calendar className="w-6 h-6 text-[#16a34a]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">Public Holidays</span>
            <span className="text-3xl font-black text-amber-900 mt-1 block">{publicHolidaysCount} Days</span>
            <span className="text-[11px] font-bold text-amber-700 mt-0.5 inline-block">Official Clinic Holidays</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-black">
            <Sun className="w-6 h-6 text-amber-800" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider block">Emergency Closures</span>
            <span className="text-3xl font-black text-rose-900 mt-1 block">{emergencyClosuresCount} Alerts</span>
            <span className="text-[11px] font-bold text-rose-700 mt-0.5 inline-block">Exceptional & Storm Warnings</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100/80 text-rose-800 flex items-center justify-center font-black">
            <AlertTriangle className="w-6 h-6 text-rose-800" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider block">Patient Warnings</span>
            <span className="text-3xl font-black text-indigo-900 mt-1 block">{activeBannersCount} Active</span>
            <span className="text-[11px] font-bold text-indigo-700 mt-0.5 inline-block">Online Booking Banners</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <Megaphone className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search holiday title, reason, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
          >
            <option value="ALL">All Closure Categories</option>
            <option value="Public Holiday">Public Holiday</option>
            <option value="Exceptional Emergency">Exceptional Emergency</option>
            <option value="Partial OPD Session Closure">Partial OPD Session Closure</option>
            <option value="Doctor Leave">Doctor Leave</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
          >
            <option value="ALL">All Branches & Desks</option>
            <option value="All Branches">All Branches</option>
            <option value="Anna Nagar Main">Anna Nagar Main</option>
            <option value="T. Nagar Specialty Desk">T. Nagar Specialty Desk</option>
          </select>
        </div>
      </div>

      {/* HOLIDAYS & CLOSURES TABLE */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[950px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Closure Title & Category</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Closure Dates</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Session Scope</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Branch / Desk</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Patient Booking Banner</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {filteredHolidays.map((h) => {
                const isEmergency = h.category === 'Exceptional Emergency';
                const isPartial = h.sessionScope && h.sessionScope.includes('Only');

                return (
                  <tr key={h.id} className={`hover:bg-green-50/30 transition-colors ${
                    isEmergency ? 'bg-rose-50/40' : isPartial ? 'bg-amber-50/30' : ''
                  }`}>
                    {/* Title & Reason */}
                    <td className="py-4 px-6 font-extrabold text-slate-900 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black">{h.title}</span>
                        {isEmergency ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> EMERGENCY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-green-100 text-[#166534] text-[9px] font-black uppercase">
                            {h.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">{h.reason}</p>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#16a34a]" />
                        <span>{h.startDate}</span>
                        {h.endDate && h.endDate !== h.startDate && (
                          <span className="text-slate-400">to {h.endDate}</span>
                        )}
                      </div>
                    </td>

                    {/* Session Scope */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {h.sessionScope === 'Full Day Closed' ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black uppercase inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Full Day Closed
                        </span>
                      ) : h.sessionScope === 'Morning OPD Only Closed' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black uppercase flex items-center gap-1 inline-flex">
                          <Sun className="w-3 h-3 text-amber-600" /> Morning OPD Only Closed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-black uppercase flex items-center gap-1 inline-flex">
                          <Moon className="w-3 h-3 text-indigo-600" /> Evening OPD Only Closed
                        </span>
                      )}
                    </td>

                    {/* Branch / Desk */}
                    <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{h.branch}</span>
                      </div>
                    </td>

                    {/* Patient Booking Banner Toggle */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleBanner(h.id)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer border ${
                          h.showBookingBanner
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Megaphone className={`w-3.5 h-3.5 ${h.showBookingBanner ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{h.showBookingBanner ? 'Broadcasting Banner' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal(h)}
                          className="p-1.5 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-green-50 border border-transparent hover:border-green-200 cursor-pointer"
                          title="Edit Closure Entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHoliday(h.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer"
                          title="Delete Closure Entry"
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
      </div>

      {/* ADD / EDIT HOLIDAY & CLOSURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-green-100 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider">Clinic Operational Control</span>
                <h3 className="text-xl font-black text-slate-900">
                  {editingHoliday ? 'Edit Clinic Closure Entry' : 'Schedule New Clinic Closure / Holiday'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Closure Title / Holiday Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day / Heavy Rain Flooding Warning"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Exceptional Emergency">Exceptional Emergency</option>
                    <option value="Partial OPD Session Closure">Partial OPD Session Closure</option>
                    <option value="Doctor Leave">Doctor Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Session Scope *</label>
                  <select
                    value={formData.sessionScope}
                    onChange={(e) => setFormData({ ...formData, sessionScope: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Full Day Closed">Full Day Closed</option>
                    <option value="Morning OPD Only Closed">Morning OPD Only Closed (09 AM - 01 PM)</option>
                    <option value="Evening OPD Only Closed">Evening OPD Only Closed (05 PM - 09 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Affected Branch / Desk</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All Branches">All Branches</option>
                    <option value="RRK Clinic - Anna Nagar Main">RRK Clinic - Anna Nagar Main</option>
                    <option value="RRK Clinic - T. Nagar Specialty Desk">RRK Clinic - T. Nagar Specialty Desk</option>
                    <option value="Dr. R.R. Rajan OPD Desk #101">Dr. R.R. Rajan OPD Desk #101</option>
                    <option value="Dr. Anitha Rajan OPD Desk #102">Dr. Anitha Rajan OPD Desk #102</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-extrabold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showBookingBanner}
                      onChange={(e) => setFormData({ ...formData, showBookingBanner: e.target.checked })}
                      className="w-4 h-4 text-[#16a34a] rounded focus:ring-emerald-500"
                    />
                    <span>Broadcast Patient Warning Banner on Booking Page</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Detailed Reason / Patient Advisory Note</label>
                <textarea
                  rows="2"
                  placeholder="e.g. National holiday celebration. Emergency desk open for critical cases."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-black shadow-md cursor-pointer"
                >
                  {editingHoliday ? 'Save Closure Changes' : 'Schedule Clinic Closure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Holidays;
