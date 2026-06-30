// Global BigInt serialization patch for JSON response compatibility
BigInt.prototype.toJSON = function() {
  return Number(this);
};

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const env = require('./config/env');
const errorMiddleware = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Set security headers with custom policies
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Required for rendering uploaded thumbnails cross-origin
}));

// Configure CORS for dynamic frontend integration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175'
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy. Origin not allowed.'));
    }
  },
  credentials: true, // Allow sharing cookies across origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-role']
}));

// Standard JSON and URL parsing body middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded thumbnail images statically with no-sniff headers
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  express.static(path.join(__dirname, '../uploads'))
);

// Base health verification endpoint
app.get('/api/health', async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Project Showcase Portal Backend online.',
    timestamp: new Date()
  });
});

// App route registrations
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 Route
app.use((req, res, next) => {
  const error = new Error(`Cannot handle request ${req.method} ${req.url}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
});

// Centralized error handling wrapper
app.use(errorMiddleware);

module.exports = app;
