// MedGuardian AI - Application Constants & Status Codes

module.exports = {
  PORT: process.env.PORT || 5000,
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },
  MESSAGES: {
    SERVER_RUNNING: "🏥 MedGuardian AI Backend API Server active",
    UNAUTHORIZED: "Access denied. Valid Bearer Token required.",
    INTERNAL_ERROR: "An internal server error occurred."
  }
};
