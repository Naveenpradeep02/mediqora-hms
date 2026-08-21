import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  User,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  MapPin,
  Sparkles,
  Check
} from 'lucide-react';
import API from '../services/api';
import logoImg from '../assets/LOGO-EDIT 1.png';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotData, setSlotData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialBranch = searchParams.get('branchId') || '';
  const initialService = searchParams.get('serviceId') || '';

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: {
      patientName: '',
      phone: '',
      email: '',
      branchId: initialBranch,
      serviceId: initialService,
      appointmentDate: new Date().toISOString().split('T')[0],
      remarks: '',
      agreeTerms: false
    }
  });

  const selectedBranchId = watch('branchId');
  const selectedDate = watch('appointmentDate');

  // Load branches & services
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [resB, resS] = await Promise.all([
          API.get('/branches?activeOnly=true'),
          API.get('/services?activeOnly=true')
        ]);
        if (resB.data.success) setBranches(resB.data.branches);
        if (resS.data.success) setServices(resS.data.services);
      } catch (err) {
        toast.error('Failed to load clinic branches or services');
      }
    };
    loadMasterData();
  }, []);

  // Fetch available slots when branchId or appointmentDate changes
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedBranchId || !selectedDate) return;
      setSlotsLoading(true);
      setSelectedSlot('');
      try {
        const res = await API.get(`/appointments/slots?branchId=${selectedBranchId}&date=${selectedDate}`);
        if (res.data.success) {
          setSlotData(res.data);
        }
      } catch (err) {
        toast.error('Failed to fetch available time slots');
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [selectedBranchId, selectedDate]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [step]);

  // Handle step 1 next button
  const handleNextStep = async () => {
    const isValid = await trigger(['patientName', 'phone', 'email']);
    if (isValid) {
      setStep(2);
    }
  };

  // Submit appointment form
  const onSubmit = async (data) => {
    if (!selectedSlot) {
      toast.error('Please select an available appointment time slot');
      return;
    }
    if (!data.agreeTerms) {
      toast.error('You must agree to the Terms & Conditions');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientName: data.patientName,
        phone: data.phone,
        email: data.email,
        branchId: parseInt(data.branchId),
        serviceId: parseInt(data.serviceId),
        appointmentDate: data.appointmentDate,
        appointmentTime: selectedSlot,
        remarks: data.remarks
      };

      const res = await API.post('/appointments', payload);
      if (res.data.success) {
        toast.success('Appointment booked successfully!');
        navigate('/booking/success', { state: { appointment: res.data.appointment } });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#F0FDF4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* UNIFIED HERO HEADER CARD */}
        <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-lg overflow-hidden">
          {/* Top Decorative Strip */}
          <div className="h-2.5 bg-[#16a34a]"></div>

          <div className="p-6 sm:p-8 text-center space-y-3.5">
            <img src={logoImg} alt="Shree Ram Homeo Logo" className="h-16 w-auto mx-auto object-contain" />

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16a34a] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" /> Shree Ram Homeo Clinic
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Online Doctor Appointment Booking
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Select your branch, medical service, date, and 30-minute consultation time slot.
            </p>
          </div>
        </div>

        {/* STEP WIZARD INDICATOR */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#BBF7D0] shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setStep(1)}
              style={
                step === 1
                  ? { backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#16a34a' }
                  : { backgroundColor: '#ffffff', color: '#1E293B', borderColor: '#16a34a' }
              }
              className="p-3 rounded-xl flex items-center gap-3 transition-all text-left border shadow-sm"
            >
              <div
                style={
                  step === 1
                    ? { backgroundColor: '#ffffff', color: '#16a34a' }
                    : { backgroundColor: '#F0FDF4', color: '#16a34a' }
                }
                className="w-8 h-8 rounded-lg font-extrabold flex items-center justify-center text-sm shrink-0"
              >
                1
              </div>
              <div className="overflow-hidden">
                <span
                  style={step === 1 ? { color: '#F0FDF4' } : { color: '#16a34a' }}
                  className="text-[10px] font-extrabold block uppercase tracking-wider"
                >
                  Step 1
                </span>
                <span className="text-xs sm:text-sm font-bold truncate block">Patient Details</span>
              </div>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={handleNextStep}
              style={
                step === 2
                  ? { backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#16a34a' }
                  : { backgroundColor: '#ffffff', color: '#1E293B', borderColor: '#16a34a' }
              }
              className="p-3 rounded-xl flex items-center gap-3 transition-all text-left border shadow-sm"
            >
              <div
                style={
                  step === 2
                    ? { backgroundColor: '#ffffff', color: '#16a34a' }
                    : { backgroundColor: '#F0FDF4', color: '#16a34a' }
                }
                className="w-8 h-8 rounded-lg font-extrabold flex items-center justify-center text-sm shrink-0"
              >
                2
              </div>
              <div className="overflow-hidden">
                <span
                  style={step === 2 ? { color: '#F0FDF4' } : { color: '#16a34a' }}
                  className="text-[10px] font-extrabold block uppercase tracking-wider"
                >
                  Step 2
                </span>
                <span className="text-xs sm:text-sm font-bold truncate block">Branch & Slot</span>
              </div>
            </button>

          </div>
        </div>

        {/* MAIN FORM CARD */}
        <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-xl p-6 sm:p-9">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* STEP 1: PATIENT CONTACT DETAILS */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-[#BBF7D0]/50">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16a34a] flex items-center justify-center font-bold shrink-0">
                    <User className="w-5 h-5 text-[#16a34a]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">Patient Contact Details</h3>
                    <p className="text-xs text-slate-500 font-medium">Please enter patient details for appointment registration</p>
                  </div>
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    Full Patient Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      {...register('patientName', { required: 'Patient Name is required' })}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                        errors.patientName ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-[#16a34a]'
                      } focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20 text-slate-900 font-medium text-sm bg-white`}
                    />
                  </div>
                  {errors.patientName && <p className="text-xs text-rose-500 mt-1">{errors.patientName.message}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    Phone Number (10 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Must be exactly 10 numeric digits'
                        }
                      })}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-[#16a34a]'
                      } focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20 text-slate-900 font-medium text-sm bg-white`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. patient@example.com"
                      {...register('email', {
                        required: 'Email address is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                        errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-[#16a34a]'
                      } focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20 text-slate-900 font-medium text-sm bg-white`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Appointment confirmation receipt will be sent to this email address.</p>
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                    className="inline-flex items-center justify-center gap-2 font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-green-500/25 hover:opacity-95 transition-all text-sm cursor-pointer"
                  >
                    <span>Continue to Slot Selection</span>
                    <ArrowRight className="w-4 h-4 text-white shrink-0" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: APPOINTMENT DETAILS */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BBF7D0]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16a34a] flex items-center justify-center font-bold shrink-0">
                      <Calendar className="w-5 h-5 text-[#16a34a]" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">Branch, Specialty & Time Slot</h3>
                      <p className="text-xs text-slate-500 font-medium">Pick clinic location, medical care, and preferred slot</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#16a34a] bg-[#F0FDF4] hover:bg-white border border-[#BBF7D0] px-3 py-1.5 rounded-xl transition-all shrink-0 whitespace-nowrap self-start sm:self-center cursor-pointer shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Edit Patient Info</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Branch */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                      Select Hospital Branch <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                      <select
                        {...register('branchId', { required: 'Please select a hospital branch' })}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none text-slate-900 font-medium text-sm bg-white"
                      >
                        <option value="">-- Choose Branch --</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    {errors.branchId && <p className="text-xs text-rose-500 mt-1">{errors.branchId.message}</p>}
                  </div>

                  {/* Select Service */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                      Select Specialty / Service <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Stethoscope className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                      <select
                        {...register('serviceId', { required: 'Please select a service' })}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none text-slate-900 font-medium text-sm bg-white"
                      >
                        <option value="">-- Choose Medical Specialty --</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    {errors.serviceId && <p className="text-xs text-rose-500 mt-1">{errors.serviceId.message}</p>}
                  </div>
                </div>

                {/* Appointment Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    Appointment Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-[#16a34a] absolute left-3.5 top-3" />
                    <input
                      type="date"
                      min={todayStr}
                      {...register('appointmentDate', { required: 'Appointment date is required' })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none text-slate-900 font-medium text-sm bg-white"
                    />
                  </div>
                  {errors.appointmentDate && <p className="text-xs text-rose-500 mt-1">{errors.appointmentDate.message}</p>}
                </div>

                {/* TIME SLOT SELECTION GRID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Available 30-Minute Time Slots <span className="text-rose-500">*</span>
                    </label>
                    {slotData && !slotData.isClosed && (
                      <span className="text-xs font-bold text-[#16a34a] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                        {slotData.availableSlotsCount} open slot(s)
                      </span>
                    )}
                  </div>

                  {!selectedBranchId ? (
                    <div className="p-6 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] text-center text-xs font-medium text-slate-700">
                      Please select a Hospital Branch above to view available 30-minute consultation slots.
                    </div>
                  ) : slotsLoading ? (
                    <div className="p-8 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] flex items-center justify-center gap-3 text-slate-700">
                      <Loader2 className="w-5 h-5 animate-spin text-[#16a34a]" />
                      <span className="text-xs font-semibold">Checking live time slot availability...</span>
                    </div>
                  ) : slotData?.isClosed ? (
                    <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                      <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                      <p className="font-bold text-rose-900 text-xs">Clinic Closed on Selected Date</p>
                      <p className="text-[11px] text-rose-600 mt-1">{slotData.reason || 'No consultation sessions available'}</p>
                    </div>
                  ) : slotData?.slots?.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto p-1">
                      {slotData.slots.map((s, idx) => (
                        <button
                          type="button"
                          key={idx}
                          disabled={!s.isAvailable}
                          onClick={() => setSelectedSlot(s.time)}
                          style={
                            selectedSlot === s.time
                              ? { backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#16a34a' }
                              : s.isAvailable
                              ? { backgroundColor: '#ffffff', color: '#1E293B', borderColor: '#16a34a' }
                              : { backgroundColor: '#F1F5F9', color: '#94A3B8', borderColor: '#E2E8F0' }
                          }
                          className="py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border shadow-xs"
                        >
                          <span className="flex items-center gap-1">
                            {selectedSlot === s.time && <Check className="w-3 h-3 text-white shrink-0" />}
                            {s.time}
                          </span>
                          <span className="text-[9px] font-normal opacity-80 mt-0.5">
                            {s.isAvailable ? 'Available' : s.reason}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center text-amber-900 text-xs">
                      No slots remaining for this date. Please select another date.
                    </div>
                  )}
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    Medical Remarks / Symptoms (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe your symptoms or reason for consultation..."
                    {...register('remarks')}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#16a34a] focus:outline-none text-slate-900 font-medium text-xs bg-white"
                  ></textarea>
                </div>

                {/* Terms Checkbox */}
                <div className="p-4 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('agreeTerms', { required: 'You must agree to terms' })}
                      className="mt-0.5 w-4 h-4 text-[#16a34a] rounded border-slate-300 focus:ring-[#16a34a]"
                    />
                    <span className="text-xs text-slate-800 leading-snug">
                      I agree to the <strong className="text-slate-900">Terms & Conditions</strong> of Shree Ram Homeo Clinic. I confirm that the details provided are accurate and understand that my consultation duration is 30 minutes.
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-xs text-rose-500 mt-1">{errors.agreeTerms.message}</p>}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSlot}
                    style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                    className="flex-1 inline-flex items-center justify-center gap-2 font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-green-500/25 disabled:opacity-50 hover:opacity-95 transition-all text-xs sm:text-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span>Processing Booking...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>Complete & Book Appointment</span>
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
