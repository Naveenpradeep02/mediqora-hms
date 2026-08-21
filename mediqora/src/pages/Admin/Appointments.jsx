import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Stethoscope
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel, exportToCSV } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';

const Appointments = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ totalRecords: 0, currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Master lists
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const loadMasterLists = async () => {
      try {
        const [resB, resS] = await Promise.all([
          API.get('/branches'),
          API.get('/services')
        ]);
        if (resB.data.success) setBranches(resB.data.branches);
        if (resS.data.success) setServices(resS.data.services);
      } catch (err) {}
    };
    loadMasterLists();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        statusGroup: 'active', // Only fetches active Pending & Confirmed appointments
        ...(search && { search }),
        ...(branchId && { branchId }),
        ...(serviceId && { serviceId }),
        ...(status && { status }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const res = await API.get(`/appointments?${queryParams.toString()}`);
      if (res.data.success) {
        setAppointments(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, branchId, serviceId, status, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.patch(`/appointments/${id}/status`, { status: newStatus });
      if (res.data.success) {
        if (newStatus === 'Completed' || newStatus === 'Cancelled') {
          toast.success(`Appointment marked as ${newStatus} & moved to History log`);
          // Instantly remove from active appointments list
          setAppointments(prev => prev.filter(apt => apt.id !== id));
        } else {
          toast.success(`Status updated to ${newStatus}`);
          fetchAppointments();
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const res = await API.delete(`/appointments/${id}`);
      if (res.data.success) {
        toast.success('Appointment deleted');
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to delete appointment');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#BBF7D0] shadow-sm">
        <div>
          <span className="text-xs font-extrabold text-[#16a34a] uppercase tracking-wider">Active Patient Desk</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">Appointment Master Desk</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Showing active (Pending & Confirmed) appointments. Completed & Cancelled bookings move to History.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/history"
            className="inline-flex items-center gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16a34a] hover:bg-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs"
          >
            View History Log &rarr;
          </Link>
          <button
            onClick={() => exportToExcel(appointments, 'Active_Appointments')}
            className="inline-flex items-center gap-1.5 bg-white border border-[#BBF7D0] text-slate-800 hover:bg-[#F0FDF4] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#16a34a]" /> Excel
          </button>
          <button
            onClick={fetchAppointments}
            className="p-2 bg-[#F0FDF4] text-[#16a34a] border border-[#BBF7D0] rounded-xl hover:bg-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-[#16a34a]" />
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CARD */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#16a34a] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search patient name, phone, email, or Ref ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none text-xs font-medium text-slate-900 bg-white"
            />
          </div>
          <button
            type="submit"
            style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
            className="px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-sm hover:opacity-95 transition-all shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Branch</label>
            <select
              value={branchId}
              onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none font-medium bg-white text-slate-900 cursor-pointer"
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Specialty</label>
            <select
              value={serviceId}
              onChange={(e) => { setServiceId(e.target.value); setPage(1); }}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none font-medium bg-white text-slate-900 cursor-pointer"
            >
              <option value="">All Services</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none font-medium bg-white text-slate-900 cursor-pointer"
            >
              <option value="">All Active (Pending & Confirmed)</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none font-medium bg-white text-slate-900 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* APPOINTMENTS CONTAINER */}
      <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-[#16a34a] font-bold text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-[#16a34a]" /> Loading active patient appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            No active appointments pending or confirmed. (Completed & Cancelled records are in the History page).
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="block sm:hidden divide-y divide-[#BBF7D0]/50">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 space-y-3 bg-white">
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-extrabold text-xs text-slate-900 bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#BBF7D0]">
                      {apt.appointment_id}
                    </span>
                    
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border outline-none cursor-pointer ${
                        apt.status === 'Confirmed' ? 'bg-green-100 text-[#166534] border-green-200' :
                        apt.status === 'Completed' ? 'bg-green-100 text-[#15803d] border-[#BBF7D0]' :
                        apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{apt.patient_name}</h4>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-[#16a34a]" /> {apt.phone}
                    </p>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#16a34a]" /> {apt.email}
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
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                      </button>
                    )}
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
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Patient Info</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Branch</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Service</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Date & Time</th>
                    <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Status</th>
                    <th className="py-4 px-6 font-extrabold whitespace-nowrap text-slate-800 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BBF7D0]/40">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-extrabold text-slate-900 whitespace-nowrap">{apt.appointment_id}</td>
                      <td className="py-4 px-4 min-w-[190px]">
                        <p className="font-bold text-slate-900 text-sm">{apt.patient_name}</p>
                        <p className="text-slate-500 font-medium">{apt.phone} • {apt.email}</p>
                      </td>
                      <td className="py-4 px-4 font-medium whitespace-nowrap">{apt.branch_name}</td>
                      <td className="py-4 px-4 font-medium min-w-[140px]">{apt.service_name}</td>
                      <td className="py-4 px-4 font-semibold text-slate-900 whitespace-nowrap">{formatDate(apt.appointment_date)} <span className="text-[#16a34a]">@ {apt.appointment_time}</span></td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold border outline-none cursor-pointer ${
                            apt.status === 'Confirmed' ? 'bg-green-100 text-[#166534] border-green-200' :
                            apt.status === 'Completed' ? 'bg-green-100 text-[#15803d] border-[#BBF7D0]' :
                            apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/appointments/${apt.id}`}
                            className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-[#F0FDF4] transition-colors flex items-center justify-center"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDelete(apt.id)}
                              className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* PAGINATION */}
        <div className="p-4 bg-[#F0FDF4] border-t border-[#BBF7D0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-medium text-center sm:text-left">
            Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalRecords} active records)
          </span>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-xl border border-[#BBF7D0] bg-white disabled:opacity-40 font-bold cursor-pointer"
            >
              Prev
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3.5 py-1.5 rounded-xl border border-[#BBF7D0] bg-white disabled:opacity-40 font-bold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Appointments;
