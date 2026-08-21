import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  CreditCard, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  TrendingUp
} from 'lucide-react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get('/saas/payments');
      if (res.data && res.data.success) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  // Filtered & deduplicated payment records
  const uniquePaymentsMap = new Map();
  payments.forEach((item) => {
    if (item && item.payment_id) {
      uniquePaymentsMap.set(item.payment_id, item);
    }
  });
  const uniquePayments = Array.from(uniquePaymentsMap.values());

  const filteredPayments = uniquePayments.filter((item) => {
    const matchesSearch = 
      (item.hospital_name && item.hospital_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.client_id && item.client_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.payment_id && item.payment_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlan = filterPlan === 'ALL' || item.plan_name === filterPlan;

    return matchesSearch && matchesPlan;
  });

  // Financial Metrics
  const totalRevenue = uniquePayments.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalTransactions = uniquePayments.length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* HEADER TITLE BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Super Admin SaaS Financial Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-400" />
            <span>Mediqoro Hospital SaaS Payment History</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-2xl">
            Real-time audit log of all hospital client subscription payments, transaction IDs, payment date-times, active start dates, and license expiration dates.
          </p>
        </div>

        <button
          onClick={fetchPaymentHistory}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Payment History</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-extrabold text-xs uppercase tracking-wider block">Total SaaS Revenue</span>
            <span className="text-2xl font-black text-slate-900 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> 100% Settled Payments
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-extrabold text-xs uppercase tracking-wider block">Completed Transactions</span>
            <span className="text-2xl font-black text-slate-900 block">{totalTransactions} Payments</span>
            <span className="text-slate-500 text-[11px] font-medium block">Razorpay & Admin Renewals</span>
          </div>
          <div className="p-3.5 bg-green-50 text-[#16a34a] rounded-2xl border border-green-100">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-extrabold text-xs uppercase tracking-wider block">Active Client Subscriptions</span>
            <span className="text-2xl font-black text-emerald-600 block">1 Active Hospital</span>
            <span className="text-slate-500 text-[11px] font-medium block">Shree Ram Homeo Hospital</span>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Hospital Name, Client ID, Transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Plan:</span>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Plans</option>
            <option value="3 Months Plan (Without Email Follow-up)">3 Months (Without Email)</option>
            <option value="3 Months Plan (With Email Follow-up)">3 Months (With Email)</option>
            <option value="6 Months Plan (Without Email Follow-up)">6 Months (Without Email)</option>
            <option value="12 Months Plan (Without Email Follow-up)">12 Months (1 Year)</option>
          </select>
        </div>
      </div>

      {/* TRANSACTION HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Payment Audit Transactions ({filteredPayments.length})</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500">
            Showing all completed payment records
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading SaaS payment transaction logs...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No payment history logs found</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or filter settings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4 align-middle text-left">Hospital Client</th>
                  <th className="py-3.5 px-4 align-middle text-left">Subscription Plan</th>
                  <th className="py-3.5 px-4 align-middle text-left">Payment Date & Time</th>
                  <th className="py-3.5 px-4 align-middle text-center">Active Date</th>
                  <th className="py-3.5 px-4 align-middle text-center">Expiry Date</th>
                  <th className="py-3.5 px-4 align-middle text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 align-middle text-left">Gateway & Txn Ref ID</th>
                  <th className="py-3.5 px-4 align-middle text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPayments.map((txn, index) => (
                  <tr key={txn.id || index} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* HOSPITAL CLIENT */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight text-xs">{txn.hospital_name}</span>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">ID: {txn.client_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* PLAN NAME */}
                    <td className="py-4 px-4 align-middle">
                      <span className="font-bold text-slate-800 text-xs block leading-snug">
                        {txn.plan_name}
                      </span>
                    </td>

                    {/* PAYMENT DATE & TIME */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDateTime(txn.payment_date)}</span>
                      </div>
                    </td>

                    {/* ACTIVE DATE */}
                    <td className="py-4 px-4 align-middle text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BBF7D0] bg-green-50 text-[#16a34a] font-extrabold text-[11px] shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                        <span>{formatDate(txn.active_date)}</span>
                      </span>
                    </td>

                    {/* EXPIRY DATE */}
                    <td className="py-4 px-4 align-middle text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-extrabold text-[11px] shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{formatDate(txn.expiry_date)}</span>
                      </span>
                    </td>

                    {/* AMOUNT PAID */}
                    <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                      <span className="text-sm font-black text-slate-900">
                        ₹{parseFloat(txn.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* PAYMENT METHOD & TRANSACTION REF ID */}
                    <td className="py-4 px-4 align-middle">
                      <span className="font-bold text-slate-700 text-xs block">
                        {txn.payment_method || 'Razorpay Online Gateway'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit block mt-1">
                        {txn.payment_id}
                      </span>
                    </td>

                    {/* STATUS BADGE */}
                    <td className="py-4 px-4 align-middle text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>SUCCESS</span>
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
