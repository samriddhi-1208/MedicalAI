const express = require('express');
const router = express.Router();
const medicinesController = require('../controllers/medicinesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, medicinesController.getMedicines);
router.post('/', authMiddleware, medicinesController.addMedicine);
router.put('/:id/take', authMiddleware, medicinesController.logTaken);
router.delete('/:id', authMiddleware, medicinesController.deleteMedicine);

module.exports = router;
