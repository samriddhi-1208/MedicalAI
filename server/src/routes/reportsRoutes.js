const express = require('express');
const router = express.Router();
const multer = require('multer');
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Use memoryStorage so file.buffer is ALWAYS in memory (100% reliable on Render/Vercel/Docker)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max file size
});

const handleSingleFile = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

router.get('/', authMiddleware, reportsController.getReports);
router.get('/:id', authMiddleware, reportsController.getReportById);
router.get('/:id/analysis', authMiddleware, reportsController.getReportById);
router.post('/', authMiddleware, handleSingleFile, reportsController.uploadReport);
router.post('/upload', authMiddleware, handleSingleFile, reportsController.uploadReport);

module.exports = router;
