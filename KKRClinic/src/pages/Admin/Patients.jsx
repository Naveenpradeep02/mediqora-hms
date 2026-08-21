import React, { useState } from 'react';
import { Users, Search, Phone, Mail, Calendar, Eye } from 'lucide-react';
import { getStoredAppointments } from '../../services/dataService';
import { Link } from 'react-router-dom';

const Patients = () => {
  const appointments = getStoredAppointments();
  const [search, setSearch] = useState('');

  // Extract unique patient records by phone
  const patientMap = new Map();
  appointments.forEach(a => {
    if (!patientMap.has(a.phone)) {
      patientMap.set(a.phone, {
        name: a.patientName,
        phone: a.phone,
        email: a.email,
        lastDoctor: a.doctor,
        lastVisit: a.date,
        totalVisits: 1,
        lastAptId: a.id
      });
    } else {
      const existing = patientMap.get(a.phone);
      existing.totalVisits += 1;
    }
  });

  const patientList = Array.from(patientMap.values()).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  return (
    <div className="space-y-6 font-sans pb-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block mb-1">
            Patient Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-[#16a34a]" /> Patient Medical Case Database
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Registered patients across Dr. Rajan & Dr. Anitha OPD desks.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black text-slate-800">Patient Name</th>
                <th className="py-4 px-4 font-black text-slate-800">Phone & Email</th>
                <th className="py-4 px-4 font-black text-slate-800">Primary Doctor</th>
                <th className="py-4 px-4 font-black text-slate-800">Total OPD Visits</th>
                <th className="py-4 px-4 font-black text-slate-800">Last Visit</th>
                <th className="py-4 px-6 font-black text-slate-800 text-right">Case File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {patientList.map((p, idx) => (
                <tr key={idx} className="hover:bg-green-50/30 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-slate-900">{p.name}</td>
                  <td className="py-4 px-4 font-semibold text-slate-700">{p.phone} <p className="text-[10px] text-slate-400">{p.email}</p></td>
                  <td className="py-4 px-4 font-bold text-[#14532d]">{p.lastDoctor}</td>
                  <td className="py-4 px-4 font-black text-[#16a34a]">{p.totalVisits} Consultations</td>
                  <td className="py-4 px-4 font-medium text-slate-600">{p.lastVisit}</td>
                  <td className="py-4 px-6 text-right">
                    <Link to={`/admin/appointments/${p.lastAptId}`} className="p-2 rounded-xl text-[#16a34a] bg-green-50 hover:bg-green-100 inline-flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </Link>
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

export default Patients;
