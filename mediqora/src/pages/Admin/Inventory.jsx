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

  const getItemTotalStock = (item) => {
    if (item.batches && item.batches.length > 0) {
      return item.batches.reduce((sum, b) => sum + (Number(b.stockQty) || 0), 0);
    }
    return Number(item.stockQty) || 0;
  };

  const getItemEarliestExpiry = (item) => {
    if (item.batches && item.batches.length > 0) {
      const sorted = [...item.batches].sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''));
      return sorted[0]?.expiryDate || item.expiryDate;
    }
    return item.expiryDate;
  };

  const lowStockItems = inventory.filter(item => getItemTotalStock(item) <= item.lowStockLimit);
  const expiredItems = inventory.filter(item => getItemEarliestExpiry(item) <= todayStr);

  const totalCostValuation = inventory.reduce((sum, i) => sum + (i.buyingPrice * getItemTotalStock(i)), 0);
  const totalSellingValuation = inventory.reduce((sum, i) => sum + (i.mrp * getItemTotalStock(i)), 0);

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

  const handleAdjustStock = (id, delta) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        let batches = item.batches ? [...item.batches] : [
          { id: 'b-1', batchNo: item.batchNo || 'BAT-2026-A1', stockQty: item.stockQty, expiryDate: item.expiryDate }
        ];
        
        if (batches.length > 0) {
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

  return (
    <div className="space-y-6 font-sans pb-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBF7D0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#15803d] bg-green-100 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block mb-1">
            Pharmacy Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-7 h-7 text-[#16a34a]" /> Pharmacy & FEFO Multi-Batch Stock Manager
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Multi-batch stock entry, FEFO earliest expiry date tracking, and low stock re-order alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#BBF7D0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Total Items Listed</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{inventory.length} Medicines</span>
            <span className="text-xs text-[#16a34a] font-bold mt-1 inline-block">Stock Valuation: ₹{totalSellingValuation.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#16a34a] flex items-center justify-center font-black">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">Low Stock Alert</span>
            <span className="text-3xl font-black text-amber-900 mt-1 block">{lowStockItems.length} Items</span>
            <span className="text-xs text-amber-700 font-bold mt-1 inline-block">Below Re-order Threshold</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider block">Expired Stock</span>
            <span className="text-3xl font-black text-rose-900 mt-1 block">{expiredItems.length} Batches</span>
            <span className="text-xs text-rose-700 font-bold mt-1 inline-block">Requires Immediate Quarantine</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
            <CalendarOff className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#BBF7D0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[800px] border-collapse">
            <thead className="bg-green-50/70 text-xs font-black uppercase text-slate-700 border-b border-[#BBF7D0]">
              <tr>
                <th className="py-4 px-6 font-black text-slate-800">Medicine Name</th>
                <th className="py-4 px-4 font-black text-slate-800">Category</th>
                <th className="py-4 px-4 font-black text-slate-800">Batch No</th>
                <th className="py-4 px-4 font-black text-slate-800">Total Stock Qty</th>
                <th className="py-4 px-4 font-black text-slate-800">Earliest Expiry</th>
                <th className="py-4 px-4 font-black text-slate-800">MRP</th>
                <th className="py-4 px-6 font-black text-slate-800 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const totalStock = getItemTotalStock(item);
                const earliestExpiry = getItemEarliestExpiry(item);
                const isLow = totalStock <= item.lowStockLimit;
                const isExpired = earliestExpiry <= todayStr;

                return (
                  <tr key={item.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900">{item.name}</td>
                    <td className="py-4 px-4 font-bold text-slate-700">{item.category}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-800">{item.batchNo}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                        isLow ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-green-100 text-[#15803d] border-[#BBF7D0]'
                      }`}>
                        {totalStock} Units
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                        isExpired ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {earliestExpiry}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-[#16a34a]">₹{item.mrp}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleAdjustStock(item.id, -1)} className="p-1 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold">-1</button>
                        <button onClick={() => handleAdjustStock(item.id, +1)} className="p-1 rounded-lg text-emerald-600 bg-green-50 hover:bg-green-100 font-bold">+1</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
