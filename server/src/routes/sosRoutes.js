const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const authMiddleware = require('../middlewares/authMiddleware');

// Support multiple endpoint aliases for 100% route resilience
router.post('/trigger', authMiddleware, sosController.triggerSOS);
router.post('/', authMiddleware, sosController.triggerSOS);
router.post('/sos', authMiddleware, sosController.triggerSOS);
router.post('/alert', authMiddleware, sosController.triggerSOS);

// Stand-down / Deactivate / Cancel SOS Alert Endpoints
router.post('/cancel', authMiddleware, sosController.cancelSOS);
router.post('/deactivate', authMiddleware, sosController.cancelSOS);
router.post('/resolve', authMiddleware, sosController.cancelSOS);

router.get('/contacts', authMiddleware, sosController.getContacts);
router.post('/contacts', authMiddleware, sosController.addContact);
router.delete('/contacts/:id', authMiddleware, sosController.deleteContact);

module.exports = router;
