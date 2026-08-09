const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const User = require('../models/User');

// Helper to safely find user from req without Mongoose ObjectId CastError
async function getUserFromReq(req) {
  const userId = req.user?.id;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const found = await User.findById(userId);
    if (found) return found;
  }
  if (req.user?.email) {
    const foundByEmail = await User.findOne({ email: req.user.email.toLowerCase() });
    if (foundByEmail) return foundByEmail;
  }
  return await User.findOne();
}

exports.getMedicines = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
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
    const user = await getUserFromReq(req);
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
    let med = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      med = await Medicine.findById(id);
    }
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
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Medicine.findByIdAndDelete(id);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
