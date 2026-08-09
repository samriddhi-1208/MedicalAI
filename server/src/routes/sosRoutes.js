const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/trigger', authMiddleware, sosController.triggerSOS);
router.get('/contacts', authMiddleware, sosController.getContacts);
router.post('/contacts', authMiddleware, sosController.addContact);

module.exports = router;
