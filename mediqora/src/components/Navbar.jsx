import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, Mail } from 'lucide-react';
import logoImg from '../assets/LOGO-EDIT 1.png';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-[#BBF7D0]/60 sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="Shree Ram Homeo Logo"
            className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Right Info */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-medium text-slate-700 bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-2 rounded-full">
            <span className="flex items-center gap-1.5 text-[#16a34a] font-bold">
              <Phone className="w-3.5 h-3.5 text-[#16a34a]" /> 95515 19766 / 044 2483 7465
            </span>
            <span className="hidden sm:inline text-[#BBF7D0]">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-700 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#16a34a]" /> dr.selvakumarr@gmail.com
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
