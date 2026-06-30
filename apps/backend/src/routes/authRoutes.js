const express = require('express');
const { z } = require('zod');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validator');

const router = express.Router();

// Validation schema for mock login
const mockLoginSchema = z.object({
  role: z.enum(['student', 'recruiter', 'admin'], {
    errorMap: () => ({ message: "Role must be 'student', 'recruiter', or 'admin'" })
  })
});

// Validation schema for admin login
const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

// Validation schema for account confirmation registration
const registerConfirmSchema = z.object({
  googleId: z.string().min(1, 'Google ID is required'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  profilePictureUrl: z.string().nullable().optional(),
  role: z.enum(['student', 'recruiter'], {
    errorMap: () => ({ message: "Role must be 'student' or 'recruiter'" })
  }),
  studentId: z.string().nullable().optional(),
  recruiterId: z.string().nullable().optional()
});

// OAuth initiation redirects
router.get('/google', authController.redirectToGoogle);
router.get('/google/callback', authController.handleCallback);

// Local development bypass mock logins
router.post('/mock-login', validate(mockLoginSchema), authController.mockLogin);

// Production admin credential login
router.post('/admin-login', validate(adminLoginSchema), authController.adminLogin);

// Confirm account registration from onboarding screen
router.post('/register-confirm', validate(registerConfirmSchema), authController.registerConfirm);

// Protected session actions
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
