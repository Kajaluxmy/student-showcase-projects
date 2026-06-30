const env = require('../config/env');
const { generateToken } = require('../utils/token');
const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');

const authController = {
  // Initiates Google OAuth consent screen redirect
  async redirectToGoogle(req, res, next) {
    try {
      const { action = 'signin', role = 'student' } = req.query;
      const stateObj = { action, role };
      const stateStr = JSON.stringify(stateObj);

      if (env.BYPASS_OAUTH) {
        console.log('⚠️  [OAuth Bypass] Redirecting to mock login callback with state:', stateObj);
        return res.redirect(`/api/auth/google/callback?code=mock_oauth_code&state=${encodeURIComponent(stateStr)}`);
      }
      
      const scopes = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GOOGLE_CALLBACK_URL)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&state=${encodeURIComponent(stateStr)}&access_type=offline&prompt=select_account`;
      
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  },

  // Handles Google callback, user mapping, and issues cookie token
  async handleCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      if (!code) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_CODE', message: 'OAuth code missing.' } });
      }

      // Parse OAuth state
      let action = 'signin';
      let role = 'student';
      if (state) {
        try {
          const parsed = JSON.parse(state);
          action = parsed.action || 'signin';
          role = parsed.role || 'student';
        } catch (e) {
          console.warn('⚠️ Failed to parse state parameter:', e.message);
        }
      }

      let googleUser = null;

      if (env.BYPASS_OAUTH || code === 'mock_oauth_code') {
        googleUser = {
          googleId: role === 'recruiter' ? 'mock_google_id_recruiter_999' : 'mock_google_id_student_123',
          email: role === 'recruiter' ? 'recruiter.dev@techcorp.com' : 'student.dev@university.edu',
          name: role === 'recruiter' ? 'Rachel Dev' : 'Jane Doe',
          profilePictureUrl: role === 'recruiter' 
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' 
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
        };
      } else {
        // Exchange code for Google Access Token (Real OAuth Flow)
        const tokenParams = new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: env.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code'
        });

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: tokenParams.toString()
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Google OAuth code.');
        }

        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });

        const profile = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error('Failed to retrieve user profile from Google.');
        }

        googleUser = {
          googleId: profile.id,
          email: profile.email,
          name: profile.name,
          profilePictureUrl: profile.picture
        };
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // If user wants to Sign Up
      if (action === 'signup') {
        const queryParams = new URLSearchParams({
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.profilePictureUrl || '',
          googleId: googleUser.googleId,
          role
        });
        const onboardingRedirectUrl = `${frontendUrl}/onboarding?${queryParams.toString()}`;
        console.log(`➡️  OAuth callback: Sign Up flow. Redirecting to onboarding: ${onboardingRedirectUrl}`);
        return res.redirect(onboardingRedirectUrl);
      }

      // Sign In Flow
      const user = await userService.getUserByGoogleId(googleUser.googleId);
      if (!user) {
        console.log(`❌ Sign In failed: No account registered for Google ID ${googleUser.googleId}`);
        return res.redirect(`${frontendUrl}/login?role=${role}&error=account_not_found`);
      }

      const token = generateToken(user);
      const cookieOptions = {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: env.JWT_EXPIRY * 1000 // In milliseconds
      };

      res.cookie('token', token, cookieOptions);
      res.redirect(`${frontendUrl}/dashboard`);
    } catch (error) {
      next(error);
    }
  },

  // Handles administrative username/password login
  async adminLogin(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'INVALID_PAYLOAD', message: 'Username and password are required.' } 
        });
      }

      const user = await userService.authenticateAdmin(username, password);
      const token = generateToken(user);

      // Set cookie containing the JWT session
      const cookieOptions = {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: env.JWT_EXPIRY * 1000
      };

      res.cookie('token', token, cookieOptions);

      res.status(200).json({
        success: true,
        message: 'Admin authenticated successfully.',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  },

  // Mock login handler for local development testing
  async mockLogin(req, res, next) {
    try {
      if (!env.BYPASS_OAUTH) {
        return res.status(403).json({ success: false, error: { code: 'BYPASS_DISABLED', message: 'OAuth bypass is disabled in this environment.' } });
      }

      const { role } = req.body;
      const validRoles = ['student', 'recruiter', 'admin'];
      const selectRole = validRoles.includes(role) ? role : 'student';

      const mockUsers = {
        student: { id: 1, googleId: 'mock_std', email: 'student@university.edu', name: 'Alex Student', role: 'student', profilePictureUrl: '', student_id: 'ST-MOCK-777', recruiter_id: null },
        recruiter: { id: 2, googleId: 'mock_rec', email: 'recruiter@techcorp.com', name: 'Rachel Recruiter', role: 'recruiter', profilePictureUrl: '', student_id: null, recruiter_id: 'RC-MOCK-999' },
        admin: { id: 3, googleId: 'mock_adm', email: 'admin@university.edu', name: 'Arthur Admin', role: 'admin', profilePictureUrl: '', student_id: null, recruiter_id: null }
      };

      const mockId = selectRole === 'admin' ? 3 : (selectRole === 'recruiter' ? 2 : 1);
      const dbUser = await userRepository.findById(mockId);
      
      const user = dbUser ? {
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
      } : mockUsers[selectRole];

      const token = generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: env.JWT_EXPIRY * 1000
      });

      res.status(200).json({
        success: true,
        message: `Successfully authenticated as mock ${selectRole}`,
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  },

  // Returns the active user session details
  async getMe(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'No active session.' } });
      }
      res.status(200).json({
        success: true,
        message: 'Active session retrieved.',
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  },

  // Destroys the cookie session token
  async logout(req, res, next) {
    try {
      res.clearCookie('token');
      res.status(200).json({
        success: true,
        message: 'Successfully logged out and cleared session cookie.'
      });
    } catch (error) {
      next(error);
    }
  },

  // Confirms JIT user registration from client onboarding review page
  async registerConfirm(req, res, next) {
    try {
      const { googleId, email, name, profilePictureUrl, role, studentId, recruiterId } = req.body;
      if (!googleId || !email || !name || !role) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PAYLOAD', message: 'Missing fields for account confirmation.' }
        });
      }

      const user = await userService.registerUser({
        googleId,
        email,
        name,
        profilePictureUrl,
        role,
        studentId,
        recruiterId
      });

      const token = generateToken(user);
      const cookieOptions = {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: env.JWT_EXPIRY * 1000
      };

      res.cookie('token', token, cookieOptions);

      res.status(201).json({
        success: true,
        message: 'Account created and authenticated successfully.',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
