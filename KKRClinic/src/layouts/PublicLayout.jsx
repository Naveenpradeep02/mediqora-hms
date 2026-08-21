import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Stethoscope, Calendar, Phone, MapPin, Clock, ShieldCheck, HeartPulse } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      
      {/* Top Contact Bar */}
      <div className="bg-emerald-950 text-white py-2 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-300" /> Helpline: +91 44 2621 1122</span>
            <span className="hidden sm:flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-300" /> Anna Nagar & T. Nagar, Chennai</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-200"><Clock className="w-3.5 h-3.5 text-emerald-300" /> OPD Hours: 09:00 AM - 09:00 PM</span>
            <Link to="/login" className="bg-[#16a34a] hover:bg-emerald-500 text-white px-3 py-0.5 rounded-full font-bold text-[11px] transition-all">
              Staff Portal Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-green-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#16a34a] to-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-emerald-500/30">
              K
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight block leading-tight">RRK CLINIC</span>
              <span className="text-[10px] font-extrabold text-[#16a34a] tracking-widest uppercase block">Multispecialty Hospital</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/booking"
              className="px-5 py-2.5 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Book Appointment
            </Link>
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#16a34a] text-white font-black flex items-center justify-center text-sm">K</div>
            <span className="font-extrabold text-white text-sm">RRK Clinic & Multispecialty Hospital</span>
          </div>
          <p className="text-slate-400 text-xs">Excellence in General Medicine, Cardiology, Pediatrics, and Gynaecology.</p>
          <p className="text-slate-500 text-[11px]">© 2026 RRK Clinic. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default PublicLayout;
