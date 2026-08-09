const express = require('express');
const router = express.Router();
const hospitalsController = require('../controllers/hospitalsController');

router.get('/nearby', hospitalsController.getNearbyHospitals);

module.exports = router;
