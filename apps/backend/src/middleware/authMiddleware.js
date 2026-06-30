const { verifyToken } = require('../utils/token');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');

async function authMiddleware(req, res, next) {
  try {
    let token = null;

    // 1. Try to read token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // 2. Try to read token from Authorization header (Bearer token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 3. Fallback for query param (useful for downloads/links)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        // Query the database to verify the user is active
        const dbUser = await userRepository.findById(decoded.id);
        if (!dbUser) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'UNAUTHENTICATED',
              message: 'User session invalid.'
            }
          });
        }
        if (dbUser.status === 'suspended') {
          return res.status(403).json({
            success: false,
            error: {
              code: 'ACCOUNT_SUSPENDED',
              message: 'Your account has been suspended by an administrator.'
            }
          });
        }
        req.user = {
          id: dbUser.id,
          googleId: dbUser.google_id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          profilePictureUrl: dbUser.profile_picture_url,
          profile_picture_url: dbUser.profile_picture_url,
          student_id: dbUser.student_id,
          recruiter_id: dbUser.recruiter_id,
          status: dbUser.status,
          created_at: dbUser.created_at
        };
        return next();
      }
    }

    // 4. Fallback for bypass mode (mock logins)
    // Prevent auto-logging in during boot session checks (/me) so the Landing/Login pages can open.
    if (env.BYPASS_OAUTH && req.path !== '/me') {
      const mockRole = req.headers['x-mock-role'] || req.query.mockRole || 'student';
      console.log(`⚠️  [Bypass Auth] Authenticating with mock user role: ${mockRole}`);
      
      const mockId = mockRole === 'admin' ? 3 : (mockRole === 'recruiter' ? 2 : 1);
      const dbUser = await userRepository.findById(mockId);
      if (dbUser) {
        req.user = {
          id: dbUser.id,
          googleId: dbUser.google_id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          profilePictureUrl: dbUser.profile_picture_url,
          profile_picture_url: dbUser.profile_picture_url,
          student_id: dbUser.student_id,
          recruiter_id: dbUser.recruiter_id,
          status: dbUser.status,
          created_at: dbUser.created_at
        };
      } else {
        // Inject mock user based on the selected role
        req.user = {
          id: mockRole === 'admin' ? 3 : (mockRole === 'recruiter' ? 2 : 1),
          email: `${mockRole}@university.edu`,
          role: mockRole,
          name: `Mock ${mockRole.charAt(0).toUpperCase() + mockRole.slice(1)}`
        };
      }
      return next();
    }

    // If no auth tokens match
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Access denied. Valid authentication token required.'
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
