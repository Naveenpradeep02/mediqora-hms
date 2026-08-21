import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  Building2,
  ArrowUpRight,
  Eye,
  Loader2,
  BarChart3,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { formatDate } from '../../utils/dateHelpers';

const Dashboard = () => {
  const { user, selectedClient } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/dashboard/stats');
        if (res.data.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`flex items-center gap-3 font-bold text-sm ${isSuperAdmin ? 'text-[#16a34a]' : 'text-[#16a34a]'}`}>
          <Loader2 className="w-6 h-6 animate-spin" /> Loading Dashboard Analytics...
        </div>
      </div>
    );
  }

  const { stats, branchCounts, serviceCounts, recentAppointments } = dashboardData || {};
  const hospitalName = selectedClient ? selectedClient.hospital_name : 'Shree Ram Homeo Hospital';

  const accentBg = isSuperAdmin ? 'bg-[#16a34a] hover:bg-[#15803d] text-white' : 'bg-[#16a34a] hover:opacity-95 text-white';
  const borderTheme = isSuperAdmin ? 'border-[#BBF7D0]' : 'border-[#BBF7D0]';
  const textAccent = isSuperAdmin ? 'text-[#16a34a]' : 'text-[#16a34a]';

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className={`bg-white p-6 sm:p-8 rounded-3xl border ${borderTheme} shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-2 h-full bg-[#16a34a]"></div>
        <div className="pl-3">
          <span className="text-xs font-black uppercase tracking-wider bg-green-100 text-[#15803d] border-[#BBF7D0] px-3 py-1 rounded-full border inline-block mb-1">
            {isSuperAdmin ? `Hospital Overview: ${hospitalName}` : 'Hospital Overview'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {hospitalName} Operational Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Real-time patient bookings, branch operational stats, and service analytics.</p>
        </div>
        <Link
          to="/admin/appointments"
          className={`inline-flex items-center gap-2 font-extrabold px-5 py-3 rounded-2xl text-xs shadow-md transition-all shrink-0 cursor-pointer ${accentBg}`}
        >
          <span>View All Appointments</span> <ArrowUpRight className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Today's Appointments */}
        <div className={`bg-white p-6 rounded-2xl border ${borderTheme} shadow-xs flex items-center justify-between`}>
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Today's Appointments</span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{stats?.todayAppointments || 0}</span>
            <span className={`text-xs ${textAccent} font-bold mt-1 inline-block`}>Scheduled for today</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Pending / New */}
        <div className={`bg-white p-6 rounded-2xl border ${borderTheme} shadow-xs flex items-center justify-between`}>
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Pending / New</span>
            <span className="text-3xl font-extrabold text-amber-600 mt-1 block">{stats?.pendingAppointments || 0}</span>
            <span className="text-xs text-amber-600 font-bold mt-1 inline-block">Awaiting Confirmation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Confirmed */}
        <div className={`bg-white p-6 rounded-2xl border ${borderTheme} shadow-xs flex items-center justify-between`}>
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Completed</span>
            <span className="text-3xl font-extrabold text-[#16a34a] mt-1 block">{stats?.completedAppointments || 0}</span>
            <span className="text-xs text-[#16a34a] font-bold mt-1 inline-block">Successfully Consulted</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white p-6 rounded-2xl border border-[#BBF7D0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Total Patients</span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{stats?.totalPatients || 0}</span>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Unique Contact Numbers</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Services */}
        <div className="bg-white p-6 rounded-2xl border border-[#BBF7D0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Active Services</span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{stats?.totalServices || 0}</span>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Medical Specialties</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-white p-6 rounded-2xl border border-[#BBF7D0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Cancelled</span>
            <span className="text-3xl font-extrabold text-rose-600 mt-1 block">{stats?.cancelledAppointments || 0}</span>
            <span className="text-xs text-rose-500 font-bold mt-1 inline-block">Cancelled Bookings</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Branches Count */}
        <div className="bg-white p-6 rounded-2xl border border-[#BBF7D0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Active Branches</span>
            <span className="text-3xl font-extrabold text-[#16a34a] mt-1 block">{stats?.totalBranches || 2}</span>
            <span className="text-xs text-[#16a34a] font-bold mt-1 inline-block">Anna Nagar & T Nagar</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6 text-[#16a34a]" />
          </div>
        </div>

      </div>

      {/* ANALYTICS & BRANCH BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Branch Distribution */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#16a34a]" /> Branch-wise Appointment Volume
            </h3>
            <span className="text-xs text-slate-500 font-medium">All Time</span>
          </div>

          <div className="space-y-4">
            {branchCounts?.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-green-50/50 border border-[#BBF7D0]/70">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900 text-sm">{b.name}</span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white text-[#16a34a] border border-[#BBF7D0]">
                    {b.appointment_count} Bookings
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#BBF7D0]/50">
                  <div
                    className="h-full bg-[#16a34a] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (b.appointment_count / Math.max(1, (stats?.todayAppointments || 0) + (stats?.confirmedAppointments || 0) + (stats?.completedAppointments || 0) + (stats?.cancelledAppointments || 0))) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services Popularity */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#16a34a]" /> Most Requested Medical Services
            </h3>
            <span className="text-xs text-slate-500 font-medium">Top 6 Specialties</span>
          </div>

          <div className="space-y-3">
            {serviceCounts?.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-green-50/40 border border-[#BBF7D0]/60">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#16a34a] text-white font-extrabold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                </div>
                <span className="text-xs font-extrabold text-[#16a34a] bg-white px-3 py-1 rounded-lg border border-[#BBF7D0]">
                  {s.count} Appointments
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECENT APPOINTMENTS TABLE */}
      <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#BBF7D0]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Recent Patient Bookings</h3>
            <p className="text-xs text-slate-500 font-medium">Latest online appointments received across clinic branches</p>
          </div>
          <Link
            to="/admin/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#16a34a] hover:underline shrink-0 whitespace-nowrap bg-green-50 border border-[#BBF7D0] px-3.5 py-1.5 rounded-xl transition-all"
          >
            <span>View Master List</span> <ArrowUpRight className="w-4 h-4 text-[#16a34a] shrink-0" />
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px] border-collapse">
            <thead className="bg-green-50 text-xs font-extrabold uppercase text-slate-700 border-b border-[#BBF7D0]">
              <tr>
                <th className="py-4 px-6 font-extrabold whitespace-nowrap text-slate-800">Ref ID</th>
                <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Patient Name</th>
                <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Service</th>
                <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Branch</th>
                <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Date & Time</th>
                <th className="py-4 px-4 font-extrabold whitespace-nowrap text-slate-800">Status</th>
                <th className="py-4 px-6 font-extrabold whitespace-nowrap text-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BBF7D0]/40">
              {recentAppointments?.map((apt) => (
                <tr key={apt.id} className="hover:bg-green-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">{apt.appointment_id}</td>
                  <td className="py-4 px-4 font-semibold text-slate-900 min-w-[150px]">{apt.patient_name}</td>
                  <td className="py-4 px-4 font-medium min-w-[130px]">{apt.service_name}</td>
                  <td className="py-4 px-4 text-xs whitespace-nowrap">{apt.branch_name}</td>
                  <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">{formatDate(apt.appointment_date)} <span className="text-[#16a34a]">@ {apt.appointment_time}</span></td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      apt.status === 'Confirmed' ? 'bg-green-100 text-[#166534]' :
                      apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/appointments/${apt.id}`}
                        className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
