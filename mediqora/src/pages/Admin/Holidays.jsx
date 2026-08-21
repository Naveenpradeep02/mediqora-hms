import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarOff, Plus, Trash2, Building2, Calendar, Lock, Eye, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredHolidays, saveHolidays, getStoredBranches } from '../../services/dataService';

const Holidays = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  const [holidays, setHolidays] = useState(getStoredHolidays);
  const [branches] = useState(getStoredBranches);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Public Holiday',
    startDate: '',
    endDate: '',
    sessionScope: 'Full Day Closed',
    branch: 'All Branches',
    reason: '',
    showBookingBanner: true,
    status: 'Scheduled'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Holiday title is required.');
      return;
    }
    if (!formData.startDate) {
      toast.error('Start date is required.');
      return;
    }

    const newHoliday = {
      id: `HOL-${Date.now().toString().slice(-4)}`,
      ...formData,
      endDate: formData.endDate || formData.startDate
    };

    const updated = [newHoliday, ...holidays];
    setHolidays(updated);
    saveHolidays(updated);
    toast.success(`Clinic holiday "${formData.title}" scheduled successfully.`);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this holiday closure entry?')) {
      const updated = holidays.filter(h => h.id !== id);
      setHolidays(updated);
      saveHolidays(updated);
      toast.success('Holiday closure entry removed.');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm">
        <div>
          <span className="text-xs font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block mb-1">
            Clinic Closures & Exceptional Emergency Sync
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarOff className="w-7 h-7 text-[#16a34a]" /> Clinic Holidays & Exceptional Closures
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Schedule public holidays, rain emergency closures, partial session suspensions, and online patient booking warning banners.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" /> Declare Holiday / Emergency Closure
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-sm overflow-hidden">
        {holidays.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">No holiday closures set. All active branches follow normal operating hours.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[750px]">
              <thead className="bg-green-50/70 font-bold uppercase text-slate-700 border-b border-[#BBF7D0]">
                <tr>
                  <th className="p-4 pl-6 font-black text-slate-800">Holiday Dates</th>
                  <th className="p-4 font-black text-slate-800">Title & Category</th>
                  <th className="p-4 font-black text-slate-800">Scope & Branch</th>
                  <th className="p-4 font-black text-slate-800">Reason / Alert Description</th>
                  <th className="p-4 pr-6 text-right font-black text-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="p-4 pl-6 font-bold text-[#16a34a] whitespace-nowrap">
                      {h.startDate} {h.endDate && h.endDate !== h.startDate ? `to ${h.endDate}` : ''}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {h.title}
                      <span className="block text-[10px] text-slate-400 font-medium">{h.category}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {h.branch || 'All Clinic Branches'}
                      <span className="block text-[10px] text-emerald-600 font-bold">{h.sessionScope}</span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs">{h.reason || 'General Holiday'}</td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                        title="Remove Holiday Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD HOLIDAY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-[#BBF7D0]/50">
              Declare Clinic Holiday / Exceptional Closure
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Title / Occasion *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day / Heavy Rain Warning"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium bg-white"
                >
                  <option value="Public Holiday">Public Holiday</option>
                  <option value="Exceptional Emergency">Exceptional Emergency (Heavy Rain/Storm)</option>
                  <option value="Doctor Leave">Doctor Leave / Conference</option>
                  <option value="Partial OPD Session Closure">Partial OPD Session Closure</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Reason / Warning Banner Description</label>
                <textarea
                  rows={2}
                  placeholder="Public warning message displayed on patient booking form..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#16a34a] text-white font-extrabold shadow-md hover:bg-[#15803d]"
                >
                  Save Holiday Entry
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
