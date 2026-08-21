import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  FileText,
  PlusCircle,
  Activity,
  UserCheck,
  ChevronRight,
  Send,
  Sparkles,
  AlertCircle,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredAppointments, saveAppointments } from '../../services/dataService';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(getStoredAppointments);
  const [opdTab, setOpdTab] = useState('ACTIVE'); // 'ACTIVE' | 'HISTORY'

  // Filter appointments specifically for the logged-in Doctor
  const myDoctorId = user?.doctorId || (user?.email?.includes('anitha') ? 'DOC-ANITHA' : 'DOC-RAJAN');
  const myDoctorName = user?.name || (myDoctorId === 'DOC-ANITHA' ? 'Dr. Anitha Rajan' : 'Dr. R.R. Rajan');

  const myAppointments = appointments.filter(a => a.doctorId === myDoctorId || a.doctor === myDoctorName);
  
  const todayStr = '2026-08-09';
  const myTodayApts = myAppointments.filter(a => a.date === todayStr);

  const inConsult = myTodayApts.find(a => a.status === 'In Consultation');
  const checkedInList = myAppointments.filter(a => a.status === 'Checked In' || a.status === 'Confirmed' || a.status === 'Pending');
  const completedList = myAppointments.filter(a => a.status === 'Completed');
  const cancelledList = myAppointments.filter(a => a.status === 'Cancelled');

  const activeQueue = myAppointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const historyList = myAppointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');

  const displayedList = opdTab === 'ACTIVE' ? activeQueue : historyList;

  // Modal State for Prescription / Notes
  const [activeAptModal, setActiveAptModal] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleStartConsultation = (aptId) => {
    const updated = appointments.map(a => a.id === aptId ? { ...a, status: 'In Consultation' } : a);
    setAppointments(updated);
    saveAppointments(updated);
    toast.success(`Patient called into OPD room for consultation.`);
  };

  const handleStatusChange = (aptId, newStatus) => {
    const target = appointments.find(a => a.id === aptId);
    const updated = appointments.map(a => a.id === aptId ? { ...a, status: newStatus } : a);

    setAppointments(updated);
    saveAppointments(updated);

    if (newStatus === 'Completed' || newStatus === 'Cancelled') {
      toast.success(`Updated status to "${newStatus}". Moved to OPD History.`);
    } else {
      toast.success(`Updated status to "${newStatus}".`);
    }
  };

  const handleCompleteConsultation = (e) => {
    e.preventDefault();
    if (!activeAptModal) return;

    const updated = appointments.map(a => {
      if (a.id === activeAptModal.id) {
        return {
          ...a,
          status: 'Completed',
          diagnosis,
          prescription,
          notes
        };
      }
      return a;
    });

    setAppointments(updated);
    saveAppointments(updated);
    toast.success(`Consultation completed for ${activeAptModal.patientName}. Saved to History.`);
    setActiveAptModal(null);
    setDiagnosis('');
    setPrescription('');
    setNotes('');
  };

  return (
    <div className="space-y-8 font-sans pb-8">
      
      {/* DOCTOR OPD DESK HERO BANNER (OCEAN BLUE THEME) */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#15803d] to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/30">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-200" />
              <span>{user?.roomNo || 'OPD Desk #101'} • Senior Consultant Desk</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {myDoctorName} OPD Console
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-xl">
              {user?.title || 'General Medicine & Cardiology'} • OPD Consultations, E-Prescriptions & Case Records.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-200" />
              <span>Today: Sunday, Aug 9</span>
            </div>
          </div>
        </div>
      </div>

      {/* OPD QUEUE QUICK SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Waiting Lobby */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Active Queue</span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">{activeQueue.length} Patients</span>
            <span className="text-xs text-amber-700 font-bold mt-1 inline-block">Waiting / In Consultation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Current Active Consult */}
        <div className="bg-white p-5 rounded-3xl border border-green-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Current Patient in OPD</span>
            <span className="text-xl font-black text-[#15803d] mt-1 block truncate max-w-[180px]">
              {inConsult ? inConsult.patientName : 'None (Room Free)'}
            </span>
            <span className="text-xs text-[#16a34a] font-bold mt-1 inline-block">
              {inConsult ? `Token: ${inConsult.tokenNo}` : 'Click Call Next Patient'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black">
            <Activity className="w-6 h-6 text-[#16a34a] animate-pulse" />
          </div>
        </div>

        {/* Completed History */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">OPD History Log</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">{historyList.length} Patients</span>
            <span className="text-xs text-emerald-700 font-bold mt-1 inline-block">Completed & Prescribed</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* CURRENT IN-CONSULTATION PATIENT PANEL */}
      {inConsult && (
        <div className="bg-gradient-to-r from-emerald-900 to-green-950 text-white p-6 rounded-3xl shadow-lg border border-emerald-700 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black bg-emerald-500 text-white px-3 py-1 rounded-xl shadow-xs">
                CURRENT OPD PATIENT
              </span>
              <span className="font-mono text-xs text-emerald-200 bg-emerald-950 px-2.5 py-0.5 rounded-md">
                {inConsult.tokenNo} • {inConsult.appointmentId}
              </span>
            </div>

            <button
              onClick={() => {
                setActiveAptModal(inConsult);
                setDiagnosis(inConsult.diagnosis || '');
                setPrescription(inConsult.prescription || '');
                setNotes(inConsult.remarks || '');
              }}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Write E-Prescription & Complete
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-emerald-300 font-bold uppercase text-[10px] block">Patient Name</span>
              <span className="text-white font-extrabold text-sm">{inConsult.patientName}</span>
            </div>
            <div>
              <span className="text-emerald-300 font-bold uppercase text-[10px] block">Phone & Age</span>
              <span className="text-white font-extrabold">{inConsult.phone} ({inConsult.age || 35} yrs, {inConsult.gender || 'M'})</span>
            </div>
            <div>
              <span className="text-emerald-300 font-bold uppercase text-[10px] block">Medical Service</span>
              <span className="text-white font-extrabold">{inConsult.service}</span>
            </div>
            <div>
              <span className="text-emerald-300 font-bold uppercase text-[10px] block">Patient Chief Complaint</span>
              <span className="text-yellow-200 font-medium italic">{inConsult.remarks || 'Routine checkup'}</span>
            </div>
          </div>
        </div>
      )}

      {/* OPD PATIENT QUEUE & HISTORY TABS TABLE */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-green-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-[#16a34a]" /> Assigned Patient OPD Queue ({myDoctorName})
            </h3>
            <p className="text-xs text-slate-500 font-medium">Update consultation statuses or switch to history log</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setOpdTab('ACTIVE')}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                opdTab === 'ACTIVE'
                  ? 'bg-[#16a34a] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Queue ({activeQueue.length})
            </button>
            <button
              onClick={() => setOpdTab('HISTORY')}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                opdTab === 'HISTORY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OPD History ({historyList.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[750px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Token</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Patient Details</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Requested Service</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Scheduled Time</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Update Status</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">OPD Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-bold">
                    No {opdTab === 'ACTIVE' ? 'active queue' : 'history'} patients found.
                  </td>
                </tr>
              ) : (
                displayedList.map((apt) => (
                  <tr key={apt.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-black text-[#15803d] text-xs whitespace-nowrap">
                      <span className="px-2 py-1 rounded-lg bg-green-100 text-[#14532d] border border-green-200 font-extrabold">
                        {apt.tokenNo || 'T-01'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 min-w-[150px]">
                      {apt.patientName}
                      <p className="text-[10px] text-slate-400 font-normal">{apt.phone}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 min-w-[130px]">
                      {apt.service}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                      {apt.time}
                    </td>
                    
                    {/* STATUS SELECTOR */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        className={`px-3 py-1 rounded-xl text-xs font-black border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          apt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                          apt.status === 'In Consultation' ? 'bg-green-100 text-[#166534] border-green-300' :
                          apt.status === 'Checked In' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked In">Checked In</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="Completed">Completed (History)</option>
                        <option value="Cancelled">Cancelled (History)</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {apt.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleStartConsultation(apt.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-[11px] transition-all shadow-2xs cursor-pointer"
                          >
                            Call Patient
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setActiveAptModal(apt);
                            setDiagnosis(apt.diagnosis || '');
                            setPrescription(apt.prescription || '');
                            setNotes(apt.remarks || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Prescription</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRESCRIPTION & CLINICAL NOTES MODAL */}
      {activeAptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-green-100 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider">E-Prescription & Consultation Recorder</span>
                <h3 className="text-xl font-black text-slate-900">{activeAptModal.patientName}</h3>
              </div>
              <button
                onClick={() => setActiveAptModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteConsultation} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hypertension Grade 1 / Acute Bronchitis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Prescription Medicines & Dosage</label>
                <textarea
                  rows="3"
                  required
                  placeholder="1. Tab Telmisartan 40mg - 1-0-0 (Before food) x 30 days&#10;2. Tab Pantoprazole 40mg - 1-0-0 x 14 days"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Doctor Advice / Lifestyle Notes</label>
                <textarea
                  rows="2"
                  placeholder="Low salt diet, daily 30-min walk, follow-up after 1 month."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveAptModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-black shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Save E-Prescription & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
