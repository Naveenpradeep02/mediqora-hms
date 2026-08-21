const { query } = require('../config/db');
const {
  sendStage3Reminder24Hours,
  sendStage4Reminder2Hours
} = require('./multiChannelNotificationService');

/**
 * Scheduled Cron Engine for 24h and 2h Appointment Reminders
 */
async function checkAndSendReminders() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // =========================================================================
    // 1. STAGE 3: 24-HOUR REMINDERS (Appointments scheduled for TOMORROW)
    // =========================================================================
    const appointments24h = await query(
      `SELECT a.id, a.appointment_id, a.patient_name, a.email, a.phone, a.appointment_date, a.appointment_time, 
              s.name as service_name, b.name as branch_name, b.address as branch_address, b.phone as clinic_phone
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN branches b ON a.branch_id = b.id
       WHERE a.appointment_date = ? AND a.status IN ('New', 'Confirmed', 'Patient Online') AND (a.reminder_24h_sent = 0 OR a.reminder_24h_sent IS NULL)`,
      [tomorrowStr]
    );

    for (const app of appointments24h) {
      console.log(`⏰ [CRON ENGINE] Triggering 24h Reminder for ${app.patient_name} (${app.appointment_id})`);
      await sendStage3Reminder24Hours({
        appointmentId: app.appointment_id,
        patientName: app.patient_name,
        email: app.email,
        phone: app.phone,
        serviceName: app.service_name,
        branchName: app.branch_name,
        branchAddress: app.branch_address,
        appointmentDate: app.appointment_date,
        appointmentTime: app.appointment_time,
        clinicPhone: app.clinic_phone
      });
      await query('UPDATE appointments SET reminder_24h_sent = 1 WHERE id = ?', [app.id]);
    }

    // =========================================================================
    // 2. STAGE 4: 2-HOUR REMINDERS (Appointments scheduled for TODAY)
    // =========================================================================
    const appointments2h = await query(
      `SELECT a.id, a.appointment_id, a.patient_name, a.email, a.phone, a.appointment_date, a.appointment_time, 
              s.name as service_name, b.name as branch_name, b.address as branch_address, b.phone as clinic_phone
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN branches b ON a.branch_id = b.id
       WHERE a.appointment_date = ? AND a.status IN ('New', 'Confirmed', 'Patient Online') AND (a.reminder_2h_sent = 0 OR a.reminder_2h_sent IS NULL)`,
      [todayStr]
    );

    const currentHour = today.getHours();
    const currentMin = today.getMinutes();
    const nowMinutes = currentHour * 60 + currentMin;

    for (const app of appointments2h) {
      // Parse appointment time (e.g. "10:30" or "10:30 AM" or "14:00")
      let appMinutes = -1;
      const timeParts = app.appointment_time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const mins = parseInt(timeParts[2]);
        const ampm = timeParts[3];

        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        appMinutes = hours * 60 + mins;
      }

      // Check if appointment is in ~2 hours (between 60 and 150 minutes from now)
      if (appMinutes > 0 && appMinutes - nowMinutes > 0 && appMinutes - nowMinutes <= 150) {
        console.log(`🔔 [CRON ENGINE] Triggering 2h Final Reminder for ${app.patient_name} (${app.appointment_id})`);
        await sendStage4Reminder2Hours({
          appointmentId: app.appointment_id,
          patientName: app.patient_name,
          email: app.email,
          phone: app.phone,
          serviceName: app.service_name,
          branchName: app.branch_name,
          branchAddress: app.branch_address,
          appointmentDate: app.appointment_date,
          appointmentTime: app.appointment_time,
          clinicPhone: app.clinic_phone
        });
        await query('UPDATE appointments SET reminder_2h_sent = 1 WHERE id = ?', [app.id]);
      }
    }
  } catch (err) {
    console.error('❌ Reminder Cron Error:', err.message);
  }
}

/**
 * Start 5-minute background polling interval
 */
function startNotificationCron() {
  console.log('⏰ Multi-Channel Reminder Cron Engine initialized (Checking every 5 minutes)');
  checkAndSendReminders();
  setInterval(checkAndSendReminders, 5 * 60 * 1000); // 5 mins
}

module.exports = {
  startNotificationCron,
  checkAndSendReminders
};
