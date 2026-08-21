import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Download,
  Stethoscope,
  Calendar,
  User,
  Phone,
  Clock,
  Sparkles,
  Building2,
  Check
} from 'lucide-react';
import { getStoredAppointments, defaultDoctors } from '../../services/dataService';

const AppointmentHistory = () => {
  const [appointments] = useState(getStoredAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for E-Prescription & Case History Preview
  const [activePrescriptionModal, setActivePrescriptionModal] = useState(null);

  // Filter history records (Completed or Cancelled appointments)
  const historyAppointments = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');

  const completedCount = historyAppointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = historyAppointments.filter(a => a.status === 'Cancelled').length;
  const prescriptionCount = historyAppointments.filter(a => a.prescription && a.prescription !== 'N/A').length;

  const filteredHistory = historyAppointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.appointmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone.includes(searchQuery) ||
      (apt.diagnosis && apt.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (apt.prescription && apt.prescription.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDoctor = doctorFilter === 'ALL' || apt.doctorId === doctorFilter;
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;

    return matchesSearch && matchesDoctor && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block">
              Clinical Medical Archive
            </span>
            <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Electronic Health Records (EHR)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-[#16a34a]" /> Patient Consultation & Appointment History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Complete archive of all completed OPD consultations, case diagnoses, e-prescriptions, and cancelled bookings.
          </p>
        </div>

        <Link
          to="/admin/appointments"
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Calendar className="w-4 h-4 text-white" /> View Active Patient Queue
        </Link>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-3xl border border-green-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Total Archived Records</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{historyAppointments.length} Cases</span>
            <span className="text-[11px] font-bold text-[#15803d] mt-0.5 inline-block">Historical OPD Consults</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black">
            <History className="w-6 h-6 text-[#16a34a]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">Completed Consults</span>
            <span className="text-3xl font-black text-emerald-900 mt-1 block">{completedCount} Patients</span>
            <span className="text-[11px] font-bold text-emerald-700 mt-0.5 inline-block">Successfully Discharged</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6 text-emerald-800" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider block">Prescriptions Logged</span>
            <span className="text-3xl font-black text-indigo-900 mt-1 block">{prescriptionCount} Prescriptions</span>
            <span className="text-[11px] font-bold text-indigo-700 mt-0.5 inline-block">Digital Pharmacy Records</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider block">Cancelled Bookings</span>
            <span className="text-3xl font-black text-rose-900 mt-1 block">{cancelledCount} Bookings</span>
            <span className="text-[11px] font-bold text-rose-700 mt-0.5 inline-block">Unfulfilled Appointments</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100/80 text-rose-800 flex items-center justify-center font-black">
            <XCircle className="w-6 h-6 text-rose-800" />
          </div>
        </div>

      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name, Ref ID, diagnosis, or medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
          >
            <option value="ALL">All Doctors</option>
            {defaultDoctors.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
          >
            <option value="ALL">All History Statuses</option>
            <option value="Completed">Completed Only</option>
            <option value="Cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* APPOINTMENT HISTORY TABLE */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[950px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Ref ID / Token</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Patient Details</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Doctor & Specialty</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Date & Session</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Diagnosis & E-Prescription</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Final Status</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-bold">
                    No completed or cancelled appointment history records found matching search filters.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((apt) => {
                  const isCompleted = apt.status === 'Completed';

                  return (
                    <tr key={apt.id} className={`hover:bg-green-50/30 transition-colors ${!isCompleted ? 'bg-rose-50/20' : ''}`}>
                      
                      {/* Ref ID & Token */}
                      <td className="py-4 px-6 font-mono font-black text-[#15803d] text-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-green-100 text-[#166534] mr-2">{apt.tokenNo || 'H-01'}</span>
                        {apt.appointmentId}
                      </td>

                      {/* Patient Details */}
                      <td className="py-4 px-4 font-extrabold text-slate-900 min-w-[160px]">
                        <span className="text-sm font-black text-slate-900 block">{apt.patientName}</span>
                        <p className="text-[10px] text-slate-400 font-normal">{apt.phone} • {apt.age || 35} yrs ({apt.gender || 'M'})</p>
                      </td>

                      {/* Doctor & Service */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-[#14532d] block">{apt.doctor}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{apt.service}</span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{apt.date}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">@ {apt.time}</span>
                      </td>

                      {/* Diagnosis & Prescription Snippet */}
                      <td className="py-4 px-4 min-w-[220px]">
                        {isCompleted ? (
                          <div className="space-y-1">
                            <span className="font-extrabold text-slate-800 text-[11px] block truncate max-w-[220px]">
                              🩺 {apt.diagnosis || 'Diagnosis Recorded'}
                            </span>
                            {apt.prescription ? (
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 block truncate max-w-[220px] font-mono">
                                💊 {apt.prescription.split('\n')[0]}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No medicines listed</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-rose-700 italic">
                            Cancelled: {apt.remarks || 'Unfulfilled'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 inline-flex">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 inline-flex">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCompleted && (
                            <button
                              onClick={() => setActivePrescriptionModal(apt)}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                              title="View E-Prescription"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Rx
                            </button>
                          )}

                          <Link
                            to={`/admin/appointments/${apt.id}`}
                            className="p-1.5 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-green-50 border border-transparent hover:border-green-200 inline-flex items-center justify-center"
                            title="View Full Case Record"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* E-PRESCRIPTION & CASE RECORD PREVIEW MODAL */}
      {activePrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-green-100 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider">RRK Clinic E-Prescription & Case Summary</span>
                <h3 className="text-xl font-black text-slate-900">{activePrescriptionModal.patientName}</h3>
                <p className="text-xs text-slate-500 font-mono">Ref ID: {activePrescriptionModal.appointmentId} • Token {activePrescriptionModal.tokenNo}</p>
              </div>
              <button
                onClick={() => setActivePrescriptionModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Consultant Doctor</span>
                  <span className="font-extrabold text-[#14532d] text-xs">{activePrescriptionModal.doctor}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Consultation Date</span>
                  <span className="font-extrabold text-slate-900 text-xs">{activePrescriptionModal.date} @ {activePrescriptionModal.time}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-50/60 border border-green-200 space-y-2">
                <span className="text-[#14532d] font-extrabold text-xs block">Clinical Diagnosis:</span>
                <p className="text-slate-900 font-bold text-xs">{activePrescriptionModal.diagnosis || 'Routine Evaluation'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <span className="text-indigo-900 font-extrabold text-xs block">Prescribed Medicines & Dosage:</span>
                <pre className="text-slate-800 font-mono text-xs font-medium whitespace-pre-wrap leading-relaxed">
                  {activePrescriptionModal.prescription || 'No medicines logged.'}
                </pre>
              </div>

              {activePrescriptionModal.remarks && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                  <strong>Doctor Advice / Notes:</strong> {activePrescriptionModal.remarks}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" /> Print Case Slip
              </button>

              <button
                type="button"
                onClick={() => setActivePrescriptionModal(null)}
                className="px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentHistory;
