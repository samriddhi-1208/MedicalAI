const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const User = require('../models/User');

exports.getMedicines = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let user = userId ? await User.findById(userId) : null;
    if (!user) {
      user = await User.findOne();
    }

    if (!user) {
      return res.json([]);
    }

    const medicines = await Medicine.find({ user_id: user._id });
    res.json(medicines);
  } catch (error) {
    next(error);
  }
};

exports.addMedicine = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let user = userId ? await User.findById(userId) : null;
    if (!user) {
      user = await User.findOne();
    }

    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const newMed = await Medicine.create({
      user_id: user._id,
      name: req.body.name,
      dosage: req.body.dosage || '500 mg',
      frequency: req.body.frequency || 'Once Daily',
      time_slot: req.body.timeSlot || 'Morning',
      scheduled_time: req.body.time || '08:00 AM',
      purpose: req.body.purpose || 'General Wellness',
      total_pills: parseInt(req.body.totalPills) || 30,
      pills_remaining: parseInt(req.body.totalPills) || 30
    });

    res.status(201).json(newMed);
  } catch (error) {
    next(error);
  }
};

exports.logTaken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const med = await Medicine.findById(id);
    if (med) {
      med.pills_remaining = Math.max(0, med.pills_remaining - 1);
      await med.save();

      await MedicineLog.create({
        medicine_id: med._id,
        taken_at: new Date(),
        status: "Logged"
      });

      return res.json(med);
    }
    res.status(404).json({ error: "Medicine not found" });
  } catch (error) {
    next(error);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Medicine.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
