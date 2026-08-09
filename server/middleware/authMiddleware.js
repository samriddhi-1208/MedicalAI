const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medguardian_super_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Demo mode fallback: Default to demo user Eleanor Vance
    req.user = { id: 'u-101', name: 'Eleanor Vance', email: 'eleanor.vance@example.com', role: 'patient' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { id: 'u-101', name: 'Eleanor Vance', email: 'eleanor.vance@example.com', role: 'patient' };
      return next();
    }
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
