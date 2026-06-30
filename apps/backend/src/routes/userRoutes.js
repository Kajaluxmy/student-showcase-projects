const express = require('express');
const { z } = require('zod');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validator');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const changeRoleSchema = z.object({
  role: z.enum(['student', 'recruiter', 'admin'], {
    errorMap: () => ({ message: "Role must be 'student', 'recruiter', or 'admin'" })
  })
});

const queryUsersSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10')
});

const pathIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

// Enforce authentication on all routes
router.use(authMiddleware);

router.put(
  '/profile',
  upload.single('avatar'),
  userController.updateProfile
);

// Admin-Only endpoints
router.get(
  '/',
  roleMiddleware('admin'),
  validate(queryUsersSchema, 'query'),
  userController.list
);

router.put(
  '/:id/role',
  roleMiddleware('admin'),
  validate(pathIdSchema, 'params'),
  validate(changeRoleSchema),
  userController.changeRole
);

// Recruiter-Only endpoints
router.get(
  '/following',
  roleMiddleware('recruiter'),
  userController.getFollowing
);

router.get(
  '/followers',
  userController.getFollowers
);

router.post(
  '/:id/follow',
  roleMiddleware('recruiter'),
  validate(pathIdSchema, 'params'),
  userController.follow
);

router.delete(
  '/:id/follow',
  roleMiddleware('recruiter'),
  validate(pathIdSchema, 'params'),
  userController.unfollow
);

module.exports = router;
