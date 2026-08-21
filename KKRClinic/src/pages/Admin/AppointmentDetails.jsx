import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope, FileText, CheckCircle2, Clock, User, Phone, Mail, MapPin } from 'lucide-react';
import { getStoredAppointments, saveAppointments } from '../../services/dataService';
import toast from 'react-hot-toast';

const AppointmentDetails = () => {
  const { id } = useParams();
  const [appointments, setAppointments] = useState(getStoredAppointments);
  const apt = appointments.find(a => String(a.id) === String(id)) || appointments[0];

  const handleStatusChange = (newStatus) => {
    if (!apt) return;
    const updated = appointments.map(a => a.id === apt.id ? { ...a, status: newStatus } : a);
    setAppointments(updated);
    saveAppointments(updated);

    if (newStatus === 'Completed' || newStatus === 'Cancelled') {
      toast.success(`Status updated to "${newStatus}". Moved to Appointment History.`);
    } else {
      toast.success(`Status updated to "${newStatus}".`);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-8">
      <Link to="/admin/appointments" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#16a34a] hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Master Appointments
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#16a34a] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
              Token {apt?.tokenNo || 'T-01'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{apt?.patientName}</h1>
            <p className="text-xs text-slate-400 font-mono">Ref ID: {apt?.appointmentId}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-600">Update Status:</span>
            <select
              value={apt?.status || 'Confirmed'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                apt?.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                apt?.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                apt?.status === 'In Consultation' ? 'bg-green-100 text-[#166534] border-green-300' :
                apt?.status === 'Checked In' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed (History)</option>
              <option value="Cancelled">Cancelled (History)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 uppercase text-[11px] text-[#15803d]">Patient Details</h3>
            <p><strong className="text-slate-700">Phone:</strong> {apt?.phone}</p>
            <p><strong className="text-slate-700">Email:</strong> {apt?.email}</p>
            <p><strong className="text-slate-700">Age & Gender:</strong> {apt?.age || 35} yrs, {apt?.gender || 'Male'}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 uppercase text-[11px] text-[#15803d]">Consultation Details</h3>
            <p><strong className="text-slate-700">Assigned Doctor:</strong> {apt?.doctor}</p>
            <p><strong className="text-slate-700">Medical Service:</strong> {apt?.service}</p>
            <p><strong className="text-slate-700">Date & Time:</strong> {apt?.date} @ {apt?.time}</p>
            <p><strong className="text-slate-700">Payment Status:</strong> {apt?.paymentStatus}</p>
          </div>
        </div>

        {/* Prescription & Clinical Notes */}
        <div className="p-5 rounded-2xl bg-green-50/60 border border-green-200 space-y-3 text-xs">
          <h3 className="font-extrabold text-[#14532d] uppercase text-xs flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#16a34a]" /> Clinical Notes & E-Prescription
          </h3>
          <p><strong>Chief Complaints:</strong> {apt?.remarks || 'Routine OPD evaluation'}</p>
          <p><strong>Diagnosis:</strong> {apt?.diagnosis || 'Pending doctor entry'}</p>
          <div className="p-3 rounded-xl bg-white border border-green-200 font-mono text-slate-800">
            <strong>Prescription:</strong> {apt?.prescription || 'No medicines logged yet.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
