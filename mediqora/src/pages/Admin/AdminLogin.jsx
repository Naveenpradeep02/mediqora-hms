import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../../assets/sreeram-logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      toast.success('Logged in successfully');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Soft Green Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="bg-white p-3 rounded-2xl border border-[#BBF7D0] inline-block shadow-sm mb-1">
            <img src={logoImg} alt="Shree Ram Homeo Logo" className="h-12 w-auto object-contain mx-auto" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Doctor Desk</h1>
          <p className="text-xs text-slate-600 font-medium">Shree Ram Homeo Clinical Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl border border-[#BBF7D0] shadow-xl space-y-6">
          <div className="pb-4 border-b border-[#BBF7D0]/50 text-center">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#16a34a]" /> Authorized Doctor Sign In
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.selvakumarr@gmail.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
              className="w-full inline-flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-xl shadow-lg transition-all hover:opacity-95 text-sm disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" /> Authenticating Doctor...
                </>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 font-medium">
          &copy; 2026 Shree Ram Homeo Admin Portal. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default AdminLogin;
