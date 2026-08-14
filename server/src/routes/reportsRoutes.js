const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

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
router.post('/', authMiddleware, handleSingleFile, reportsController.uploadReport);
router.post('/upload', authMiddleware, handleSingleFile, reportsController.uploadReport);

module.exports = router;
