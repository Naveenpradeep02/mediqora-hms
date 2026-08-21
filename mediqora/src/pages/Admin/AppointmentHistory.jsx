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
  Building2
} from 'lucide-react';
import { getStoredAppointments, defaultDoctors } from '../../services/dataService';

const AppointmentHistory = () => {
  const [appointments] = useState(getStoredAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [activePrescriptionModal, setActivePrescriptionModal] = useState(null);

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
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block">
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
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Calendar className="w-4 h-4 text-white" /> View Active Patient Queue
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#BBF7D0] shadow-xs flex items-center justify-between">
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

      <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[950px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-[#BBF7D0]">
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
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((apt) => {
                const isCompleted = apt.status === 'Completed';

                return (
                  <tr key={apt.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-black text-[#16a34a] text-xs whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-green-100 text-[#15803d] mr-2">{apt.tokenNo || 'H-01'}</span>
                      {apt.appointmentId}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 min-w-[160px]">
                      {apt.patientName}
                      <p className="text-[10px] text-slate-400 font-normal">{apt.phone}</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">{apt.doctor}</td>
                    <td className="py-4 px-4 font-medium text-slate-600">{apt.date} @ {apt.time}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700 min-w-[200px]">
                      {isCompleted ? (apt.diagnosis || 'Diagnosis Recorded') : 'Cancelled'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                        isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/admin/appointments/${apt.id}`} className="p-2 rounded-xl text-[#16a34a] bg-green-50 hover:bg-green-100 inline-flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;
