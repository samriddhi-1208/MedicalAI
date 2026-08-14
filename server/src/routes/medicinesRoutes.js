const express = require('express');
const router = express.Router();
const medicinesController = require('../controllers/medicinesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, medicinesController.getMedicines);
router.post('/', authMiddleware, medicinesController.addMedicine);
router.put('/:id', authMiddleware, medicinesController.updateMedicine);
router.patch('/:id/pause', authMiddleware, medicinesController.togglePause);
router.patch('/:id/taken', authMiddleware, medicinesController.logTaken);
router.put('/:id/take', authMiddleware, medicinesController.logTaken);
router.delete('/:id', authMiddleware, medicinesController.deleteMedicine);

module.exports = router;
