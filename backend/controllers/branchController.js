const { query } = require('../config/db');

const getBranches = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let sql = 'SELECT * FROM branches';
    if (activeOnly === 'true') {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY id ASC';

    const branches = await query(sql);
    res.json({ success: true, branches });
  } catch (error) {
    console.error('Get Branches Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch branches' });
  }
};

const createBranch = async (req, res) => {
  try {
    const {
      name,
      slug,
      address,
      phone,
      morningOpen,
      morningClose,
      eveningOpen,
      eveningClose,
      sundayMorningOpen,
      sundayMorningClose,
      sundayEveningOpen,
      sundayEveningClose,
      isSundayOpen,
      isActive,
      googleMapUrl
    } = req.body;

    const result = await query(
      `INSERT INTO branches 
       (name, slug, address, phone, morning_open, morning_close, evening_open, evening_close, 
        sunday_morning_open, sunday_morning_close, sunday_evening_open, sunday_evening_close, 
        is_sunday_open, is_active, google_map_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        address,
        phone,
        morningOpen || null,
        morningClose || null,
        eveningOpen || null,
        eveningClose || null,
        sundayMorningOpen || null,
        sundayMorningClose || null,
        sundayEveningOpen || null,
        sundayEveningClose || null,
        isSundayOpen ? 1 : 0,
        isActive ? 1 : 0,
        googleMapUrl || ''
      ]
    );

    res.status(201).json({ success: true, message: 'Branch created successfully', branchId: result.insertId });
  } catch (error) {
    console.error('Create Branch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create branch' });
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      address,
      phone,
      morningOpen,
      morningClose,
      eveningOpen,
      eveningClose,
      sundayMorningOpen,
      sundayMorningClose,
      sundayEveningOpen,
      sundayEveningClose,
      isSundayOpen,
      isActive,
      googleMapUrl
    } = req.body;

    await query(
      `UPDATE branches 
       SET name = ?, slug = ?, address = ?, phone = ?, morning_open = ?, morning_close = ?, 
           evening_open = ?, evening_close = ?, sunday_morning_open = ?, sunday_morning_close = ?, 
           sunday_evening_open = ?, sunday_evening_close = ?, is_sunday_open = ?, is_active = ?, 
           google_map_url = ? 
       WHERE id = ?`,
      [
        name,
        slug,
        address,
        phone,
        morningOpen || null,
        morningClose || null,
        eveningOpen || null,
        eveningClose || null,
        sundayMorningOpen || null,
        sundayMorningClose || null,
        sundayEveningOpen || null,
        sundayEveningClose || null,
        isSundayOpen ? 1 : 0,
        isActive ? 1 : 0,
        googleMapUrl || '',
        id
      ]
    );

    res.json({ success: true, message: 'Branch updated successfully' });
  } catch (error) {
    console.error('Update Branch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update branch' });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM branches WHERE id = ?', [id]);
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete Branch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete branch' });
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch
};
