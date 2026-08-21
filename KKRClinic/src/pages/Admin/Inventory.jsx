import React, { useState } from 'react';
import {
  Pill,
  AlertTriangle,
  CalendarOff,
  Plus,
  Search,
  Edit,
  TrendingUp,
  MinusCircle,
  PlusCircle,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Box
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredInventory, saveInventory } from '../../services/dataService';
import toast from 'react-hot-toast';

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState(getStoredInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [alertFilter, setAlertFilter] = useState('ALL'); // 'ALL' | 'LOW_STOCK' | 'EXPIRED'

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tablets',
    lowStockLimit: 20,
    buyingPrice: 20,
    mrp: 45,
    supplier: 'Apex Pharma Distributors',
    batches: [
      { id: 'b-1', batchNo: 'BAT-2026-A1', stockQty: 50, expiryDate: '2027-06-30' }
    ]
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to calculate total stock quantity across all batches of an item
  const getItemTotalStock = (item) => {
    if (item.batches && item.batches.length > 0) {
      return item.batches.reduce((sum, b) => sum + (Number(b.stockQty) || 0), 0);
    }
    return Number(item.stockQty) || 0;
  };

  // Helper to get FEFO earliest expiry date among active batches of an item
  const getItemEarliestExpiry = (item) => {
    if (item.batches && item.batches.length > 0) {
      const sorted = [...item.batches].sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''));
      return sorted[0]?.expiryDate || item.expiryDate;
    }
    return item.expiryDate;
  };

  // Alert Counts
  const lowStockItems = inventory.filter(item => getItemTotalStock(item) <= item.lowStockLimit);
  const expiredItems = inventory.filter(item => getItemEarliestExpiry(item) <= todayStr);

  // Valuation Calculation (Buying Price Total vs MRP Selling Price Total)
  const totalCostValuation = inventory.reduce((sum, i) => sum + (i.buyingPrice * getItemTotalStock(i)), 0);
  const totalSellingValuation = inventory.reduce((sum, i) => sum + (i.mrp * getItemTotalStock(i)), 0);
  const totalPotentialProfit = totalSellingValuation - totalCostValuation;

  // Search & Filter
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.batchNo && item.batchNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.batches && item.batches.some(b => b.batchNo.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = categoryFilter === 'ALL' || item.category.includes(categoryFilter);
    
    let matchesAlert = true;
    if (alertFilter === 'LOW_STOCK') matchesAlert = getItemTotalStock(item) <= item.lowStockLimit;
    if (alertFilter === 'EXPIRED') matchesAlert = getItemEarliestExpiry(item) <= todayStr;

    return matchesSearch && matchesCategory && matchesAlert;
  });

  // Stock Quantity Adjust (+ or - on earliest batch)
  const handleAdjustStock = (id, delta) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        let batches = item.batches ? [...item.batches] : [
          { id: 'b-1', batchNo: item.batchNo || 'BAT-2026-A1', stockQty: item.stockQty, expiryDate: item.expiryDate }
        ];
        
        if (batches.length > 0) {
          // Adjust stock on the first (earliest) batch
          const newQty = Math.max(0, (Number(batches[0].stockQty) || 0) + delta);
          batches[0] = { ...batches[0], stockQty: newQty };
        }

        const totalStock = batches.reduce((sum, b) => sum + (Number(b.stockQty) || 0), 0);
        const sortedByExpiry = [...batches].sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''));
        const earliestExpiry = sortedByExpiry[0]?.expiryDate || item.expiryDate;
        const primaryBatchNo = batches.length === 1 ? batches[0].batchNo : `${batches[0].batchNo} (+${batches.length - 1} more)`;

        return {
          ...item,
          batches,
          stockQty: totalStock,
          expiryDate: earliestExpiry,
          batchNo: primaryBatchNo
        };
      }
      return item;
    });

    setInventory(updated);
    saveInventory(updated);
    toast.success('Stock quantity updated.');
  };

  // Open Modal (Add / Edit)
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      const batches = item.batches && item.batches.length > 0 
        ? item.batches.map(b => ({ ...b }))
        : [{ id: 'b-1', batchNo: item.batchNo || 'BAT-2026-A1', stockQty: item.stockQty || 50, expiryDate: item.expiryDate || '2027-06-30' }];

      setFormData({
        name: item.name,
        category: item.category,
        lowStockLimit: item.lowStockLimit,
        buyingPrice: item.buyingPrice,
        mrp: item.mrp,
        supplier: item.supplier || 'Apex Pharma Distributors',
        batches
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Tablets',
        lowStockLimit: 20,
        buyingPrice: 25,
        mrp: 50,
        supplier: 'Apex Pharma Distributors',
        batches: [
          { id: `b-${Date.now()}-1`, batchNo: `BAT-2026-A1`, stockQty: 50, expiryDate: '2027-06-30' }
        ]
      });
    }
    setIsModalOpen(true);
  };

  // Batch Form Handlers
  const handleAddBatchRow = () => {
    const nextIdx = formData.batches.length + 1;
    const newBatch = {
      id: `b-${Date.now()}-${nextIdx}`,
      batchNo: `BAT-2026-A${nextIdx}`,
      stockQty: 50,
      expiryDate: '2027-12-31'
    };
    setFormData({
      ...formData,
      batches: [...formData.batches, newBatch]
    });
    toast.success('Added new purchase batch row.');
  };

  const handleBatchChange = (index, field, value) => {
    const updatedBatches = [...formData.batches];
    updatedBatches[index] = {
      ...updatedBatches[index],
      [field]: field === 'stockQty' ? (parseInt(value, 10) || 0) : value
    };
    setFormData({ ...formData, batches: updatedBatches });
  };

  const handleRemoveBatchRow = (index) => {
    if (formData.batches.length <= 1) {
      toast.error('At least 1 purchase batch is required per medicine.');
      return;
    }
    const updatedBatches = formData.batches.filter((_, i) => i !== index);
    setFormData({ ...formData, batches: updatedBatches });
    toast.success('Batch row removed.');
  };

  // Calculate live modal batch stats
  const calculatedTotalStock = formData.batches.reduce((sum, b) => sum + (Number(b.stockQty) || 0), 0);
  const sortedModalBatches = [...formData.batches].sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''));
  const calculatedEarliestExpiry = sortedModalBatches[0]?.expiryDate || '2027-12-31';

  // Handle Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Medicine Name is required.');
      return;
    }

    if (formData.batches.some(b => !b.batchNo.trim() || !b.expiryDate)) {
      toast.error('All batch rows must have a valid Batch Number and Expiry Date.');
      return;
    }

    const totalStock = calculatedTotalStock;
    const earliestExpiry = calculatedEarliestExpiry;
    const primaryBatchNo = formData.batches.length === 1 
      ? formData.batches[0].batchNo 
      : `${formData.batches[0].batchNo} (+${formData.batches.length - 1} more)`;

    const updatedItemData = {
      name: formData.name.trim(),
      category: formData.category,
      lowStockLimit: parseInt(formData.lowStockLimit, 10) || 15,
      buyingPrice: parseFloat(formData.buyingPrice) || 0,
      mrp: parseFloat(formData.mrp) || 0,
      supplier: formData.supplier,
      batches: formData.batches,
      stockQty: totalStock,
      expiryDate: earliestExpiry,
      batchNo: primaryBatchNo
    };

    let updated;
    if (editingItem) {
      updated = inventory.map(i => i.id === editingItem.id ? { ...i, ...updatedItemData } : i);
      toast.success(`Medicine "${formData.name}" & batch stock updated successfully.`);
    } else {
      const newItem = {
        id: `MED-${Date.now().toString().slice(-4)}`,
        ...updatedItemData
      };
      updated = [newItem, ...inventory];
      toast.success(`New Medicine "${formData.name}" added to inventory with ${formData.batches.length} batch(es).`);
    }

    setInventory(updated);
    saveInventory(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-green-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-block">
              Pharmacy & Medical Stock Control
            </span>
            <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Multi-Batch & Expiry Enabled
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-7 h-7 text-[#16a34a]" /> Inventory Stock & Multi-Expiry Manager
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track medicine stock quantities, add multiple purchase batches before old stock empties, and monitor earliest expiry dates (FEFO).
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="px-5 py-3 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" /> Add New Medicine Stock
        </button>
      </div>

      {/* ALERT SUMMARY CARDS (LOW STOCK & EXPIRED MEDICINE WARNINGS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Low Stock Alert Card */}
        <div className={`p-5 rounded-3xl border shadow-xs flex items-center justify-between transition-all ${
          lowStockItems.length > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider block text-amber-800">Low Stock Alert</span>
            <span className="text-3xl font-black text-amber-900 mt-1 block">{lowStockItems.length} Medicines</span>
            <span className="text-[11px] font-bold text-amber-700 mt-1 inline-block">Stock Below Threshold</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-black">
            <AlertTriangle className="w-6 h-6 text-amber-800" />
          </div>
        </div>

        {/* Expired Medicine Alert Card */}
        <div className={`p-5 rounded-3xl border shadow-xs flex items-center justify-between transition-all ${
          expiredItems.length > 0 ? 'bg-rose-50/80 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider block text-rose-800">Expired Medicines</span>
            <span className="text-3xl font-black text-rose-900 mt-1 block">{expiredItems.length} Items</span>
            <span className="text-[11px] font-bold text-rose-700 mt-1 inline-block">Requires Immediate Disposal</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-200/80 text-rose-900 flex items-center justify-center font-black">
            <CalendarOff className="w-6 h-6 text-rose-800" />
          </div>
        </div>

        {/* Total Profit Valuation Margin */}
        <div className="bg-white p-5 rounded-3xl border border-green-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider block text-slate-500">Inventory MRP Profit Margin</span>
            <span className="text-2xl font-black text-[#15803d] mt-1 block">₹{totalPotentialProfit.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-slate-500 mt-1 inline-block">
              Cost: ₹{totalCostValuation.toLocaleString()} | Selling: ₹{totalSellingValuation.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black">
            <TrendingUp className="w-6 h-6 text-[#16a34a]" />
          </div>
        </div>

      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicine name, batch number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
          >
            <option value="ALL">All Categories</option>
            <option value="Tablets">Tablets</option>
            <option value="Syrups">Syrups</option>
            <option value="Injections">Injections</option>
            <option value="Ointments">Ointments</option>
          </select>

          <select
            value={alertFilter}
            onChange={(e) => setAlertFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
          >
            <option value="ALL">All Stock Status</option>
            <option value="LOW_STOCK">Low Stock Alerts Only</option>
            <option value="EXPIRED">Expired Items Only</option>
          </select>
        </div>
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white rounded-3xl border border-green-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[950px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-green-100">
              <tr>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800">Medicine & Purchase Batches</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Category</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Combined Stock Qty</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Earliest Expiry (FEFO)</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Cost Price (₹)</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">MRP Selling (₹)</th>
                <th className="py-4 px-4 font-black whitespace-nowrap text-slate-800">Profit / Unit</th>
                <th className="py-4 px-6 font-black whitespace-nowrap text-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {filteredInventory.map((item) => {
                const totalStock = getItemTotalStock(item);
                const earliestExpiry = getItemEarliestExpiry(item);
                const isLowStock = totalStock <= item.lowStockLimit;
                const isExpired = earliestExpiry <= todayStr;
                const profitPerUnit = item.mrp - item.buyingPrice;
                const batchesCount = item.batches ? item.batches.length : 1;

                return (
                  <tr key={item.id} className={`hover:bg-green-50/30 transition-colors ${
                    isExpired ? 'bg-rose-50/40' : isLowStock ? 'bg-amber-50/30' : ''
                  }`}>
                    {/* Name & Multi-Batches breakdown */}
                    <td className="py-4 px-6 font-extrabold text-slate-900 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black">{item.name}</span>
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase">
                            EXPIRED
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase">
                            LOW STOCK
                          </span>
                        ) : null}
                      </div>

                      {/* Itemized Batches Summary */}
                      <div className="mt-1.5 space-y-1">
                        {item.batches && item.batches.length > 0 ? (
                          item.batches.map((batch, bIdx) => {
                            const bExpired = batch.expiryDate <= todayStr;
                            return (
                              <div
                                key={batch.id || bIdx}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono border mr-1 mb-1 ${
                                  bExpired
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <span className="font-extrabold">{batch.batchNo}</span>
                                <span className="text-[9px]">({batch.stockQty} units)</span>
                                <span className="text-[9px] opacity-75">Exp: {batch.expiryDate}</span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Batch: {item.batchNo}</span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {item.category}
                    </td>

                    {/* Total Stock Qty & Quick Adjust */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className={`font-black text-sm block ${isLowStock ? 'text-amber-700' : 'text-slate-900'}`}>
                            {totalStock} Units
                          </span>
                          <span className="text-[9px] font-bold text-[#16a34a] bg-green-50 px-1.5 py-0.5 rounded border border-green-200 inline-block">
                            {batchesCount} Purchase {batchesCount === 1 ? 'Batch' : 'Batches'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleAdjustStock(item.id, -1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Deduct 1 from earliest batch"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, 5)}
                            className="p-1 rounded bg-green-100 hover:bg-green-200 text-[#15803d] cursor-pointer"
                            title="Add +5 to earliest batch"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Min Limit: {item.lowStockLimit}</span>
                    </td>

                    {/* Earliest Expiry Date */}
                    <td className="py-4 px-4 whitespace-nowrap font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span className={isExpired ? 'text-rose-700 font-black' : 'text-slate-800'}>
                          {earliestExpiry}
                        </span>
                      </div>
                      {batchesCount > 1 && (
                        <span className="text-[9px] font-extrabold text-indigo-600 block mt-0.5">
                          ⚡ Earliest of {batchesCount} dates
                        </span>
                      )}
                    </td>

                    {/* Buying Price */}
                    <td className="py-4 px-4 font-semibold text-slate-600 whitespace-nowrap">
                      ₹{item.buyingPrice}
                    </td>

                    {/* MRP Selling Price */}
                    <td className="py-4 px-4 font-black text-[#15803d] whitespace-nowrap text-sm">
                      ₹{item.mrp}
                    </td>

                    {/* Profit per unit */}
                    <td className="py-4 px-4 font-extrabold text-emerald-700 whitespace-nowrap">
                      +₹{profitPerUnit}
                    </td>

                    {/* Edit Action */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 rounded-xl text-slate-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors inline-flex items-center justify-center border border-transparent hover:border-green-200 cursor-pointer"
                        title="Edit Medicine & Purchase Batches"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MEDICINE & MULTI-BATCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-green-100 relative my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] tracking-wider flex items-center gap-1">
                  <Box className="w-3 h-3 text-[#16a34a]" /> Multi-Batch Stock Control
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {editingItem ? 'Edit Medicine & Expiry Batches' : 'Add New Medicine & Purchase Batches'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 font-bold cursor-pointer hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              
              {/* BASIC DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol 650mg (Dolo)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Tablets / Antibiotics">Tablets / Antibiotics</option>
                    <option value="Syrups">Syrups</option>
                    <option value="Injections">Injections</option>
                    <option value="Ointments & Dressing">Ointments & Dressing</option>
                    <option value="Medical Accessories">Medical Accessories</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC MULTI-BATCH BUILDER SECTION */}
              <div className="p-4 rounded-2xl bg-green-50/60 border border-green-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#16a34a]" />
                      Stock Purchase Batches & Expiry Dates
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Add multiple batches if purchased before old stock runs out.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBatchRow}
                    className="px-3 py-1.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Purchase Batch
                  </button>
                </div>

                {/* BATCH ROWS LIST */}
                <div className="space-y-2.5">
                  {formData.batches.map((batch, index) => (
                    <div
                      key={batch.id || index}
                      className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Batch No #{index + 1}
                        </label>
                        <input
                          type="text"
                          required
                          value={batch.batchNo}
                          onChange={(e) => handleBatchChange(index, 'batchNo', e.target.value)}
                          placeholder="e.g. BAT-2026-A1"
                          className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Batch Stock Qty
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={batch.stockQty}
                          onChange={(e) => handleBatchChange(index, 'stockQty', e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-rose-700 uppercase mb-0.5">
                          Expiry Date (YYYY-MM-DD)
                        </label>
                        <input
                          type="date"
                          required
                          value={batch.expiryDate}
                          onChange={(e) => handleBatchChange(index, 'expiryDate', e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveBatchRow(index)}
                          disabled={formData.batches.length <= 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                          title="Remove batch row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BATCH STATS SUMMARY STRIP */}
                <div className="p-2.5 rounded-xl bg-white border border-green-200 flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-700 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                    <span>Combined Total Stock: <strong className="text-[#15803d] font-black">{calculatedTotalStock} Units</strong> across {formData.batches.length} batch(es)</span>
                  </div>
                  <div>
                    <span>Earliest Expiry (FEFO): <strong className="text-rose-700 font-black">{calculatedEarliestExpiry}</strong></span>
                  </div>
                </div>
              </div>

              {/* PRICING & LIMITS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Low Stock Alert Limit</label>
                  <input
                    type="number"
                    value={formData.lowStockLimit}
                    onChange={(e) => setFormData({ ...formData, lowStockLimit: parseInt(e.target.value, 10) || 15 })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Buying Price (Cost ₹)</label>
                  <input
                    type="number"
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-[#15803d] uppercase mb-1">MRP (Selling Price ₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-black shadow-md cursor-pointer"
                >
                  {editingItem ? 'Save Multi-Batch Stock Changes' : 'Add Medicine to Inventory'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
