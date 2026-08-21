import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  UserPlus,
  CheckCircle2,
  Calendar,
  DollarSign,
  PlusCircle,
  Stethoscope,
  Printer,
  Users,
  Search,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredAppointments, saveAppointments, defaultDoctors, defaultServices } from '../../services/dataService';
import toast from 'react-hot-toast';

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(getStoredAppointments);

  // Walk-in Registration Form State
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorId, setDoctorId] = useState('DOC-RAJAN');
  const [service, setService] = useState('General & Preventive Consultation');
  const [paymentMethod, setPaymentMethod] = useState('Paid (Cash)');

  const todayStr = '2026-08-09';
  const todayApts = appointments.filter(a => a.date === todayStr);

  const checkedInCount = todayApts.filter(a => a.status === 'Checked In' || a.status === 'Pending').length;
  const inConsultCount = todayApts.filter(a => a.status === 'In Consultation').length;
  const completedCount = todayApts.filter(a => a.status === 'Completed').length;

  // Handle Quick Walk-in Registration by Receptionist
  const handleWalkInRegistration = (e) => {
    e.preventDefault();
    if (!patientName || !phone) {
      toast.error('Patient Name and Phone are required');
      return;
    }

    const assignedDoc = defaultDoctors.find(d => d.id === doctorId);
    const nextTokenNo = `T-0${todayApts.length + 1}`;
    const newAptId = `RRK-${Date.now().toString().slice(-6)}`;

    const newApt = {
      id: Date.now(),
      appointmentId: newAptId,
      patientName,
      phone,
      email: `${patientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      doctor: assignedDoc?.name || 'Dr. R.R. Rajan',
      doctorId: doctorId,
      service,
      branch: 'RRK Clinic - Anna Nagar Main',
      date: todayStr,
      time: 'Just Arrived (Walk-in)',
      status: 'Checked In',
      tokenNo: nextTokenNo,
      paymentStatus: paymentMethod,
      remarks: 'Front desk walk-in registration.'
    };

    const updated = [newApt, ...appointments];
    setAppointments(updated);
    saveAppointments(updated);

    toast.success(`🎉 Walk-in Registered! Token: ${nextTokenNo} assigned for ${assignedDoc?.name}.`);
    setPatientName('');
    setPhone('');
  };

  const handleUpdateStatus = (aptId, newStatus) => {
    const updated = appointments.map(a => a.id === aptId ? { ...a, status: newStatus } : a);
    setAppointments(updated);
    saveAppointments(updated);
    toast.success(`Appointment status updated to "${newStatus}".`);
  };

  const handleUpdatePayment = (aptId, newPayment) => {
    const updated = appointments.map(a => a.id === aptId ? { ...a, paymentStatus: newPayment } : a);
    setAppointments(updated);
    saveAppointments(updated);
    toast.success(`Payment updated to "${newPayment}".`);
  };

  return (
    <div className="space-y-8 font-sans pb-8">
      
      {/* RECEPTION DESK HERO BANNER (TEAL / OCEAN BLUE THEME) */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#15803d] to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/30">
              <Clock className="w-3.5 h-3.5 text-teal-200" />
              <span>Front Desk Reception & Token Manager</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Reception Console ({user?.name || 'Priya'})
            </h1>

            <p className="text-xs sm:text-sm text-teal-100 font-medium max-w-xl">
              Walk-in Patient Check-in, OPD Token Generator, and Consultation Fee Collection.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-200" />
              <span>Today: Sunday, Aug 9</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK RECEPTION STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Waiting Lobby Queue</span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">{checkedInCount} Patients</span>
            <span className="text-xs text-amber-700 font-bold mt-1 inline-block">Checked In & Ready</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">In Doctor Room</span>
            <span className="text-3xl font-black text-[#16a34a] mt-1 block">{inConsultCount} Patients</span>
            <span className="text-xs text-[#15803d] font-bold mt-1 inline-block">Under OPD Consultation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Completed Today</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">{completedCount} Patients</span>
            <span className="text-xs text-emerald-700 font-bold mt-1 inline-block">Consultations Done</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* QUICK WALK-IN REGISTRATION FORM */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center font-black">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Walk-In Patient Quick Registration & Token Generator</h2>
              <p className="text-xs text-slate-500 font-medium">Issue instant OPD token for arriving walk-in patients</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleWalkInRegistration} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Patient Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Kumar"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="+91 98401 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Assigned Doctor *</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              {defaultDoctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Fee Payment Mode *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Paid (Cash)">Paid (Cash)</option>
              <option value="Paid (UPI)">Paid (UPI)</option>
              <option value="Paid (Card)">Paid (Card)</option>
              <option value="Pending">Payment Pending</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Issue Token
            </button>
          </div>
        </form>
      </div>

      {/* FRONT DESK PATIENT QUEUE TABLE */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-green-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Reception Lobby Queue & Status Manager</h3>
            <p className="text-xs text-slate-500 font-medium">Update patient check-in status and payment receipts</p>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[800px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Token</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Patient Info</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Assigned Doctor</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Payment Status</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Queue Status</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">Quick Update Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {todayApts.map((apt) => (
                <tr key={apt.id} className="hover:bg-green-50/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-black text-[#15803d] text-xs whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-green-100 text-[#14532d] border border-green-200 font-black">
                      {apt.tokenNo || 'T-01'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 min-w-[150px]">
                    {apt.patientName}
                    <p className="text-[10px] text-slate-400 font-normal">{apt.phone}</p>
                  </td>
                  <td className="py-4 px-4 font-bold text-[#14532d] whitespace-nowrap">
                    {apt.doctor}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <select
                      value={apt.paymentStatus}
                      onChange={(e) => handleUpdatePayment(apt.id, e.target.value)}
                      className="p-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-800"
                    >
                      <option value="Paid (Cash)">Paid (Cash)</option>
                      <option value="Paid (UPI)">Paid (UPI)</option>
                      <option value="Paid (Card)">Paid (Card)</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border ${
                      apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      apt.status === 'In Consultation' ? 'bg-green-100 text-[#166534] border-green-300' :
                      apt.status === 'Checked In' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {apt.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'Checked In')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-extrabold text-[10px]"
                        >
                          Check In
                        </button>
                      )}
                      {apt.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px]"
                        >
                          Mark Completed
                        </button>
                      )}
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

export default ReceptionistDashboard;
