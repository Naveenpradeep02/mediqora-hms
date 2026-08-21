import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  Stethoscope,
  ArrowUpRight,
  Eye,
  BarChart3,
  Sparkles,
  DollarSign,
  Activity,
  HeartPulse,
  UserCheck,
  TrendingUp,
  Crown,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredAppointments, defaultDoctors, getStoredSubscription, syncSubscriptionWithBackend } from '../../services/dataService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [appointments] = useState(getStoredAppointments);
  const [subscription, setSubscription] = useState(getStoredSubscription);

  useEffect(() => {
    const fetchSub = async () => {
      const live = await syncSubscriptionWithBackend();
      if (live) setSubscription(live);
    };
    fetchSub();
    const interval = setInterval(fetchSub, 4000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = '2026-08-09';
  const todayApts = appointments.filter(a => a.date === todayStr);

  const totalPatients = new Set(appointments.map(a => a.phone)).size;
  const completedApts = appointments.filter(a => a.status === 'Completed').length;
  const inConsultApts = appointments.filter(a => a.status === 'In Consultation' || a.status === 'Checked In').length;

  // Doctor Workload Metrics
  const rajanApts = appointments.filter(a => a.doctorId === 'DOC-RAJAN');
  const anithaApts = appointments.filter(a => a.doctorId === 'DOC-ANITHA');

  // Revenue estimation
  const totalRevenue = appointments
    .filter(a => a.status === 'Completed' || a.paymentStatus.includes('Paid'))
    .reduce((sum, a) => sum + (a.doctorId === 'DOC-ANITHA' ? 600 : 500), 0);

  return (
    <div className="space-y-8 font-sans pb-8">
      
      {/* HERO EXECUTIVE WELCOME BANNER (GREEN & WHITE THEME) */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#15803d] to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-200 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>RRK Clinic Master Hospital Control</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Hospital Executive Dashboard
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-xl">
              Real-time monitoring across 2 Senior Doctor OPD Desks, Front Desk Reception Token Queue, and Branch Analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/appointments"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Master Appointments</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* MEDIQORA SAAS SUBSCRIPTION LIVE STATUS CARD */}
      {(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let renewalDateObj = null;
        let renewalDateFormatted = subscription?.renewalDate || '2027-08-16';
        if (subscription?.renewalDate) {
          renewalDateObj = new Date(subscription.renewalDate);
          if (typeof subscription.renewalDate === 'string' && subscription.renewalDate.includes('T')) {
            renewalDateFormatted = subscription.renewalDate.split('T')[0];
          }
        }

        let daysRemaining = null;
        if (renewalDateObj && !isNaN(renewalDateObj.getTime())) {
          renewalDateObj.setHours(0, 0, 0, 0);
          const diffTime = renewalDateObj.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const isPaused = Boolean(subscription?.isPaused || subscription?.status?.toLowerCase() === 'paused');
        const isExpired = Boolean((daysRemaining !== null && daysRemaining <= 0) || subscription?.status?.toLowerCase() === 'expired');

        return (
          <>
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-green-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 border ${
                  isPaused 
                    ? 'bg-rose-50 text-rose-600 border-rose-100' 
                    : isExpired 
                    ? 'bg-rose-50 text-rose-600 border-rose-100' 
                    : 'bg-green-50 text-[#16a34a] border-green-100'
                }`}>
                  <Crown className={`w-6 h-6 ${isPaused || isExpired ? 'text-rose-600' : 'text-[#16a34a]'}`} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-[#15803d] tracking-wider bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 font-mono">
                      CLI-RRK-002
                    </span>
                    {isPaused ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        <span>PAUSED</span>
                      </span>
                    ) : isExpired ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>EXPIRED ({Math.abs(daysRemaining || 0)}d ago)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ACTIVE ({daysRemaining !== null ? `${daysRemaining}d left` : 'Active'})</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {subscription?.planName || 'Active Hospital Plan'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Next Expiry: <strong className="text-slate-800">{renewalDateFormatted}</strong> •{' '}
                    {isPaused ? (
                      <strong className="text-rose-600">Access Suspended</strong>
                    ) : isExpired ? (
                      <strong className="text-rose-600">Expired {Math.abs(daysRemaining || 0)} Days Ago</strong>
                    ) : daysRemaining !== null ? (
                      <strong className="text-emerald-700 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{daysRemaining} Days Remaining ({Math.floor(daysRemaining / 30)} months left)</span>
                      </strong>
                    ) : (
                      <span className="text-slate-600">Active</span>
                    )}
                  </p>
                </div>
              </div>

              <Link
                to="/admin/subscription"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all shadow-xs shrink-0 cursor-pointer ${
                  isPaused || isExpired
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-slate-900 hover:bg-[#16a34a] text-white'
                }`}
              >
                <span>{isPaused || isExpired ? 'Renew License Now' : 'Manage / Upgrade Plan'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* PAUSED ACCESS WARNING */}
            {isPaused && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 sm:p-6 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-black text-rose-950 text-sm">
                      Hospital SaaS Operations Paused by Mediqora Admin
                    </h4>
                    <p className="text-rose-700 font-medium leading-relaxed">
                      <strong>Reason:</strong> {subscription?.pauseReason || 'Subscription is paused. Please renew to ensure uninterrupted doctor booking desks.'}
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/subscription"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                >
                  Resolve & Renew
                </Link>
              </div>
            )}

            {/* EXPIRED ACCESS WARNING */}
            {isExpired && !isPaused && (
              <div className="bg-rose-50 border border-rose-300 rounded-3xl p-5 sm:p-6 text-rose-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-black text-rose-950 text-sm">
                      Hospital SaaS Subscription Has Expired
                    </h4>
                    <p className="text-rose-800 font-medium leading-relaxed">
                      Your hospital license ended on <strong>{renewalDateFormatted}</strong> ({Math.abs(daysRemaining || 0)} days overdue). Clinical data desks are locked. Please renew to restore full access.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/subscription"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                >
                  Renew Plan
                </Link>
              </div>
            )}
          </>
        );
      })()}

      {/* HERO METRICS GRID (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Today's Queue */}
        <div className="bg-white p-5 rounded-3xl border border-green-100 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Today's Appointments</span>
            <div className="w-11 h-11 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-[#16a34a]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{todayApts.length}</span>
            <div className="mt-1">
              <span className="text-[11px] font-bold text-[#15803d] bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                Scheduled for Today
              </span>
            </div>
          </div>
        </div>

        {/* Active Patients in OPD Queue */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">OPD Live Queue</span>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-600">{inConsultApts}</span>
            <div className="mt-1">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Checked In / In Consult
              </span>
            </div>
          </div>
        </div>

        {/* Completed Consultations */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Completed Consults</span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-600">{completedApts}</span>
            <div className="mt-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Successfully Consulted
              </span>
            </div>
          </div>
        </div>

        {/* Total Estimated Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-green-100 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">OPD Revenue Collected</span>
            <div className="w-11 h-11 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5 text-[#16a34a]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</span>
            <div className="mt-1">
              <span className="text-[11px] font-bold text-[#15803d] bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                Total Consultation Receipts
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* DOCTORS WORKLOAD SPLIT (DR. R.R. RAJAN & DR. ANITHA RAJAN) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#16a34a]" /> Senior Doctor OPD Workload & Queue Status
          </h2>
          <span className="text-xs font-extrabold text-[#15803d] bg-green-50 px-3 py-1 rounded-full border border-green-200">
            2 Active Doctors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Doctor 1: Dr. R.R. Rajan */}
          <div className="bg-white p-6 rounded-3xl border border-green-100 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20">
                  R
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Dr. R.R. Rajan</h3>
                  <p className="text-xs text-[#15803d] font-bold">General Medicine & Cardiology • OPD #101</p>
                </div>
              </div>
              <span className="text-xs font-black bg-green-50 text-[#15803d] px-3 py-1 rounded-full border border-green-200">
                Fee: ₹500
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Total Bookings</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">{rajanApts.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Completed</span>
                <span className="text-xl font-black text-emerald-700 mt-0.5 block">{rajanApts.filter(a => a.status === 'Completed').length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-extrabold text-amber-700 uppercase block">Pending Queue</span>
                <span className="text-xl font-black text-amber-700 mt-0.5 block">{rajanApts.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length}</span>
              </div>
            </div>
          </div>

          {/* Doctor 2: Dr. Anitha Rajan */}
          <div className="bg-white p-6 rounded-3xl border border-green-100 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
                  A
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Dr. Anitha Rajan</h3>
                  <p className="text-xs text-[#15803d] font-bold">Pediatrics & Gynaecology • OPD #102</p>
                </div>
              </div>
              <span className="text-xs font-black bg-green-50 text-[#15803d] px-3 py-1 rounded-full border border-green-200">
                Fee: ₹600
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Total Bookings</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">{anithaApts.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Completed</span>
                <span className="text-xl font-black text-emerald-700 mt-0.5 block">{anithaApts.filter(a => a.status === 'Completed').length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-extrabold text-amber-700 uppercase block">Pending Queue</span>
                <span className="text-xl font-black text-amber-700 mt-0.5 block">{anithaApts.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MASTER APPOINTMENTS TABLE */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-green-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">Recent Patient Appointments</h3>
              <span className="text-[10px] font-black bg-green-100 text-[#15803d] px-2.5 py-0.5 rounded-full border border-green-200 uppercase">
                RRK Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time consultation status across all OPD desks</p>
          </div>

          <Link
            to="/admin/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-[#16a34a] hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <span>View All Appointments</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Token / Ref ID</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Patient Name</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Assigned Doctor</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Service</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Time</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Status</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {appointments.map((apt) => (
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
                    {apt.time}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border ${
                      apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      apt.status === 'In Consultation' ? 'bg-green-50 text-[#15803d] border-green-200' :
                      apt.status === 'Checked In' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/appointments/${apt.id}`}
                      className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors inline-flex items-center justify-center border border-transparent hover:border-green-200"
                      title="View Consultation Details"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </Link>
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

export default AdminDashboard;
