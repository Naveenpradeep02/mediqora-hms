import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { History, Search, FileSpreadsheet, FileText, Loader2, Download, Phone, MapPin, Stethoscope, Calendar, Eye } from 'lucide-react';
import API from '../../services/api';
import { exportToExcel, exportToCSV, generateAppointmentPDF } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';

const CompletedHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        statusGroup: 'history', // Fetches both Completed and Cancelled records
        limit: 100,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      });

      const res = await API.get(`/appointments?${queryParams.toString()}`);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load appointment history log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#BBF7D0] shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#16a34a]" /> Appointment History Log
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Archived log of all completed consultations and cancelled patient bookings.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportToExcel(appointments, 'Appointment_History_Log')}
            className="flex items-center gap-1.5 bg-white border border-[#BBF7D0] text-slate-800 hover:bg-[#F0FDF4] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#16a34a]" /> Export Excel
          </button>
          <button
            onClick={() => exportToCSV(appointments, 'Appointment_History_Log')}
            className="flex items-center gap-1.5 bg-white border border-[#BBF7D0] text-slate-800 hover:bg-[#F0FDF4] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#16a34a]" /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#BBF7D0] shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#16a34a] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history records by patient name, phone, or Ref ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none text-xs font-medium text-slate-900 bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none text-xs font-bold bg-white text-slate-900 shrink-0 cursor-pointer"
        >
          <option value="">All History (Completed & Cancelled)</option>
          <option value="Completed">Completed Only</option>
          <option value="Cancelled">Cancelled Only</option>
        </select>
      </div>

      {/* HISTORY CONTAINER */}
      <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#16a34a] font-bold flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-[#16a34a]" /> Loading History Log...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">No appointment history records found.</div>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="block sm:hidden divide-y divide-[#BBF7D0]/50">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xs text-slate-900 bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#BBF7D0]">
                      {apt.appointment_id}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      apt.status === 'Completed' ? 'bg-green-100 text-[#15803d]' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{apt.patient_name}</h4>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-[#16a34a]" /> {apt.phone}
                    </p>
                  </div>

                  <div className="p-3 bg-[#F0FDF4]/70 rounded-2xl border border-[#BBF7D0]/70 space-y-1 text-xs text-slate-700">
                    <p className="flex items-center gap-1.5 font-bold text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-[#16a34a]" /> {apt.branch_name}
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <Stethoscope className="w-3.5 h-3.5 text-[#16a34a]" /> {apt.service_name}
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-[#16a34a] pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#16a34a]" /> {formatDate(apt.appointment_date)} @ {apt.appointment_time}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Link
                      to={`/admin/appointments/${apt.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F0FDF4] text-[#16a34a] border border-[#BBF7D0] text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#16a34a]" /> View Details
                    </Link>
                    <button
                      onClick={() => generateAppointmentPDF(apt)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#16a34a]" /> PDF Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-slate-600 min-w-[750px] border-collapse">
                <thead className="bg-[#F0FDF4] font-extrabold uppercase text-slate-700 border-b border-[#BBF7D0]">
                  <tr>
                    <th className="py-4 px-6 font-extrabold whitespace-nowrap text-slate-800">Ref ID</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Patient Name</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Phone</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Service</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Branch</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Date & Time</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Final Status</th>
                    <th className="py-4 px-6 font-extrabold whitespace-nowrap text-slate-800 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BBF7D0]/40">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">{apt.appointment_id}</td>
                      <td className="py-4 px-4 font-bold text-slate-900 min-w-[150px]">{apt.patient_name}</td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">{apt.phone}</td>
                      <td className="py-4 px-4 font-medium min-w-[140px]">{apt.service_name}</td>
                      <td className="py-4 px-4 text-xs whitespace-nowrap">{apt.branch_name}</td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">{formatDate(apt.appointment_date)} <span className="text-[#16a34a]">@ {apt.appointment_time}</span></td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                          apt.status === 'Completed' ? 'bg-green-100 text-[#15803d]' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/appointments/${apt.id}`}
                            className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-[#F0FDF4] transition-colors flex items-center justify-center"
                            title="View Patient Appointment Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => generateAppointmentPDF(apt)}
                            className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-[#F0FDF4] transition-colors flex items-center justify-center cursor-pointer"
                            title="Download Receipt PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default CompletedHistory;
