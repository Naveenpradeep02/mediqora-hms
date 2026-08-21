import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  DollarSign,
  Search,
  CheckCircle2,
  Stethoscope,
  Pill,
  Syringe,
  Activity,
  User,
  Phone,
  Send,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredInvoices,
  saveInvoices,
  getStoredInventory,
  saveInventory,
  defaultDoctors,
  defaultServices
} from '../../services/dataService';
import toast from 'react-hot-toast';

const Billing = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState(getStoredInvoices);
  const [inventory, setInventory] = useState(getStoredInventory);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeInvoiceReceipt, setActiveInvoiceReceipt] = useState(null);

  // New Invoice Generator Form State
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorId, setDoctorId] = useState('DOC-RAJAN');
  const [paymentMethod, setPaymentMethod] = useState('Paid (Cash)');

  // Itemized Line Items State
  // 1. Doctor Fee Item
  const [includeDoctorFee, setIncludeDoctorFee] = useState(true);
  const [doctorFeeAmount, setDoctorFeeAmount] = useState(500);

  // 2. Selected Medicines Items
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [currentMedId, setCurrentMedId] = useState('');
  const [currentMedQty, setCurrentMedQty] = useState(1);

  // 3. Injection Fee Item
  const [includeInjection, setIncludeInjection] = useState(false);
  const [injectionFeeAmount, setInjectionFeeAmount] = useState(200);
  const [injectionNote, setInjectionNote] = useState('IV Drip / Intramuscular Injection');

  // 4. Other Services Item (ECG, Scan, Dressing, etc.)
  const [selectedOtherServices, setSelectedOtherServices] = useState([]);
  const [currentServiceId, setCurrentServiceId] = useState('');

  const [discountAmount, setDiscountAmount] = useState(0);

  // Handle Adding Medicine to Line Item
  const handleAddMedicineItem = () => {
    if (!currentMedId) return;
    const medObj = inventory.find(m => m.id === currentMedId);
    if (!medObj) return;

    if (currentMedQty > medObj.stockQty) {
      toast.error(`Not enough stock available for ${medObj.name}. Stock: ${medObj.stockQty}`);
      return;
    }

    const itemTotal = medObj.mrp * currentMedQty;
    setSelectedMedicines([
      ...selectedMedicines,
      {
        id: medObj.id,
        name: medObj.name,
        qty: currentMedQty,
        mrp: medObj.mrp,
        buyingPrice: medObj.buyingPrice,
        amount: itemTotal
      }
    ]);
    toast.success(`Added ${medObj.name} x${currentMedQty} to bill.`);
  };

  const handleRemoveMedicineItem = (index) => {
    setSelectedMedicines(selectedMedicines.filter((_, idx) => idx !== index));
  };

  // Handle Adding Other Service (ECG / Scan / Dressing) to Bill
  const handleAddOtherService = () => {
    if (!currentServiceId) return;
    const sObj = defaultServices.find(s => String(s.id) === String(currentServiceId));
    if (!sObj) return;

    setSelectedOtherServices([
      ...selectedOtherServices,
      { id: sObj.id, name: sObj.name, category: sObj.category, amount: sObj.fee }
    ]);
    toast.success(`Added ${sObj.name} (₹${sObj.fee}) to bill.`);
  };

  const handleRemoveOtherService = (index) => {
    setSelectedOtherServices(selectedOtherServices.filter((_, idx) => idx !== index));
  };

  // Calculate Subtotals
  const docFeeTotal = includeDoctorFee ? parseFloat(doctorFeeAmount || 0) : 0;
  const medTotal = selectedMedicines.reduce((sum, m) => sum + m.amount, 0);
  const injectionTotal = includeInjection ? parseFloat(injectionFeeAmount || 0) : 0;
  const otherServicesTotal = selectedOtherServices.reduce((sum, s) => sum + s.amount, 0);

  const subtotal = docFeeTotal + medTotal + injectionTotal + otherServicesTotal;
  const netTotal = Math.max(0, subtotal - parseFloat(discountAmount || 0));

  // Generate & Save Itemized Bill Invoice
  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!patientName || !phone) {
      toast.error('Patient Name and Phone are required for billing.');
      return;
    }

    const assignedDoc = defaultDoctors.find(d => d.id === doctorId);
    const invoiceId = `INV-2026-${Date.now().toString().slice(-4)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    // Build line items array
    const lineItems = [];
    if (includeDoctorFee) {
      lineItems.push({
        type: 'Doctor Fee',
        description: `${assignedDoc?.name || 'Doctor'} Consultation Fee`,
        amount: docFeeTotal
      });
    }

    selectedMedicines.forEach(m => {
      lineItems.push({
        type: 'Medicine',
        description: `${m.name} (${m.qty} x ₹${m.mrp})`,
        amount: m.amount
      });
    });

    if (includeInjection) {
      lineItems.push({
        type: 'Injection Fee',
        description: injectionNote,
        amount: injectionTotal
      });
    }

    selectedOtherServices.forEach(s => {
      lineItems.push({
        type: 'Other Service',
        description: `${s.name} (${s.category})`,
        amount: s.amount
      });
    });

    const newInvoice = {
      id: invoiceId,
      patientName,
      phone,
      date: todayStr,
      doctorName: assignedDoc?.name || 'Dr. R.R. Rajan',
      doctorFee: docFeeTotal,
      medicineCharges: medTotal,
      injectionCharges: injectionTotal,
      otherServiceCharges: otherServicesTotal,
      subtotal,
      discount: parseFloat(discountAmount || 0),
      netTotal,
      paymentMethod,
      items: lineItems
    };

    // Deduct medicine stock automatically upon bill generation!
    let updatedInv = [...inventory];
    selectedMedicines.forEach(m => {
      updatedInv = updatedInv.map(invItem => {
        if (invItem.id === m.id) {
          return { ...invItem, stockQty: Math.max(0, invItem.stockQty - m.qty) };
        }
        return invItem;
      });
    });

    setInventory(updatedInv);
    saveInventory(updatedInv);

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);

    toast.success(`🎉 Itemized Invoice ${invoiceId} generated & stock updated!`);
    setIsBillingModalOpen(false);
    setActiveInvoiceReceipt(newInvoice);

    // Reset Form
    setPatientName('');
    setPhone('');
    setSelectedMedicines([]);
    setSelectedOtherServices([]);
  };

  // Filtered Invoices Search
  const filteredInvoices = invoices.filter(inv =>
    inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block mb-1">
            Itemized Billing & Invoice Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#16a34a]" /> RRK Itemized Bill & Receipt Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Generate itemized receipts with separate Doctor Fees, Medicine MRP, Injection Charges & ECG/Scan Fees.
          </p>
        </div>

        <button
          onClick={() => setIsBillingModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" /> Create New Itemized Bill
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-xs flex items-center justify-between gap-4 text-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, patient name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[900px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Invoice Ref #</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Patient Info</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Consulting Doctor</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Doctor Fee</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Medicine Charges</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Services & Injection</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Net Bill Paid</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-green-50/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-black text-[#15803d] text-xs whitespace-nowrap">
                    {inv.id}
                    <p className="text-[10px] text-slate-400 font-normal">{inv.date}</p>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 min-w-[150px]">
                    {inv.patientName}
                    <p className="text-[10px] text-slate-400 font-normal">{inv.phone}</p>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-[#14532d] whitespace-nowrap">
                    {inv.doctorName}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-800 whitespace-nowrap">
                    ₹{inv.doctorFee}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-[#15803d] whitespace-nowrap">
                    ₹{inv.medicineCharges}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                    ₹{(inv.injectionCharges || 0) + (inv.otherServiceCharges || 0)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-black text-emerald-700 text-sm block">₹{inv.netTotal}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{inv.paymentMethod}</span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveInvoiceReceipt(inv)}
                      className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors inline-flex items-center justify-center border border-transparent hover:border-green-200 cursor-pointer"
                      title="View & Print Itemized Bill Receipt"
                    >
                      <Printer className="w-4 h-4 text-[#16a34a]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW ITEMIZED BILL MODAL */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-green-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider">Itemized Patient Billing Generator</span>
                <h3 className="text-xl font-black text-slate-900">Create New Bill Receipt</h3>
              </div>
              <button
                onClick={() => setIsBillingModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-6 text-xs">
              {/* Patient & Doctor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Consulting Doctor *</label>
                  <select
                    value={doctorId}
                    onChange={(e) => {
                      setDoctorId(e.target.value);
                      const d = defaultDoctors.find(doc => doc.id === e.target.value);
                      if (d) setDoctorFeeAmount(d.fee);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    {defaultDoctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} (₹{d.fee})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ITEMIZED CHARGES BUILDER */}

              {/* 1. Doctor Consultation Fee */}
              <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#14532d] uppercase text-xs flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#16a34a]" /> 1. Doctor Consultation Fee (Separate)
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDoctorFee}
                      onChange={(e) => setIncludeDoctorFee(e.target.checked)}
                      className="rounded text-[#16a34a]"
                    />
                    <span className="font-bold text-slate-700">Include Fee</span>
                  </label>
                </div>

                {includeDoctorFee && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-slate-600 font-semibold">Consultation Amount (₹):</span>
                    <input
                      type="number"
                      value={doctorFeeAmount}
                      onChange={(e) => setDoctorFeeAmount(parseFloat(e.target.value) || 0)}
                      className="w-32 p-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* 2. Pharmacy Medicine Charges (MRP with Auto-stock deduction) */}
              <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 space-y-3">
                <span className="font-extrabold text-[#14532d] uppercase text-xs flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-[#16a34a]" /> 2. Pharmacy Medicines Charges (MRP Separate)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <select
                    value={currentMedId}
                    onChange={(e) => setCurrentMedId(e.target.value)}
                    className="sm:col-span-6 p-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 text-xs"
                  >
                    <option value="">-- Select Medicine from Inventory --</option>
                    {inventory.map(m => (
                      <option key={m.id} value={m.id} disabled={m.stockQty <= 0}>
                        {m.name} (Stock: {m.stockQty} | MRP: ₹{m.mrp})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={currentMedQty}
                    onChange={(e) => setCurrentMedQty(parseInt(e.target.value, 10) || 1)}
                    className="sm:col-span-3 p-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 text-xs"
                    placeholder="Qty"
                  />

                  <button
                    type="button"
                    onClick={handleAddMedicineItem}
                    className="sm:col-span-3 py-2 px-3 rounded-xl bg-[#16a34a] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    + Add Medicine
                  </button>
                </div>

                {/* Selected Medicines List */}
                {selectedMedicines.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {selectedMedicines.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-200 font-semibold">
                        <span>{m.name} ({m.qty} x ₹{m.mrp})</span>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[#15803d]">₹{m.amount}</span>
                          <button onClick={() => handleRemoveMedicineItem(idx)} type="button" className="text-rose-600 font-bold">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Injection Fee (Separate) */}
              <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#14532d] uppercase text-xs flex items-center gap-1.5">
                    <Syringe className="w-4 h-4 text-[#16a34a]" /> 3. Injection Charges (Separate)
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInjection}
                      onChange={(e) => setIncludeInjection(e.target.checked)}
                      className="rounded text-[#16a34a]"
                    />
                    <span className="font-bold text-slate-700">Include Injection</span>
                  </label>
                </div>

                {includeInjection && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Injection details (e.g. IV Drip / TT Injection)"
                      value={injectionNote}
                      onChange={(e) => setInjectionNote(e.target.value)}
                      className="p-2 rounded-xl bg-white border border-slate-200 font-semibold"
                    />
                    <input
                      type="number"
                      placeholder="Fee (₹)"
                      value={injectionFeeAmount}
                      onChange={(e) => setInjectionFeeAmount(parseFloat(e.target.value) || 0)}
                      className="p-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* 4. Other Services (ECG, Scan, Dressing, Lab - Separate) */}
              <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 space-y-3">
                <span className="font-extrabold text-[#14532d] uppercase text-xs flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#16a34a]" /> 4. Other Clinical Services (ECG, Scan, Dressing - Separate)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <select
                    value={currentServiceId}
                    onChange={(e) => setCurrentServiceId(e.target.value)}
                    className="sm:col-span-9 p-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 text-xs"
                  >
                    <option value="">-- Select Service (ECG, Scan, Dressing) --</option>
                    {defaultServices.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ₹{s.fee} ({s.category})</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddOtherService}
                    className="sm:col-span-3 py-2 px-3 rounded-xl bg-[#16a34a] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    + Add Service
                  </button>
                </div>

                {/* Selected Other Services List */}
                {selectedOtherServices.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {selectedOtherServices.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-200 font-semibold">
                        <span>{s.name} ({s.category})</span>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[#15803d]">₹{s.amount}</span>
                          <button onClick={() => handleRemoveOtherService(idx)} type="button" className="text-rose-600 font-bold">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PAYMENT & DISCOUNT SUMMARY */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span>Gross Subtotal:</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span>Discount Amount (₹):</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-28 p-1 px-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-right"
                  />
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-sm">
                  <span className="font-extrabold text-emerald-300">NET BILL AMOUNT TO PAY:</span>
                  <span className="font-black text-xl text-emerald-400">₹{netTotal}</span>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Payment Mode:</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="p-1 px-2 rounded-lg bg-slate-800 text-white font-bold text-xs"
                  >
                    <option value="Paid (Cash)">Paid (Cash)</option>
                    <option value="Paid (UPI)">Paid (UPI)</option>
                    <option value="Paid (Card)">Paid (Card)</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBillingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Save Bill & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL ITEMIZED BILL RECEIPT MODAL */}
      {activeInvoiceReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-green-100 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider">Official Patient Invoice</span>
                <h3 className="text-xl font-black text-slate-900">{activeInvoiceReceipt.id}</h3>
              </div>
              <button
                onClick={() => setActiveInvoiceReceipt(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* PRINTABLE RECEIPT CONTAINER */}
            <div className="p-6 rounded-2xl bg-green-50/40 border border-green-100 space-y-4 text-xs">
              <div className="flex justify-between border-b border-green-200 pb-3">
                <div>
                  <h2 className="font-black text-slate-900 text-base">RRK CLINIC & HOSPITAL</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Anna Nagar & T. Nagar, Chennai</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 block">Date: {activeInvoiceReceipt.date}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-black uppercase">
                    {activeInvoiceReceipt.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p><strong>Patient Name:</strong> {activeInvoiceReceipt.patientName}</p>
                <p><strong>Phone:</strong> {activeInvoiceReceipt.phone}</p>
                <p><strong>Doctor:</strong> {activeInvoiceReceipt.doctorName}</p>
              </div>

              {/* Itemized Lines */}
              <div className="space-y-2 border-t border-b border-green-200 py-3">
                <span className="font-black uppercase text-[10px] text-[#15803d] block">Itemized Charges Breakdown</span>
                {activeInvoiceReceipt.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{item.type}: {item.description}</span>
                    <span className="font-extrabold text-slate-900">₹{item.amount}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right pt-1">
                {activeInvoiceReceipt.discount > 0 && (
                  <p className="text-slate-500">Discount: -₹{activeInvoiceReceipt.discount}</p>
                )}
                <p className="text-base font-black text-[#14532d]">GRAND TOTAL PAID: ₹{activeInvoiceReceipt.netTotal}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Bill Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Billing;
