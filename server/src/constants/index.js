/**
 * MedGuardian AI — Server Constants & Config Defaults
 */

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'medguardian_ai_secure_jwt_secret_2026';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  MAX_FILE_SIZE_BYTES,
  HTTP_STATUS
};
