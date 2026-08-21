const { initDatabase, query } = require('./backend/config/db');

async function activateSaas() {
  await initDatabase();
  await query("UPDATE settings SET setting_value = 'active' WHERE setting_key = 'saas_status'");
  await query("UPDATE clients SET status = 'active', plan_name = '3 Months Plan (Without Email Follow-up)', monthly_fee = '12000', next_billing_date = '2026-11-08' WHERE client_id = 'CLI-SRIRAM-001'");
  console.log('✅ Updated SaaS status to active in DB!');
}

activateSaas().catch(console.error);
