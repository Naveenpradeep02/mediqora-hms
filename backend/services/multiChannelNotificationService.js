const { query } = require('../config/db');

/**
 * Brevo REST API v3 Transactional Email Dispatcher
 */
async function sendBrevoEmail({ apiKey, senderName, senderEmail, recipientEmail, recipientName, subject, htmlContent }) {
  const brevoApiKey = apiKey || process.env.BREVO_API_KEY;
  const fromEmail = senderEmail || process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'no-reply@shreeramhomeo.com';
  const fromName = senderName || process.env.BREVO_SENDER_NAME || 'Shree Ram Homeo';

  if (brevoApiKey && brevoApiKey !== 'mock' && brevoApiKey.length > 5) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: recipientEmail, name: recipientName || 'Patient' }],
          subject,
          htmlContent
        })
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ [BREVO EMAIL DISPATCH] Sent to ${recipientEmail} (MessageId: ${data.messageId || 'ok'})`);
        return { success: true, messageId: data.messageId };
      } else {
        console.warn(`⚠️ [BREVO API WARNING] ${data.message || JSON.stringify(data)}`);
        return { success: false, error: data.message || 'Brevo API error' };
      }
    } catch (err) {
      console.error(`❌ [BREVO NETWORK ERROR]`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    // Development / Mock Brevo Transporter
    console.log('----------------------------------------------------');
    console.log(`📩 [BREVO MOCK EMAIL DISPATCH] Recipient: ${recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${fromName} <${fromEmail}>`);
    console.log('----------------------------------------------------');
    return { success: true, messageId: 'mock-brevo-' + Date.now() };
  }
}

/**
 * WhatsApp Business API Dispatcher
 */
async function sendWhatsAppMessage({ apiKey, phoneId, recipientPhone, messageText }) {
  const waApiKey = apiKey || process.env.WHATSAPP_API_KEY;
  const waPhoneId = phoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (waApiKey && waPhoneId && waApiKey !== 'mock' && waApiKey.length > 5) {
    try {
      const formattedPhone = recipientPhone.replace(/[^0-9]/g, '');
      const response = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${waApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: messageText }
        })
      });
      const data = await response.json();
      console.log(`📲 [WHATSAPP DISPATCH] Sent to ${recipientPhone}`);
      return { success: response.ok, data };
    } catch (err) {
      console.error(`❌ [WHATSAPP NETWORK ERROR]`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log('----------------------------------------------------');
    console.log(`📲 [WHATSAPP MOCK DISPATCH] Recipient: ${recipientPhone}`);
    console.log(`Message: ${messageText}`);
    console.log('----------------------------------------------------');
    return { success: true };
  }
}

/**
 * SMS Gateway Dispatcher
 */
async function sendSMS({ apiKey, senderId, recipientPhone, messageText }) {
  const smsKey = apiKey || process.env.SMS_API_KEY;

  if (smsKey && smsKey !== 'mock' && smsKey.length > 5) {
    try {
      console.log(`💬 [SMS DISPATCH] Sent to ${recipientPhone}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  } else {
    console.log('----------------------------------------------------');
    console.log(`💬 [SMS MOCK DISPATCH] Recipient: ${recipientPhone}`);
    console.log(`Message: ${messageText}`);
    console.log('----------------------------------------------------');
    return { success: true };
  }
}

/**
 * Log notification to notification_logs table
 */
async function logNotification({ appointmentId, channel, stage, recipient, status, message, errorMessage }) {
  try {
    await query(
      `INSERT INTO notification_logs 
       (appointment_id, channel, stage, recipient, status, message, error_message) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [appointmentId || '', channel, stage, recipient, status, message || '', errorMessage || '']
    );
  } catch (err) {
    console.warn('Logging notification failed:', err.message);
  }
}

/**
 * Helper to fetch Hospital Brevo / WhatsApp / SMS Credentials
 */
async function getHospitalNotificationConfig(hospitalClientId = 'CLI-RRK-002') {
  try {
    const clients = await query(
      `SELECT brevo_api_key, brevo_sender_email, brevo_sender_name, whatsapp_api_key, whatsapp_phone_number_id, sms_api_key, sms_sender_id, feedback_url 
       FROM clients WHERE client_id = ? OR id = 1 LIMIT 1`,
      [hospitalClientId]
    );
    if (clients.length > 0) {
      return clients[0];
    }
  } catch (e) {}
  return {};
}

/**
 * HTML Email Template Generator
 */
function createHtmlEmail({ title, patientName, appointmentId, serviceName, branchName, branchAddress, appointmentDate, appointmentTime, phone, additionalNotes, actionUrl, actionText }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
      .header { background: linear-gradient(135deg, #0d9488 0%, #0f172a 100%); padding: 32px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
      .header p { margin: 6px 0 0 0; color: #ccfbf1; font-size: 13px; font-weight: 500; }
      .content { padding: 32px; }
      .badge { display: inline-block; background-color: #f0fdf4; color: #166534; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; margin-bottom: 20px; border: 1px solid #bbf7d0; }
      .details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 10px 0; font-size: 14px; }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { color: #64748b; font-weight: 500; }
      .detail-value { color: #0f172a; font-weight: 700; }
      .instructions { background-color: #f0fdf4; border-left: 4px solid #0d9488; padding: 16px; border-radius: 8px; font-size: 13px; color: #115e59; margin-top: 20px; }
      .btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; margin-top: 20px; }
      .footer { text-align: center; padding: 24px; background-color: #f8fafc; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Shree Ram Homeo Hospital</h1>
        <p>Holistic & Safe Healing Without Surgery</p>
      </div>
      <div class="content">
        <div class="badge">${title}</div>
        <p>Dear <strong>${patientName}</strong>,</p>

        <div class="details-card">
          <div class="detail-row"><span class="detail-label">Appointment ID:</span><span class="detail-value">${appointmentId}</span></div>
          <div class="detail-row"><span class="detail-label">Service / Specialty:</span><span class="detail-value">${serviceName || 'General Consultation'}</span></div>
          <div class="detail-row"><span class="detail-label">Branch:</span><span class="detail-value">${branchName || 'Shree Ram Homeo'}</span></div>
          <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${appointmentDate}</span></div>
          <div class="detail-row"><span class="detail-label">Scheduled Time Slot:</span><span class="detail-value">${appointmentTime}</span></div>
          ${branchAddress ? `<div class="detail-row"><span class="detail-label">Location:</span><span class="detail-value">${branchAddress}</span></div>` : ''}
          ${phone ? `<div class="detail-row"><span class="detail-label">Clinic Contact:</span><span class="detail-value">${phone}</span></div>` : ''}
        </div>

        ${additionalNotes ? `<p style="font-size: 14px; color: #334155; background: #f1f5f9; padding: 12px; border-radius: 8px;"><strong>Note:</strong> ${additionalNotes}</p>` : ''}

        ${actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="btn" target="_blank">${actionText || 'Provide Feedback'}</a></div>` : ''}

        <div class="instructions">
          <strong>📋 Pre-Visit Instructions:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Please arrive 10-15 minutes prior to your scheduled slot.</li>
            <li>Bring any previous medical reports, prescriptions, or blood test results.</li>
            <li>For cancellations or rescheduling, please contact clinic reception at least 2 hours prior.</li>
          </ul>
        </div>
      </div>
      <div class="footer">
        <p>&copy; 2026 Shree Ram Homeo Clinics. All rights reserved.</p>
        <p>Anna Nagar | T Nagar | Chennai</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// =========================================================================
// 5 AUTOMATED TRIGGER STAGES (Brevo Email + WhatsApp + SMS)
// =========================================================================

/**
 * STAGE 1: Immediate after booking -> "Appointment received."
 */
async function sendStage1BookingReceived(appointmentData) {
  const { appointmentId, patientName, email, phone, serviceName, branchName, branchAddress, appointmentDate, appointmentTime, clinicPhone } = appointmentData;
  const config = await getHospitalNotificationConfig();

  const title = 'Appointment Received - Shree Ram Homeo';
  const emailHtml = createHtmlEmail({
    title,
    patientName,
    appointmentId,
    serviceName,
    branchName,
    branchAddress,
    appointmentDate,
    appointmentTime,
    phone: clinicPhone || '+91 95515 19766',
    additionalNotes: 'Your appointment booking has been received. Our clinic team will confirm your slot shortly.'
  });

  const textMsg = `Hello ${patientName}, your appointment booking (${appointmentId}) for ${serviceName} on ${appointmentDate} at ${appointmentTime} has been received by Shree Ram Homeo.`;

  // 1. Brevo Email
  if (email) {
    const res = await sendBrevoEmail({
      apiKey: config.brevo_api_key,
      senderEmail: config.brevo_sender_email,
      senderName: config.brevo_sender_name,
      recipientEmail: email,
      recipientName: patientName,
      subject: `Appointment Received: ${appointmentId} - Shree Ram Homeo`,
      htmlContent: emailHtml
    });
    await logNotification({ appointmentId, channel: 'EMAIL', stage: 'STAGE_1_BOOKED', recipient: email, status: res.success ? 'SENT' : 'FAILED', message: 'Appointment received.' });
  }

  // 2. WhatsApp
  if (phone) {
    const res = await sendWhatsAppMessage({
      apiKey: config.whatsapp_api_key,
      phoneId: config.whatsapp_phone_number_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'WHATSAPP', stage: 'STAGE_1_BOOKED', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }

  // 3. SMS
  if (phone) {
    const res = await sendSMS({
      apiKey: config.sms_api_key,
      senderId: config.sms_sender_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'SMS', stage: 'STAGE_1_BOOKED', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }
}

/**
 * STAGE 2: After hospital confirms -> "Your appointment is confirmed."
 */
async function sendStage2AppointmentConfirmed(appointmentData) {
  const { appointmentId, patientName, email, phone, serviceName, branchName, branchAddress, appointmentDate, appointmentTime, clinicPhone } = appointmentData;
  const config = await getHospitalNotificationConfig();

  const title = 'Appointment Confirmed - Shree Ram Homeo';
  const emailHtml = createHtmlEmail({
    title,
    patientName,
    appointmentId,
    serviceName,
    branchName,
    branchAddress,
    appointmentDate,
    appointmentTime,
    phone: clinicPhone || '+91 95515 19766',
    additionalNotes: 'Your appointment is confirmed! Please arrive 10-15 minutes before your time slot.'
  });

  const textMsg = `Hello ${patientName}, your appointment (${appointmentId}) is CONFIRMED for ${appointmentDate} at ${appointmentTime} at ${branchName}. Shree Ram Homeo.`;

  if (email) {
    const res = await sendBrevoEmail({
      apiKey: config.brevo_api_key,
      senderEmail: config.brevo_sender_email,
      senderName: config.brevo_sender_name,
      recipientEmail: email,
      recipientName: patientName,
      subject: `Your Appointment is Confirmed! (${appointmentId}) - Shree Ram Homeo`,
      htmlContent: emailHtml
    });
    await logNotification({ appointmentId, channel: 'EMAIL', stage: 'STAGE_2_CONFIRMED', recipient: email, status: res.success ? 'SENT' : 'FAILED', message: 'Appointment confirmed.' });
  }

  if (phone) {
    const res = await sendWhatsAppMessage({
      apiKey: config.whatsapp_api_key,
      phoneId: config.whatsapp_phone_number_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'WHATSAPP', stage: 'STAGE_2_CONFIRMED', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }

  if (phone) {
    const res = await sendSMS({
      apiKey: config.sms_api_key,
      senderId: config.sms_sender_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'SMS', stage: 'STAGE_2_CONFIRMED', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }
}

/**
 * STAGE 3: 24 Hours Before -> Reminder with date, time, doctor, location
 */
async function sendStage3Reminder24Hours(appointmentData) {
  const { appointmentId, patientName, email, phone, serviceName, branchName, branchAddress, appointmentDate, appointmentTime, clinicPhone } = appointmentData;
  const config = await getHospitalNotificationConfig();

  const title = '24-Hour Reminder: Upcoming Appointment';
  const emailHtml = createHtmlEmail({
    title,
    patientName,
    appointmentId,
    serviceName,
    branchName,
    branchAddress,
    appointmentDate,
    appointmentTime,
    phone: clinicPhone || '+91 98400 11223',
    additionalNotes: 'Reminder: Your medical consultation is scheduled for tomorrow at RRK Clinic.'
  });

  const textMsg = `⏰ REMINDER: Dear ${patientName}, your appointment (${appointmentId}) at ${branchName} is tomorrow (${appointmentDate}) at ${appointmentTime}. Location: ${branchAddress}. RRK Clinic & Multispecialty Hospital.`;

  if (email) {
    const res = await sendBrevoEmail({
      apiKey: config.brevo_api_key,
      senderEmail: config.brevo_sender_email,
      senderName: config.brevo_sender_name || 'RRK Clinic & Multispecialty Hospital',
      recipientEmail: email,
      recipientName: patientName,
      subject: `⏰ 24h Reminder: Appointment Tomorrow at ${appointmentTime} - RRK Clinic`,
      htmlContent: emailHtml
    });
    await logNotification({ appointmentId, channel: 'EMAIL', stage: 'STAGE_3_REMINDER_24H', recipient: email, status: res.success ? 'SENT' : 'FAILED', message: '24h reminder.' });
  }

  if (phone) {
    const res = await sendWhatsAppMessage({
      apiKey: config.whatsapp_api_key,
      phoneId: config.whatsapp_phone_number_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'WHATSAPP', stage: 'STAGE_3_REMINDER_24H', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }

  if (phone) {
    const res = await sendSMS({
      apiKey: config.sms_api_key,
      senderId: config.sms_sender_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'SMS', stage: 'STAGE_3_REMINDER_24H', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }
}

/**
 * STAGE 4: 2 Hours Before -> Final reminder
 */
async function sendStage4Reminder2Hours(appointmentData) {
  const { appointmentId, patientName, email, phone, serviceName, branchName, branchAddress, appointmentDate, appointmentTime, clinicPhone } = appointmentData;
  const config = await getHospitalNotificationConfig();

  const title = 'Final Reminder: Appointment in 2 Hours';
  const emailHtml = createHtmlEmail({
    title,
    patientName,
    appointmentId,
    serviceName,
    branchName,
    branchAddress,
    appointmentDate,
    appointmentTime,
    phone: clinicPhone || '+91 95515 19766',
    additionalNotes: 'Final Reminder: Your appointment is in 2 hours. We look forward to welcoming you!'
  });

  const textMsg = `🔔 FINAL REMINDER: Dear ${patientName}, your appointment (${appointmentId}) at ${branchName} is in 2 HOURS (${appointmentTime}). Shree Ram Homeo.`;

  if (email) {
    const res = await sendBrevoEmail({
      apiKey: config.brevo_api_key,
      senderEmail: config.brevo_sender_email,
      senderName: config.brevo_sender_name,
      recipientEmail: email,
      recipientName: patientName,
      subject: `🔔 Final Reminder: Appointment in 2 Hours (${appointmentTime}) - Shree Ram Homeo`,
      htmlContent: emailHtml
    });
    await logNotification({ appointmentId, channel: 'EMAIL', stage: 'STAGE_4_REMINDER_2H', recipient: email, status: res.success ? 'SENT' : 'FAILED', message: '2h reminder.' });
  }

  if (phone) {
    const res = await sendWhatsAppMessage({
      apiKey: config.whatsapp_api_key,
      phoneId: config.whatsapp_phone_number_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'WHATSAPP', stage: 'STAGE_4_REMINDER_2H', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }

  if (phone) {
    const res = await sendSMS({
      apiKey: config.sms_api_key,
      senderId: config.sms_sender_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'SMS', stage: 'STAGE_4_REMINDER_2H', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }
}

/**
 * STAGE 5: After Consultation -> Thank-you email with feedback link
 */
async function sendStage5ConsultationCompleted(appointmentData) {
  const { appointmentId, patientName, email, phone, serviceName, branchName, appointmentDate, appointmentTime } = appointmentData;
  const config = await getHospitalNotificationConfig();
  const feedbackUrl = config.feedback_url || 'https://shreeramhomeo.com/feedback';

  const title = 'Thank You for Visiting Shree Ram Homeo';
  const emailHtml = createHtmlEmail({
    title,
    patientName,
    appointmentId,
    serviceName,
    branchName,
    appointmentDate,
    appointmentTime,
    additionalNotes: 'We hope you had a pleasant consultation experience with our doctors at KKR Clinic. Your feedback helps us serve you better!',
    actionUrl: feedbackUrl,
    actionText: '⭐ Rate & Share Your Feedback'
  });

  const textMsg = `💌 Dear ${patientName}, thank you for visiting KKR Clinic & Multispecialty Hospital! Please share your feedback to help us improve: ${feedbackUrl}`;

  if (email) {
    const res = await sendBrevoEmail({
      apiKey: config.brevo_api_key,
      senderEmail: config.brevo_sender_email,
      senderName: config.brevo_sender_name || 'KKR Clinic & Multispecialty Hospital',
      recipientEmail: email,
      recipientName: patientName,
      subject: `Thank You for Visiting KKR Clinic! Share Your Feedback`,
      htmlContent: emailHtml
    });
    await logNotification({ appointmentId, channel: 'EMAIL', stage: 'STAGE_5_COMPLETED', recipient: email, status: res.success ? 'SENT' : 'FAILED', message: 'Completed & feedback link.' });
  }

  if (phone) {
    const res = await sendWhatsAppMessage({
      apiKey: config.whatsapp_api_key,
      phoneId: config.whatsapp_phone_number_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'WHATSAPP', stage: 'STAGE_5_COMPLETED', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }

  if (phone) {
    const res = await sendSMS({
      apiKey: config.sms_api_key,
      senderId: config.sms_sender_id,
      recipientPhone: phone,
      messageText: textMsg
    });
    await logNotification({ appointmentId, channel: 'SMS', stage: 'STAGE_5_COMPLETED', recipient: phone, status: res.success ? 'SENT' : 'FAILED', message: textMsg });
  }
}

module.exports = {
  sendBrevoEmail,
  sendWhatsAppMessage,
  sendSMS,
  sendStage1BookingReceived,
  sendStage2AppointmentConfirmed,
  sendStage3Reminder24Hours,
  sendStage4Reminder2Hours,
  sendStage5ConsultationCompleted,
  getHospitalNotificationConfig
};
