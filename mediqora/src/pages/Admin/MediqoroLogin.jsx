import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Shield, Loader2, ArrowRight, Crown, Sparkles, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import mediqoraLogo from '../../assets/mediqora.png';

const MediqoroLogin = () => {
  const [email, setEmail] = useState('info@mediqora.in');
  const [password, setPassword] = useState('superadmin123');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter Mediqoro master email and password');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      toast.success('Welcome back, Srija! Mediqoro Master Portal Connected.');
      navigate('/admin/saas');
    }
  };

  return (
    <div className="min-h-screen bg-green-50/40 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Soft Emerald Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Mediqoro Brand Header */}
        <div className="text-center space-y-3">
          <div className="bg-white p-3 rounded-3xl border border-[#BBF7D0] inline-block shadow-lg shadow-emerald-500/10">
            <img src={mediqoraLogo} alt="Mediqora Logo" className="h-14 w-auto object-contain mx-auto" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#16a34a]" /> MEDIQORO SAAS MASTER
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">Mediqoro Platform</h1>
            <p className="text-xs text-slate-600 font-medium mt-1">Srija (Master Platform Owner) Sign In</p>
          </div>
        </div>

        {/* Mediqoro White & Emerald Master Login Card */}
        <div className="bg-white p-8 rounded-3xl border border-[#BBF7D0] shadow-2xl shadow-emerald-900/10 space-y-6">
          <div className="pb-4 border-b border-[#BBF7D0] text-center">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-[#16a34a]" /> Mediqoro Master Sign In
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Master Owner Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@mediqora.in"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#16a34a] text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Master Password</label>
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
              className="w-full inline-flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-green-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" /> Authenticating Mediqoro Master...
                </>
              ) : (
                <>
                  <span>Sign In as Mediqoro Master</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Mediqoro Feature Badges */}
          <div className="pt-4 border-t border-[#BBF7D0] text-xs space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>Master Access Capabilities:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
              <div className="p-2.5 rounded-xl bg-green-50/70 border border-[#BBF7D0] flex items-center gap-2 text-[#15803d]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                <span>Multi-Client List</span>
              </div>
              <div className="p-2.5 rounded-xl bg-green-50/70 border border-[#BBF7D0] flex items-center gap-2 text-[#15803d]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                <span>SaaS License Pause</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 font-medium pt-2">
          &copy; 2026 MEDIQORA || HMS Master Portal. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default MediqoroLogin;
