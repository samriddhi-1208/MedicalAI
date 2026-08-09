/**
 * API Documentation Specification Notes
 * Endpoint sitemap for MedGuardian AI REST API
 * 
 * Auth:
 * - POST /api/auth/signup
 * - POST /api/auth/login
 * - GET  /api/auth/profile
 * - PUT  /api/auth/profile
 * 
 * Reports & OCR:
 * - GET  /api/reports
 * - POST /api/reports/upload
 * 
 * Medicines:
 * - GET  /api/medicines
 * - POST /api/medicines
 * - PUT  /api/medicines/:id/take
 * - DELETE /api/medicines/:id
 * 
 * Emergency SOS:
 * - POST /api/sos/trigger
 * - GET  /api/sos/contacts
 * - POST /api/sos/contacts
 * 
 * Hospitals & Vitals:
 * - GET /api/hospitals/nearby
 * - GET /api/vitals/history
 */

module.exports = {
  version: "1.0.0",
  title: "MedGuardian AI API Specification"
};
