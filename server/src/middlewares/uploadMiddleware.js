/**
 * MedGuardian AI — File Upload Middleware
 * Encapsulates Multer file handling for medical report uploads (PDF, PNG, JPG)
 */

const multer = require('multer');

const storage = multer.memoryStorage();

const uploadReport = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|png|jpg|jpeg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPG medical reports are supported.'));
    }
  }
});

module.exports = {
  uploadReport
};
