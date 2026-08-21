import React, { useState } from 'react';
import { FileText, Plus, Search, Eye, Printer, Download, DollarSign, CheckCircle2 } from 'lucide-react';
import { getStoredInvoices, saveInvoices } from '../../services/dataService';
import toast from 'react-hot-toast';

const Billing = () => {
  const [invoices, setInvoices] = useState(getStoredInvoices);
  const [search, setSearch] = useState('');
  const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);

  const filteredInvoices = invoices.filter(inv =>
    inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
    inv.id.toLowerCase().includes(search.toLowerCase()) ||
    inv.phone.includes(search)
  );

  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.netTotal || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block mb-1">
            Patient Financial Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#16a34a]" /> Itemized GST Patient Billing Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Generate itemized billing invoices for OPD doctor fees, pharmacy medicines, and diagnostic tests.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-green-50 border border-[#BBF7D0] text-[#15803d] font-black text-xs">
          Total Collection: ₹{totalCollected.toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice ID, patient name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#16a34a]"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[750px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-[#BBF7D0]">
              <tr>
                <th className="py-4 px-6 font-black text-slate-800">Invoice Ref</th>
                <th className="py-4 px-4 font-black text-slate-800">Patient Details</th>
                <th className="py-4 px-4 font-black text-slate-800">Consultant Doctor</th>
                <th className="py-4 px-4 font-black text-slate-800">Date</th>
                <th className="py-4 px-4 font-black text-slate-800">Net Total</th>
                <th className="py-4 px-4 font-black text-slate-800">Payment Status</th>
                <th className="py-4 px-6 font-black text-slate-800 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-green-50/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-black text-[#16a34a]">{inv.id}</td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">{inv.patientName} <p className="text-[10px] text-slate-400">{inv.phone}</p></td>
                  <td className="py-4 px-4 font-bold text-slate-800">{inv.doctorName}</td>
                  <td className="py-4 px-4 font-medium text-slate-600">{inv.date}</td>
                  <td className="py-4 px-4 font-black text-[#16a34a] text-sm">₹{inv.netTotal}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-[#15803d] border border-[#BBF7D0]">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => setActiveInvoiceModal(inv)} className="p-2 rounded-xl text-[#16a34a] bg-green-50 hover:bg-green-100 inline-flex items-center justify-center">
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#BBF7D0]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a]">Patient GST Billing Slip</span>
                <h3 className="text-xl font-black text-slate-900">{activeInvoiceModal.patientName}</h3>
                <p className="text-xs text-slate-400 font-mono">Invoice: {activeInvoiceModal.id}</p>
              </div>
              <button onClick={() => setActiveInvoiceModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              {activeInvoiceModal.items?.map((item, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">{item.description}</span>
                  <span className="font-black text-slate-900">₹{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-sm font-black text-[#16a34a]">
                <span>Net Amount Paid:</span>
                <span>₹{activeInvoiceModal.netTotal}</span>
              </div>
            </div>

            <button onClick={() => window.print()} className="w-full py-2.5 rounded-xl bg-[#16a34a] text-white font-black text-xs flex items-center justify-center gap-2">
              <Printer className="w-4 h-4 text-white" /> Print Bill Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
