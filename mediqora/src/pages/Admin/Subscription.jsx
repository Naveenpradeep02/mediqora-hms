import React, { useState } from 'react';
import { Crown, Sparkles, CheckCircle2, ShieldCheck, Zap, CreditCard, ArrowRight, ExternalLink } from 'lucide-react';
import { getStoredSubscription, saveSubscription } from '../../services/dataService';
import toast from 'react-hot-toast';

const Subscription = () => {
  const [subData, setSubData] = useState(getStoredSubscription);

  const availablePlans = [
    {
      id: 'PLAN-STARTER',
      name: 'Starter Basic Plan',
      fee: '₹1,999 / Month',
      maxDoctors: 'Single OPD Doctor',
      maxBranches: '1 Branch Clinic',
      emailSupport: false,
      whatsappIntegration: false,
      popular: false
    },
    {
      id: 'PLAN-PRO-02',
      name: 'Professional Pro Plan (SaaS Tier)',
      fee: '₹3,499 / Month',
      maxDoctors: 'Up to 5 OPD Doctors',
      maxBranches: '2 Clinic Branches',
      emailSupport: true,
      whatsappIntegration: true,
      popular: true
    },
    {
      id: 'PLAN-[#ENTERPRISE]',
      name: 'Enterprise Multi-Hospital Tier',
      fee: '₹6,999 / Month',
      maxDoctors: 'Unlimited Doctors',
      maxBranches: 'Unlimited Branches',
      emailSupport: true,
      whatsappIntegration: true,
      popular: false
    }
  ];

  const handleSelectPlan = (plan) => {
    const updated = {
      ...subData,
      planId: plan.id,
      planName: plan.name,
      priceMonthly: parseInt(plan.fee.replace(/[^0-9]/g, ''), 10) || 3499
    };
    setSubData(updated);
    saveSubscription(updated);
    toast.success(`Subscription updated to ${plan.name}`);
  };

  return (
    <div className="space-y-6 font-sans pb-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block mb-1">
            Mediqora SaaS Subscription Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Crown className="w-7 h-7 text-[#16a34a]" /> Hospital SaaS Subscription & Tier Upgrade
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Current Active License: {subData.planName} • Renewal Date: {subData.renewalDate}
          </p>
        </div>
        <span className="px-4 py-2 rounded-2xl bg-green-100 text-[#15803d] font-black text-xs border border-[#BBF7D0]">
          🟢 License Status: {subData.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availablePlans.map((p) => {
          const isCurrent = subData.planId === p.id || subData.planName.includes(p.name.split(' ')[0]);

          return (
            <div
              key={p.id}
              className={`p-6 rounded-3xl border-2 space-y-4 relative flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-green-50/80 border-[#16a34a] ring-2 ring-[#16a34a]/30 shadow-lg'
                  : 'bg-white border-slate-200 hover:border-[#BBF7D0]'
              }`}
            >
              {p.popular && (
                <span className="absolute top-4 right-4 text-[9px] font-black uppercase bg-[#16a34a] text-white px-2.5 py-0.5 rounded-full">
                  RECOMMENDED
                </span>
              )}

              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-lg">{p.name}</h3>
                <p className="text-2xl font-black text-[#16a34a]">{p.fee}</p>
                <div className="pt-2 text-xs space-y-1.5 font-medium text-slate-600">
                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16a34a]" /> {p.maxDoctors}</p>
                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16a34a]" /> {p.maxBranches}</p>
                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16a34a]" /> Multi-Batch FEFO Inventory</p>
                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16a34a]" /> Itemized GST Billing Invoices</p>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(p)}
                className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-xs cursor-pointer ${
                  isCurrent ? 'bg-[#16a34a] text-white' : 'bg-slate-900 text-emerald-400 hover:bg-[#16a34a] hover:text-white'
                }`}
              >
                {isCurrent ? 'Active Current Plan ✓' : 'Select & Upgrade Plan →'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;
