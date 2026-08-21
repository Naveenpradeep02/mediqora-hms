// RRK Clinic & Mediqora Expanded Data Store & Mock Data Manager

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

// Helper to detect active selected hospital client
export function getActiveClientId() {
  try {
    const saved = localStorage.getItem('mediqoro_selected_client');
    if (saved) {
      const client = JSON.parse(saved);
      return client.client_id || 'CLI-RRK-002';
    }
  } catch (e) {}
  return 'CLI-RRK-002';
}

// Helper functions for Persistence with Client Data Isolation
export function getStoredInventory() {
  const clientId = getActiveClientId();
  const storageKey = 'rrk_inventory';
  const saved = localStorage.getItem(storageKey);
  const items = saved ? JSON.parse(saved) : initialInventory;
  return items.map(normalizeInventoryItem);
}

export function saveInventory(data) {
  const storageKey = 'rrk_inventory';
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function getStoredInvoices() {
  const storageKey = 'rrk_invoices';
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : initialInvoices;
}

export function saveInvoices(data) {
  const storageKey = 'rrk_invoices';
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function getStoredAppointments() {
  const storageKey = 'rrk_appointments';
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : initialAppointments;
}

export function saveAppointments(data) {
  const storageKey = 'rrk_appointments';
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// ITEMIZED BILLING INVOICES DATASET (CLEAN INITIAL STATE)
export const initialInvoices = [];

// APPOINTMENTS DATASET (CLEAN INITIAL STATE)
export const initialAppointments = [];

// CLINIC HOLIDAYS & EXCEPTIONAL CLOSURES DATASET (CLEAN INITIAL STATE)
export const initialHolidays = [];

export function getStoredServices() {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_services' : 'sriram_services';
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : (clientId === 'CLI-RRK-002' ? defaultServices : []);
}

export function saveServices(data) {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_services' : 'sriram_services';
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function getStoredDoctors() {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_doctors' : 'sriram_doctors';
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : (clientId === 'CLI-RRK-002' ? defaultDoctors : []);
}

export function saveDoctors(data) {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_doctors' : 'sriram_doctors';
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function getStoredHolidays() {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_holidays' : 'sriram_holidays';
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : (clientId === 'CLI-RRK-002' ? initialHolidays : []);
}

export function saveHolidays(data) {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_holidays' : 'sriram_holidays';
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// HOSPITAL SAAS SUBSCRIPTION DATASET
export const initialSubscription = {
  planId: 'PLAN-PRO-02',
  planName: 'Professional Pro Tier (3 Months)',
  status: 'Active',
  priceMonthly: 12000,
  billingCycle: '3 Months (Quarterly)',
  renewalDate: '2026-11-11',
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
  invoiceHistory: [
    { id: 'SUB-INV-2026-08', date: '2026-08-09', plan: 'Professional Pro Tier (3 Months)', amount: 12000, status: 'Paid', method: 'UPI (Razorpay)' },
    { id: 'SUB-INV-2026-05', date: '2026-05-09', plan: 'Professional Pro Tier (3 Months)', amount: 12000, status: 'Paid', method: 'Credit Card' }
  ]
};

export function getStoredSubscription() {
  const clientId = getActiveClientId();
  const isRrk = clientId === 'CLI-RRK-002';
  const storageKey = isRrk ? 'rrk_subscription' : 'sriram_subscription';
  const saved = localStorage.getItem(storageKey);
  let baseSub = saved ? JSON.parse(saved) : (isRrk ? initialSubscription : {});

  if (isRrk) {
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
  }

  return baseSub;
}

export function saveSubscription(data) {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_subscription' : 'sriram_subscription';
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function getStoredBranches() {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_branches' : 'sriram_branches';
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : defaultBranches;
}

export function saveBranches(data) {
  const clientId = getActiveClientId();
  const storageKey = clientId === 'CLI-RRK-002' ? 'rrk_branches' : 'sriram_branches';
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export const defaultRrkSettings = {
  name: 'RRK Hospital Administrator',
  email: 'admin@kkrclinic.com',
  phone: '+91 98401 00000',
  title: 'Executive Clinic Director'
};

export const defaultSriramSettings = {
  name: 'Dr. Selvakumar',
  email: 'dr.selvakumarr@gmail.com',
  phone: '+91 95515 19766',
  title: 'Senior Homeo Physician'
};

export function getStoredSettings() {
  const clientId = getActiveClientId();
  const storageKey = 'rrk_settings';
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : defaultRrkSettings;
}

export function saveSettings(data) {
  const storageKey = 'rrk_settings';
  localStorage.setItem(storageKey, JSON.stringify(data));
}
