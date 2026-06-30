const { pool } = require('../config/db');
const env = require('../config/env');
const mockDb = require('./mockDb');

const likeRepository = {
  async exists(userId, projectId) {
    if (env.MOCK_DATABASE) {
      return mockDb.likes.some(
        (l) => String(l.user_id) === String(userId) && String(l.project_id) === String(projectId)
      );
    }
    const [rows] = await pool.query(
      'SELECT 1 FROM likes WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    );
    return rows.length > 0;
  },

  async insert(userId, projectId) {
    if (env.MOCK_DATABASE) {
      mockDb.likes.push({
        user_id: userId,
        project_id: projectId,
        created_at: new Date()
      });
      return { affectedRows: 1 };
    }
    const [result] = await pool.query(
      'INSERT INTO likes (user_id, project_id) VALUES (?, ?)',
      [userId, projectId]
    );
    return result;
  },

  async delete(userId, projectId) {
    if (env.MOCK_DATABASE) {
      const idx = mockDb.likes.findIndex(
        (l) => String(l.user_id) === String(userId) && String(l.project_id) === String(projectId)
      );
      if (idx !== -1) {
        mockDb.likes.splice(idx, 1);
        return true;
      }
      return false;
    }
    const [result] = await pool.query(
      'DELETE FROM likes WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    );
    return result.affectedRows > 0;
  },

  async countByProjectId(projectId) {
    if (env.MOCK_DATABASE) {
      return mockDb.likes.filter((l) => String(l.project_id) === String(projectId)).length;
    }
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM likes WHERE project_id = ?',
      [projectId]
    );
    return count;
  }
};

module.exports = likeRepository;
