import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  ArrowRight,
  PhoneCall,
  Sparkles,
  HeartPulse,
  Brain,
  Activity,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Smile,
  ShieldPlus
} from 'lucide-react';
import API from '../services/api';

const Home = () => {
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resServices, resBranches] = await Promise.all([
          API.get('/services?activeOnly=true'),
          API.get('/branches?activeOnly=true')
        ]);
        if (resServices.data.success) setServices(resServices.data.services);
        if (resBranches.data.success) setBranches(resBranches.data.branches);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-400" /> Leading Homeopathic Clinic in Chennai
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Holistic Non-Surgical <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-teal-200 to-emerald-400">
                  Homeopathic Healing
                </span>
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Experience gentle, effective, and permanent root-cause treatments without surgical procedures. Serving patients across <strong className="text-white">Anna Nagar</strong> & <strong className="text-white">T Nagar</strong>.
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>30-Min Automated Slot Booking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>Zero Surgical Complications</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>Instant Email Confirmations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>Experienced Doctors & Staff</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/booking"
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all text-base"
                >
                  <Calendar className="w-5 h-5" /> Book Online Appointment
                </Link>
                <a
                  href="#branches"
                  className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-6 py-4 rounded-2xl transition-all text-base"
                >
                  <MapPin className="w-5 h-5 text-teal-400" /> View Branches & Hours
                </a>
              </div>
            </motion.div>

            {/* Right Column Glass Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="glass-card-dark p-8 rounded-3xl shadow-2xl relative border border-slate-700/60">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Shree Ram Homeo</h3>
                    <p className="text-xs text-teal-400 font-medium">Anna Nagar & T Nagar Clinics</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Anna Nagar Branch</span>
                      <span className="text-sm font-bold text-white">Mon – Sat: 4:00 PM – 6:00 PM</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-900/50 text-teal-300 border border-teal-700/50">Open</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">T Nagar Branch</span>
                      <span className="text-sm font-bold text-white">10 AM – 2 PM & 6:30 PM – 9 PM</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-900/50 text-teal-300 border border-teal-700/50">Open</span>
                  </div>

                  <div className="pt-2 text-center">
                    <Link
                      to="/booking"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      Check Next Slot & Book Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* QUICK STATS STRIP */}
      <section className="-mt-10 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80">
          <div className="text-center p-3 border-r border-slate-100 last:border-none">
            <p className="text-3xl font-extrabold text-teal-600">17+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase mt-1">Specialized Services</p>
          </div>
          <div className="text-center p-3 border-r border-slate-100 last:border-none">
            <p className="text-3xl font-extrabold text-teal-600">2</p>
            <p className="text-xs font-semibold text-slate-500 uppercase mt-1">Prime Branches</p>
          </div>
          <div className="text-center p-3 border-r border-slate-100 last:border-none">
            <p className="text-3xl font-extrabold text-teal-600">30 Min</p>
            <p className="text-xs font-semibold text-slate-500 uppercase mt-1">Dedicated Duration</p>
          </div>
          <div className="text-center p-3">
            <p className="text-3xl font-extrabold text-teal-600">100%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase mt-1">Non-Surgical Focus</p>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Medical Departments
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Homeopathic Care Services
          </h2>
          <p className="text-slate-600 text-base">
            Providing evidence-backed constitutional treatment across 17 distinct medical specialties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-teal-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center font-bold mb-4 transition-colors">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Non-Surgical Care</span>
                <Link
                  to={`/booking?serviceId=${service.id}`}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  Book Service <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BRANCHES & HOURS SECTION */}
      <section id="branches" className="py-20 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Clinic Locations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Hospital Branches & Working Hours
            </h2>
            <p className="text-slate-600 text-base">
              Visit our state-of-the-art homeopathy clinics located conveniently in Anna Nagar and T Nagar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Branch 1: Anna Nagar */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full">
                    Branch 1
                  </span>
                  <span className="text-xs font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Active Clinic
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">Shree Ram Homeo – Anna Nagar</h3>
                <p className="text-sm text-slate-500 mb-6 flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  No. 142, 2nd Avenue, Near Roundtana, Anna Nagar, Chennai - 600040
                </p>

                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-700">Monday – Saturday</span>
                    <span className="font-bold text-teal-700">4:00 PM – 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Sunday</span>
                    <span className="font-semibold text-rose-500">Closed</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <a
                  href="https://maps.google.com/?q=Anna+Nagar+Chennai"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-slate-600 hover:text-teal-600 flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" /> Open in Google Maps
                </a>
                <Link
                  to="/booking?branchId=1"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md hover:bg-teal-700 transition-colors"
                >
                  Book Anna Nagar Slot <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Branch 2: T Nagar */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full">
                    Branch 2
                  </span>
                  <span className="text-xs font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Active Clinic
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">Shree Ram Homeo – T Nagar</h3>
                <p className="text-sm text-slate-500 mb-6 flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  No. 45, Venkatanarayana Road, Near Panagal Park, T Nagar, Chennai - 600017
                </p>

                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-700">Mon – Sat (Morning)</span>
                    <span className="font-bold text-teal-700">10:00 AM – 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-700">Mon – Sat (Evening)</span>
                    <span className="font-bold text-teal-700">6:30 PM – 9:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold">Sunday (Morning)</span>
                    <span className="font-bold text-[#16a34a]">11:00 AM – 2:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <a
                  href="https://maps.google.com/?q=T+Nagar+Chennai"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-slate-600 hover:text-teal-600 flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" /> Open in Google Maps
                </a>
                <Link
                  to="/booking?branchId=2"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md hover:bg-teal-700 transition-colors"
                >
                  Book T Nagar Slot <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Why Choose Shree Ram Homeo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pioneering Non-Surgical Homeopathic Cures
            </h2>
            <p className="text-slate-600 leading-relaxed text-base">
              At Shree Ram Homeo, we focus on constitutional treatment. We treat the patient as a whole, addressing the underlying root cause of chronic and surgical ailments without invasive surgeries or toxic side effects.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                  <ShieldPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Non-Surgical Specialty Cures</h4>
                  <p className="text-sm text-slate-500">Effective treatment for piles, fissures, nasal polyps, tonsillitis, and cysts avoiding surgery.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">30-Minute Dedicated Consultation</h4>
                  <p className="text-sm text-slate-500">Every appointment gets 30 full minutes of comprehensive diagnosis and prescription planning.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Instant Email & Confirmation</h4>
                  <p className="text-sm text-slate-500">Receive instant booking receipts, pre-visit guidelines, and SMS/Email reminders.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-tr from-teal-900 to-slate-900 p-8 sm:p-12 rounded-3xl text-white shadow-2xl space-y-6">
            <h3 className="text-2xl font-bold text-white">Book Your Consultation Today</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Don't wait for your symptoms to escalate. Secure your 30-minute consultation slot at our Anna Nagar or T Nagar branches online in less than 2 minutes.
            </p>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Selected Branch Slot:</span>
                <span className="font-bold text-teal-300">Live Slots Available</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Appointment Duration:</span>
                <span className="font-bold text-emerald-300">30 Minutes</span>
              </div>
            </div>
            <Link
              to="/booking"
              className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-base shadow-lg hover:shadow-teal-500/40 transition-all"
            >
              Start Online Booking Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
