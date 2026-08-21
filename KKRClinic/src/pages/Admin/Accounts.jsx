import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Stethoscope,
  Pill,
  Syringe,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Sun,
  Moon,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredInvoices, getStoredInventory } from '../../services/dataService';

const Accounts = () => {
  const { user } = useAuth();
  const invoices = getStoredInvoices();
  const inventory = getStoredInventory();

  // Selected timeframe filter: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  const [timeframe, setTimeframe] = useState('DAILY');

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl space-y-3 font-sans max-w-lg mx-auto my-12">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-black text-rose-900">Access Restricted to Hospital Admin</h2>
        <p className="text-xs text-rose-700">Financial Accounts & Profit Ledgers are visible exclusively to Hospital Administrator.</p>
      </div>
    );
  }

  // Calculate Real Ledger Numbers from stored invoices & inventory
  const totalGrossIncome = invoices.reduce((sum, inv) => sum + inv.netTotal, 0);
  const totalDoctorFees = invoices.reduce((sum, inv) => sum + (inv.doctorFee || 0), 0);
  const totalMedicineSales = invoices.reduce((sum, inv) => sum + (inv.medicineCharges || 0), 0);
  const totalInjectionFees = invoices.reduce((sum, inv) => sum + (inv.injectionCharges || 0), 0);
  const totalOtherServicesFees = invoices.reduce((sum, inv) => sum + (inv.otherServiceCharges || 0), 0);

  // Profit Timelines Data (Daily, Weekly, Monthly)
  const profitTimelines = {
    DAILY: {
      label: 'Daily Profit (Today)',
      period: 'Today, 09 Aug 2026',
      grossRevenue: 8450,
      costExpenses: 2150,
      netProfit: 6300,
      profitMargin: 74.6,
      patientsCount: 32,
      morningRevenue: 3850,
      morningProfit: 2950,
      eveningRevenue: 4600,
      eveningProfit: 3350
    },
    WEEKLY: {
      label: 'Weekly Profit (This Week)',
      period: '03 Aug - 09 Aug 2026',
      grossRevenue: 58900,
      costExpenses: 14725,
      netProfit: 44175,
      profitMargin: 75.0,
      patientsCount: 214,
      morningRevenue: 26800,
      morningProfit: 20100,
      eveningRevenue: 32100,
      eveningProfit: 24075
    },
    MONTHLY: {
      label: 'Monthly Profit (This Month)',
      period: 'August 2026',
      grossRevenue: 245000,
      costExpenses: 61250,
      netProfit: 183750,
      profitMargin: 75.0,
      patientsCount: 890,
      morningRevenue: 110250,
      morningProfit: 82680,
      eveningRevenue: 134750,
      eveningProfit: 101070
    }
  };

  const currentTimeline = profitTimelines[timeframe];

  // 7-Day Profit & Session Dataset for Graph
  const weeklyGraphData = [
    { day: 'Mon', date: '03 Aug', gross: 7200, cost: 1800, profit: 5400, margin: '75.0%', morning: 2400, evening: 3000 },
    { day: 'Tue', date: '04 Aug', gross: 8100, cost: 2000, profit: 6100, margin: '75.3%', morning: 2800, evening: 3300 },
    { day: 'Wed', date: '05 Aug', gross: 6900, cost: 1700, profit: 5200, margin: '75.4%', morning: 2300, evening: 2900 },
    { day: 'Thu', date: '06 Aug', gross: 9400, cost: 2300, profit: 7100, margin: '75.5%', morning: 3200, evening: 3900 },
    { day: 'Fri', date: '07 Aug', gross: 8800, cost: 2200, profit: 6600, margin: '75.0%', morning: 3000, evening: 3600 },
    { day: 'Sat', date: '08 Aug', gross: 10050, cost: 2575, profit: 7475, margin: '74.4%', morning: 3400, evening: 4075 },
    { day: 'Sun', date: '09 Aug', gross: 8450, cost: 2150, profit: 6300, margin: '74.6%', morning: 2950, evening: 3350 }
  ];

  const maxDailyProfit = Math.max(...weeklyGraphData.map(d => d.profit));

  // Category Profit Margin Breakdown Data
  const categoryMargins = [
    {
      category: 'Doctor OPD Consultation Fees',
      icon: Stethoscope,
      gross: totalDoctorFees || 4500,
      cost: 0,
      profit: totalDoctorFees || 4500,
      margin: 100,
      badgeColor: 'bg-green-50 text-[#15803d] border-green-200',
      iconBg: 'bg-[#16a34a] text-white'
    },
    {
      category: 'Pharmacy Medicine MRP Margins',
      icon: Pill,
      gross: totalMedicineSales || 2150,
      cost: Math.round((totalMedicineSales || 2150) * 0.5),
      profit: Math.round((totalMedicineSales || 2150) * 0.5),
      margin: 50,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white'
    },
    {
      category: 'Injection & Nursing Fees',
      icon: Syringe,
      gross: totalInjectionFees || 600,
      cost: Math.round((totalInjectionFees || 600) * 0.2),
      profit: Math.round((totalInjectionFees || 600) * 0.8),
      margin: 80,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white'
    },
    {
      category: 'Diagnostics (ECG & Ultrasound)',
      icon: Activity,
      gross: totalOtherServicesFees || 1200,
      cost: Math.round((totalOtherServicesFees || 1200) * 0.25),
      profit: Math.round((totalOtherServicesFees || 1200) * 0.75),
      margin: 75,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-600 text-white'
    }
  ];

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* HEADER BANNER WITH TIMEFRAME SELECTOR */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block">
              Hospital Financial Ledger & Income Analytics
            </span>
            <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Morning & Evening OPD Sessions Split
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-[#16a34a]" /> Income Accounts & Profit Analysis
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Comprehensive ledger breakdown of Daily, Weekly & Monthly Profits, Morning vs Evening session splits, and profit margins.
          </p>
        </div>

        {/* TIMEFRAME SWITCHER (DAILY / WEEKLY / MONTHLY) */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setTimeframe('DAILY')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              timeframe === 'DAILY'
                ? 'bg-[#16a34a] text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Profit
          </button>
          <button
            onClick={() => setTimeframe('WEEKLY')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              timeframe === 'WEEKLY'
                ? 'bg-[#16a34a] text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Profit
          </button>
          <button
            onClick={() => setTimeframe('MONTHLY')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              timeframe === 'MONTHLY'
                ? 'bg-[#16a34a] text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Profit
          </button>
        </div>
      </div>

      {/* TIMEFRAME PROFIT HIGHLIGHT CARDS (DAILY, WEEKLY, MONTHLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Gross Revenue Card */}
        <div className="bg-white p-6 rounded-3xl border border-green-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Gross Income Receipts</span>
              <div className="w-10 h-10 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black">
                <DollarSign className="w-5 h-5 text-[#16a34a]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">₹{currentTimeline.grossRevenue.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-[#15803d] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 inline-block mt-1">
                {currentTimeline.period} • {currentTimeline.patientsCount} Patients
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Total OPD fees + Pharmacy MRP + Diagnostics
          </div>
        </div>

        {/* Operating Expenses Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Operating Expenses & Cost</span>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                <Layers className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-700">₹{currentTimeline.costExpenses.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 inline-block mt-1">
                Medicine Purchase Buying Cost & Supplies
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Direct stock acquisition & clinic consumables
          </div>
        </div>

        {/* Net Profit Card (Featured) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-100">{currentTimeline.label}</span>
              <div className="w-10 h-10 rounded-2xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center font-black">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-4xl font-black text-white">₹{currentTimeline.netProfit.toLocaleString()}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> {currentTimeline.profitMargin}% Profit Margin
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 text-[11px] text-emerald-100 font-semibold flex justify-between items-center">
            <span>Net Clinic Earnings</span>
            <span className="text-white font-bold">100% Cleared</span>
          </div>
        </div>

      </div>

      {/* DETAILED MORNING VS EVENING OPD SESSION PROFIT ANALYSIS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider block">OPD Session Profit Breakdown</span>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" /> Morning Session vs Evening Session Profit Detailed Analysis
            </h3>
          </div>
          <span className="text-xs font-extrabold text-[#15803d] bg-green-50 px-3 py-1 rounded-full border border-green-200">
            {timeframe === 'DAILY' ? 'Today\'s Sessions' : timeframe === 'WEEKLY' ? 'Weekly OPD Sessions' : 'Monthly OPD Sessions'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* MORNING SESSION CARD (09:00 AM - 01:00 PM) */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Morning OPD Session</h4>
                  <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 09:00 AM - 01:00 PM
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-full border border-amber-300">
                Morning OPD
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Gross Revenue</span>
                <span className="text-lg font-black text-slate-900">₹{currentTimeline.morningRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Net Session Profit</span>
                <span className="text-lg font-black text-amber-900">₹{currentTimeline.morningProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-amber-200/50 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-600">Consultations (Dr. R.R. Rajan & Dr. Anitha):</span>
                <span className="font-extrabold text-slate-900">₹{Math.round(currentTimeline.morningRevenue * 0.55).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-600">Pharmacy & Injections:</span>
                <span className="font-extrabold text-slate-900">₹{Math.round(currentTimeline.morningRevenue * 0.45).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* EVENING SESSION CARD (05:00 PM - 09:00 PM) */}
          <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Evening OPD Session</h4>
                  <p className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 05:00 PM - 09:00 PM
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-indigo-900 bg-indigo-200/80 px-2.5 py-1 rounded-full border border-indigo-300">
                Evening OPD
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-indigo-200/60 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Gross Revenue</span>
                <span className="text-lg font-black text-slate-900">₹{currentTimeline.eveningRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-200/60 shadow-2xs">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Net Session Profit</span>
                <span className="text-lg font-black text-indigo-900">₹{currentTimeline.eveningProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-indigo-200/50 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-600">Consultations & Specialized Desk:</span>
                <span className="font-extrabold text-slate-900">₹{Math.round(currentTimeline.eveningRevenue * 0.52).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-600">Pharmacy & ECG / Scans:</span>
                <span className="font-extrabold text-slate-900">₹{Math.round(currentTimeline.eveningRevenue * 0.48).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* SESSION REVENUE SPLIT VISUAL PROGRESS BAR */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-xs font-extrabold text-slate-800">
            <span className="flex items-center gap-1.5 text-amber-700">
              <Sun className="w-4 h-4 text-amber-500" /> Morning OPD Share: {Math.round((currentTimeline.morningRevenue / currentTimeline.grossRevenue) * 100)}%
            </span>
            <span className="flex items-center gap-1.5 text-indigo-700">
              <Moon className="w-4 h-4 text-indigo-600" /> Evening OPD Share: {Math.round((currentTimeline.eveningRevenue / currentTimeline.grossRevenue) * 100)}%
            </span>
          </div>

          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${(currentTimeline.morningRevenue / currentTimeline.grossRevenue) * 100}%` }}
              title={`Morning OPD: ₹${currentTimeline.morningRevenue}`}
            ></div>
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${(currentTimeline.eveningRevenue / currentTimeline.grossRevenue) * 100}%` }}
              title={`Evening OPD: ₹${currentTimeline.eveningRevenue}`}
            ></div>
          </div>
        </div>
      </div>

      {/* PROFIT MARGIN VISUAL GRAPHS & CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPH 1: 7-DAY PROFIT TREND BAR CHART (2 COLS) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider block">Visual Financial Trend</span>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#16a34a]" /> 7-Day Net Profit & Margin Bar Graph
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-[#16a34a] inline-block"></span> Net Profit (₹)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-amber-400 inline-block"></span> Morning OPD
              </span>
            </div>
          </div>

          {/* CUSTOM SVG / TAILWIND BAR GRAPH */}
          <div className="pt-6 pb-2">
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200 pb-2">
              {weeklyGraphData.map((d, index) => {
                const heightPercent = (d.profit / maxDailyProfit) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                    
                    {/* Hover Tooltip Popup */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-slate-900 text-white p-2 rounded-xl text-[10px] font-bold shadow-xl pointer-events-none z-20 whitespace-nowrap text-center">
                      <div className="text-emerald-300 font-extrabold">{d.day} ({d.date})</div>
                      <div>Profit: ₹{d.profit.toLocaleString()} ({d.margin})</div>
                      <div className="text-[9px] text-slate-400">Gross: ₹{d.gross} | Cost: ₹{d.cost}</div>
                    </div>

                    {/* Profit Margin Badge over Bar */}
                    <span className="text-[9px] font-extrabold text-[#15803d] bg-green-50 px-1 rounded border border-green-200">
                      {d.margin}
                    </span>

                    {/* Dual Segmented Bar */}
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all group-hover:scale-105" style={{ height: `${heightPercent}%` }}>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 transition-all"
                        style={{ height: `${(d.evening / d.profit) * 100}%` }}
                        title={`Evening Profit: ₹${d.evening}`}
                      ></div>
                      <div
                        className="w-full bg-gradient-to-t from-amber-400 to-orange-500 transition-all border-b border-amber-300/30"
                        style={{ height: `${(d.morning / d.profit) * 100}%` }}
                        title={`Morning Profit: ₹${d.morning}`}
                      ></div>
                    </div>

                    {/* Day & Date Labels */}
                    <div className="text-center">
                      <span className="text-xs font-black text-slate-900 block leading-tight">{d.day}</span>
                      <span className="text-[9px] text-slate-400 block">{d.date.split(' ')[0]}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-green-50/60 border border-green-100 flex items-center justify-between text-xs font-bold text-[#14532d]">
            <span>Highest Daily Profit Recorded: <strong>Sat, 08 Aug (₹7,475 Net)</strong></span>
            <span className="text-[11px] text-[#15803d] bg-white px-2.5 py-0.5 rounded-full border border-green-200 font-extrabold">
              Average Margin: 75.1%
            </span>
          </div>
        </div>

        {/* GRAPH 2: PROFIT MARGIN BY CATEGORY (1 COL) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-xs space-y-5">
          <div>
            <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider block">Profitability Share</span>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" /> Category Profit Margins
            </h3>
          </div>

          <div className="space-y-4">
            {categoryMargins.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${cat.iconBg} flex items-center justify-center text-xs font-black shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block leading-tight">{cat.category}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Net Profit: ₹{cat.profit.toLocaleString()}</span>
                      </div>
                    </div>

                    <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${cat.badgeColor}`}>
                      {cat.margin}% Margin
                    </span>
                  </div>

                  {/* Profit Margin Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#16a34a] to-emerald-600 rounded-full"
                      style={{ width: `${cat.margin}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ITEMIZED FINANCIAL INCOME LEDGER TABLE */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider block">Detailed Ledger</span>
            <h3 className="font-black text-slate-900 text-base">Income Sources & Category Breakdown Table</h3>
          </div>
          <span className="text-xs font-extrabold text-slate-500">Real-time Collections</span>
        </div>

        <div className="space-y-3 text-xs">
          
          <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16a34a] text-white flex items-center justify-center font-black">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">Doctor Consultation Fees</span>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    🌅 Morning & 🌙 Evening OPD
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">Dr. R.R. Rajan (₹500) & Dr. Anitha Rajan (₹600) OPD Desk Consultations</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-black text-slate-900 text-base block">₹{totalDoctorFees}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Margin (₹{totalDoctorFees} Profit)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">Pharmacy Medicine Sales (MRP)</span>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    Pharmacy Desk
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">Retail Medicine Billing (Buying Cost vs MRP Retail Profit Margin)</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-black text-emerald-700 text-base block">₹{totalMedicineSales}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                50% Margin (₹{Math.round(totalMedicineSales * 0.5)} Profit)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                <Syringe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">Injection & Drip Administration Fees</span>
                  <span className="text-[9px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                    Nursing Desk
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">IV Drips, TT Injections, Booster Administration Charges</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-black text-indigo-700 text-base block">₹{totalInjectionFees}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                80% Margin (₹{Math.round(totalInjectionFees * 0.8)} Profit)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">Other Clinical Services & Diagnostics</span>
                  <span className="text-[9px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                    Diagnostics & Scan
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">Cardiology ECG, Ultrasound Scans, Sterile Bandaging</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-black text-purple-700 text-base block">₹{totalOtherServicesFees}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                75% Margin (₹{Math.round(totalOtherServicesFees * 0.75)} Profit)
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Accounts;
