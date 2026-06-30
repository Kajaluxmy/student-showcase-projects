const express = require('express');
const { z } = require('zod');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validator');

const router = express.Router();

const queryNotificationsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('15')
});

const pathIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

router.use(authMiddleware);

router.get(
  '/',
  validate(queryNotificationsSchema, 'query'),
  notificationController.list
);

router.put(
  '/:id/read',
  validate(pathIdSchema, 'params'),
  notificationController.markRead
);

router.put(
  '/read-all',
  notificationController.markAllRead
);

router.delete(
  '/clear',
  notificationController.clearAll
);

module.exports = router;
