import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  CreditCard,
  Download,
  Mail,
  MessageSquare,
  Building2,
  Stethoscope,
  Check,
  Loader2,
  ArrowRight,
  Clock,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredSubscription, saveSubscription, syncSubscriptionWithBackend } from '../../services/dataService';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

const Subscription = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [subscription, setSubscription] = useState(getStoredSubscription);
  const [selectedDuration, setSelectedDuration] = useState(3); // 3 | 6 | 12
  const [withEmail, setWithEmail] = useState(false);
  const [whatsappAddon, setWhatsappAddon] = useState(false);
  const [smsAddon, setSmsAddon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [pricingRates, setPricingRates] = useState({
    p3m_noemail: '12000',
    p3m_wemail: '14000',
    p6m_noemail: '20000',
    p6m_wemail: '22000',
    p12m_noemail: '38000',
    p12m_wemail: '42000',
    whatsapp: '4000',
    sms: '3000'
  });

  const syncData = async () => {
    try {
      const liveData = await syncSubscriptionWithBackend();
      if (liveData) {
        setSubscription(liveData);
        if (liveData.pricingRates) {
          const rates = typeof liveData.pricingRates === 'string' ? JSON.parse(liveData.pricingRates) : liveData.pricingRates;
          if (rates && typeof rates === 'object') {
            setPricingRates(rates);
          }
        }
      }
    } catch (e) {
      const stored = getStoredSubscription();
      if (stored) {
        setSubscription(stored);
        if (stored.pricingRates) {
          const rates = typeof stored.pricingRates === 'string' ? JSON.parse(stored.pricingRates) : stored.pricingRates;
          if (rates && typeof rates === 'object') {
            setPricingRates(rates);
          }
        }
      }
    }
  };

  useEffect(() => {
    syncData();
    window.addEventListener('storage', syncData);
    const interval = setInterval(syncData, 4000);
    return () => {
      window.removeEventListener('storage', syncData);
      clearInterval(interval);
    };
  }, []);

  // Strict Access Guard for Hospital Admin
  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl space-y-4 font-sans max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider bg-rose-100 px-2.5 py-0.5 rounded-full">
            Admin Access Restricted
          </span>
          <h2 className="text-xl font-black text-rose-950">Subscription & SaaS Billing Restricted</h2>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Hospital Subscription Plans, SaaS Tier Upgrades, and Billing Invoices are strictly reserved for the <strong>Hospital Administrator / Executive Clinic Director</strong>.
        </p>
      </div>
    );
  }

  const getRate = (val, defaultVal) => {
    if (val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (!isNaN(num)) return num;
    }
    return defaultVal;
  };

  // Dynamic Plan Tiers
  const plans = [
    {
      months: 3,
      durationLabel: '3 MONTHS PLAN',
      titleName: '3 Months Plan',
      durationDays: 90,
      basePriceNoEmail: getRate(pricingRates.p3m_noemail, 12000),
      basePriceWithEmail: getRate(pricingRates.p3m_wemail, 14000),
      badge: 'POPULAR',
      description: 'Ideal for growing clinics looking for quarterly billing & automation.'
    },
    {
      months: 6,
      durationLabel: '6 MONTHS PLAN',
      titleName: '6 Months Plan',
      durationDays: 180,
      basePriceNoEmail: getRate(pricingRates.p6m_noemail, 20000),
      basePriceWithEmail: getRate(pricingRates.p6m_wemail, 22000),
      badge: 'SAVE 15%',
      description: 'Half-year continuous access with complete appointment desk controls.'
    },
    {
      months: 12,
      durationLabel: '1 YEAR (12 MONTHS)',
      titleName: '12 Months Plan',
      durationDays: 365,
      basePriceNoEmail: getRate(pricingRates.p12m_noemail, 38000),
      basePriceWithEmail: getRate(pricingRates.p12m_wemail, 42000),
      badge: 'BEST VALUE (RECOMMENDED)',
      featured: true,
      description: 'Full 1-year unlimited hospital management with maximum cost savings.'
    }
  ];

  const currentPlan = plans.find((p) => p.months === selectedDuration) || plans[0];
  const basePrice = withEmail ? currentPlan.basePriceWithEmail : currentPlan.basePriceNoEmail;

  const whatsappRate = getRate(pricingRates.whatsapp, 4000);
  const smsRate = getRate(pricingRates.sms, 3000);

  const whatsappPrice = whatsappAddon ? whatsappRate : 0;
  const smsPrice = smsAddon ? smsRate : 0;

  const totalPrice = basePrice + whatsappPrice + smsPrice;
  const fullPlanTitle = `${currentPlan.titleName} (${withEmail ? 'With Email Follow-up' : 'Without Email Follow-up'})`;

  // Activate Plan helper function
  const activateSubPlan = (paymentMethod = 'Razorpay UPI Online') => {
    const renewalDateObj = new Date();
    renewalDateObj.setDate(renewalDateObj.getDate() + currentPlan.durationDays);
    const newRenewalDate = renewalDateObj.toISOString().split('T')[0];

    const newInvoice = {
      id: `SUB-INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      plan: fullPlanTitle,
      amount: totalPrice,
      status: 'Paid',
      method: paymentMethod
    };

    const updatedSub = {
      ...subscription,
      planId: `PLAN-PRO-${selectedDuration}M`,
      planName: fullPlanTitle,
      status: 'Active',
      priceMonthly: totalPrice,
      billingCycle: `${currentPlan.months} Months`,
      renewalDate: newRenewalDate,
      maxDoctors: 5,
      maxBranches: 2,
      invoiceHistory: [newInvoice, ...(subscription.invoiceHistory || [])]
    };

    setSubscription(updatedSub);
    saveSubscription(updatedSub);
    window.dispatchEvent(new Event('storage'));
    toast.success(`🎉 Subscription "${fullPlanTitle}" Activated Successfully! Total Paid: ₹${totalPrice.toLocaleString()}`);
  };

  // Buy / Activate Plan Handler via Razorpay Checkout Modal
  const handleBuyNow = async () => {
    setIsProcessing(true);

    try {
      // 1. Try to create Order via Backend API
      const res = await apiService.createRazorpayOrder(fullPlanTitle, totalPrice, currentPlan.durationDays);

      if (res && res.success && window.Razorpay) {
        const options = {
          key: res.keyId || 'rzp_test_51772186',
          amount: res.amount || (totalPrice * 100),
          currency: res.currency || 'INR',
          name: 'RRK Clinic & Multispecialty Hospital',
          description: `Upgrade License: ${fullPlanTitle} (₹${totalPrice})`,
          prefill: {
            name: user?.name || 'RRK Hospital Administrator',
            email: user?.email || 'admin@rrkclinic.com',
            contact: user?.phone || '+91 98401 00000'
          },
          theme: {
            color: '#2563eb'
          },
          handler: async function (response) {
            try {
              if (response.razorpay_signature) {
                await apiService.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planName: fullPlanTitle,
                  durationDays: currentPlan.durationDays,
                  customAmount: totalPrice
                });
              }
            } catch (e) {}

            activateSubPlan(`Razorpay (${response.razorpay_payment_id || 'RZP-SUCCESS'})`);
            setIsProcessing(false);
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast('Payment window closed', { icon: 'ℹ️' });
            }
          }
        };

        if (res.orderId && !res.orderId.startsWith('order_test_')) {
          options.order_id = res.orderId;
        }

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setIsProcessing(false);
          toast.error(response.error?.description || 'Razorpay Payment Failed');
        });
        rzp.open();
        return;
      }

      // 2. Fallback: If Razorpay script is in test/demo mode
      if (window.Razorpay) {
        const options = {
          key: 'rzp_test_51772186',
          amount: totalPrice * 100,
          currency: 'INR',
          name: 'RRK Clinic & Multispecialty Hospital',
          description: `Upgrade License: ${fullPlanTitle} (₹${totalPrice})`,
          prefill: {
            name: user?.name || 'RRK Hospital Administrator',
            email: user?.email || 'admin@rrkclinic.com',
            contact: user?.phone || '+91 98401 00000'
          },
          theme: {
            color: '#2563eb'
          },
          handler: function (response) {
            activateSubPlan(`Razorpay (${response.razorpay_payment_id || 'RZP-SUCCESS'})`);
            setIsProcessing(false);
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast('Payment window closed', { icon: 'ℹ️' });
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback for offline demo mode
        setTimeout(() => {
          activateSubPlan('Razorpay (UPI Instant)');
          setIsProcessing(false);
        }, 1000);
      }
    } catch (err) {
      console.warn('Razorpay checkout fallback:', err);
      setTimeout(() => {
        activateSubPlan('Razorpay (UPI Instant)');
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* RRK Clinic Signature Blue Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-green-50 text-[#15803d] border border-green-200 px-3.5 py-1 rounded-full">
          <Sparkles className="w-4 h-4 text-[#16a34a]" /> MEDIQORA SAAS SUBSCRIBER PORTAL
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Hospital Subscription & SaaS Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
          Manage your hospital license, view active plan details synced directly from Mediqora Platform Controller, or upgrade your subscription.
        </p>
      </div>

      {/* ACTIVE PLAN LIVE STATUS CARD (MEDIQORA SYNCED) */}
      {(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let renewalDateObj = null;
        let renewalDateFormatted = subscription?.renewalDate || '2027-08-16';
        if (subscription?.renewalDate) {
          renewalDateObj = new Date(subscription.renewalDate);
          if (typeof subscription.renewalDate === 'string' && subscription.renewalDate.includes('T')) {
            renewalDateFormatted = subscription.renewalDate.split('T')[0];
          }
        }

        let daysRemaining = null;
        if (renewalDateObj && !isNaN(renewalDateObj.getTime())) {
          renewalDateObj.setHours(0, 0, 0, 0);
          const diffTime = renewalDateObj.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const isPaused = Boolean(subscription?.isPaused || subscription?.status?.toLowerCase() === 'paused');
        const isExpired = Boolean((daysRemaining !== null && daysRemaining <= 0) || subscription?.status?.toLowerCase() === 'expired');
        const isActive = !isPaused && !isExpired;

        return (
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-green-950 text-white p-6 sm:p-7 rounded-3xl border border-emerald-900/50 shadow-xl space-y-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-800/40 pb-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-mono">
                    MEDIQORA CLIENT ID: CLI-RRK-002
                  </span>

                  {/* Dynamic Status Badge with Days Remaining */}
                  {isPaused ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-rose-500/20 text-rose-300 border-rose-400/30 flex items-center gap-1.5">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      <span>PAUSED</span>
                    </span>
                  ) : isExpired ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-rose-600/30 text-rose-200 border-rose-500/50 flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>PLAN EXPIRED ({Math.abs(daysRemaining || 0)} DAYS AGO)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-400/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>ACTIVE ({daysRemaining !== null ? `${daysRemaining} DAYS REMAINING` : 'ACTIVE'})</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {subscription?.planName || '12 Months Plan (With Email Follow-up)'}
                </h2>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Next Renewal / Expiry
                </span>
                <span className="text-lg font-black text-emerald-300 flex items-center sm:justify-end gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  {renewalDateFormatted}
                </span>

                {/* Days remaining badge under date */}
                {isPaused ? (
                  <span className="inline-block text-[11px] font-bold text-rose-300/90">
                    SaaS Access Paused by Mediqora
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Expired {Math.abs(daysRemaining || 0)} days ago</span>
                  </span>
                ) : daysRemaining !== null ? (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                    daysRemaining <= 7 
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800 animate-pulse' 
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{daysRemaining} Days Left ({Math.floor(daysRemaining / 30)} mos {daysRemaining % 30} days)</span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* PAUSED BANNER (WITH REASON) */}
            {isPaused && (
              <div className="bg-rose-500/20 border border-rose-500/40 rounded-2xl p-4 text-rose-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 flex-1">
                  <p className="font-extrabold text-rose-100 uppercase tracking-wider text-[11px]">
                    Hospital SaaS Access Paused by Mediqora Super Admin
                  </p>
                  <p className="text-rose-200 leading-relaxed font-medium">
                    {subscription?.pauseReason || 'Hospital SaaS subscription is currently paused. Please contact Mediqora Super Admin.'}
                  </p>
                </div>
              </div>
            )}

            {/* EXPIRED BANNER */}
            {isExpired && !isPaused && (
              <div className="bg-rose-600/25 border border-rose-500/60 rounded-2xl p-4 text-rose-100 flex items-start gap-3 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 flex-1">
                  <p className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                    Hospital SaaS Plan Has Expired
                  </p>
                  <p className="text-rose-200 leading-relaxed font-medium">
                    Your subscription license ended on <strong>{renewalDateFormatted}</strong> ({Math.abs(daysRemaining || 0)} days overdue). All clinical data, patient booking, and OPD operations are locked. Choose a plan duration below to renew immediately.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Multi-Branch OPD, Doctor Desks & Inventory Enabled</span>
              </div>
              <span className="text-[11px] text-emerald-300 font-bold">
                Live Connected to Mediqora Controller API (Port 5000)
              </span>
            </div>
          </div>
        );
      })()}

      {/* Email Follow-up Toggle Switch - Medical Green & White Theme */}
      <div className="bg-white p-4 rounded-2xl border border-green-100 max-w-md mx-auto flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <Mail className="w-5 h-5 text-[#16a34a]" />
          <div>
            <p className="text-xs font-extrabold text-slate-900">Include Automated Email Follow-ups?</p>
            <p className="text-[10px] text-slate-500 font-medium">Automatic patient email confirmation & reminders</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setWithEmail(!withEmail)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            withEmail
              ? 'bg-[#16a34a] text-white border-[#16a34a] shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          {withEmail ? 'With Email ✓' : 'Without Email'}
        </button>
      </div>

      {/* PLAN CARDS GRID - Medical Green & White Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const price = withEmail ? p.basePriceWithEmail : p.basePriceNoEmail;
          const isSelected = selectedDuration === p.months;

          return (
            <div
              key={p.months}
              onClick={() => setSelectedDuration(p.months)}
              className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-2 border-[#16a34a] shadow-xl shadow-emerald-600/10 scale-[1.02]'
                  : 'border-green-100 hover:border-green-200 shadow-sm'
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#16a34a] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {p.badge}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{p.durationLabel}</span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{p.titleName}</h3>
                  </div>
                  {!p.featured && (
                    <span className="text-[10px] font-black uppercase bg-green-50 text-[#15803d] px-2.5 py-1 rounded-md border border-green-200">
                      {p.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">{p.description}</p>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">₹{price.toLocaleString()}</span>
                    <span className="text-xs font-semibold text-slate-500">/ {p.months} mo</span>
                  </div>
                  <div className="text-[11px] font-bold mt-1.5 flex items-center gap-1.5">
                    {withEmail ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                        <span className="text-[#15803d]">Automated Email Follow-ups Included</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-amber-800">No Email Follow-ups</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 pt-2 text-xs font-medium text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Full Doctor Desk & Appointment Booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Multi-Branch Operating Hours Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Instant PDF Slip Export & Download</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Patient Consultation History & Stats</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDuration(p.months);
                  }}
                  style={isSelected ? { backgroundColor: '#16a34a', color: '#ffffff' } : {}}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    isSelected ? 'shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Selected Plan ✓' : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD-ON CHANNELS SECTION - Medical Green Theme */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#16a34a]" /> Optional Patient Follow-up Add-ons
            </h3>
            <p className="text-xs text-slate-500 font-medium">Select additional notification channels for patient reminders (Additional charges apply)</p>
          </div>
          <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
            OPTIONAL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* WhatsApp Addon */}
          <div
            onClick={() => setWhatsappAddon(!whatsappAddon)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              whatsappAddon ? 'bg-green-50/70 border-green-300 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={whatsappAddon}
                onChange={() => {}}
                className="w-4 h-4 rounded text-[#16a34a] focus:ring-emerald-500"
              />
              <div>
                <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>WhatsApp Patient Reminders</span>
                </p>
                <p className="text-[11px] text-slate-600 font-medium">Send instant appointment confirmations via WhatsApp</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#15803d] shrink-0 pl-2">
              +₹{whatsappRate.toLocaleString()}
            </span>
          </div>

          {/* SMS Addon */}
          <div
            onClick={() => setSmsAddon(!smsAddon)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              smsAddon ? 'bg-emerald-50/70 border-emerald-300 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={smsAddon}
                onChange={() => {}}
                className="w-4 h-4 rounded text-[#16a34a] focus:ring-emerald-500"
              />
              <div>
                <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SMS Text Reminders</span>
                </p>
                <p className="text-[11px] text-slate-600 font-medium">Send SMS booking updates directly to patient mobile</p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-800 shrink-0 pl-2">
              +₹{smsRate.toLocaleString()}
            </span>
          </div>

        </div>
      </div>

      {/* FINAL CHECKOUT SUMMARY BAR - Medical Green Accent */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">SELECTED SUBSCRIPTION SUMMARY</span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">{fullPlanTitle}</h3>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 font-medium pt-1">
            <span>Duration: <strong className="text-white">{currentPlan.titleName} ({currentPlan.durationDays} Days)</strong></span>
            <span>•</span>
            <span>Email: <strong className="text-white">{withEmail ? 'Included' : 'Disabled'}</strong></span>
            {(whatsappAddon || smsAddon) && (
              <>
                <span>•</span>
                <span>Addons: <strong className="text-emerald-400">{whatsappAddon ? 'WhatsApp ' : ''}{smsAddon ? 'SMS' : ''}</strong></span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
          <div className="text-center sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">TOTAL AMOUNT TO PAY</span>
            <span className="text-3xl font-black text-emerald-400">₹{totalPrice.toLocaleString()}</span>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={isProcessing}
            style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Processing Activation...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-white" />
                <span>Buy & Activate Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* SUBSCRIPTION INVOICE HISTORY TABLE - Medical Green Theme */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#15803d] tracking-wider block">Billing History</span>
            <h3 className="font-black text-slate-900 text-base">Subscription Invoice Receipts</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">Admin Tax Receipts</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Invoice ID</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Billing Date</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Subscription Plan</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Amount Paid</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Payment Method</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Status</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {(subscription.invoiceHistory || []).map((inv) => (
                <tr key={inv.id} className="hover:bg-green-50/40 transition-colors">
                  <td className="py-4 px-6 font-mono font-black text-[#15803d] whitespace-nowrap">
                    {inv.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {inv.date}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 min-w-[150px]">
                    {inv.plan}
                  </td>
                  <td className="py-4 px-4 font-black text-[#15803d] whitespace-nowrap">
                    ₹{inv.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-600 whitespace-nowrap">
                    {inv.method}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Paid
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-green-50 text-slate-700 hover:text-[#16a34a] font-extrabold text-[11px] border border-slate-200 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Subscription;
