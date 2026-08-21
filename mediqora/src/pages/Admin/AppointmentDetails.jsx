import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  Download,
  Printer,
  Save,
  Loader2
} from 'lucide-react';
import API from '../../services/api';
import { generateAppointmentPDF, printAppointmentSlip } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/appointments/${id}`);
      if (res.data.success) {
        setAppointment(res.data.appointment);
        setAdminNotes(res.data.appointment.admin_notes || '');
      }
    } catch (err) {
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await API.patch(`/appointments/${appointment.id}/status`, {
        status: appointment.status,
        adminNotes
      });
      if (res.data.success) {
        toast.success('Admin notes saved successfully!');
        fetchDetails();
      }
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await API.patch(`/appointments/${appointment.id}/status`, { status: newStatus });
      if (res.data.success) {
        if (newStatus === 'Completed' || newStatus === 'Cancelled') {
          toast.success(`Appointment status updated to ${newStatus} & moved to History log`);
          navigate('/admin/history');
        } else {
          toast.success(`Status updated to ${newStatus}`);
          fetchDetails();
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2 text-[#16a34a] font-bold text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-[#16a34a]" /> Loading Appointment Details...
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-600 font-medium">Appointment not found.</p>
        <Link to="/admin/appointments" className="text-[#16a34a] font-bold hover:underline">
          &larr; Back to Appointments List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Navigation & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to={appointment.status === 'Completed' || appointment.status === 'Cancelled' ? '/admin/history' : '/admin/appointments'}
            className="p-2.5 rounded-2xl bg-[#F0FDF4] text-[#16a34a] hover:bg-white border border-[#BBF7D0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
          </Link>
          <div>
            <span className="text-[10px] font-extrabold text-[#16a34a] uppercase tracking-wider">Reference ID: {appointment.appointment_id}</span>
            <h1 className="text-xl font-extrabold text-slate-900">{appointment.patient_name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generateAppointmentPDF(appointment)}
            className="inline-flex items-center gap-1.5 bg-white border border-[#BBF7D0] text-slate-800 hover:bg-[#F0FDF4] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#16a34a]" /> PDF Slip
          </button>
          <button
            onClick={() => printAppointmentSlip(appointment)}
            className="inline-flex items-center gap-1.5 bg-white border border-[#BBF7D0] text-slate-800 hover:bg-[#F0FDF4] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#16a34a]" /> Print
          </button>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Card */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-[#BBF7D0]/50 flex items-center gap-2">
            <User className="w-5 h-5 text-[#16a34a]" /> Patient & Consultation Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Patient Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{appointment.patient_name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Phone Number</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{appointment.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Email Address</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{appointment.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Hospital Branch</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{appointment.branch_name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Medical Service</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{appointment.service_name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Scheduled Time</span>
              <p className="font-bold text-[#16a34a] text-sm mt-0.5">{formatDate(appointment.appointment_date)} @ {appointment.appointment_time}</p>
            </div>
          </div>

          {/* Patient Remarks */}
          {appointment.remarks && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Patient Symptoms / Remarks</span>
              <p className="text-slate-800 font-medium leading-relaxed">{appointment.remarks}</p>
            </div>
          )}

          {/* Admin Notes Form */}
          <div className="pt-4 border-t border-[#BBF7D0]/50 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              Doctor / Admin Internal Clinical Notes
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal consultation notes, remedy recommendations, or follow-up dates..."
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none text-xs font-medium text-slate-900 bg-white"
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                className="inline-flex items-center gap-2 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-green-500/20 hover:opacity-95 cursor-pointer"
              >
                {savingNotes ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
                <span>Save Admin Notes</span>
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Status Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-6 h-fit">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-[#BBF7D0]/50">
            Booking Status Management
          </h3>

          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-center space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Status</span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
              appointment.status === 'Confirmed' ? 'bg-green-100 text-[#166534]' :
              appointment.status === 'Completed' ? 'bg-green-100 text-[#15803d]' :
              appointment.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {appointment.status}
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 block">Quick Action Update:</span>
            <button
              onClick={() => handleUpdateStatus('Confirmed')}
              className="w-full py-2.5 px-3 bg-green-50 text-[#15803d] hover:bg-green-100 font-bold rounded-xl text-xs transition-colors border border-green-200 text-left flex items-center justify-between cursor-pointer"
            >
              <span>✓ Mark as Confirmed</span>
            </button>
            <button
              onClick={() => handleUpdateStatus('Completed')}
              className="w-full py-2.5 px-3 bg-green-50 text-[#16a34a] hover:bg-green-100 font-bold rounded-xl text-xs transition-colors border border-[#BBF7D0] text-left flex items-center justify-between cursor-pointer"
            >
              <span>✓ Mark as Completed</span>
              <span className="text-[10px] text-[#16a34a] font-normal">Moves to History &rarr;</span>
            </button>
            <button
              onClick={() => handleUpdateStatus('Cancelled')}
              className="w-full py-2.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-xs transition-colors border border-rose-200 text-left flex items-center justify-between cursor-pointer"
            >
              <span>✕ Mark as Cancelled</span>
              <span className="text-[10px] text-rose-600 font-normal">Moves to History &rarr;</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AppointmentDetails;
