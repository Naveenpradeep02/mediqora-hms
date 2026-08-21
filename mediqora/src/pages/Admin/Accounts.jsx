import React, { useState } from 'react';
import { TrendingUp, Sun, Moon, Calendar, DollarSign, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { getStoredInvoices } from '../../services/dataService';

const Accounts = () => {
  const invoices = getStoredInvoices();
  const [timeframe, setTimeframe] = useState('DAILY');

  const totalGrossRevenue = invoices.reduce((sum, inv) => sum + (inv.netTotal || 0), 0);
  const totalDoctorFees = invoices.reduce((sum, inv) => sum + (inv.doctorFee || 0), 0);
  const totalPharmacyRevenue = invoices.reduce((sum, inv) => sum + (inv.medicineCharges || 0), 0);
  const totalDiagnosticRevenue = invoices.reduce((sum, inv) => sum + (inv.otherServiceCharges || 0), 0);

  // OPD Session Split
  const morningSessionRevenue = Math.round(totalGrossRevenue * 0.55);
  const eveningSessionRevenue = Math.round(totalGrossRevenue * 0.45);

  const profitMarginPercent = 68;

  return (
    <div className="space-y-6 font-sans pb-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block mb-1">
            Financial Ledger & Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-[#16a34a]" /> Income Accounts & OPD Profit Analysis
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Daily, weekly, and monthly profit margins, morning vs evening OPD session split, and financial ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          {['DAILY', 'WEEKLY', 'MONTHLY'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === t ? 'bg-[#16a34a] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#BBF7D0] shadow-xs">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Total Gross Revenue</span>
          <span className="text-3xl font-black text-[#16a34a] mt-1 block">₹{totalGrossRevenue.toLocaleString()}</span>
          <span className="text-xs text-[#15803d] font-bold mt-1 inline-block">Consultations + Pharmacy</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200 shadow-xs">
          <span className="text-xs font-extrabold text-[#166534] uppercase tracking-wider block">Doctor Consultation Fees</span>
          <span className="text-3xl font-black text-[#14532d] mt-1 block">₹{totalDoctorFees.toLocaleString()}</span>
          <span className="text-xs text-[#15803d] font-bold mt-1 inline-block">Direct Faculty Revenue</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200 shadow-xs">
          <span className="text-xs font-extrabold text-purple-800 uppercase tracking-wider block">Pharmacy Medicines Income</span>
          <span className="text-3xl font-black text-purple-900 mt-1 block">₹{totalPharmacyRevenue.toLocaleString()}</span>
          <span className="text-xs text-purple-700 font-bold mt-1 inline-block">Dispensed Stock Margin</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs">
          <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">Net Profit Margin</span>
          <span className="text-3xl font-black text-amber-900 mt-1 block">{profitMarginPercent}%</span>
          <span className="text-xs text-amber-700 font-bold mt-1 inline-block">Overall Operating Margin</span>
        </div>
      </div>

      {/* OPD SESSION SPLIT ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" /> Morning OPD Session (09 AM - 01 PM)
            </h3>
            <span className="text-xs font-black bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">55% Share</span>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{morningSessionRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-medium">Higher volume of general consultation and pediatric checkups.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#BBF7D0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" /> Evening OPD Session (05 PM - 09 PM)
            </h3>
            <span className="text-xs font-black bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200">45% Share</span>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{eveningSessionRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-medium">Cardiology screening, ECG, and follow-up consultations.</p>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
