function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Access denied. User session required.'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ROLE_RESTRICTION',
          message: `Access denied. Requiring role(s): [${allowedRoles.join(', ')}]. Current role: ${req.user.role}.`
        }
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
