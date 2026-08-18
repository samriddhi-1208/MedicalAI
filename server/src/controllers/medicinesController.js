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
  return null;
}

// Helper to verify if a timestamp falls on TODAY's calendar date in local timezone
function isTakenToday(lastTakenAt) {
  if (!lastTakenAt) return false;
  const takenDate = new Date(lastTakenAt);
  const today = new Date();
  return (
    takenDate.getFullYear() === today.getFullYear() &&
    takenDate.getMonth() === today.getMonth() &&
    takenDate.getDate() === today.getDate()
  );
}

// Internal safe cleanup function to merge and remove duplicate database records for a user
async function cleanupUserDuplicates(userId) {
  try {
    const allMeds = await Medicine.find({ user_id: userId }).sort({ created_at: 1 });
    if (allMeds.length <= 1) return;

    const groups = {};
    allMeds.forEach(m => {
      const cleanName = (m.name || '').toLowerCase().trim();
      if (!cleanName) return;

      if (!groups[cleanName]) {
        groups[cleanName] = [];
      }
      groups[cleanName].push(m);
    });

    const idsToDelete = [];

    for (const nameKey in groups) {
      const list = groups[nameKey];
      if (list.length > 1) {
        // Choose primary: prefer record with specific mg/strength over generic '1 tablet'
        list.sort((a, b) => {
          const aHasMg = /\d+\s*(mg|g|mcg|ml)/i.test(a.dose || a.dosage || '');
          const bHasMg = /\d+\s*(mg|g|mcg|ml)/i.test(b.dose || b.dosage || '');
          if (aHasMg && !bHasMg) return -1;
          if (!aHasMg && bHasMg) return 1;
          return 0;
        });

        const primary = list[0];
        let hasTaken = primary.is_taken;
        let lastTakenAt = primary.last_taken_at;

        for (let i = 1; i < list.length; i++) {
          const dup = list[i];
          if (dup.is_taken) {
            hasTaken = true;
            if (!lastTakenAt || (dup.last_taken_at && dup.last_taken_at > lastTakenAt)) {
              lastTakenAt = dup.last_taken_at;
            }
          }
          idsToDelete.push(dup._id);
        }

        // Preserve taken status on primary if any duplicate was taken
        if (hasTaken !== primary.is_taken || (lastTakenAt && lastTakenAt !== primary.last_taken_at)) {
          primary.is_taken = hasTaken;
          primary.last_taken_at = lastTakenAt || new Date();
          await primary.save();
        }
      }
    }

    if (idsToDelete.length > 0) {
      console.log(`[MEDICINE CLEANUP] Removing ${idsToDelete.length} duplicate medicine records for user ${userId}`);
      await Medicine.deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (err) {
    console.error("[MEDICINE CLEANUP ERROR]", err);
  }
}

exports.getMedicines = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json([]);
    }

    // Auto-run deduplication cleanup on fetch
    await cleanupUserDuplicates(user._id);

    const medicines = await Medicine.find({ user_id: user._id }).sort({ created_at: -1 });

    // Daily Schedule Reset: Reset is_taken = false if last_taken_at was on a PREVIOUS calendar day
    const updatedMedicines = await Promise.all(
      medicines.map(async (m) => {
        if (m.is_taken && !isTakenToday(m.last_taken_at)) {
          m.is_taken = false;
          await m.save();
        }
        return m;
      })
    );

    res.json(updatedMedicines);
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
      duration_days,
      durationDays,
      start_date,
      end_date,
      instructions,
      purpose,
      totalPills,
      total_pills,
      source_title,
      report_id
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Medicine name is required." });
    }

    const cleanName = name.trim();
    const cleanDose = (dose || dosage || '1 tablet').trim();
    const cleanFreq = (frequency || 'Once daily').trim();
    const cleanTime = (scheduled_time || time || '08:00 AM').trim();

    // Idempotent Check: Check if medicine with same clean name already exists for this user
    const existingMed = await Medicine.findOne({
      user_id: user._id,
      name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (existingMed) {
      console.log(`[MEDICINE ENGINE] Intercepted duplicate medicine creation request for user ${user._id}: "${cleanName}". Returning existing record.`);
      return res.status(200).json(existingMed);
    }

    const newMed = await Medicine.create({
      user_id: user._id,
      report_id: report_id || null,
      source_title: source_title || 'Prescription Schedule',
      name: cleanName,
      dose: cleanDose,
      dosage: cleanDose,
      frequency: cleanFreq,
      scheduled_time: cleanTime,
      time_slot: timeSlot || 'Morning',
      meal_relation: meal_relation || mealRelation || 'After meal',
      meal_type: meal_type || mealType || 'Lunch',
      delay_minutes: Number(delay_minutes || delayMinutes || 30),
      duration_days: Number(duration_days || durationDays || 5),
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || null,
      instructions: instructions || '',
      purpose: purpose || 'Prescribed Medication',
      total_pills: parseInt(total_pills || totalPills || 30),
      pills_remaining: parseInt(total_pills || totalPills || 30),
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

exports.cleanupDuplicates = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    await cleanupUserDuplicates(user._id);
    const cleanedMeds = await Medicine.find({ user_id: user._id }).sort({ created_at: -1 });

    res.json({ success: true, count: cleanedMeds.length, medicines: cleanedMeds });
  } catch (error) {
    next(error);
  }
};
