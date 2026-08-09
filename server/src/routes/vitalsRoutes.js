const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');

router.get('/history', vitalsController.getBiomarkerHistories);

module.exports = router;
