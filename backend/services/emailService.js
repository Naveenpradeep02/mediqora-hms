const nodemailer = require('nodemailer');
const { query } = require('../config/db');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port == 465,
      auth: { user, pass }
    });
  } else {
    // Development / Fallback Mock Transporter
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('----------------------------------------------------');
        console.log('📧 [MOCK EMAIL TRANSPORTER] Email notification dispatched');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('Content Preview:');
        console.log(mailOptions.text || mailOptions.html.replace(/<[^>]*>?/gm, ' ').substring(0, 150) + '...');
        console.log('----------------------------------------------------');
        return { messageId: 'mock-mail-id-' + Date.now() };
      }
    };
  }
  return transporter;
}

// Generates modern HTML email template
function createEmailTemplate({ title, patientName, appointmentId, serviceName, branchName, branchAddress, appointmentDate, appointmentTime, phone, additionalNotes }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #334155; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #0d9488 0%, #0f172a 100%); padding: 30px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
      .header p { margin: 5px 0 0 0; color: #ccfbf1; font-size: 14px; }
      .content { padding: 30px; }
      .badge { display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-bottom: 20px; }
      .details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 10px 0; font-size: 15px; }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { color: #64748b; font-weight: 500; }
      .detail-value { color: #0f172a; font-weight: 600; }
      .instructions { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px; font-size: 14px; color: #166534; margin-top: 20px; }
      .footer { text-align: center; padding: 20px; background-color: #f8fafc; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Shree Ram Homeo</h1>
        <p>Holistic & Safe Healing Without Surgery</p>
      </div>
      <div class="content">
        <div class="badge">${title}</div>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Thank you for choosing Shree Ram Homeo. Your appointment details are outlined below:</p>

        <div class="details-card">
          <div class="detail-row">
            <span class="detail-label">Appointment ID:</span>
            <span class="detail-value">${appointmentId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Service:</span>
            <span class="detail-value">${serviceName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Branch:</span>
            <span class="detail-value">${branchName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${appointmentDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Slot:</span>
            <span class="detail-value">${appointmentTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Branch Address:</span>
            <span class="detail-value">${branchAddress}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Clinic Contact:</span>
            <span class="detail-value">${phone}</span>
          </div>
        </div>

        ${additionalNotes ? `<p style="font-size: 14px; color: #475569;"><strong>Note:</strong> ${additionalNotes}</p>` : ''}

        <div class="instructions">
          <strong>📋 Pre-Visit Instructions:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Please arrive 10-15 minutes prior to your scheduled slot.</li>
            <li>Bring any previous medical reports, prescriptions, or blood tests.</li>
            <li>In case of rescheduling or cancellations, please contact our reception at least 2 hours in advance.</li>
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

async function sendAppointmentConfirmation({ appointmentId, patientName, email, serviceName, branchName, branchAddress, appointmentDate, appointmentTime, phone }) {
  try {
    const htmlContent = createEmailTemplate({
      title: 'Appointment Confirmation - Shree Ram Homeo',
      patientName,
      appointmentId,
      serviceName,
      branchName,
      branchAddress,
      appointmentDate,
      appointmentTime,
      phone
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Shree Ram Homeo" <no-reply@shreeramhomeo.com>',
      to: email,
      subject: `Appointment Confirmation - Shree Ram Homeo (${appointmentId})`,
      html: htmlContent
    };

    const info = await getTransporter().sendMail(mailOptions);
    
    // Log email dispatch
    await query(
      'INSERT INTO email_logs (recipient_email, subject, status) VALUES (?, ?, ?)',
      [email, mailOptions.subject, 'Sent']
    );

    return info;
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error.message);
    await query(
      'INSERT INTO email_logs (recipient_email, subject, status, error_message) VALUES (?, ?, ?, ?)',
      [email, `Appointment Confirmation (${appointmentId})`, 'Failed', error.message]
    ).catch(() => {});
    return false;
  }
}

async function sendAppointmentStatusUpdate({ appointmentId, patientName, email, serviceName, branchName, branchAddress, appointmentDate, appointmentTime, phone, newStatus }) {
  try {
    const titleMap = {
      'Confirmed': 'Appointment Confirmed',
      'Completed': 'Appointment Completed - Thank You',
      'Cancelled': 'Appointment Cancelled'
    };

    const title = titleMap[newStatus] || `Appointment Update - ${newStatus}`;

    const htmlContent = createEmailTemplate({
      title,
      patientName,
      appointmentId,
      serviceName,
      branchName,
      branchAddress,
      appointmentDate,
      appointmentTime,
      phone,
      additionalNotes: `Your appointment status has been updated to: ${newStatus}`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Shree Ram Homeo" <no-reply@shreeramhomeo.com>',
      to: email,
      subject: `${title} - Shree Ram Homeo (${appointmentId})`,
      html: htmlContent
    };

    const info = await getTransporter().sendMail(mailOptions);

    await query(
      'INSERT INTO email_logs (recipient_email, subject, status) VALUES (?, ?, ?)',
      [email, mailOptions.subject, 'Sent']
    );

    return info;
  } catch (error) {
    console.error('❌ Failed to send email update:', error.message);
    return false;
  }
}

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentStatusUpdate
};
