const { query } = require('../config/db');

const getHolidays = async (req, res) => {
  try {
    const holidays = await query(`
      SELECT h.*, b.name as branch_name 
      FROM holidays h
      LEFT JOIN branches b ON h.branch_id = b.id
      ORDER BY h.holiday_date ASC
    `);
    res.json({ success: true, holidays });
  } catch (error) {
    console.error('Get Holidays Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holidays' });
  }
};

const createHoliday = async (req, res) => {
  try {
    const { branchId, holidayDate, title, reason, isRecurring } = req.body;

    const result = await query(
      'INSERT INTO holidays (branch_id, holiday_date, title, reason, is_recurring) VALUES (?, ?, ?, ?, ?)',
      [branchId || null, holidayDate, title, reason || '', isRecurring ? 1 : 0]
    );

    res.status(201).json({ success: true, message: 'Holiday added successfully', holidayId: result.insertId });
  } catch (error) {
    console.error('Create Holiday Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create holiday' });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM holidays WHERE id = ?', [id]);
    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Delete Holiday Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete holiday' });
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  deleteHoliday
};
