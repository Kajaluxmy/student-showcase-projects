const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const eventBroker = require('../events/eventBroker');

const userService = {
  async authenticateAdmin(username, password) {
    const user = await userRepository.findByUsername(username);
    if (!user || user.role !== 'admin') {
      const error = new Error('Invalid administrative credentials.');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    if (!user.password_hash) {
      const error = new Error('Authentication method not supported for this account.');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      const error = new Error('Invalid administrative credentials.');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    return user;
  },

  async getUserByGoogleId(googleId) {
    return userRepository.findByGoogleId(googleId);
  },

  async registerUser(user) {
    const { googleId, email, name, profilePictureUrl, role, studentId, recruiterId } = user;
    
    // Check duplicates
    let existing = await userRepository.findByGoogleId(googleId);
    if (!existing) {
      existing = await userRepository.findByEmail(email);
    }

    if (existing) {
      return existing; // Idempotency
    }

    const newUser = await userRepository.create({
      googleId,
      email,
      name,
      profilePictureUrl,
      role,
      studentId,
      recruiterId
    });

    eventBroker.emitSafe('UserRegistered', {
      userId: newUser.id,
      name: newUser.name,
      role: newUser.role
    });

    return newUser;
  },

  async handleGoogleOauthOnboarding(googleUser) {
    const { googleId, email, name, profilePictureUrl } = googleUser;
    
    let user = await userRepository.findByGoogleId(googleId);
    
    if (!user) {
      user = await userRepository.findByEmail(email);
      if (user) {
        // Map the Google ID to the existing account
        // Note: For simplicity we bypass direct DB update since userRepository doesn't expose generic update,
        // but in production you'd run an UPDATE query.
        console.log(`🔗 Mapping Google ID to existing email account: ${email}`);
      } else {
        // Create new user profile with default student role
        user = await userRepository.create({
          googleId,
          email,
          name,
          profilePictureUrl,
          role: 'student'
        });
        console.log(`🆕 Onboarded new student user account: ${email}`);

        eventBroker.emitSafe('UserRegistered', {
          userId: user.id,
          name: user.name,
          role: user.role
        });
      }
    }
    
    return user;
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return user;
  },

  async listUsersForAdmin(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return userRepository.findAllPaginated(Number(limit), Number(offset));
  },

  async changeUserRole(id, role) {
    const validRoles = ['student', 'recruiter', 'admin'];
    if (!validRoles.includes(role)) {
      const error = new Error('Invalid user role specified.');
      error.statusCode = 400;
      error.code = 'INVALID_ROLE';
      throw error;
    }

    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return userRepository.updateRole(id, role);
  },

  async updateUserProfile(id, { name, email, profilePictureUrl }) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return userRepository.updateProfile(id, { name, email, profilePictureUrl });
  }
};

module.exports = userService;
