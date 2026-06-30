const notificationRepository = require('../repositories/notificationRepository');

const notificationService = {
  async getNotifications(recipientId, page = 1, limit = 15) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 15));
    const offset = (pageNum - 1) * limitNum;

    return notificationRepository.findByRecipientId(recipientId, limitNum, offset);
  },

  async markAsRead(id, recipientId) {
    const success = await notificationRepository.markAsRead(id, recipientId);
    if (!success) {
      const error = new Error('Notification not found or access denied.');
      error.statusCode = 404;
      error.code = 'NOTIFICATION_NOT_FOUND';
      throw error;
    }
    return true;
  },

  async markAllAsRead(recipientId) {
    return notificationRepository.markAllAsRead(recipientId);
  },

  async clearAll(recipientId) {
    return notificationRepository.clearAll(recipientId);
  },

  async createNotification(data) {
    return notificationRepository.create(data);
  },

  async notifyAdmins(senderId, type, entityId, message) {
    const userRepository = require('../repositories/userRepository');
    const admins = await userRepository.findAdmins();
    const notifications = [];
    
    for (const admin of admins) {
      const notif = await notificationRepository.create({
        recipientId: admin.id,
        senderId: senderId,
        type: type,
        entityId: entityId,
        message: message
      });
      notifications.push(notif);
    }
    return notifications;
  }
};

module.exports = notificationService;
