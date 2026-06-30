const express = require('express');
const { z } = require('zod');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validator');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Helper middleware to parse multipart form fields before Zod validation
const parseMultipartFields = (req, res, next) => {
  if (req.body.technologyStack && typeof req.body.technologyStack === 'string') {
    try {
      req.body.technologyStack = JSON.parse(req.body.technologyStack);
    } catch (error) {
      // Allow fallback to let Zod handle malformed JSON strings
    }
  }
  next();
};

// Zod schemas for request validation
const createProjectSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .min(20, 'Description must contain at least 20 characters detail'),
  technologyStack: z.array(z.string())
    .min(1, 'Technology stack must list at least one technology tag'),
  githubUrl: z.string().url('Invalid GitHub repository URL format').nullable().optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL format').optional()
});

const updateProjectSchema = createProjectSchema.partial();

const queryProjectsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('12'),
  search: z.string().optional(),
  tech: z.string().optional(),
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  likedByUserId: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.enum(['newest', 'popular']).default('newest'),
  adminView: z.string().optional(),
  status: z.string().optional()
});

const pathIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

// Apply auth to all project routes
router.use(authMiddleware);

// Core CRUD Endpoints
router.post(
  '/',
  roleMiddleware('student'),
  upload.single('thumbnail'),
  parseMultipartFields,
  validate(createProjectSchema),
  projectController.create
);

router.get(
  '/',
  validate(queryProjectsSchema, 'query'),
  projectController.list
);

router.get(
  '/:id',
  validate(pathIdSchema, 'params'),
  projectController.getById
);

router.put(
  '/:id',
  roleMiddleware('student'),
  validate(pathIdSchema, 'params'),
  upload.single('thumbnail'),
  parseMultipartFields,
  validate(updateProjectSchema),
  projectController.update
);

router.delete(
  '/:id',
  validate(pathIdSchema, 'params'),
  projectController.delete
);

// Liking Actions (Recruiter only)
router.post(
  '/:id/like',
  roleMiddleware('recruiter'),
  validate(pathIdSchema, 'params'),
  projectController.like
);

router.delete(
  '/:id/like',
  roleMiddleware('recruiter'),
  validate(pathIdSchema, 'params'),
  projectController.unlike
);

module.exports = router;
