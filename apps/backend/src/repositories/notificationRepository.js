const { pool } = require('../config/db');
const env = require('../config/env');
const mockDb = require('./mockDb');

const notificationRepository = {
  async findByRecipientId(recipientId, limit, offset) {
    if (env.MOCK_DATABASE) {
      const list = mockDb.notifications.filter((n) => String(n.recipient_id) === String(recipientId));
      
      const rowsMapped = list.map((n) => {
        const sender = mockDb.users.find((u) => u.id === n.sender_id);
        return {
          ...n,
          sender_name: sender ? sender.name : 'System',
          sender_avatar: sender ? sender.profile_picture_url : ''
        };
      });

      // Sort by recency
      rowsMapped.sort((a, b) => b.created_at - a.created_at);

      const rows = rowsMapped.slice(offset, offset + limit);
      const count = list.length;
      return { rows, count };
    }
    const [rows] = await pool.query(
      `SELECT n.*, u.name as sender_name, u.profile_picture_url as sender_avatar
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       WHERE n.recipient_id = ?
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [recipientId, Number(limit), Number(offset)]
    );
    
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ?',
      [recipientId]
    );

    return { rows, count };
  },

  async markAsRead(id, recipientId) {
    if (env.MOCK_DATABASE) {
      const n = mockDb.notifications.find(
        (item) => String(item.id) === String(id) && String(item.recipient_id) === String(recipientId)
      );
      if (n) {
        n.is_read = true;
        return true;
      }
      return false;
    }
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ?',
      [id, recipientId]
    );
    return result.affectedRows > 0;
  },

  async markAllAsRead(recipientId) {
    if (env.MOCK_DATABASE) {
      let count = 0;
      mockDb.notifications.forEach((item) => {
        if (String(item.recipient_id) === String(recipientId) && !item.is_read) {
          item.is_read = true;
          count++;
        }
      });
      return count;
    }
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ?',
      [recipientId]
    );
    return result.affectedRows;
  },

  async clearAll(recipientId) {
    if (env.MOCK_DATABASE) {
      mockDb.notifications = mockDb.notifications.filter(
        (item) => String(item.recipient_id) !== String(recipientId)
      );
      return true;
    }
    await pool.query(
      'DELETE FROM notifications WHERE recipient_id = ?',
      [recipientId]
    );
    return true;
  },

  async create(notification) {
    if (env.MOCK_DATABASE) {
      const newNotif = {
        id: mockDb.notifications.length + 1,
        recipient_id: notification.recipientId,
        sender_id: notification.senderId,
        type: notification.type,
        entity_id: notification.entityId,
        message: notification.message,
        is_read: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockDb.notifications.push(newNotif);
      return newNotif;
    }
    const { recipientId, senderId, type, entityId, message } = notification;
    const [result] = await pool.query(
      `INSERT INTO notifications (recipient_id, sender_id, type, entity_id, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [recipientId, senderId, type, entityId, message]
    );
    return { id: result.insertId, ...notification };
  }
};

module.exports = notificationRepository;
