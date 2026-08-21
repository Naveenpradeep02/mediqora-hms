import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, Calendar } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
          <h2 className="text-lg font-bold text-slate-700 mt-1">Page Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-colors"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
          <Link
            to="/booking"
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            <Calendar className="w-4 h-4 text-teal-600" /> Book an Appointment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
