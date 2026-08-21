import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Stethoscope,
  Plus,
  ArrowUpRight,
  History,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { getStoredAppointments, saveAppointments, defaultDoctors } from '../../services/dataService';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState(getStoredAppointments);
  const [viewTab, setViewTab] = useState('ACTIVE'); // 'ACTIVE' | 'HISTORY'
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Count active vs history appointments
  const activeCount = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length;
  const historyCount = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled').length;

  // Handle direct Status Update by Doctor / Staff
  const handleStatusChange = (aptId, newStatus) => {
    const target = appointments.find(a => a.id === aptId);
    const updated = appointments.map((a) => {
      if (a.id === aptId) {
        return { ...a, status: newStatus };
      }
      return a;
    });

    setAppointments(updated);
    saveAppointments(updated);

    if (newStatus === 'Completed' || newStatus === 'Cancelled') {
      toast.success(`Appointment ${target?.appointmentId || ''} marked as "${newStatus}". Moved to Appointment History.`);
    } else {
      toast.success(`Updated status to "${newStatus}".`);
    }
  };

  // Filter Appointments based on View Tab (ACTIVE vs HISTORY) and Filters
  const filteredAppointments = appointments.filter((apt) => {
    const isHistoryItem = apt.status === 'Completed' || apt.status === 'Cancelled';
    const matchesTab = viewTab === 'HISTORY' ? isHistoryItem : !isHistoryItem;

    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.appointmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone.includes(searchQuery);

    const matchesDoctor = doctorFilter === 'ALL' || apt.doctorId === doctorFilter;
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;

    return matchesTab && matchesSearch && matchesDoctor && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#15803d] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block mb-1">
            Clinical Records & Queue Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-[#16a34a]" /> Master Patient Appointments
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage live patient queue, update consultation statuses, and view completed/cancelled appointment history.
          </p>
        </div>

        <Link
          to="/booking"
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-white" /> New Patient Appointment
        </Link>
      </div>

      {/* VIEW TAB SWITCHER (ACTIVE QUEUE VS APPOINTMENT HISTORY) */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-green-100 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setViewTab('ACTIVE'); setStatusFilter('ALL'); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              viewTab === 'ACTIVE'
                ? 'bg-[#16a34a] text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Active OPD Patient Queue</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${viewTab === 'ACTIVE' ? 'bg-white/20 text-white' : 'bg-green-100 text-[#15803d]'}`}>
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => { setViewTab('HISTORY'); setStatusFilter('ALL'); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              viewTab === 'HISTORY'
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Appointment History</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${viewTab === 'HISTORY' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              {historyCount}
            </span>
          </button>
        </div>

        <div className="hidden sm:block text-xs font-bold text-slate-500 px-3">
          {viewTab === 'ACTIVE' ? 'Showing Live Patient Queue' : 'Showing Completed & Cancelled History'}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient Name, Ref ID, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
          >
            <option value="ALL">All Doctors</option>
            {defaultDoctors.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
          >
            <option value="ALL">All Statuses ({viewTab})</option>
            {viewTab === 'ACTIVE' ? (
              <>
                <option value="Checked In">Checked In</option>
                <option value="In Consultation">In Consultation</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
              </>
            ) : (
              <>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Appointments List Table */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[850px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Token / Ref ID</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Patient Details</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Assigned Doctor</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Service</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Date & Time</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Update Status</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-bold">
                    No {viewTab === 'ACTIVE' ? 'active' : 'history'} appointments found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-green-50/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-black text-[#15803d] text-xs whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-green-100 text-[#15803d] mr-2">{apt.tokenNo || 'T-01'}</span>
                      {apt.appointmentId}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 min-w-[150px]">
                      {apt.patientName}
                      <p className="text-[10px] text-slate-400 font-normal">{apt.phone}</p>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-[#15803d] whitespace-nowrap">
                      {apt.doctor}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 min-w-[130px]">
                      {apt.service}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                      {apt.date} @ {apt.time}
                    </td>
                    
                    {/* INTERACTIVE DOCTOR STATUS UPDATER */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        className={`px-3 py-1 rounded-xl text-xs font-black border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          apt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                          apt.status === 'In Consultation' ? 'bg-green-50 text-[#15803d] border-green-300' :
                          apt.status === 'Checked In' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked In">Checked In</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="Completed">Completed (Move to History)</option>
                        <option value="Cancelled">Cancelled (Move to History)</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/appointments/${apt.id}`}
                        className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors inline-flex items-center justify-center border border-transparent hover:border-green-200"
                        title="View Medical Details"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Appointments;
