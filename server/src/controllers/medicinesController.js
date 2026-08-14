const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const User = require('../models/User');

// Helper to safely resolve authenticated user from req (Strict 100% Data Isolation)
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
  // NEVER fall back to a default/random user!
  return null;
}

exports.getMedicines = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json([]);
    }

    const medicines = await Medicine.find({ user_id: user._id }).sort({ created_at: -1 });
    res.json(medicines);
  } catch (error) {
    next(error);
  }
};

exports.addMedicine = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const {
      name,
      dose,
      dosage,
      frequency,
      scheduled_time,
      time,
      timeSlot,
      meal_relation,
      mealRelation,
      meal_type,
      mealType,
      delay_minutes,
      delayMinutes,
      purpose,
      totalPills
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Medicine name is required." });
    }

    const newMed = await Medicine.create({
      user_id: user._id,
      name,
      dose: dose || dosage || '1 tablet',
      dosage: dose || dosage || '1 tablet',
      frequency: frequency || 'Once daily',
      scheduled_time: scheduled_time || time || '08:00 AM',
      time_slot: timeSlot || 'Morning',
      meal_relation: meal_relation || mealRelation || 'After meal',
      meal_type: meal_type || mealType || 'Lunch',
      delay_minutes: Number(delay_minutes || delayMinutes || 30),
      purpose: purpose || 'General Wellness',
      total_pills: parseInt(totalPills) || 30,
      pills_remaining: parseInt(totalPills) || 30,
      is_paused: false,
      is_taken: false
    });

    res.status(201).json(newMed);
  } catch (error) {
    next(error);
  }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }

    const med = await Medicine.findOneAndUpdate(
      { _id: id, user_id: user._id },
      { ...req.body },
      { new: true }
    );

    if (!med) {
      return res.status(404).json({ error: "Medicine reminder not found or not owned by user." });
    }

    res.json(med);
  } catch (error) {
    next(error);
  }
};

exports.togglePause = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }

    const med = await Medicine.findOne({ _id: id, user_id: user._id });
    if (!med) {
      return res.status(404).json({ error: "Medicine reminder not found." });
    }

    med.is_paused = !med.is_paused;
    await med.save();

    res.json(med);
  } catch (error) {
    next(error);
  }
};

exports.logTaken = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }

    const med = await Medicine.findOne({ _id: id, user_id: user._id });
    if (!med) {
      return res.status(404).json({ error: "Medicine reminder not found." });
    }

    med.is_taken = !med.is_taken;
    if (med.is_taken) {
      med.pills_remaining = Math.max(0, med.pills_remaining - 1);
      med.last_taken_at = new Date();
      await MedicineLog.create({
        medicine_id: med._id,
        taken_at: new Date(),
        status: "Logged"
      });
    }
    await med.save();

    res.json(med);
  } catch (error) {
    next(error);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }

    const deleted = await Medicine.findOneAndDelete({ _id: id, user_id: user._id });
    if (!deleted) {
      return res.status(404).json({ error: "Medicine reminder not found or access denied." });
    }

    res.json({ success: true, message: "Medicine reminder deleted." });
  } catch (error) {
    next(error);
  }
};
