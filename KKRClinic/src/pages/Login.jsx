import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Stethoscope,
  Clock,
  Lock,
  Mail,
  Loader2,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, demoAccounts } = useAuth();
  
  // Default to Admin tab
  const [selectedRole, setSelectedRole] = useState('admin');
  const [selectedDoctorId, setSelectedDoctorId] = useState('USR-DOC-001');

  const [email, setEmail] = useState('admin@rrkclinic.com');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role switching handler on login page
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === 'admin') {
      setEmail('admin@rrkclinic.com');
      setPassword('admin123');
    } else if (roleKey === 'doctor') {
      const doc = demoAccounts.find(a => a.id === selectedDoctorId) || demoAccounts[1];
      setEmail(doc.email);
      setPassword(doc.password);
    } else if (roleKey === 'receptionist') {
      setEmail('receptionist@rrkclinic.com');
      setPassword('reception123');
    }
  };

  const handleDoctorSelect = (docId) => {
    setSelectedDoctorId(docId);
    const doc = demoAccounts.find(a => a.id === docId);
    if (doc) {
      setEmail(doc.email);
      setPassword(doc.password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'doctor') navigate('/admin/doctor-dashboard');
      else if (res.user.role === 'receptionist') navigate('/admin/receptionist-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Emerald Green Background Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>RRK Clinic Staff Authorization Portal</span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#16a34a] to-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/30">
            R
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">RRK CLINIC</h1>
        </div>

        <p className="text-xs text-slate-400 font-medium">Select your portal role below to sign in with your staff account.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        
        {/* Dedicated Separate Role Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-[#16a34a] text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('doctor')}
            className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
              selectedRole === 'doctor'
                ? 'bg-[#16a34a] text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('receptionist')}
            className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
              selectedRole === 'receptionist'
                ? 'bg-[#16a34a] text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Receptionist</span>
          </button>
        </div>

        {/* Doctor Sub-Account Picker (If Doctor Role Selected) */}
        {selectedRole === 'doctor' && (
          <div className="mb-6 bg-slate-800/60 p-3 rounded-2xl border border-emerald-500/30 space-y-2">
            <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider block">
              Select Doctor Account:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.filter(a => a.role === 'doctor').map(doc => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleDoctorSelect(doc.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedDoctorId === doc.id
                      ? 'bg-emerald-600/30 border-emerald-500 text-white'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-extrabold text-xs text-white">{doc.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{doc.specialty}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Portal Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                {selectedRole === 'admin' && 'Hospital Administrator Portal'}
                {selectedRole === 'doctor' && 'Doctor OPD Desk Portal'}
                {selectedRole === 'receptionist' && 'Front Desk & Patient Registrar Portal'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Enter credentials to authenticate into {selectedRole} view</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900 text-emerald-300 border border-slate-700 uppercase">
              {selectedRole}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">Staff Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="staff@rrkclinic.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Credential Hint Info Box */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-400 space-y-1">
              <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Login Credentials:</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Email: <span className="text-white font-semibold">{email}</span> | Pass: <span className="text-white font-semibold">{password}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-white bg-gradient-to-r from-[#16a34a] to-emerald-600 hover:from-green-600 hover:to-emerald-500 shadow-emerald-600/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating Staff...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole === 'admin' ? 'Administrator' : selectedRole === 'doctor' ? 'Doctor' : 'Receptionist'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Login;
