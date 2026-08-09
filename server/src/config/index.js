// System Configuration Module
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'medguardian_ai_secure_jwt_secret_2026',
  env: process.env.NODE_ENV || 'development'
};
