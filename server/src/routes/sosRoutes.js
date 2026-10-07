const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

// Zero-Login public emergency endpoints (support authenticated users when token present, and bystanders when token absent)
router.post('/trigger', optionalAuthMiddleware, sosController.triggerSOS);
router.post('/', optionalAuthMiddleware, sosController.triggerSOS);
router.post('/sos', optionalAuthMiddleware, sosController.triggerSOS);
router.post('/alert', optionalAuthMiddleware, sosController.triggerSOS);

// Stand-down / Deactivate / Cancel SOS Alert Endpoints (allow zero-login cancellation as well)
router.post('/cancel', optionalAuthMiddleware, sosController.cancelSOS);
router.post('/deactivate', optionalAuthMiddleware, sosController.cancelSOS);
router.post('/resolve', optionalAuthMiddleware, sosController.cancelSOS);

// Contact management routes
router.get('/contacts', authMiddleware, sosController.getContacts);
router.post('/contacts', authMiddleware, sosController.addContact);
router.delete('/contacts/:id', authMiddleware, sosController.deleteContact);
router.post('/contacts/notify-all', authMiddleware, sosController.notifyAllContacts);
router.post('/contacts/:id/notify', authMiddleware, sosController.notifyContact);

module.exports = router;
