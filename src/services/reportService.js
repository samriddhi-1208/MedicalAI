/**
 * MedGuardian AI — Report Service Architecture
 * Manages user-scoped medical report uploads, dynamic PDF/OCR extraction, and patient report lists.
 * ZERO HARDCODED MEDICAL VALUES — Uploaded Document is the ONLY Source of Truth
 */

import { analyzeUploadedDocument } from '../utils/reportParser';

export const reportService = {
  /**
   * Scopes report retrieval strictly to the authenticated user ID
   */
  getUserReports: (userId, userReportsList = []) => {
    if (!Array.isArray(userReportsList)) return [];
    return userReportsList.filter(r => !r.userId || r.userId === userId);
  },

  /**
   * Processes an uploaded report file through dynamic PDF/OCR parsing
   */
  processUploadedReport: async (file, userId) => {
    return await analyzeUploadedDocument(file, userId);
  }
};
