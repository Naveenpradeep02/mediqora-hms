import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, Stethoscope, Clock, Phone, MapPin, Printer, ArrowRight } from 'lucide-react';

const Success = () => {
  const location = useLocation();
  const booking = location.state?.booking || {
    appointmentId: 'RRK-20260809-101',
    tokenNo: 'T-01',
    patientName: 'Karthik Subramanian',
    doctor: 'Dr. R.R. Rajan',
    service: 'General & Preventive Consultation',
    branch: 'RRK Clinic - Anna Nagar Main',
    date: '2026-08-09',
    time: '10:30 AM'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-2xl mx-auto font-sans space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-green-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <div>
          <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            Appointment Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            OPD Token Issued Successfully!
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Please show this OPD token at RRK Clinic Reception desk upon arrival.</p>
        </div>

        {/* TOKEN CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-green-950 text-white space-y-4 shadow-lg text-left">
          <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
            <div>
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">OPD TOKEN NUMBER</span>
              <span className="text-3xl font-black text-white">{booking.tokenNo}</span>
            </div>
            <span className="font-mono text-xs text-emerald-200 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-700">
              {booking.appointmentId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-emerald-300 font-bold uppercase text-[10px] block">Patient Name</span>
              <span className="text-white font-extrabold text-sm">{booking.patientName}</span>
            </div>
            <div>
              <span className="text-emerald-300 font-bold uppercase text-[10px] block">Assigned Doctor</span>
              <span className="text-white font-extrabold text-sm">{booking.doctor}</span>
            </div>
            <div>
              <span className="text-emerald-300 font-bold uppercase text-[10px] block">Medical Service</span>
              <span className="text-white font-extrabold">{booking.service}</span>
            </div>
            <div>
              <span className="text-emerald-300 font-bold uppercase text-[10px] block">Date & Time</span>
              <span className="text-white font-extrabold">{booking.date} @ {booking.time}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print OPD Token Receipt
          </button>
          <Link
            to="/booking"
            className="py-3 px-6 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Book Another Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
