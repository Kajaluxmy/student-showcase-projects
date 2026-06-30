const { pool } = require('../config/db');
const env = require('../config/env');
const mockDb = require('./mockDb');

const auditLogRepository = {
  async list(limit = 50, offset = 0) {
    if (env.MOCK_DATABASE) {
      const logs = [...mockDb.audit_logs];
      // Sort by creation date descending
      logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const rows = logs.slice(offset, offset + limit);
      const count = mockDb.audit_logs.length;
      return { rows, count };
    }
    const [rows] = await pool.query(
      `SELECT a.*, u.name as admin_name
       FROM audit_logs a
       JOIN users u ON a.admin_id = u.id
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
    return { rows, count };
  },

  async log(adminId, action, targetType, targetId, reason = null, ipAddress = null) {
    if (env.MOCK_DATABASE) {
      const newLog = {
        id: mockDb.audit_logs.length + 1,
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        reason,
        ip_address: ipAddress,
        created_at: new Date().toISOString()
      };
      // Fetch admin name
      const admin = mockDb.users.find(u => u.id === adminId);
      newLog.admin_name = admin ? admin.name : 'Arthur Admin';
      mockDb.audit_logs.push(newLog);
      return newLog;
    }
    const [result] = await pool.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, reason, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, action, targetType, targetId, reason, ipAddress]
    );
    return { 
      id: result.insertId, 
      admin_id: adminId, 
      action, 
      target_type: targetType, 
      target_id: targetId, 
      reason, 
      ip_address: ipAddress, 
      created_at: new Date().toISOString() 
    };
  }
};

module.exports = auditLogRepository;
