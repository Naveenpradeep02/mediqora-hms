import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Stethoscope, User, Phone, Mail, Building2, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { defaultDoctors, defaultServices, defaultBranches, getStoredAppointments, saveAppointments } from '../services/dataService';
import toast from 'react-hot-toast';

const Booking = () => {
  const navigate = useNavigate();

  const [doctorId, setDoctorId] = useState('DOC-RAJAN');
  const [service, setService] = useState('General & Preventive Consultation');
  const [branch, setBranch] = useState('RRK Clinic - Anna Nagar Main');
  const [date, setDate] = useState('2026-08-10');
  const [time, setTime] = useState('10:30 AM');
  
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState('Male');
  const [remarks, setRemarks] = useState('');

  const timeSlots = [
    '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    if (!patientName || !phone) {
      toast.error('Patient Name and Phone Number are required!');
      return;
    }

    const assignedDoc = defaultDoctors.find(d => d.id === doctorId);
    const stored = getStoredAppointments();
    const tokenNo = `T-0${stored.length + 1}`;
    const aptId = `RRK-${Date.now().toString().slice(-6)}`;

    const newApt = {
      id: Date.now(),
      appointmentId: aptId,
      patientName,
      phone,
      email: email || `${patientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      age: parseInt(age, 10) || 35,
      gender,
      doctor: assignedDoc?.name || 'Dr. R.R. Rajan',
      doctorId,
      service,
      branch,
      date,
      time,
      status: 'Checked In',
      tokenNo,
      paymentStatus: 'Pending',
      remarks: remarks || 'Online patient appointment booking.'
    };

    saveAppointments([newApt, ...stored]);
    toast.success(`🎉 Appointment Booked Successfully! Token: ${tokenNo}`);

    navigate('/booking/success', { state: { booking: newApt } });
  };

  const selectedDocInfo = defaultDoctors.find(d => d.id === doctorId);

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto font-sans space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#15803d] to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 px-3.5 py-1 rounded-full">
          <Sparkles className="w-4 h-4 text-emerald-200" /> RRK Clinic Smart Booking
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Book Doctor Appointment Online
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-xl mx-auto">
          Consult Senior Specialists Dr. R.R. Rajan (Cardiology & Medicine) & Dr. Anitha Rajan (Pediatrics & Gynaecology).
        </p>
      </div>

      {/* Booking Form Card */}
      <form onSubmit={handleBooking} className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-md space-y-6">
        
        {/* Step 1: Doctor Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-[#15803d]">1. Select Consulting Doctor *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {defaultDoctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setDoctorId(doc.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  doctorId === doc.id
                    ? 'border-[#16a34a] bg-green-50/80 shadow-md'
                    : 'border-slate-200 bg-slate-50 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#16a34a] text-white font-black flex items-center justify-center">
                    {doc.name.charAt(4)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{doc.name}</h3>
                    <p className="text-[11px] font-bold text-[#15803d]">{doc.specialty}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Fee: ₹{doc.fee} • {doc.roomNo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Service & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1.5">2. Medical Service *</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              {defaultServices.map(s => (
                <option key={s.id} value={s.name}>{s.name} (₹{s.fee})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1.5">3. Clinic Branch *</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              {defaultBranches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Date & Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1.5">4. Appointment Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1.5">5. Preferred Time Slot *</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              {timeSlots.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 4: Patient Info */}
        <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
          <label className="block text-xs font-black uppercase tracking-wider text-[#15803d]">6. Patient Contact Info *</label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-extrabold text-slate-700 uppercase mb-1">Full Patient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Anandha Krishnan"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 uppercase mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98401 22334"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-extrabold text-slate-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                placeholder="anand@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 uppercase mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 uppercase mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 uppercase mb-1">Health Symptoms / Chief Complaints</label>
            <textarea
              rows="2"
              placeholder="e.g. Chest pain, fever, pediatric vaccination request..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#16a34a] to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" /> Confirm & Issue RRK Clinic OPD Token
        </button>

      </form>

    </div>
  );
};

export default Booking;
