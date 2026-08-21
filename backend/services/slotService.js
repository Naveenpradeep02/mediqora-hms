const { query } = require('../config/db');

// Helper to convert HH:MM string to total minutes from midnight
function parseTimeToMins(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper to format minutes from midnight into 12-hour AM/PM format (e.g. 10:30 AM, 04:00 PM)
function formatMinsTo12Hr(totalMins) {
  let hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // convert 0 to 12
  const minsStr = minutes < 10 ? '0' + minutes : minutes;
  const hoursStr = hours < 10 ? '0' + hours : hours;
  return `${hoursStr}:${minsStr} ${ampm}`;
}

// Helper to format totalMins into HH:MM (24-hr format)
function formatMinsTo24Hr(totalMins) {
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  const hStr = hours < 10 ? '0' + hours : hours;
  const mStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hStr}:${mStr}`;
}

// Generate array of 30-min slots between startMins and endMins (exclusive of endMins)
function generateSessionSlots(startMins, endMins, durationMins = 30) {
  const slots = [];
  if (startMins === null || endMins === null || startMins >= endMins) return slots;
  
  for (let m = startMins; m + durationMins <= endMins; m += durationMins) {
    slots.push({
      time24: formatMinsTo24Hr(m),
      time12: formatMinsTo12Hr(m),
      startMins: m,
      endMins: m + durationMins
    });
  }
  return slots;
}

async function getAvailableSlots({ branchId, appointmentDate }) {
  // 1. Fetch branch operating hours
  const branches = await query('SELECT * FROM branches WHERE id = ? AND is_active = 1', [branchId]);
  if (!branches || branches.length === 0) {
    return { isClosed: true, message: 'Branch not found or inactive', slots: [] };
  }
  const branch = branches[0];

  // 2. Check if selected date falls on a branch holiday
  const holidays = await query(
    'SELECT * FROM holidays WHERE (branch_id = ? OR branch_id IS NULL) AND holiday_date = ?',
    [branchId, appointmentDate]
  );

  if (holidays && holidays.length > 0) {
    return {
      isClosed: true,
      reason: holidays[0].title || 'Clinic Closed for Holiday',
      slots: []
    };
  }

  // 3. Determine day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dateObj = new Date(appointmentDate);
  const dayOfWeek = dateObj.getDay();

  let slots = [];
  const isSunday = dayOfWeek === 0;
  const isSundayOpen = branch.is_sunday_open === 1 || branch.is_sunday_open === true || branch.is_sunday_open === '1';

  if (isSunday) {
    if (!isSundayOpen) {
      return { isClosed: true, reason: 'Branch is closed on Sundays (Sunday Holiday)', slots: [] };
    }

    // Sunday Morning session
    if (branch.sunday_morning_open && branch.sunday_morning_close) {
      const start = parseTimeToMins(branch.sunday_morning_open);
      const end = parseTimeToMins(branch.sunday_morning_close);
      slots.push(...generateSessionSlots(start, end));
    }
    // Sunday Evening session
    if (branch.sunday_evening_open && branch.sunday_evening_close) {
      const start = parseTimeToMins(branch.sunday_evening_open);
      const end = parseTimeToMins(branch.sunday_evening_close);
      slots.push(...generateSessionSlots(start, end));
    }
  } else {
    // Mon - Sat Morning session
    if (branch.morning_open && branch.morning_close) {
      const start = parseTimeToMins(branch.morning_open);
      const end = parseTimeToMins(branch.morning_close);
      slots.push(...generateSessionSlots(start, end));
    }
    // Mon - Sat Evening session
    if (branch.evening_open && branch.evening_close) {
      const start = parseTimeToMins(branch.evening_open);
      const end = parseTimeToMins(branch.evening_close);
      slots.push(...generateSessionSlots(start, end));
    }
  }

  if (slots.length === 0) {
    return { isClosed: true, reason: 'No operating sessions scheduled on this date for the selected branch.', slots: [] };
  }

  // 4. Fetch booked appointments for this branch and date (excluding cancelled ones)
  const bookedAppointments = await query(
    `SELECT appointment_time FROM appointments 
     WHERE branch_id = ? AND appointment_date = ? AND status != 'Cancelled'`,
    [branchId, appointmentDate]
  );

  const bookedTimes = new Set(bookedAppointments.map(a => a.appointment_time));

  // 5. If booking for TODAY, calculate server local time cutoff
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = appointmentDate === todayStr;
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // 6. Map slots with availability flag
  const formattedSlots = slots.map(slot => {
    const isBooked = bookedTimes.has(slot.time12) || bookedTimes.has(slot.time24);
    const isPast = isToday && slot.startMins <= currentMins;
    const isAvailable = !isBooked && !isPast;

    return {
      time: slot.time12,
      time24: slot.time24,
      isAvailable,
      reason: isBooked ? 'Booked' : (isPast ? 'Past Slot' : 'Available')
    };
  });

  return {
    isClosed: false,
    branchName: branch.name,
    appointmentDate,
    totalSlots: formattedSlots.length,
    availableSlotsCount: formattedSlots.filter(s => s.isAvailable).length,
    slots: formattedSlots
  };
}

module.exports = {
  getAvailableSlots,
  parseTimeToMins,
  formatMinsTo12Hr
};
