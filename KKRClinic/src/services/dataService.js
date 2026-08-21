// RRK Clinic Expanded Data Store & Mock Data Manager
import { apiService } from './apiService';

export const defaultDoctors = [
  {
    id: 'DOC-RAJAN',
    name: 'Dr. R.R. Rajan',
    qualification: 'MBBS, MD (General Medicine), FICC (Cardiology)',
    specialty: 'General Medicine & Cardiology',
    experience: '18+ Years Experience',
    fee: 500,
    roomNo: 'OPD Desk #101',
    availableDays: 'Mon - Sat',
    availableHours: '09:00 AM - 01:00 PM & 05:00 PM - 09:00 PM',
    email: 'dr.rajan@rrkclinic.com',
    phone: '+91 98401 22334',
    badgeColor: 'bg-[#1e40af]'
  },
  {
    id: 'DOC-ANITHA',
    name: 'Dr. Anitha Rajan',
    qualification: 'MBBS, DCH (Pediatrics), DGO (Gynaecology)',
    specialty: 'Pediatrics & Gynaecology',
    experience: '15+ Years Experience',
    fee: 600,
    roomNo: 'OPD Desk #102',
    availableDays: 'Mon - Sat',
    availableHours: '10:00 AM - 02:00 PM & 04:30 PM - 08:30 PM',
    email: 'dr.anitha@rrkclinic.com',
    phone: '+91 98401 55667',
    badgeColor: 'bg-[#2563eb]'
  }
];

export const defaultServices = [
  { id: 1, name: 'General & Preventive Consultation', category: 'Doctor Fee', fee: 500 },
  { id: 2, name: 'Cardiology & ECG Screening', category: 'Diagnostic (ECG)', fee: 800 },
  { id: 3, name: 'Pediatric Checkup & Immunization', category: 'Doctor Fee', fee: 450 },
  { id: 4, name: 'Gynaecology & Ultrasound Scan', category: 'Diagnostic (Scan)', fee: 1200 },
  { id: 5, name: 'Wound Dressing & Sterile Bandaging', category: 'Nursing / Dressing', fee: 350 },
  { id: 6, name: 'IV Drip / Intramuscular Injection Fee', category: 'Injection Fee', fee: 200 }
];

export const defaultBranches = [
  { id: 1, name: 'RRK Clinic - Anna Nagar Main', address: 'Plot 42, 2nd Avenue, Anna Nagar East, Chennai - 600102', phone: '+91 44 2621 1122' },
  { id: 2, name: 'RRK Clinic - T. Nagar Specialty Desk', address: '88, Usman Road, T. Nagar, Chennai - 600017', phone: '+91 44 2434 5566' }
];

// INVENTORY STOCK MANAGEMENT (WITH BUYING PRICE, MRP, EXPIRY BATCHES, LOW STOCK ALERT LIMIT)
export const initialInventory = [
  {
    id: 'MED-101',
    name: 'Paracetamol 650mg (Dolo)',
    category: 'Tablets',
    batchNo: 'BAT-2026-A1 (+1 more)',
    stockQty: 118,
    lowStockLimit: 20,
    expiryDate: '2026-08-15',
    buyingPrice: 15,
    mrp: 30,
    supplier: 'Apex Pharma Distributors',
    batches: [
      { id: 'b1-1', batchNo: 'BAT-2026-A1', stockQty: 18, expiryDate: '2026-08-15' },
      { id: 'b1-2', batchNo: 'BAT-2026-A2', stockQty: 100, expiryDate: '2027-12-20' }
    ]
  },
  {
    id: 'MED-102',
    name: 'Amoxicillin 500mg Capsules',
    category: 'Tablets / Antibiotics',
    batchNo: 'BAT-2026-B4',
    stockQty: 120,
    lowStockLimit: 25,
    expiryDate: '2027-05-20',
    buyingPrice: 45,
    mrp: 90,
    supplier: 'Sun Life Pharma',
    batches: [
      { id: 'b2-1', batchNo: 'BAT-2026-B4', stockQty: 120, expiryDate: '2027-05-20' }
    ]
  },
  {
    id: 'MED-103',
    name: 'Tetanus Toxoid (TT Injection)',
    category: 'Injections',
    batchNo: 'BAT-2026-C9 (+1 more)',
    stockQty: 58,
    lowStockLimit: 15,
    expiryDate: '2026-07-30',
    buyingPrice: 20,
    mrp: 60,
    supplier: 'MedVax Supplies',
    batches: [
      { id: 'b3-1', batchNo: 'BAT-2026-C9', stockQty: 8, expiryDate: '2026-07-30' },
      { id: 'b3-2', batchNo: 'BAT-2026-C10', stockQty: 50, expiryDate: '2027-09-15' }
    ]
  },
  {
    id: 'MED-104',
    name: 'Pantoprazole 40mg (Pan-40)',
    category: 'Tablets',
    batchNo: 'BAT-2026-[#9]',
    stockQty: 85,
    lowStockLimit: 20,
    expiryDate: '2027-11-10',
    buyingPrice: 40,
    mrp: 85,
    supplier: 'Apex Pharma Distributors',
    batches: [
      { id: 'b4-1', batchNo: 'BAT-2026-[#9]', stockQty: 85, expiryDate: '2027-11-10' }
    ]
  },
  {
    id: 'MED-105',
    name: 'Cough Syrup (Benadryl 100ml)',
    category: 'Syrups',
    batchNo: 'BAT-2026-S2',
    stockQty: 14,
    lowStockLimit: 15,
    expiryDate: '2026-12-30',
    buyingPrice: 65,
    mrp: 120,
    supplier: 'HealthCare Pharma',
    batches: [
      { id: 'b5-1', batchNo: 'BAT-2026-S2', stockQty: 14, expiryDate: '2026-12-30' }
    ]
  },
  {
    id: 'MED-106',
    name: 'Betadine Antiseptic Ointment 20g',
    category: 'Ointments & Dressing',
    batchNo: 'BAT-2026-O7',
    stockQty: 45,
    lowStockLimit: 10,
    expiryDate: '2027-08-15',
    buyingPrice: 50,
    mrp: 95,
    supplier: 'MedVax Supplies',
    batches: [
      { id: 'b6-1', batchNo: 'BAT-2026-O7', stockQty: 45, expiryDate: '2027-08-15' }
    ]
  }
];

// Normalize item to ensure batches exist and FEFO calculation is applied
export function normalizeInventoryItem(item) {
  let batches = item.batches;
  if (!batches || !Array.isArray(batches) || batches.length === 0) {
    batches = [
      {
        id: `b-1`,
        batchNo: item.batchNo || 'BAT-2026-A1',
        stockQty: Number(item.stockQty) || 0,
        expiryDate: item.expiryDate || '2027-12-31'
      }
    ];
  }

  const totalStock = batches.reduce((sum, b) => sum + (Number(b.stockQty) || 0), 0);
  const sortedByExpiry = [...batches].sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''));
  const earliestExpiry = sortedByExpiry[0]?.expiryDate || item.expiryDate || '2027-12-31';
  const primaryBatchNo = batches.length === 1 
    ? batches[0].batchNo 
    : `${batches[0].batchNo} (+${batches.length - 1} more)`;

  return {
    ...item,
    batches,
    stockQty: totalStock,
    expiryDate: earliestExpiry,
    batchNo: primaryBatchNo
  };
}

// Helper functions for Persistence
export function getStoredInventory() {
  const saved = localStorage.getItem('rrk_inventory');
  const items = saved ? JSON.parse(saved) : initialInventory;
  return items.map(normalizeInventoryItem);
}

export function saveInventory(data) {
  localStorage.setItem('rrk_inventory', JSON.stringify(data));
}

export function getStoredInvoices() {
  const saved = localStorage.getItem('rrk_invoices');
  return saved ? JSON.parse(saved) : initialInvoices;
}

export function saveInvoices(data) {
  localStorage.setItem('rrk_invoices', JSON.stringify(data));
}

export function getStoredAppointments() {
  const saved = localStorage.getItem('rrk_appointments');
  return saved ? JSON.parse(saved) : initialAppointments;
}

export function saveAppointments(data) {
  localStorage.setItem('rrk_appointments', JSON.stringify(data));
}

// ITEMIZED BILLING INVOICES DATASET (CLEAN INITIAL STATE)
export const initialInvoices = [];

// APPOINTMENTS DATASET (CLEAN INITIAL STATE)
export const initialAppointments = [];

// CLINIC HOLIDAYS & EXCEPTIONAL CLOSURES DATASET (CLEAN INITIAL STATE)
export const initialHolidays = [];

// Helper functions for Services & Doctor Fee Persistence
export function getStoredServices() {
  const saved = localStorage.getItem('rrk_services');
  return saved ? JSON.parse(saved) : defaultServices;
}

export function saveServices(data) {
  localStorage.setItem('rrk_services', JSON.stringify(data));
}

export function getStoredDoctors() {
  const saved = localStorage.getItem('rrk_doctors');
  return saved ? JSON.parse(saved) : defaultDoctors;
}

export function saveDoctors(data) {
  localStorage.setItem('rrk_doctors', JSON.stringify(data));
}

export function getStoredHolidays() {
  const saved = localStorage.getItem('rrk_holidays');
  return saved ? JSON.parse(saved) : initialHolidays;
}

export function saveHolidays(data) {
  localStorage.setItem('rrk_holidays', JSON.stringify(data));
}

// HOSPITAL SAAS SUBSCRIPTION DATASET
export const initialSubscription = {
  planId: 'PLAN-PRO-12M',
  planName: '12 Months Plan (With Email Follow-up)',
  status: 'Active',
  priceMonthly: 42000,
  billingCycle: '12 Months (Annual)',
  renewalDate: '2027-08-16',
  maxDoctors: 5,
  maxBranches: 2,
  features: [
    'Multi-Doctor OPD Desk Management',
    'Pharmacy Inventory & FEFO Multi-Batch Control',
    'Itemized GST Patient Billing & Invoices',
    'Financial Ledger Accounts & Profit Analysis',
    'Clinic Holidays & Emergency Closures Sync',
    'Digital E-Prescriptions & Case History Records',
    'Patient SMS & WhatsApp Reminders'
  ],
  invoiceHistory: []
};

export function getStoredSubscription() {
  const saved = localStorage.getItem('rrk_subscription');
  let baseSub = saved ? JSON.parse(saved) : initialSubscription;

  const saasSettingsStr = localStorage.getItem('saasSettings');
  if (saasSettingsStr) {
    try {
      const parsed = JSON.parse(saasSettingsStr);
      if (parsed.pricingRates) {
        const rates = parsed.pricingRates;
        const custom3mPrice = Number(rates.p3m_noemail || rates.p3m_wemail);
        if (!isNaN(custom3mPrice) && custom3mPrice > 0) {
          baseSub = { ...baseSub, priceMonthly: custom3mPrice, pricingRates: rates };
        }
      }
    } catch (e) {}
  }

  return baseSub;
}

export function saveSubscription(data) {
  localStorage.setItem('rrk_subscription', JSON.stringify(data));
}

// BACKEND API ASYNC SYNCHRONIZATION HELPERS
export async function syncAppointmentsWithBackend() {
  try {
    const res = await apiService.fetchAppointments();
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      saveAppointments(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('Backend appointments sync fallback to local storage:', err.message);
  }
  return getStoredAppointments();
}

export async function syncServicesWithBackend() {
  try {
    const res = await apiService.fetchServices();
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      saveServices(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('Backend services sync fallback to local storage:', err.message);
  }
  return getStoredServices();
}

export async function syncHolidaysWithBackend() {
  try {
    const res = await apiService.fetchHolidays();
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      saveHolidays(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('Backend holidays sync fallback to local storage:', err.message);
  }
  return getStoredHolidays();
}

export async function syncSubscriptionWithBackend() {
  try {
    const res = await apiService.fetchSubscription('CLI-RRK-002');
    if (res && res.success) {
      const current = getStoredSubscription();
      let rates = res.pricingRates || current.pricingRates;
      if (typeof rates === 'string') {
        try { rates = JSON.parse(rates); } catch (e) {}
      }
      const updated = {
        ...current,
        planName: res.plan || current.planName,
        status: (res.status || 'Active').charAt(0).toUpperCase() + (res.status || 'Active').slice(1),
        isPaused: res.isPaused || res.status === 'paused',
        priceMonthly: Number(res.monthlyFee) || current.priceMonthly,
        renewalDate: res.nextBillingDate || current.renewalDate,
        pauseReason: res.pauseReason || current.pauseReason,
        pricingRates: rates,
        supportPhone: res.supportPhone || '+91 73735 09585',
        supportEmail: res.supportEmail || 'info@mediqora.in',
        lastPayment: res.lastPayment || current.lastPayment
      };
      saveSubscription(updated);
      return updated;
    }
  } catch (err) {
    console.warn('Backend subscription sync fallback to local storage:', err.message);
  }
  return getStoredSubscription();
}

export function getStoredBranches() {
  const saved = localStorage.getItem('rrk_branches');
  return saved ? JSON.parse(saved) : defaultBranches;
}

export function saveBranches(data) {
  localStorage.setItem('rrk_branches', JSON.stringify(data));
}

export const defaultKkrSettings = {
  name: 'RRK Hospital Administrator',
  email: 'admin@rrkclinic.com',
  phone: '+91 98401 00000',
  title: 'Executive Clinic Director'
};

export function getStoredSettings() {
  const saved = localStorage.getItem('rrk_settings');
  return saved ? JSON.parse(saved) : defaultKkrSettings;
}

export function saveSettings(data) {
  localStorage.setItem('rrk_settings', JSON.stringify(data));
}




