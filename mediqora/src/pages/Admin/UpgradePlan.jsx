import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Crown,
  Calendar,
  CreditCard,
  Loader2,
  Mail,
  MessageSquare,
  Building2,
  ArrowRight,
  Check
} from 'lucide-react';

const UpgradePlan = () => {
  const { user, selectedClient } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  // State for selected plan & add-ons
  const [selectedDuration, setSelectedDuration] = useState(3); // 3 | 6 | 12
  const [withEmail, setWithEmail] = useState(true);
  const [whatsappAddon, setWhatsappAddon] = useState(false);
  const [smsAddon, setSmsAddon] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeHospitalFee, setActiveHospitalFee] = useState(null);
  const [activePlanName, setActivePlanName] = useState('');

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

  // Fetch active SaaS status and dynamic pricing rates on mount
  React.useEffect(() => {
    const savedSaasSettings = localStorage.getItem('saasSettings');
    if (savedSaasSettings) {
      try {
        const parsed = JSON.parse(savedSaasSettings);
        if (parsed.pricingRates) setPricingRates(parsed.pricingRates);
        if (parsed.settingsForm?.defaultPlan) {
          const planStr = parsed.settingsForm.defaultPlan;
          if (planStr.includes('3 Months')) setSelectedDuration(3);
          else if (planStr.includes('6 Months')) setSelectedDuration(6);
          else if (planStr.includes('12 Months')) setSelectedDuration(12);
          setWithEmail(planStr.includes('With Email'));
        }
      } catch (err) {}
    }

    const fetchSaasInfo = async () => {
      try {
        const res = await API.get('/saas/status');
        if (res.data.success) {
          if (res.data.monthlyFee) {
            setActiveHospitalFee(Number(res.data.monthlyFee));
          }
          if (res.data.plan) {
            setActivePlanName(res.data.plan);
          }
          if (res.data.pricingRates) {
            setPricingRates(res.data.pricingRates);
          }
        }
      } catch (err) {}
    };
    fetchSaasInfo();
  }, []);

  // Pricing structure dynamically matching Super Admin Customizable Rates
  const plans = [
    {
      months: 3,
      durationLabel: '3 Months Plan',
      durationDays: 90,
      basePriceNoEmail: Number(pricingRates.p3m_noemail) || 12000,
      basePriceWithEmail: Number(pricingRates.p3m_wemail) || 14000,
      badge: 'Popular',
      description: 'Ideal for growing clinics looking for quarterly billing & automation.'
    },
    {
      months: 6,
      durationLabel: '6 Months Plan',
      durationDays: 180,
      basePriceNoEmail: Number(pricingRates.p6m_noemail) || 20000,
      basePriceWithEmail: Number(pricingRates.p6m_wemail) || 22000,
      badge: 'Save 15%',
      description: 'Half-year continuous access with complete appointment desk controls.'
    },
    {
      months: 12,
      durationLabel: '1 Year (12 Months)',
      durationDays: 365,
      basePriceNoEmail: Number(pricingRates.p12m_noemail) || 38000,
      basePriceWithEmail: Number(pricingRates.p12m_wemail) || 42000,
      badge: 'Best Value (Recommended)',
      featured: true,
      description: 'Full 1-year unlimited hospital management with maximum cost savings.'
    }
  ];

  const currentPlan = plans.find((p) => p.months === selectedDuration) || plans[0];

  // Base price calculation (check if Super Admin assigned a custom rate to this client)
  let basePrice = withEmail ? currentPlan.basePriceWithEmail : currentPlan.basePriceNoEmail;

  // Addon charges (dynamically calculated from Super Admin rates)
  const whatsappRate = Number(pricingRates.whatsapp) || 499;
  const smsRate = Number(pricingRates.sms) || 299;

  const whatsappPrice = whatsappAddon ? whatsappRate : 0;
  const smsPrice = smsAddon ? smsRate : 0;

  const totalPrice = basePrice + whatsappPrice + smsPrice;
  const fullPlanTitle = `${currentPlan.durationLabel} (${withEmail ? 'With Email Follow-up' : 'Without Email Follow-up'})`;

  // Razorpay Checkout handler
  const handleBuyNow = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order on backend with custom plan details
      const res = await API.post('/saas/create-razorpay-order', {
        planName: fullPlanTitle,
        customAmount: totalPrice,
        durationDays: currentPlan.durationDays
      });

      if (!res.data.success) {
        toast.error(res.data.message || 'Failed to create payment order');
        setIsProcessing(false);
        return;
      }

      const { orderId, keyId, amount, currency, hospitalName, clientId } = res.data;

      // 2. Open Razorpay Popup
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: hospitalName || 'Shree Ram Homeo',
        description: `Upgrade Plan: ${fullPlanTitle} (₹${totalPrice})`,
        order_id: orderId,
        prefill: {
          name: user?.name || 'Dr. Selvakumar',
          email: user?.email || 'dr.selvakumarr@gmail.com',
          contact: user?.phone || '+91 95515 19766'
        },
        theme: {
          color: '#16a34a'
        },
        handler: async function (response) {
          try {
            const verifyRes = await API.post('/saas/verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              clientId,
              planName: fullPlanTitle,
              durationDays: currentPlan.durationDays,
              customAmount: totalPrice
            });

            if (verifyRes.data.success) {
              toast.success('🎉 Subscription Plan Upgraded & Activated Successfully!');
              setTimeout(() => {
                navigate('/admin/dashboard');
                window.location.reload();
              }, 1200);
            } else {
              toast.error(verifyRes.data.message || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            toast.error('Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
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
    } catch (err) {
      console.error('Razorpay Error:', err);
      toast.error('Failed to initiate Razorpay online payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-green-100 text-[#15803d] border border-[#BBF7D0] px-3.5 py-1 rounded-full">
          <Sparkles className="w-4 h-4 text-[#16a34a]" /> Upgrade Hospital Subscription Plan
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Select Your Hospital License Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
          Choose a 3-month, 6-month, or 12-month plan with optional email follow-ups & messaging add-ons to unpause and manage your clinical appointments desk.
        </p>
      </div>

      {/* Email Follow-up Toggle Switch */}
      <div className="bg-white p-4 rounded-2xl border border-[#BBF7D0] max-w-md mx-auto flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
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
            withEmail ? 'bg-[#16a34a] text-white border-[#16a34a] shadow-xs' : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          {withEmail ? 'With Email ✓' : 'Without Email'}
        </button>
      </div>

      {/* PLAN CARDS GRID */}
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
                  : 'border-[#BBF7D0] hover:border-[#BBF7D0] shadow-sm'
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
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{p.months} Months Plan</h3>
                  </div>
                  {!p.featured && (
                    <span className="text-[10px] font-black uppercase bg-green-50 text-[#16a34a] px-2.5 py-1 rounded-md border border-[#BBF7D0]">
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
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[#16a34a]">Automated Email Follow-ups Included</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-amber-700">No Email Follow-ups</span>
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
                    isSelected ? 'shadow-md shadow-green-500/20' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Selected Plan ✓' : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD-ON CHANNELS SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#16a34a]" /> Optional Patient Follow-up Add-ons
            </h3>
            <p className="text-xs text-slate-500 font-medium">Select additional notification channels for patient reminders (Additional charges apply)</p>
          </div>
          <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
            Optional
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* WhatsApp Addon */}
          <div
            onClick={() => setWhatsappAddon(!whatsappAddon)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              whatsappAddon ? 'bg-green-50/70 border-[#BBF7D0] shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={whatsappAddon}
                onChange={() => {}}
                className="w-4 h-4 rounded text-[#16a34a] focus:ring-green-500"
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
              smsAddon ? 'bg-amber-50/70 border-amber-400 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={smsAddon}
                onChange={() => {}}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>SMS Text Reminders</span>
                </p>
                <p className="text-[11px] text-slate-600 font-medium">Send SMS booking updates directly to patient mobile</p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-800 shrink-0 pl-2">
              +₹{smsRate.toLocaleString()}
            </span>
          </div>

        </div>
      </div>

      {/* FINAL CHECKOUT SUMMARY BAR */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">Selected Subscription Summary</span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">{fullPlanTitle}</h3>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 font-medium pt-1">
            <span>Duration: <strong className="text-white">{currentPlan.durationLabel} ({currentPlan.durationDays} Days)</strong></span>
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
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Amount to Pay</span>
            <span className="text-3xl font-black text-emerald-400">₹{totalPrice.toLocaleString()}</span>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={isProcessing}
            style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Opening Razorpay...</span>
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

    </div>
  );
};

export default UpgradePlan;
