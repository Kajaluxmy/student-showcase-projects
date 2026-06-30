const { pool } = require('../config/db');
const env = require('../config/env');
const mockDb = require('./mockDb');

const followRepository = {
  async exists(followerId, followingId) {
    if (env.MOCK_DATABASE) {
      return mockDb.followers.some(
        (f) => String(f.follower_id) === String(followerId) && String(f.following_id) === String(followingId)
      );
    }
    const [rows] = await pool.query(
      'SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return rows.length > 0;
  },

  async insert(followerId, followingId) {
    if (env.MOCK_DATABASE) {
      mockDb.followers.push({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date()
      });
      return { affectedRows: 1 };
    }
    const [result] = await pool.query(
      'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );
    return result;
  },

  async delete(followerId, followingId) {
    if (env.MOCK_DATABASE) {
      const idx = mockDb.followers.findIndex(
        (f) => String(f.follower_id) === String(followerId) && String(f.following_id) === String(followingId)
      );
      if (idx !== -1) {
        mockDb.followers.splice(idx, 1);
        return true;
      }
      return false;
    }
    const [result] = await pool.query(
      'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return result.affectedRows > 0;
  },

  async findFollowing(followerId) {
    if (env.MOCK_DATABASE) {
      const list = mockDb.followers.filter((f) => String(f.follower_id) === String(followerId));
      return list.map((f) => {
        const u = mockDb.users.find((user) => user.id === f.following_id);
        return {
          id: u?.id,
          name: u?.name || 'Unknown Student',
          email: u?.email || '',
          profile_picture_url: u?.profile_picture_url || ''
        };
      });
    }
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.profile_picture_url 
       FROM followers f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?`,
      [followerId]
    );
    return rows;
  },

  async findFollowers(followingId) {
    if (env.MOCK_DATABASE) {
      const list = mockDb.followers.filter((f) => String(f.following_id) === String(followingId));
      return list.map((f) => {
        const u = mockDb.users.find((user) => user.id === f.follower_id);
        return {
          id: u?.id,
          name: u?.name || 'Unknown Recruiter',
          email: u?.email || '',
          profile_picture_url: u?.profile_picture_url || ''
        };
      });
    }
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.profile_picture_url 
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?`,
      [followingId]
    );
    return rows;
  }
};

module.exports = followRepository;
