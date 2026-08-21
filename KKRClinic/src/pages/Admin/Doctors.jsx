import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Clock,
  Phone,
  Mail,
  Award,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  UserPlus,
  Check,
  X,
  Sparkles,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { getStoredDoctors, saveDoctors, defaultDoctors } from '../../services/dataService';
import toast from 'react-hot-toast';

const colorOptions = [
  { label: 'Royal Blue', value: 'bg-[#16a34a]' },
  { label: 'Emerald Green', value: 'bg-[#16a34a]' },
  { label: 'Indigo', value: 'bg-indigo-600' },
  { label: 'Purple', value: 'bg-purple-600' },
  { label: 'Amber', value: 'bg-amber-600' },
  { label: 'Rose', value: 'bg-rose-600' }
];

const Doctors = () => {
  // Permission rules: RRK Local Admin CANNOT add new doctors, BUT CAN EDIT existing doctor details
  const canAddDoctor = false;
  const canEditDoctor = true;

  const [doctors, setDoctors] = useState(() => getStoredDoctors() || defaultDoctors);

  useEffect(() => {
    const syncData = () => {
      const stored = getStoredDoctors();
      if (stored) setDoctors(stored);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    specialty: '',
    experience: '',
    fee: 500,
    roomNo: 'OPD Desk #103',
    availableDays: 'Mon - Sat',
    availableHours: '09:00 AM - 01:00 PM',
    email: '',
    phone: '',
    badgeColor: 'bg-[#16a34a]'
  });

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.roomNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditModal = (doc) => {
    if (!canEditDoctor) {
      toast.error('You do not have permission to edit doctor profiles.');
      return;
    }
    setEditingDoctor(doc);
    setFormData({
      name: doc.name || '',
      qualification: doc.qualification || '',
      specialty: doc.specialty || '',
      experience: doc.experience || '',
      fee: doc.fee || 500,
      roomNo: doc.roomNo || '',
      availableDays: doc.availableDays || 'Mon - Sat',
      availableHours: doc.availableHours || '',
      email: doc.email || '',
      phone: doc.phone || '',
      badgeColor: doc.badgeColor || 'bg-[#16a34a]'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingDoctor) {
      toast.error('Only Mediqora Super Admin can register new Senior Doctors.');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Doctor Name is required.');
      return;
    }
    if (!formData.specialty.trim()) {
      toast.error('Specialty & Department is required.');
      return;
    }

    const updated = doctors.map(d => (d.id === editingDoctor.id ? { ...d, ...formData } : d));
    setDoctors(updated);
    saveDoctors(updated);
    toast.success(`Doctor profile for "${formData.name}" updated successfully.`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans pb-8">
      {/* HEADER BAR */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block">
              Medical Faculty Directory
            </span>
            <span className="text-xs font-black uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> Adding New Doctor Reserved for Mediqora Super Admin
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-[#16a34a]" /> RRK Senior Doctors Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Edit doctor profiles, consultation fees, OPD desk assignments, and availability schedules.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctor, specialty, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* DOCTORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-6 rounded-3xl border border-green-100 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between relative group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl ${doc.badgeColor || 'bg-[#16a34a]'} text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0`}
                  >
                    {doc.name ? doc.name.split(' ').pop().charAt(0) : 'D'}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">{doc.name}</h3>
                    <p className="text-xs font-bold text-[#16a34a]">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{doc.qualification}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-50 text-[#166534] border border-green-200 shrink-0">
                  ₹{doc.fee} OPD
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-green-50/60 border border-green-100 space-y-2 text-xs font-medium">
                <p className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span><strong>OPD Desk:</strong> {doc.roomNo}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span><strong>Hours:</strong> {doc.availableHours}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Award className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span><strong>Experience:</strong> {doc.experience}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span><strong>Phone:</strong> {doc.phone || '+91 98401 00000'}</span>
                </p>
                {doc.email && (
                  <p className="flex items-center gap-2 text-slate-700 truncate">
                    <Mail className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span className="truncate"><strong>Email:</strong> {doc.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* ACTION CONTROL BUTTON - EDIT IS ENABLED FOR RRK ADMIN */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openEditModal(doc)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-emerald-400 hover:bg-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Edit className="w-4 h-4 text-emerald-400" /> Edit Doctor Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT DOCTOR MODAL (FOR RRK ADMIN) */}
      {isModalOpen && editingDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                  Update Doctor Profile
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Edit {editingDoctor.name}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 font-bold cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. S. Kanthimathi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Specialty & Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. General Medicine & Diabetology"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Degrees & Qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD (General Medicine)"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-extrabold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">OPD Desk / Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. OPD Desk #103"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Experience Summary</label>
                  <input
                    type="text"
                    placeholder="e.g. 12+ Years Experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Available Days & Timings</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 01:00 PM & 05:00 PM - 09:00 PM"
                    value={formData.availableHours}
                    onChange={(e) => setFormData({ ...formData, availableHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98401 22334"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="dr.name@rrkclinic.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Avatar Theme Color</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, badgeColor: opt.value })}
                      className={`p-2 rounded-xl border text-[11px] font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        formData.badgeColor === opt.value
                          ? 'border-[#16a34a] bg-green-50 text-[#166534] font-black'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${opt.value}`}></span>
                      <span className="truncate">{opt.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-extrabold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
