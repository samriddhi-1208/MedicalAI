const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup);
router.post('/register', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getProfile);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
