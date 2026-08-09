const express = require('express');
const router = express.Router();
const Medicine = require('../src/models/Medicine');
const MedicineLog = require('../src/models/MedicineLog');
const User = require('../src/models/User');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/medicines
router.get('/', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const medicines = await Medicine.find({ user_id: user._id });

    const result = await Promise.all(
      medicines.map(async (med) => {
        const medLogs = await MedicineLog.find({ medicine_id: med._id }).sort({ createdAt: -1 });
        const lastLog = medLogs[0];
        return {
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          timeSlots: [med.scheduled_time],
          totalPills: med.total_pills,
          pillsRemaining: med.pills_remaining,
          taken: lastLog ? lastLog.status === 'Logged' : false
        };
      })
    );

    res.json({ medicines: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/medicines
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, frequency, timeSlot, totalPills } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const newMed = await Medicine.create({
      user_id: user._id,
      name,
      dosage: dosage || "500 mg",
      frequency: frequency || "Once Daily",
      scheduled_time: timeSlot || "08:00 AM",
      total_pills: parseInt(totalPills) || 30,
      pills_remaining: parseInt(totalPills) || 30
    });

    res.status(201).json({ message: "Medicine added to schedule", medicine: newMed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/medicines/:id/toggle
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const medId = req.params.id;
    const med = await Medicine.findById(medId);
    if (!med) return res.status(404).json({ error: "Medication not found" });

    med.pills_remaining = Math.max(0, med.pills_remaining - 1);
    await med.save();

    await MedicineLog.create({
      medicine_id: med._id,
      taken_at: new Date(),
      status: "Logged"
    });

    res.json({
      message: "Dose taken & logged",
      taken: true,
      pillsRemaining: med.pills_remaining
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/medicines/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    await MedicineLog.deleteMany({ medicine_id: req.params.id });
    res.json({ message: "Medication deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
