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

router.get('/', authMiddleware, reportsController.getReports);
router.post('/upload', authMiddleware, upload.single('reportFile'), reportsController.uploadReport);

module.exports = router;
