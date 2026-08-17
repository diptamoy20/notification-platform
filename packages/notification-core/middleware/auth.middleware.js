const jwt = require('jsonwebtoken');

function createAuthMiddleware({ jwtSecret, apiResponse }) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse.badRequest(res, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded; // Attach user info to request
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
    }
  };
}

module.exports = { createAuthMiddleware };
