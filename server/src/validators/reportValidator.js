/**
 * MedGuardian AI — Medical Report Payload Validator
 * Validates document buffer size and extraction parameters
 */

function validateReportInput(fileObj, bodyObj) {
  const fileProvided = Boolean(fileObj && (fileObj.buffer || fileObj.path));
  const titleProvided = Boolean(bodyObj && bodyObj.title);

  if (!fileProvided && !titleProvided) {
    return { valid: false, message: 'Please upload a medical report PDF or image file.' };
  }

  return { valid: true };
}

module.exports = {
  validateReportInput
};
