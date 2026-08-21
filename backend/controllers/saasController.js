const { query } = require('../config/db');
const crypto = require('crypto');

// Helper function to get setting value by key
async function getSetting(key, defaultValue = '') {
  try {
    const rows = await query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
    if (rows && rows.length > 0) {
      return rows[0].setting_value;
    }
  } catch (e) {}
  return defaultValue;
}

// Helper function to set setting value by key
async function setSetting(key, value) {
  try {
    const existing = await query('SELECT id FROM settings WHERE setting_key = ?', [key]);
    if (existing && existing.length > 0) {
      await query('UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?', [String(value), key]);
    } else {
      await query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, String(value)]);
    }
  } catch (e) {
    console.error(`Error saving setting ${key}:`, e);
  }
}

const defaultPricingRates = {
  p3m_noemail: '12000',
  p3m_wemail: '14000',
  p6m_noemail: '20000',
  p6m_wemail: '22000',
  p12m_noemail: '38000',
  p12m_wemail: '42000',
  whatsapp: '4000',
  sms: '3000'
};

// GET /api/saas/status - Fetch SaaS status and billing parameters for a specific client or platform default
const getSaasStatus = async (req, res) => {
  try {
    const requestedClientId = req.query.clientId || req.query.id || req.headers['x-client-id'];
    let clients = [];
    
    if (requestedClientId) {
      clients = await query("SELECT * FROM clients WHERE client_id = ? OR id = ? LIMIT 1", [requestedClientId, requestedClientId]);
    }
    
    if (!clients || clients.length === 0) {
      clients = await query("SELECT * FROM clients WHERE status != 'deleted' ORDER BY id ASC LIMIT 1");
    }
    
    const client = (clients && clients.length > 0) ? clients[0] : null;

    const globalStatus = await getSetting('saas_status', '');
    const status = client ? client.status : (globalStatus || 'active');
    
    const globalPlan = await getSetting('saas_plan', '');
    const defaultPlan = await getSetting('saas_default_plan', '3 Months Plan (Without Email Follow-up)');
    const plan = client?.plan_name || globalPlan || defaultPlan;

    const globalMonthlyFee = await getSetting('saas_monthly_fee', '');
    const defaultMonthlyFee = await getSetting('saas_default_monthly_fee', '12000');
    const monthlyFee = client?.monthly_fee || globalMonthlyFee || defaultMonthlyFee;

    const hospitalName = client ? client.hospital_name : 'RRK Clinic & Multispecialty Hospital';
    const clientId = client ? client.client_id : (requestedClientId || 'CLI-RRK-002');

    const defaultTrialDaysStr = await getSetting('saas_trial_days', '4');
    const defaultTrialDays = parseInt(defaultTrialDaysStr, 10) || 4;
    const globalPauseMessage = await getSetting('saas_pause_reason', client?.pause_reason || 'Hospital SaaS subscription is currently paused. Please contact Mediqoro Super Admin to renew monthly subscription.');
    const supportPhone = await getSetting('saas_support_phone', '+91 73735 09585');
    const supportEmail = await getSetting('saas_support_email', 'info@mediqora.in');
    const autoRenewReminders = (await getSetting('saas_auto_renew_reminders', 'true')) === 'true';

    // Dynamically calculate trial expiration if status is trial or date not set
    let nextBilling = client?.next_billing_date;
    if (nextBilling) {
      if (typeof nextBilling === 'object' && nextBilling.toISOString) {
        nextBilling = nextBilling.toISOString().split('T')[0];
      } else if (typeof nextBilling === 'string' && nextBilling.includes('T')) {
        nextBilling = nextBilling.split('T')[0];
      }
    }
    if (!nextBilling) {
      const globalNextBilling = await getSetting('saas_next_billing', '');
      if (globalNextBilling) {
        nextBilling = globalNextBilling;
      } else {
        const createdDate = client?.created_at ? new Date(client.created_at) : new Date();
        createdDate.setDate(createdDate.getDate() + defaultTrialDays);
        nextBilling = createdDate.toISOString().split('T')[0];
      }
    }

    const lastPayment = client?.last_payment_date || 'N/A';

    // Load pricingRates from setting first, then client, then default
    let pricingRates = null;
    const pricingRatesStr = await getSetting('saas_pricing_rates', '');
    if (pricingRatesStr) {
      try {
        pricingRates = typeof pricingRatesStr === 'string' ? JSON.parse(pricingRatesStr) : pricingRatesStr;
      } catch (e) {}
    }

    if (!pricingRates && client && client.pricing_rates) {
      try {
        pricingRates = typeof client.pricing_rates === 'string' ? JSON.parse(client.pricing_rates) : client.pricing_rates;
      } catch (e) {}
    }

    if (!pricingRates || typeof pricingRates !== 'object') {
      pricingRates = defaultPricingRates;
    }

    res.json({
      success: true,
      brand: 'Mediqoro SaaS Platform',
      clientId,
      hospitalName,
      status, // 'active' | 'trial' | 'paused' | 'expired'
      isPaused: status === 'paused',
      plan,
      monthlyFee,
      trialDays: defaultTrialDays,
      defaultMonthlyFee,
      defaultTrialDays,
      defaultPlan,
      globalPauseMessage,
      supportPhone,
      supportEmail,
      autoRenewReminders,
      nextBillingDate: nextBilling,
      nextBilling,
      pauseReason: client?.pause_reason || globalPauseMessage,
      lastPayment,
      pricingRates
    });
  } catch (error) {
    console.error('Error fetching SaaS status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch SaaS status' });
  }
};

// PUT /api/saas/status - Update global SaaS status (Super Admin only)
const updateSaasStatus = async (req, res) => {
  try {
    const {
      status, plan, monthlyFee, nextBilling, pauseReason, pricingRates,
      defaultMonthlyFee, defaultTrialDays, defaultPlan, globalPauseMessage,
      supportPhone, supportEmail, autoRenewReminders
    } = req.body;

    const finalPlan = plan || defaultPlan;
    const finalFee = monthlyFee || defaultMonthlyFee;
    const finalPause = pauseReason || globalPauseMessage;

    if (status !== undefined) {
      await setSetting('saas_status', status);
      await query("UPDATE clients SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = 'CLI-RRK-002' OR status != 'deleted'", [status]);
    }
    if (finalPlan !== undefined) {
      await setSetting('saas_plan', finalPlan);
      await setSetting('saas_default_plan', finalPlan);
      await query("UPDATE clients SET plan_name = ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = 'CLI-RRK-002' OR status != 'deleted'", [finalPlan]);
    }
    if (finalFee !== undefined) {
      await setSetting('saas_monthly_fee', String(finalFee));
      await setSetting('saas_default_monthly_fee', String(finalFee));
      await query("UPDATE clients SET monthly_fee = ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = 'CLI-RRK-002' OR status != 'deleted'", [String(finalFee)]);
    }
    if (nextBilling !== undefined) {
      await setSetting('saas_next_billing', nextBilling);
      await query("UPDATE clients SET next_billing_date = ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = 'CLI-RRK-002' OR status != 'deleted'", [nextBilling]);
    }
    if (finalPause !== undefined) {
      await setSetting('saas_pause_reason', finalPause);
      await query("UPDATE clients SET pause_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = 'CLI-RRK-002' OR status != 'deleted'", [finalPause]);
    }
    if (defaultTrialDays !== undefined) {
      await setSetting('saas_trial_days', String(defaultTrialDays));
    }
    if (supportPhone !== undefined) {
      await setSetting('saas_support_phone', supportPhone);
    }
    if (supportEmail !== undefined) {
      await setSetting('saas_support_email', supportEmail);
    }
    if (autoRenewReminders !== undefined) {
      await setSetting('saas_auto_renew_reminders', String(autoRenewReminders));
    }
    if (pricingRates !== undefined) {
      const ratesStr = typeof pricingRates === 'string' ? pricingRates : JSON.stringify(pricingRates);
      await setSetting('saas_pricing_rates', ratesStr);
      await query("UPDATE clients SET pricing_rates = ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = 'CLI-RRK-002' OR status != 'deleted'", [ratesStr]);
    }

    const currentStatus = await getSetting('saas_status', 'active');

    res.json({
      success: true,
      message: `Mediqoro SaaS status & platform settings updated successfully!`,
      status: currentStatus,
      isPaused: currentStatus === 'paused'
    });
  } catch (error) {
    console.error('Error updating SaaS status:', error);
    res.status(500).json({ success: false, message: 'Failed to update SaaS status' });
  }
};

// POST /api/saas/renew - 1-Click Renew based on active plan duration and activate
const renewSaasSubscription = async (req, res) => {
  try {
    const clients = await query("SELECT * FROM clients WHERE client_id = 'CLI-RRK-002' OR status != 'deleted' ORDER BY id ASC LIMIT 1");
    const client = (clients && clients.length > 0) ? clients[0] : null;
    const planStr = client?.plan_name || '3 Months Plan (Without Email Follow-up)';

    let addDays = 90;
    if (planStr.includes('6 Month')) addDays = 180;
    else if (planStr.includes('12 Month') || planStr.includes('1 Year')) addDays = 365;

    const now = new Date();
    now.setDate(now.getDate() + addDays);
    const newBillingDate = now.toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];

    await setSetting('saas_status', 'active');
    await setSetting('saas_next_billing', newBillingDate);
    await setSetting('saas_last_payment', todayDate);

    // Sync into clients table
    await query(`
      UPDATE clients 
      SET status = 'active', next_billing_date = ?, last_payment_date = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE client_id = 'CLI-RRK-002' OR id = 1
    `, [newBillingDate, todayDate]);

    res.json({
      success: true,
      message: `Mediqoro Client Subscription renewed for +${addDays} days! Access is ACTIVE.`,
      status: 'active',
      nextBilling: newBillingDate,
      lastPayment: todayDate
    });
  } catch (error) {
    console.error('Error renewing SaaS subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to renew subscription' });
  }
};

// ==========================================
// MEDIQORO CLIENT MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/saas/clients - List all hospital clients registered on Mediqoro
const getClients = async (req, res) => {
  try {
    const clients = await query('SELECT * FROM clients ORDER BY id ASC');
    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Mediqoro clients' });
  }
};

// POST /api/saas/clients - Add a new hospital client
const createClient = async (req, res) => {
  try {
    const { hospitalName, contactPerson, email, phone, planName, monthlyFee, status, nextBillingDate, pauseReason, pricingRates } = req.body;

    if (!hospitalName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Hospital Name, Email, and Phone are required' });
    }

    const clientId = `CLI-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];
    const pricingRatesValue = pricingRates ? (typeof pricingRates === 'string' ? pricingRates : JSON.stringify(pricingRates)) : null;

    await query(`
      INSERT INTO clients 
      (client_id, hospital_name, contact_person, email, phone, plan_name, monthly_fee, status, pause_reason, next_billing_date, last_payment_date, pricing_rates) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clientId,
      hospitalName,
      contactPerson || 'Hospital Admin',
      email.trim().toLowerCase(),
      phone,
      planName || 'Monthly Hospital Enterprise',
      monthlyFee || '2999',
      status || 'active',
      pauseReason || 'Hospital SaaS subscription is currently paused. Please contact Mediqoro Super Admin.',
      nextBillingDate || '2026-09-07',
      today,
      pricingRatesValue
    ]);

    res.json({
      success: true,
      message: `Hospital Client "${hospitalName}" added successfully to Mediqoro SaaS Platform`,
      clientId
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, message: 'Failed to register new hospital client' });
  }
};

// PUT /api/saas/clients/:id - Update client status, details, plan, or API credentials
const updateClient = async (req, res) => {
  try {
    const { 
      id, hospitalName, contactPerson, email, phone, planName, monthlyFee, status, nextBillingDate, pauseReason,
      brevoApiKey, brevoSenderEmail, brevoSenderName, whatsappApiKey, whatsappPhoneNumberId, smsApiKey, smsSenderId, feedbackUrl,
      pricingRates
    } = req.body;

    const existing = await query('SELECT * FROM clients WHERE id = ? OR client_id = ?', [req.params.id, req.params.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Client record not found' });
    }

    const clientId = existing[0].id;
    const pricingRatesValue = pricingRates !== undefined 
      ? (typeof pricingRates === 'string' ? pricingRates : JSON.stringify(pricingRates))
      : null;

    await query(`
      UPDATE clients SET 
        hospital_name = COALESCE(?, hospital_name),
        contact_person = COALESCE(?, contact_person),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        plan_name = COALESCE(?, plan_name),
        monthly_fee = COALESCE(?, monthly_fee),
        status = COALESCE(?, status),
        pause_reason = COALESCE(?, pause_reason),
        next_billing_date = COALESCE(?, next_billing_date),
        brevo_api_key = COALESCE(?, brevo_api_key),
        brevo_sender_email = COALESCE(?, brevo_sender_email),
        brevo_sender_name = COALESCE(?, brevo_sender_name),
        whatsapp_api_key = COALESCE(?, whatsapp_api_key),
        whatsapp_phone_number_id = COALESCE(?, whatsapp_phone_number_id),
        sms_api_key = COALESCE(?, sms_api_key),
        sms_sender_id = COALESCE(?, sms_sender_id),
        feedback_url = COALESCE(?, feedback_url),
        pricing_rates = COALESCE(?, pricing_rates),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      hospitalName, contactPerson, email, phone, planName, monthlyFee, status, pauseReason, nextBillingDate,
      brevoApiKey, brevoSenderEmail, brevoSenderName, whatsappApiKey, whatsappPhoneNumberId, smsApiKey, smsSenderId, feedbackUrl,
      pricingRatesValue,
      clientId
    ]);

    // If updating primary client, sync global saas_status, saas_plan, saas_monthly_fee
    const updatedClient = existing[0];
    if (updatedClient.client_id === 'CLI-RRK-002' || updatedClient.id == 1) {
      if (status) await setSetting('saas_status', status);
      if (planName) await setSetting('saas_plan', planName);
      if (monthlyFee) await setSetting('saas_monthly_fee', monthlyFee);
      if (pauseReason) await setSetting('saas_pause_reason', pauseReason);
    }

    if (req.body.pricingRates !== undefined) {
      await setSetting('saas_pricing_rates', typeof req.body.pricingRates === 'string' ? req.body.pricingRates : JSON.stringify(req.body.pricingRates));
    }

    res.json({
      success: true,
      message: 'Mediqoro Hospital Client details and API credentials updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ success: false, message: 'Failed to update client details' });
  }
};

// POST /api/saas/clients/:id/renew - Renew individual client based on assigned plan duration
const renewClient = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM clients WHERE id = ? OR client_id = ?', [id, id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Client record not found' });
    }

    const client = existing[0];
    const planStr = client.plan_name || '3 Months Plan (Without Email Follow-up)';

    let addDays = 90;
    if (planStr.includes('6 Month')) addDays = 180;
    else if (planStr.includes('12 Month') || planStr.includes('1 Year')) addDays = 365;

    const now = new Date();
    now.setDate(now.getDate() + addDays);
    const newBillingDate = now.toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];

    await query(`
      UPDATE clients 
      SET status = 'active', next_billing_date = ?, last_payment_date = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? OR client_id = ?
    `, [newBillingDate, todayDate, client.id, client.client_id]);

    try {
      await query(`
        INSERT INTO payments 
          (client_id, hospital_name, plan_name, amount, payment_id, payment_method, payment_date, active_date, expiry_date, status)
        VALUES (?, ?, ?, ?, ?, 'Super Admin Manual Renewal', CURRENT_TIMESTAMP, ?, ?, 'SUCCESS')
      `, [
        client.client_id,
        client.hospital_name,
        planStr,
        client.monthly_fee || '12000',
        `pay_ADM_${Date.now()}`,
        todayDate,
        newBillingDate
      ]);
    } catch (e) {
      console.warn('Warning inserting payment history log:', e.message);
    }

    if (client.client_id === 'CLI-RRK-002' || client.id == 1) {
      await setSetting('saas_status', 'active');
      await setSetting('saas_next_billing', newBillingDate);
      await setSetting('saas_last_payment', todayDate);
    }

    res.json({
      success: true,
      message: `Client "${client.hospital_name}" renewed for +${addDays} days! Access is ACTIVE.`,
      nextBillingDate: newBillingDate
    });
  } catch (error) {
    console.error('Error renewing client:', error);
    res.status(500).json({ success: false, message: 'Failed to renew client subscription' });
  }
};

// POST /api/saas/create-razorpay-order - Create Razorpay order for online payment & renewal
const createRazorpayOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TMw4K6Z5l8cBXt';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '86RXFIAM5qy84TBnAaIigjtk';

    const { planName, customAmount, durationDays, clientId } = req.body || {};

    // Fetch hospital client details
    const targetId = clientId || 'CLI-RRK-002';
    const clients = await query("SELECT * FROM clients WHERE client_id = ? OR id = ? ORDER BY id ASC LIMIT 1", [targetId, targetId]);
    const client = (clients && clients.length > 0) ? clients[0] : null;

    const baseFee = client?.monthly_fee ? parseInt(client.monthly_fee, 10) : 12000;
    const finalAmount = customAmount ? parseInt(customAmount, 10) : baseFee;
    const amountInPaise = Math.max(1, isNaN(finalAmount) ? 12000 : finalAmount) * 100;

    // Call Razorpay REST API directly to create order
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          hospital_name: client?.hospital_name || 'RRK Clinic & Multispecialty Hospital',
          client_id: targetId,
          plan_name: planName || '3 Months Plan',
          duration_days: durationDays || 90
        }
      })
    });

    const orderData = await response.json();

    if (!response.ok) {
      console.warn('Razorpay live API order response:', orderData);
      return res.json({
        success: true,
        keyId: keyId,
        amount: amountInPaise,
        currency: 'INR',
        hospitalName: client?.hospital_name || 'RRK Clinic & Multispecialty Hospital',
        monthlyFee: finalAmount,
        clientId: targetId,
        planName: planName || '3 Months Plan',
        durationDays: durationDays || 90
      });
    }

    res.json({
      success: true,
      orderId: orderData.id,
      keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      hospitalName: client?.hospital_name || 'RRK Clinic & Multispecialty Hospital',
      monthlyFee: finalAmount,
      clientId: targetId,
      planName: planName || '3 Months Plan',
      durationDays: durationDays || 90
    });
  } catch (error) {
    console.error('Error creating Razorpay Order:', error);
    res.status(500).json({ success: false, message: 'Internal server error creating payment order' });
  }
};

// POST /api/saas/verify-razorpay-payment - Verify payment signature and auto-renew hospital access
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, planName, durationDays, customAmount } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '86RXFIAM5qy84TBnAaIigjtk';

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay payment parameters' });
    }

    // Verify HMAC SHA256 Signature
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    const targetClientId = clientId || 'CLI-RRK-002';
    const selectedPlan = planName || '3 Months Plan (Without Email Follow-up)';

    // Calculate days to extend (dynamically matching plan duration: 90, 180, or 365 days)
    let daysToAdd = 90;
    if (durationDays && !isNaN(parseInt(durationDays, 10))) {
      daysToAdd = parseInt(durationDays, 10);
    } else if (selectedPlan.includes('6 Month') || selectedPlan.includes('6 month')) {
      daysToAdd = 180;
    } else if (selectedPlan.includes('12 Month') || selectedPlan.includes('1 Year') || selectedPlan.includes('1 year')) {
      daysToAdd = 365;
    } else {
      daysToAdd = 90;
    }

    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    const newBillingDate = now.toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];

    // Fetch current pricing rates setting to resolve standard plan fee
    const pricingRatesStr = await getSetting('saas_pricing_rates', JSON.stringify(defaultPricingRates));
    let pricingRatesObj = defaultPricingRates;
    try {
      pricingRatesObj = typeof pricingRatesStr === 'string' ? JSON.parse(pricingRatesStr) : pricingRatesStr;
    } catch(e) {}

    let resolvedPlanFee = '12000';
    if (selectedPlan.includes('3 Months') && selectedPlan.includes('Without Email')) {
      resolvedPlanFee = pricingRatesObj.p3m_noemail || '12000';
    } else if (selectedPlan.includes('3 Months') && selectedPlan.includes('With Email')) {
      resolvedPlanFee = pricingRatesObj.p3m_wemail || '14000';
    } else if (selectedPlan.includes('6 Months') && selectedPlan.includes('Without Email')) {
      resolvedPlanFee = pricingRatesObj.p6m_noemail || '20000';
    } else if (selectedPlan.includes('6 Months') && selectedPlan.includes('With Email')) {
      resolvedPlanFee = pricingRatesObj.p6m_wemail || '22000';
    } else if (selectedPlan.includes('12 Months') && selectedPlan.includes('Without Email')) {
      resolvedPlanFee = pricingRatesObj.p12m_noemail || '38000';
    } else if (selectedPlan.includes('12 Months') && selectedPlan.includes('With Email')) {
      resolvedPlanFee = pricingRatesObj.p12m_wemail || '42000';
    }

    const actualPaidAmount = (customAmount !== undefined && customAmount !== null && customAmount !== '') ? String(customAmount) : resolvedPlanFee;

    await query(`
      UPDATE clients 
      SET status = 'active', plan_name = ?, monthly_fee = ?, next_billing_date = ?, last_payment_date = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE client_id = ? OR id = ?
    `, [selectedPlan, resolvedPlanFee, newBillingDate, todayDate, targetClientId, targetClientId]);

    await setSetting('saas_status', 'active');
    await setSetting('saas_plan', selectedPlan);
    await setSetting('saas_monthly_fee', resolvedPlanFee);
    await setSetting('saas_next_billing', newBillingDate);
    await setSetting('saas_last_payment', todayDate);

    try {
      const existingClient = await query("SELECT hospital_name FROM clients WHERE client_id = ? OR id = ? LIMIT 1", [targetClientId, targetClientId]);
      const hName = (existingClient && existingClient.length > 0) ? existingClient[0].hospital_name : 'Shree Ram Homeo Hospital';
      
      await query(`
        INSERT INTO payments 
          (client_id, hospital_name, plan_name, amount, payment_id, payment_method, payment_date, active_date, expiry_date, status)
        VALUES (?, ?, ?, ?, ?, 'Razorpay Online Gateway', CURRENT_TIMESTAMP, ?, ?, 'SUCCESS')
      `, [targetClientId, hName, selectedPlan, actualPaidAmount, razorpay_payment_id, todayDate, newBillingDate]);
    } catch (e) {
      console.warn('Warning logging Razorpay payment:', e.message);
    }

    res.json({
      success: true,
      message: `🎉 Payment Successful! Access unpaused and plan upgraded to "${selectedPlan}". Valid until ${newBillingDate}.`,
      status: 'active',
      nextBillingDate: newBillingDate,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Error verifying Razorpay Payment:', error);
    res.status(500).json({ success: false, message: 'Server error verifying Razorpay payment' });
  }
};

// GET /api/saas/payments - Fetch all SaaS subscription payment transaction logs
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await query('SELECT * FROM payments WHERE id IN (SELECT MAX(id) FROM payments GROUP BY payment_id) ORDER BY id DESC');
    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history logs' });
  }
};

// DELETE /api/saas/clients/:id - Remove client record
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ success: true, message: 'Mediqoro Hospital Client removed successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: 'Failed to delete client record' });
  }
};

module.exports = {
  getSaasStatus,
  updateSaasStatus,
  renewSaasSubscription,
  getClients,
  createClient,
  updateClient,
  renewClient,
  deleteClient,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentHistory,
  getSetting
};
