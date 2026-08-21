import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Stethoscope,
  PlusCircle,
  ShieldCheck,
  Send
} from 'lucide-react';
import logoImg from '../assets/LOGO-EDIT 1.png';
import { formatDate } from '../utils/dateHelpers';

const Success = () => {
  const location = useLocation();
  const appointment = location.state?.appointment;

  if (!appointment) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F0FDF4] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-[#BBF7D0] shadow-2xl overflow-hidden"
        >
          {/* Top Success Header */}
          <div className="bg-[#F0FDF4] border-b border-[#BBF7D0] p-8 text-center space-y-4">
            
            {/* Big Clinic Logo */}
            <div className="py-2">
              <img
                src={logoImg}
                alt="Shree Ram Homeo Logo"
                className="h-24 sm:h-28 w-auto mx-auto object-contain drop-shadow-xs"
              />
            </div>

            {/* Prominent Check Badge Icon */}
            <div
              style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30 ring-4 ring-white"
            >
              <CheckCircle2 className="w-10 h-10 text-white shrink-0" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Booking Confirmed!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Your consultation appointment has been stored in our system.
              </p>
            </div>

            {/* Appointment Reference ID Box */}
            <div className="inline-block bg-white border border-[#BBF7D0] px-6 py-3 rounded-2xl shadow-xs">
              <span className="text-[10px] text-[#16a34a] font-extrabold uppercase tracking-wider block">
                Appointment Reference ID
              </span>
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 mt-0.5 block">
                {appointment.appointmentId || appointment.appointment_id}
              </span>
            </div>

          </div>

          {/* Email Notification Banner */}
          <div
            style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
            className="px-6 py-2.5 flex items-center justify-center gap-2 text-xs font-extrabold text-center"
          >
            <Send className="w-4 h-4 text-white shrink-0" />
            <span>Confirmation email sent to <strong>{appointment.email}</strong>.</span>
          </div>

          {/* Details Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-[#BBF7D0]/50 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#16a34a]" /> Appointment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#16a34a]" /> {appointment.patientName || appointment.patient_name}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Phone Number</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#16a34a]" /> {appointment.phone}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Specialty</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#16a34a]" /> {appointment.serviceName || appointment.service_name}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Hospital Branch</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#16a34a]" /> {appointment.branchName || appointment.branch_name}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Appointment Date</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#16a34a]" /> {formatDate(appointment.appointmentDate || appointment.appointment_date)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Time Slot</span>
                <span className="font-bold text-[#16a34a] text-sm mt-0.5 block flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#16a34a]" /> {appointment.appointmentTime || appointment.appointment_time}
                </span>
              </div>
            </div>

            {/* Address Box */}
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl space-y-1 text-xs">
              <span className="text-[10px] text-[#16a34a] font-bold uppercase tracking-wider block">Clinic Location Address</span>
              <p className="font-bold text-slate-900">{appointment.branchAddress || appointment.branch_address}</p>
            </div>

            {/* Guidelines */}
            <div className="p-4 bg-green-50 border border-[#BBF7D0] rounded-2xl text-xs text-slate-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs text-slate-900">
                <ShieldCheck className="w-4 h-4 text-[#16a34a]" /> Pre-Visit Guidelines:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[#15803d] text-[11px]">
                <li>Please arrive 10-15 minutes prior to your 30-minute consultation slot.</li>
                <li>Bring previous prescriptions, medical reports, or blood work.</li>
                <li>Present this receipt or your Reference ID at the reception.</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Link
                to="/"
                style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                className="inline-flex items-center justify-center gap-2 font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md hover:opacity-95 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Book Another Appointment</span>
              </Link>
            </div>

          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Success;
