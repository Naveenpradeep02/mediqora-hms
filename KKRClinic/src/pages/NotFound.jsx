import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
      <div className="w-16 h-16 rounded-3xl bg-green-100 text-[#16a34a] flex items-center justify-center font-black text-2xl">
        404
      </div>
      <h1 className="text-3xl font-black text-slate-900">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm">The requested RRK Clinic portal page does not exist or has been moved.</p>
      <Link to="/" className="px-5 py-2.5 rounded-2xl bg-[#16a34a] text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Return to RRK Booking Portal
      </Link>
    </div>
  );
};

export default NotFound;
