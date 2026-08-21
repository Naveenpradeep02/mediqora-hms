import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import logoImg from '../assets/LOGO-EDIT 1.png';
import { formatDate } from './dateHelpers';

export const exportToExcel = (data, fileName = 'Appointments_Report') => {
  if (!data || data.length === 0) return;

  const formattedData = data.map((item, idx) => ({
    '#': idx + 1,
    'Appointment ID': item.appointment_id,
    'Patient Name': item.patient_name,
    'Phone Number': item.phone,
    'Email Address': item.email,
    'Service': item.service_name || item.service,
    'Branch': item.branch_name || item.branch,
    'Date': formatDate(item.appointment_date),
    'Time Slot': item.appointment_time,
    'Status': item.status,
    'Remarks': item.remarks || '',
    'Booked On': item.created_at ? new Date(item.created_at).toLocaleString() : ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToCSV = (data, fileName = 'Appointments_Report') => {
  if (!data || data.length === 0) return;

  const headers = ['Appointment ID', 'Patient Name', 'Phone', 'Email', 'Service', 'Branch', 'Date', 'Time', 'Status'];
  const rows = data.map(item => [
    `"${item.appointment_id}"`,
    `"${item.patient_name}"`,
    `"${item.phone}"`,
    `"${item.email}"`,
    `"${item.service_name || item.service}"`,
    `"${item.branch_name || item.branch}"`,
    `"${formatDate(item.appointment_date)}"`,
    `"${item.appointment_time}"`,
    `"${item.status}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper to convert imported logo to base64 Data URL and compute true aspect ratio
const getLogoData = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      const aspectRatio = img.width / img.height;
      resolve({ dataUrl, width: img.width, height: img.height, aspectRatio });
    };
    img.onerror = () => resolve(null);
    img.src = logoImg;
  });
};

export const generateAppointmentPDF = async (appointment) => {
  const doc = new jsPDF();
  const logoInfo = await getLogoData();

  // Top Accent Line (#16a34a)
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, 210, 6, 'F');

  // Header Logo (Left - proportional aspect ratio)
  if (logoInfo && logoInfo.dataUrl) {
    try {
      // Fit logo within max width 45mm x max height 22mm preserving natural aspect ratio
      let logoH = 22;
      let logoW = logoH * logoInfo.aspectRatio;
      if (logoW > 45) {
        logoW = 45;
        logoH = logoW / logoInfo.aspectRatio;
      }
      const logoY = 8 + (22 - logoH) / 2;
      doc.addImage(logoInfo.dataUrl, 'PNG', 15, logoY, logoW, logoH);
    } catch (e) {}
  }

  // Doctor & Clinic Info (Right)
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('Dr. R. Selvakumar, B.H.M.S.', 195, 17, { align: 'right' });

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Chief Homeopathic Physician & Medical Consultant', 195, 23, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('SHREE RAM HOMEO CLINICS - CHENNAI', 195, 28, { align: 'right' });

  // Header Divider Line (#16a34a)
  doc.setLineWidth(1);
  doc.setDrawColor(22, 163, 74);
  doc.line(15, 34, 195, 34);

  // Document Title Banner
  doc.setFillColor(240, 253, 244);
  doc.rect(15, 38, 180, 11, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.rect(15, 38, 180, 11, 'S');

  doc.setTextColor(22, 163, 74);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT REGISTRATION & CONSULTATION SLIP', 105, 45.5, { align: 'center' });

  // Patient & Appointment Details Box
  const startY = 60;
  const lineSpacing = 10;

  const fields = [
    ['Appointment Ref ID:', appointment.appointment_id || appointment.appointmentId || 'N/A'],
    ['Patient Name:', appointment.patient_name || appointment.patientName || 'N/A'],
    ['Contact Phone:', appointment.phone || 'N/A'],
    ['Email Address:', appointment.email || 'N/A'],
    ['Medical Specialty:', appointment.service_name || appointment.serviceName || 'Homeopathy Consultation'],
    ['Hospital Branch:', appointment.branch_name || appointment.branchName || 'Shree Ram Homeo'],
    ['Consultation Date:', formatDate(appointment.appointment_date || appointment.appointmentDate) || 'N/A'],
    ['Scheduled Time Slot:', appointment.appointment_time || appointment.appointmentTime || 'N/A'],
    ['Booking Status:', appointment.status || 'Confirmed'],
    ['Patient Symptoms / Remarks:', appointment.remarks || 'None']
  ];

  fields.forEach(([label, val], idx) => {
    const currentY = startY + (idx * lineSpacing);
    
    // Row zebra background
    if (idx % 2 === 0) {
      doc.setFillColor(240, 253, 244);
      doc.rect(15, currentY - 6.5, 180, 9.5, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, currentY);

    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(val), 82, currentY);
  });

  // Footer Branch Addresses Section
  const footerStartY = 175;
  doc.setLineWidth(0.8);
  doc.setDrawColor(187, 247, 208);
  doc.line(15, footerStartY, 195, footerStartY);

  // Footer Logo (Left - proportional aspect ratio)
  if (logoInfo && logoInfo.dataUrl) {
    try {
      let fLogoH = 18;
      let fLogoW = fLogoH * logoInfo.aspectRatio;
      if (fLogoW > 40) {
        fLogoW = 40;
        fLogoH = fLogoW / logoInfo.aspectRatio;
      }
      const fLogoY = footerStartY + 6 + (18 - fLogoH) / 2;
      doc.addImage(logoInfo.dataUrl, 'PNG', 15, fLogoY, fLogoW, fLogoH);
    } catch (e) {}
  }

  // Branch Addresses Details
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('West Mambalam / T Nagar Branch:', 58, footerStartY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('58, Arya Gowder Road, West Mambalam, Chennai - 600033 | Ph: 044 2483 7465 / 95515 19766', 58, footerStartY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Anna Nagar Branch:', 58, footerStartY + 23);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('G-2, Firm Foundation, Plot 3738, 17th St, Q Block, Anna Nagar, Chennai - 600040 | Cell: 95515 19766', 58, footerStartY + 28);

  // Bottom Credit Bar (#16a34a)
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 282, 210, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SHREE RAM HOMEO CLINICS - CHENNAI', 15, 291);

  doc.setFont('helvetica', 'normal');
  doc.text('Designed & Developed by Medgrow Marketing Agency (medgrowdigi.com)', 195, 291, { align: 'right' });

  doc.save(`Appointment_${appointment.appointment_id || appointment.appointmentId}.pdf`);
};

export const printAppointmentSlip = (appointment) => {
  const printWindow = window.open('', '_blank');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Appointment Slip - ${appointment.appointment_id || appointment.appointmentId}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #0f172a; max-width: 750px; margin: 0 auto; background: #f8fafc; }
        .letterhead { background: #ffffff; border: 2px solid #BBF7D0; border-radius: 20px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        
        .top-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 20px; }
        .logo-header img { height: 60px; width: auto; object-fit: contain; display: block; }
        .doc-info { text-align: right; }
        .doc-info h2 { margin: 0; color: #16a34a; font-size: 20px; font-weight: 800; }
        .doc-info p { margin: 2px 0 0 0; color: #475569; font-size: 12px; font-weight: 600; }
        
        .banner { background: #F0FDF4; border: 1px solid #BBF7D0; color: #16a34a; padding: 10px; border-radius: 12px; text-align: center; font-weight: 800; font-size: 14px; margin-bottom: 24px; letter-spacing: 0.5px; }
        
        .grid { display: grid; grid-cols: 1; gap: 8px; margin-bottom: 24px; }
        .row { display: flex; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #BBF7D0; font-size: 13px; }
        .row:nth-child(even) { background: #F0FDF4; border-radius: 8px; }
        .label { color: #475569; font-weight: 700; }
        .val { font-weight: 700; color: #0f172a; }
        .ref-val { color: #16a34a; font-family: monospace; font-size: 14px; }

        .footer-addresses { border-top: 2px solid #BBF7D0; padding-top: 16px; margin-top: 24px; display: flex; align-items: center; gap: 24px; }
        .footer-logo img { height: 48px; width: auto; object-fit: contain; display: block; }
        .addresses-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 11px; color: #475569; flex: 1; }
        .branch-title { font-weight: 800; color: #0f172a; margin-bottom: 2px; }

        .credit-bar { background: #16a34a; color: white; padding: 10px 16px; border-radius: 10px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 600; }
        .credit-bar a { color: white; font-weight: 800; text-decoration: underline; }

        @media print {
          body { background: white; padding: 0; }
          .letterhead { border: none; box-shadow: none; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="letterhead">
        <div class="top-bar">
          <div class="logo-header">
            <img src="${logoImg}" alt="Shree Ram Homeo Logo" />
          </div>
          <div class="doc-info">
            <h2>Dr. R. Selvakumar, B.H.M.S.</h2>
            <p>Chief Homeopathic Physician & Medical Consultant</p>
            <p style="color: #64748b; font-weight: 500;">Shree Ram Homeo Clinics - Chennai</p>
          </div>
        </div>

        <div class="banner">APPOINTMENT REGISTRATION & CONSULTATION SLIP</div>

        <div class="grid">
          <div class="row"><span class="label">Appointment Ref ID:</span><span class="val ref-val">${appointment.appointment_id || appointment.appointmentId}</span></div>
          <div class="row"><span class="label">Patient Name:</span><span class="val">${appointment.patient_name || appointment.patientName}</span></div>
          <div class="row"><span class="label">Contact Phone:</span><span class="val">${appointment.phone}</span></div>
          <div class="row"><span class="label">Email Address:</span><span class="val">${appointment.email}</span></div>
          <div class="row"><span class="label">Medical Specialty:</span><span class="val">${appointment.service_name || appointment.serviceName || 'Homeopathy Consultation'}</span></div>
          <div class="row"><span class="label">Hospital Branch:</span><span class="val">${appointment.branch_name || appointment.branchName}</span></div>
          <div class="row"><span class="label">Consultation Date:</span><span class="val">${formatDate(appointment.appointment_date || appointment.appointmentDate)}</span></div>
          <div class="row"><span class="label">Scheduled Time Slot:</span><span class="val">${appointment.appointment_time || appointment.appointmentTime}</span></div>
          <div class="row"><span class="label">Booking Status:</span><span class="val" style="color:#16a34a;">${appointment.status || 'Confirmed'}</span></div>
          ${appointment.remarks ? `<div class="row"><span class="label">Patient Symptoms:</span><span class="val">${appointment.remarks}</span></div>` : ''}
        </div>

        <div class="footer-addresses">
          <div class="footer-logo">
            <img src="${logoImg}" alt="Shree Ram Homeo Logo" />
          </div>
          <div class="addresses-grid">
            <div>
              <div class="branch-title">West Mambalam / T Nagar Branch</div>
              <p style="margin:2px 0;">58, Arya Gowder Road, West Mambalam, Chennai - 600033 (Near Panigraha Hall)</p>
              <p style="margin:2px 0; font-weight: 700; color:#16a34a;">Ph: 044 2483 7465 / 95515 19766</p>
            </div>
            <div>
              <div class="branch-title">Anna Nagar Branch</div>
              <p style="margin:2px 0;">G-2, Firm Foundation, Plot 3738, 17th St, Q Block, Anna Nagar, Chennai - 600040 (Near K4 Station)</p>
              <p style="margin:2px 0; font-weight: 700; color:#16a34a;">Cell: 95515 19766</p>
            </div>
          </div>
        </div>

        <div class="credit-bar">
          <span>&copy; 2026 Shree Ram Homeo Clinics - Chennai</span>
          <span>Designed & Developed by <a href="http://medgrowdigi.com/" target="_blank">Medgrow Marketing Agency</a></span>
        </div>
      </div>

      <div style="margin-top: 24px; text-align: center;" class="no-print">
        <button onclick="window.print()" style="background: #16a34a; color: white; border: none; padding: 12px 28px; font-weight: 800; border-radius: 12px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(22, 163, 74,0.3);">
          Print Prescription Slip
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
