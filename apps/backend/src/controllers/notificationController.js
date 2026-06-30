const notificationService = require('../services/notificationService');

const notificationController = {
  async list(req, res, next) {
    try {
      const recipientId = req.user.id;
      const page = req.query.page || 1;
      const limit = req.query.limit || 15;

      const result = await notificationService.getNotifications(recipientId, page, limit);

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully.',
        data: {
          notifications: result.rows,
          pagination: {
            total_items: result.count,
            current_page: page,
            limit
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async markRead(req, res, next) {
    try {
      const { id } = req.params;
      const recipientId = req.user.id;

      await notificationService.markAsRead(id, recipientId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read.'
      });
    } catch (error) {
      next(error);
    }
  },

  async markAllRead(req, res, next) {
    try {
      const recipientId = req.user.id;

      await notificationService.markAllAsRead(recipientId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.'
      });
    } catch (error) {
      next(error);
    }
  },

  async clearAll(req, res, next) {
    try {
      const recipientId = req.user.id;

      await notificationService.clearAll(recipientId);

      res.status(200).json({
        success: true,
        message: 'All notifications cleared.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationController;
