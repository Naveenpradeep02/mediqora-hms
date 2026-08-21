import React, { useState } from 'react';
import {
  Activity,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Edit,
  Plus,
  DollarSign,
  Clock,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredServices, saveServices, defaultServices, getStoredDoctors, saveDoctors } from '../../services/dataService';
import toast from 'react-hot-toast';

const Services = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  const [doctors, setDoctors] = useState(() => getStoredDoctors());
  const [services, setServices] = useState(() => getStoredServices() || defaultServices);

  // Doctor Fee Edit Modal / State
  const [editingDocId, setEditingDocId] = useState(null);
  const [tempDocFee, setTempDocFee] = useState('');

  // Service Edit Modal / State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    category: 'Doctor Fee',
    fee: 500,
    duration: '15 Mins'
  });

  // Handle Doctor Fee Update (Super Admin & Hospital Admin)
  const handleStartEditDocFee = (doc) => {
    setEditingDocId(doc.id);
    setTempDocFee(doc.fee);
  };

  const handleSaveDocFee = (docId) => {
    const newFee = parseInt(tempDocFee, 10);
    if (isNaN(newFee) || newFee < 0) {
      toast.error('Please enter a valid consultation fee amount.');
      return;
    }

    const updated = doctors.map(d => d.id === docId ? { ...d, fee: newFee } : d);
    setDoctors(updated);
    saveDoctors(updated);
    setEditingDocId(null);
    toast.success(`Updated Doctor Consultation Fee to ₹${newFee}`);
  };

  // Handle Service Modal (Super Admin Add / Both Edit)
  const openServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceFormData({
        name: service.name,
        category: service.category || 'Doctor Fee',
        fee: service.fee,
        duration: service.duration || '15 Mins'
      });
    } else {
      setEditingService(null);
      setServiceFormData({
        name: '',
        category: 'Diagnostic (Scan)',
        fee: 500,
        duration: '15 Mins'
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = (e) => {
    e.preventDefault();
    if (!serviceFormData.name.trim()) {
      toast.error('Service Name is required.');
      return;
    }

    const feeNum = parseInt(serviceFormData.fee, 10);
    if (isNaN(feeNum) || feeNum < 0) {
      toast.error('Please enter a valid service fee amount.');
      return;
    }

    let updated;
    if (editingService) {
      updated = services.map(s => s.id === editingService.id ? { ...s, ...serviceFormData, fee: feeNum } : s);
      toast.success(`Updated tariff for "${serviceFormData.name}" to ₹${feeNum}`);
    } else {
      const newService = {
        id: Date.now(),
        ...serviceFormData,
        fee: feeNum
      };
      updated = [...services, newService];
      toast.success(`Added new clinical service "${serviceFormData.name}" (₹${feeNum})`);
    }

    setServices(updated);
    saveServices(updated);
    setIsServiceModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block">
              Clinical Fee Schedule & Tariff Control
            </span>
            <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Mediqora Super Admin Controls Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#16a34a]" /> Medical Specialties & Consultation Tariff
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Doctor consultation fees and clinical service tariffs. Changes reflect live across all desks.
          </p>
        </div>

        <button
          onClick={() => openServiceModal()}
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" /> Add Custom Clinical Service
        </button>
      </div>

      {/* SECTION 1: DOCTOR CONSULTATION FEES */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider">OPD Consultation Rates</span>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#16a34a]" /> Doctor Consultation Fees Tariff
            </h2>
          </div>
          <span className="text-xs font-extrabold text-[#15803d] bg-green-100 px-2.5 py-1 rounded-full border border-[#BBF7D0]">
            ⚡ Live Synced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {doctors.map((doc) => {
            const isEditing = editingDocId === doc.id;

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-[#BBF7D0] bg-green-50/40 space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${doc.badgeColor || 'bg-[#16a34a]'} text-white font-black text-lg flex items-center justify-center shadow-xs`}>
                      {doc.name.charAt(4)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{doc.name}</h3>
                      <p className="text-xs font-bold text-[#16a34a]">{doc.specialty}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{doc.roomNo}</p>
                    </div>
                  </div>

                  {/* Fee Badge / Admin Input */}
                  <div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-500">₹</span>
                          <input
                            type="number"
                            value={tempDocFee}
                            onChange={(e) => setTempDocFee(e.target.value)}
                            className="w-24 pl-6 pr-2 py-1.5 rounded-xl bg-white border border-green-400 font-black text-slate-900 text-sm focus:ring-2 focus:ring-[#16a34a]"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveDocFee(doc.id)}
                          className="p-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold cursor-pointer shadow-xs"
                          title="Save Consultation Fee"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#15803d] block">₹{doc.fee}</span>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase">Consultation Fee</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom Button */}
                <div className="pt-3 border-t border-[#BBF7D0]/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{doc.experience}</span>
                  {!isEditing && (
                    <button
                      onClick={() => handleStartEditDocFee(doc)}
                      className="px-3 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Dr. Fee Rate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CLINICAL SERVICES & DIAGNOSTIC TARIFF SCHEDULE */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#16a34a]" /> Clinical Services & Diagnostic Tariff Schedule
          </h2>
          <span className="text-xs font-bold text-slate-500">{services.length} Tariff Items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0]">
                    {s.category || 'Clinical Service'}
                  </span>
                  <span className="text-xl font-black text-[#16a34a]">₹{s.fee}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{s.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Estimated Duration: {s.duration || '15 Mins'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5 text-[#15803d]">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" /> Active Tariff
                </div>

                <button
                  onClick={() => openServiceModal(s)}
                  className="p-1.5 px-3 rounded-xl bg-[#F0FDF4] hover:bg-green-100 text-[#15803d] transition-colors flex items-center gap-1 font-extrabold cursor-pointer border border-[#BBF7D0]"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Tariff
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD / EDIT SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#BBF7D0] relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider">Tariff Control</span>
                <h3 className="text-xl font-black text-slate-900">
                  {editingService ? 'Edit Clinical Tariff' : 'Add Custom Clinical Service'}
                </h3>
              </div>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultrasound Scan & Report"
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Category / Specialty</label>
                <select
                  value={serviceFormData.category}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-[#16a34a]"
                >
                  <option value="Doctor Fee">Doctor Fee</option>
                  <option value="Diagnostic (ECG)">Diagnostic (ECG)</option>
                  <option value="Diagnostic (Scan)">Diagnostic (Scan)</option>
                  <option value="Nursing / Dressing">Nursing / Dressing</option>
                  <option value="Injection Fee">Injection Fee</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-[#16a34a] uppercase mb-1">Tariff Fee Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={serviceFormData.fee}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, fee: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-[#16a34a]"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    value={serviceFormData.duration}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
                    placeholder="e.g. 20 Mins"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-[#16a34a]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#16a34a] text-white font-black shadow-md cursor-pointer hover:bg-[#15803d]"
                >
                  {editingService ? 'Save Tariff Changes' : 'Add Service to Tariff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Services;
