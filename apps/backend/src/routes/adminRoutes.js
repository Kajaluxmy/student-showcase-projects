const express = require('express');
const { z } = require('zod');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validator');

const router = express.Router();

// Enforce auth and role checks on all routes
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

const pathIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

const userStatusSchema = z.object({
  status: z.enum(['active', 'suspended'])
});

const userPrivilegeSchema = z.object({
  disabled: z.boolean()
});

const projectModerationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  reason: z.string().optional().nullable()
});

const queryLogsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20')
});

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters long.'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

router.get('/stats', adminController.getStats);
router.get('/audit-logs', validate(queryLogsSchema, 'query'), adminController.getAuditLogs);
router.get('/users/:id', validate(pathIdSchema, 'params'), adminController.getUserDetails);
router.put('/users/:id/status', validate(pathIdSchema, 'params'), validate(userStatusSchema), adminController.updateUserStatus);
router.put('/users/:id/privilege', validate(pathIdSchema, 'params'), validate(userPrivilegeSchema), adminController.updateUserPrivilege);
router.put('/projects/:id/moderation', validate(pathIdSchema, 'params'), validate(projectModerationSchema), adminController.moderateProject);
router.delete('/projects/:id', validate(pathIdSchema, 'params'), adminController.deleteProject);
router.put('/change-password', validate(changePasswordSchema), adminController.changePassword);

module.exports = router;
