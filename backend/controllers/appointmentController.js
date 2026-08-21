const { query } = require('../config/db');
const { getAvailableSlots } = require('../services/slotService');
const { sendAppointmentConfirmation, sendAppointmentStatusUpdate } = require('../services/emailService');
const {
  sendStage1BookingReceived,
  sendStage2AppointmentConfirmed,
  sendStage5ConsultationCompleted
} = require('../services/multiChannelNotificationService');

// Helper to generate unique Appointment ID dynamically with clinic prefix (e.g. RRK-20260808-3193)
async function generateAppointmentId(hospitalClientId = 'CLI-RRK-002') {
  let prefix = 'RRK';
  try {
    const clients = await query('SELECT hospital_name, client_id FROM clients WHERE client_id = ? OR id = 1 LIMIT 1', [hospitalClientId]);
    if (clients && clients.length > 0) {
      const name = clients[0].hospital_name || '';
      const firstWord = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
      if (firstWord.length >= 2) prefix = firstWord.substring(0, 4);
    }
  } catch (e) {}

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomNum}`;
}

const fetchAvailableSlots = async (req, res) => {
  try {
    const { branchId, date } = req.query;
    if (!branchId || !date) {
      return res.status(400).json({ success: false, message: 'branchId and date are required parameters' });
    }

    const slotResult = await getAvailableSlots({ branchId: parseInt(branchId), appointmentDate: date });
    res.json({ success: true, ...slotResult });
  } catch (error) {
    console.error('Fetch Slots Error:', error);
    res.status(500).json({ success: false, message: 'Error calculating available time slots' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientName, phone, email, serviceId, branchId, appointmentDate, appointmentTime, remarks, clientId } = req.body;

    // 1. Check double booking
    const existing = await query(
      `SELECT id FROM appointments 
       WHERE branch_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'`,
      [branchId, appointmentDate, appointmentTime]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'The selected time slot has just been booked. Please choose another available slot.'
      });
    }

    // 2. Fetch service & branch info for verification & email
    const services = await query('SELECT name FROM services WHERE id = ?', [serviceId]);
    const branches = await query('SELECT name, address, phone FROM branches WHERE id = ?', [branchId]);

    if (services.length === 0 || branches.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid Service or Branch selected.' });
    }

    const serviceName = services[0].name;
    const branchName = branches[0].name;
    const branchAddress = branches[0].address;
    const branchPhone = branches[0].phone;

    // 3. Insert appointment with dynamic Clinic prefix (e.g. RRK-20260808-3193)
    const appointmentCode = await generateAppointmentId(clientId || 'CLI-RRK-002');
    const result = await query(
      `INSERT INTO appointments 
       (appointment_id, patient_name, phone, email, service_id, branch_id, appointment_date, appointment_time, status, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)`,
      [appointmentCode, patientName, phone, email, serviceId, branchId, appointmentDate, appointmentTime, remarks || '']
    );

    const insertedId = result.insertId;

    // 4. Record status history (wrapped in try/catch to ensure appointment creation never fails)
    try {
      await query(
        'INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by) VALUES (?, NULL, ?, ?)',
        [insertedId, 'New', 'Patient Online']
      );
    } catch (histErr) {
      console.warn('Non-blocking status history error:', histErr.message);
    }

    // 5. Send Multi-Channel Notification (Stage 1: Immediate Booking Received via Brevo, WhatsApp, SMS)
    sendStage1BookingReceived({
      appointmentId: appointmentCode,
      patientName,
      email,
      phone,
      serviceName,
      branchName,
      branchAddress,
      appointmentDate,
      appointmentTime,
      clinicPhone: branchPhone
    }).catch(err => console.error('Stage 1 Notification Error:', err.message));

    // Also maintain legacy nodemailer confirmation for fallback compatibility
    sendAppointmentConfirmation({
      appointmentId: appointmentCode,
      patientName,
      email,
      serviceName,
      branchName,
      branchAddress,
      appointmentDate,
      appointmentTime,
      phone: branchPhone
    }).catch(err => console.error('Background Email Error:', err));

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment: {
        id: insertedId,
        appointmentId: appointmentCode,
        patientName,
        phone,
        email,
        serviceName,
        branchName,
        branchAddress,
        appointmentDate,
        appointmentTime,
        status: 'New',
        remarks
      }
    });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Server error while booking appointment.' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const {
      search,
      branchId,
      serviceId,
      status,
      statusGroup,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(a.patient_name LIKE ? OR a.phone LIKE ? OR a.email LIKE ? OR a.appointment_id LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (branchId) {
      whereClauses.push('a.branch_id = ?');
      params.push(branchId);
    }

    if (serviceId) {
      whereClauses.push('a.service_id = ?');
      params.push(serviceId);
    }

    if (status) {
      whereClauses.push('a.status = ?');
      params.push(status);
    } else if (statusGroup === 'active') {
      whereClauses.push("a.status NOT IN ('Completed', 'Cancelled')");
    } else if (statusGroup === 'history') {
      whereClauses.push("a.status IN ('Completed', 'Cancelled')");
    }

    if (startDate) {
      whereClauses.push('a.appointment_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClauses.push('a.appointment_date <= ?');
      params.push(endDate);
    }

    const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Count Total
    const countSql = `SELECT COUNT(*) as total FROM appointments a ${whereSql}`;
    const countRows = await query(countSql, params);
    const totalRecords = countRows[0] ? countRows[0].total : 0;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const dataSql = `
      SELECT 
        a.id, a.appointment_id, a.patient_name, a.phone, a.email,
        a.service_id, s.name as service_name,
        a.branch_id, b.name as branch_name, b.address as branch_address,
        a.appointment_date, a.appointment_time, a.status, a.remarks, a.admin_notes,
        a.created_at, a.updated_at
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN branches b ON a.branch_id = b.id
      ${whereSql}
      ORDER BY a.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const appointments = await query(dataSql, params);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        totalRecords,
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving appointments list' });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const dataSql = `
      SELECT 
        a.id, a.appointment_id, a.patient_name, a.phone, a.email,
        a.service_id, s.name as service_name, s.description as service_description,
        a.branch_id, b.name as branch_name, b.address as branch_address, b.phone as branch_phone,
        a.appointment_date, a.appointment_time, a.status, a.remarks, a.admin_notes,
        a.created_at, a.updated_at
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN branches b ON a.branch_id = b.id
      WHERE a.id = ? OR a.appointment_id = ?
    `;

    const appointments = await query(dataSql, [id, id]);

    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Fetch status history timeline (defensive against missing columns)
    let history = [];
    try {
      history = await query(
        'SELECT id, COALESCE(previous_status, old_status) AS previous_status, new_status, changed_by, notes, created_at FROM appointment_status_history WHERE appointment_id = ? ORDER BY created_at ASC',
        [appointment.id]
      );
    } catch (hErr) {
      try {
        history = await query(
          'SELECT id, COALESCE(previous_status, old_status) AS previous_status, new_status, changed_by, created_at FROM appointment_status_history WHERE appointment_id = ? ORDER BY created_at ASC',
          [appointment.id]
        );
      } catch (hErr2) {
        history = [];
      }
    }

    res.json({
      success: true,
      appointment: {
        ...appointment,
        history
      }
    });
  } catch (error) {
    console.error('Get Appointment Details Error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving appointment details' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const appointments = await query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const prevAppointment = appointments[0];
    const prevStatus = prevAppointment.status;

    await query(
      'UPDATE appointments SET status = ?, admin_notes = COALESCE(?, admin_notes) WHERE id = ?',
      [status, adminNotes, id]
    );

    // Record history log (wrapped in try/catch to avoid breaking status update)
    try {
      await query(
        'INSERT INTO appointment_status_history (appointment_id, previous_status, old_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [id, prevStatus, prevStatus, status, req.user ? req.user.name : 'Admin', adminNotes || `Status changed from ${prevStatus} to ${status}`]
      );
    } catch (histErr) {
      try {
        await query(
          'INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
          [id, prevStatus, status, req.user ? req.user.name : 'Admin']
        );
      } catch (histErr2) {
        console.warn('Status history update warning:', histErr2.message);
      }
    }

    // Trigger multi-channel notifications (Stage 2: Confirmed, Stage 5: Completed)
    if (prevStatus !== status) {
      const branches = await query('SELECT name, address, phone FROM branches WHERE id = ?', [prevAppointment.branch_id]);
      const services = await query('SELECT name FROM services WHERE id = ?', [prevAppointment.service_id]);

      const notificationPayload = {
        appointmentId: prevAppointment.appointment_id,
        patientName: prevAppointment.patient_name,
        email: prevAppointment.email,
        phone: prevAppointment.phone,
        serviceName: services[0] ? services[0].name : '',
        branchName: branches[0] ? branches[0].name : '',
        branchAddress: branches[0] ? branches[0].address : '',
        appointmentDate: prevAppointment.appointment_date,
        appointmentTime: prevAppointment.appointment_time,
        clinicPhone: branches[0] ? branches[0].phone : ''
      };

      if (status === 'Confirmed') {
        sendStage2AppointmentConfirmed(notificationPayload).catch(e => console.error('Stage 2 Notification Error:', e.message));
      } else if (status === 'Completed') {
        sendStage5ConsultationCompleted(notificationPayload).catch(e => console.error('Stage 5 Notification Error:', e.message));
      }

      sendAppointmentStatusUpdate({
        ...notificationPayload,
        newStatus: status
      }).catch(e => console.error('Status Email Error:', e));
    }

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, message: 'Error updating appointment status' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, phone, email, serviceId, branchId, appointmentDate, appointmentTime, remarks, adminNotes } = req.body;

    await query(
      `UPDATE appointments 
       SET patient_name = ?, phone = ?, email = ?, service_id = ?, branch_id = ?, 
           appointment_date = ?, appointment_time = ?, remarks = ?, admin_notes = ?
       WHERE id = ?`,
      [patientName, phone, email, serviceId, branchId, appointmentDate, appointmentTime, remarks, adminNotes, id]
    );

    res.json({ success: true, message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete appointment' });
  }
};

module.exports = {
  fetchAvailableSlots,
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateStatus,
  updateAppointment,
  deleteAppointment
};
