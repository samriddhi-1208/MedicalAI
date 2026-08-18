const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/history', authMiddleware, vitalsController.getBiomarkerHistories);

module.exports = router;
