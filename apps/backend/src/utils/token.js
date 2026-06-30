const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(user) {
  // Store user properties in JWT payload for stateless authorization checks
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name 
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
