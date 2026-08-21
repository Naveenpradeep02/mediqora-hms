import React from 'react';
import { Phone, MapPin, Clock, Mail } from 'lucide-react';
import logoImg from '../assets/LOGO-EDIT 1.png';

const Footer = () => {
  return (
    <footer className="bg-[#F0FDF4] text-slate-700 pt-12 pb-8 border-t border-[#BBF7D0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#BBF7D0]">
          
          {/* Col 1 */}
          <div className="space-y-3">
            <img src={logoImg} alt="Shree Ram Homeo Logo" className="h-12 w-auto object-contain" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Holistic, non-surgical homeopathic care and constitutional remedies across Anna Nagar and West Mambalam / T Nagar in Chennai.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16a34a] bg-white border border-[#BBF7D0] px-3 py-1.5 rounded-xl shadow-xs">
                <Mail className="w-4 h-4 text-[#16a34a]" /> dr.selvakumarr@gmail.com
              </div>
            </div>
          </div>

          {/* Col 2: West Mambalam / T Nagar */}
          <div className="space-y-2 text-xs bg-white p-4 rounded-2xl border border-[#BBF7D0] shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#16a34a]" /> West Mambalam / T Nagar Branch
            </h4>
            <p className="text-slate-700 font-medium">
              58, Arya Gowder Road, West Mambalam, Chennai - 600033
              <span className="block text-slate-500 text-[11px]">(Near Panigraha Marriage Hall)</span>
            </p>
            <p className="text-slate-900 font-bold flex items-center gap-1.5 pt-0.5">
              <Phone className="w-3.5 h-3.5 text-[#16a34a]" /> 044 2483 7465 / 95515 19766
            </p>
            <div className="text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#16a34a]" /> <strong>Mon – Sat:</strong> 10:00 AM – 2:00 PM & 6:30 PM – 9:00 PM</p>
              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#16a34a]" /> <strong>Sunday:</strong> 11:00 AM – 2:00 PM</p>
            </div>
          </div>

          {/* Col 3: Anna Nagar */}
          <div className="space-y-2 text-xs bg-white p-4 rounded-2xl border border-[#BBF7D0] shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#16a34a]" /> Anna Nagar Branch
            </h4>
            <p className="text-slate-700 font-medium">
              G-2, Firm Foundation, Plot No : 3738, 6/22, 17th Street, Q Block, Anna Nagar, Chennai - 600040
              <span className="block text-slate-500 text-[11px]">(Near K4 Police Station)</span>
            </p>
            <p className="text-slate-900 font-bold flex items-center gap-1.5 pt-0.5">
              <Phone className="w-3.5 h-3.5 text-[#16a34a]" /> CELL: 95515 19766
            </p>
            <div className="text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#16a34a]" /> <strong>Mon – Sat:</strong> 4:00 PM – 6:00 PM</p>
              <p className="flex items-center gap-1.5 text-rose-600"><Clock className="w-3.5 h-3.5 text-rose-500" /> <strong>Sunday:</strong> HOLIDAY</p>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>&copy; 2026 Shree Ram Homeo Clinics. All rights reserved.</p>
          <p className="text-slate-600 font-semibold">
            Designed & Developed by{' '}
            <a
              href="http://medgrowdigi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#16a34a] hover:underline font-extrabold"
            >
              Medgrow Marketing Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
