const { query } = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Stat cards counts
    const todayRows = await query('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?', [todayStr]);
    const pendingRows = await query('SELECT COUNT(*) as count FROM appointments WHERE status = "New" OR status = "Pending"');
    const confirmedRows = await query('SELECT COUNT(*) as count FROM appointments WHERE status = "Confirmed"');
    const completedRows = await query('SELECT COUNT(*) as count FROM appointments WHERE status = "Completed"');
    const cancelledRows = await query('SELECT COUNT(*) as count FROM appointments WHERE status = "Cancelled"');
    const totalPatientsRows = await query('SELECT COUNT(DISTINCT phone) as count FROM appointments');
    const totalServicesRows = await query('SELECT COUNT(*) as count FROM services WHERE is_active = 1');
    const totalBranchesRows = await query('SELECT COUNT(*) as count FROM branches WHERE is_active = 1');

    // 2. Branch-wise appointment counts
    const branchCounts = await query(`
      SELECT b.id, b.name, COUNT(a.id) as appointment_count
      FROM branches b
      LEFT JOIN appointments a ON b.id = a.branch_id
      GROUP BY b.id, b.name
    `);

    // 3. Service-wise appointment counts
    const serviceCounts = await query(`
      SELECT s.name, COUNT(a.id) as count
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
      GROUP BY s.id, s.name
      ORDER BY count DESC
      LIMIT 6
    `);

    // 4. Monthly analytics (for graph visualizer)
    const monthlyData = await query(`
      SELECT 
        substr(appointment_date, 1, 7) as month,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM appointments
      GROUP BY substr(appointment_date, 1, 7)
      ORDER BY month ASC
      LIMIT 12
    `);

    // 5. Recent 5 appointments for quick dashboard list
    const recentAppointments = await query(`
      SELECT 
        a.id, a.appointment_id, a.patient_name, a.phone, a.appointment_date, a.appointment_time, a.status,
        s.name as service_name, b.name as branch_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN branches b ON a.branch_id = b.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        todayAppointments: todayRows[0] ? todayRows[0].count : 0,
        pendingAppointments: pendingRows[0] ? pendingRows[0].count : 0,
        confirmedAppointments: confirmedRows[0] ? confirmedRows[0].count : 0,
        completedAppointments: completedRows[0] ? completedRows[0].count : 0,
        cancelledAppointments: cancelledRows[0] ? cancelledRows[0].count : 0,
        totalPatients: totalPatientsRows[0] ? totalPatientsRows[0].count : 0,
        totalServices: totalServicesRows[0] ? totalServicesRows[0].count : 0,
        totalBranches: totalBranchesRows[0] ? totalBranchesRows[0].count : 0
      },
      branchCounts,
      serviceCounts,
      monthlyData,
      recentAppointments
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard analytics' });
  }
};

module.exports = {
  getDashboardStats
};
