const { query } = require('../config/db');

const getServices = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let sql = 'SELECT * FROM services';
    if (activeOnly === 'true') {
      sql += ' WHERE is_active = 1';
    }
    
    try {
      const services = await query(sql + ' ORDER BY display_order ASC, name ASC');
      return res.json({ success: true, services });
    } catch (orderErr) {
      const services = await query(sql + ' ORDER BY name ASC');
      return res.json({ success: true, services });
    }
  } catch (error) {
    console.error('Get Services Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
};

const createService = async (req, res) => {
  try {
    const { name, description, iconName = 'Stethoscope', displayOrder = 0, isActive = 1 } = req.body;

    const result = await query(
      'INSERT INTO services (name, description, icon_name, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, description, iconName, displayOrder, isActive ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      serviceId: result.insertId
    });
  } catch (error) {
    console.error('Create Service Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, iconName, displayOrder, isActive } = req.body;

    await query(
      'UPDATE services SET name = ?, description = ?, icon_name = ?, display_order = ?, is_active = ? WHERE id = ?',
      [name, description, iconName, displayOrder, isActive ? 1 : 0, id]
    );

    res.json({ success: true, message: 'Service updated successfully' });
  } catch (error) {
    console.error('Update Service Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM services WHERE id = ?', [id]);
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete Service Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService
};
