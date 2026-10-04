const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const User = require('../models/User');

// Helper to safely format ID whether ObjectId or string
function toIdString(val) {
  if (!val) return '';
  return typeof val.toHexString === 'function' ? val.toHexString() : String(val);
}

// Persistent storage file for offline / development resilience
const MEDICINES_FILE = path.join(__dirname, '../data/medicines.json');
const inMemoryMedicines = new Map();

function loadPersistentMedicines() {
  try {
    if (fs.existsSync(MEDICINES_FILE)) {
      const content = fs.readFileSync(MEDICINES_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        data.forEach(m => {
          const id = m._id || m.id;
          if (id) inMemoryMedicines.set(String(id), m);
        });
        console.log(`[MEDICINES CONTROLLER] Loaded ${inMemoryMedicines.size} persistent medicine reminder(s).`);
      }
    }
  } catch (err) {
    console.warn('[MEDICINES CONTROLLER] Could not load persistent medicines:', err.message);
  }
}

function savePersistentMedicines() {
  try {
    const dir = path.dirname(MEDICINES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const list = Array.from(inMemoryMedicines.values());
    fs.writeFileSync(MEDICINES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[MEDICINES CONTROLLER] Could not save persistent medicines:', err.message);
  }
}

loadPersistentMedicines();

// Helper to safely resolve authenticated user from req (Strict 100% Data Isolation)
async function getUserFromReq(req) {
  const userId = req.user?.id;
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const found = await User.findById(userId);
        if (found) return found;
      }
      if (req.user?.email) {
        const foundByEmail = await User.findOne({ email: req.user.email.toLowerCase().trim() });
        if (foundByEmail) return foundByEmail;
      }
    } catch (e) {
      console.warn('[MEDICINES] getUserFromReq DB note:', e.message);
    }
  }

  const authCtrl = require('./authController');
  const userEmail = (req.user?.email || '').toLowerCase().trim();
  if (userEmail && authCtrl.__inMemoryUsers?.has(userEmail)) {
    return {
      ...authCtrl.__inMemoryUsers.get(userEmail),
      toObject: function() { return { ...this }; }
    };
  }

  return {
    _id: userId || 'u-101',
    id: userId || 'u-101',
    full_name: req.user?.name || 'Patient',
    email: req.user?.email || 'patient@medguardian.ai',
    toObject: function() { return { ...this }; }
  };
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

// Helper to check user ownership matching string ID or email
function matchesUser(med, user) {
  const medUserId = String(med.user_id || med.userId || '');
  const targetId = String(user._id || user.id || '');
  if (medUserId && targetId && medUserId === targetId) return true;
  if (user.email && med.user_email && med.user_email.toLowerCase() === user.email.toLowerCase()) return true;
  return false;
}

// Internal safe cleanup function to merge and remove duplicate database records for a user
async function cleanupUserDuplicates(userId) {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const allMeds = await Medicine.find({ user_id: userId }).sort({ created_at: 1 });
      if (allMeds.length > 1) {
        const groups = {};
        allMeds.forEach(m => {
          const cleanName = (m.name || '').toLowerCase().trim();
          if (!cleanName) return;
          if (!groups[cleanName]) groups[cleanName] = [];
          groups[cleanName].push(m);
        });

        const idsToDelete = [];
        for (const nameKey in groups) {
          const list = groups[nameKey];
          if (list.length > 1) {
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
          idsToDelete.forEach(id => inMemoryMedicines.delete(String(id)));
          savePersistentMedicines();
        }
      }
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

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        await cleanupUserDuplicates(user._id);
        const medicines = await Medicine.find({ user_id: user._id }).sort({ created_at: -1 });

        const updatedMedicines = await Promise.all(
          medicines.map(async (m) => {
            if (m.is_taken && !isTakenToday(m.last_taken_at)) {
              m.is_taken = false;
              await m.save();
            }
            const mObj = m.toObject ? m.toObject() : { ...m };
            mObj.id = toIdString(m._id);
            inMemoryMedicines.set(String(mObj.id), mObj);
            return mObj;
          })
        );
        savePersistentMedicines();
        return res.json(updatedMedicines);
      } catch (dbErr) {
        console.warn('[MEDICINES] DB getMedicines fallback to offline cache:', dbErr.message);
      }
    }

    // Offline / fallback cache
    const userMeds = Array.from(inMemoryMedicines.values()).filter(m => matchesUser(m, user));
    const processed = userMeds.map(m => {
      if (m.is_taken && !isTakenToday(m.last_taken_at)) {
        m.is_taken = false;
      }
      return m;
    });
    savePersistentMedicines();
    res.json(processed);
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

    // Check existing medicine in memory cache
    const existingInMemory = Array.from(inMemoryMedicines.values()).find(
      m => matchesUser(m, user) && (m.name || '').toLowerCase().trim() === cleanName.toLowerCase()
    );

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const existingMed = await Medicine.findOne({
          user_id: user._id,
          name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existingMed) {
          console.log(`[MEDICINE ENGINE] Intercepted duplicate medicine for user ${user._id}: "${cleanName}".`);
          const existingObj = existingMed.toObject ? existingMed.toObject() : { ...existingMed };
          existingObj.id = toIdString(existingMed._id);
          inMemoryMedicines.set(String(existingObj.id), existingObj);
          return res.status(200).json(existingObj);
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

        const savedObj = newMed.toObject ? newMed.toObject() : { ...newMed };
        savedObj.id = toIdString(newMed._id);
        inMemoryMedicines.set(String(savedObj.id), savedObj);
        savePersistentMedicines();

        return res.status(201).json(savedObj);
      } catch (dbErr) {
        console.warn('[MEDICINES] DB addMedicine fallback to offline store:', dbErr.message);
      }
    }

    if (existingInMemory) {
      return res.status(200).json(existingInMemory);
    }

    // Offline / fallback creation
    const offlineId = `med-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const newMedObj = {
      _id: offlineId,
      id: offlineId,
      user_id: String(user._id || user.id),
      user_email: user.email ? user.email.toLowerCase() : '',
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
      is_taken: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    inMemoryMedicines.set(offlineId, newMedObj);
    savePersistentMedicines();

    res.status(201).json(newMedObj);
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
    if (!id) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        const med = await Medicine.findOneAndUpdate(
          { ...query, user_id: user._id },
          { ...req.body },
          { new: true }
        );

        if (med) {
          const medObj = med.toObject ? med.toObject() : { ...med };
          medObj.id = toIdString(med._id);
          inMemoryMedicines.set(String(medObj.id), medObj);
          savePersistentMedicines();
          return res.json(medObj);
        }
      } catch (dbErr) {
        console.warn('[MEDICINES] DB updateMedicine note:', dbErr.message);
      }
    }

    // In-memory fallback
    const cached = inMemoryMedicines.get(String(id));
    if (!cached || !matchesUser(cached, user)) {
      return res.status(404).json({ error: "Medicine reminder not found or not owned by user." });
    }

    const updated = { ...cached, ...req.body, updated_at: new Date().toISOString() };
    inMemoryMedicines.set(String(id), updated);
    savePersistentMedicines();
    res.json(updated);
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
    if (!id) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        const med = await Medicine.findOne({ ...query, user_id: user._id });
        if (med) {
          med.is_paused = !med.is_paused;
          await med.save();
          const medObj = med.toObject ? med.toObject() : { ...med };
          medObj.id = toIdString(med._id);
          inMemoryMedicines.set(String(medObj.id), medObj);
          savePersistentMedicines();
          return res.json(medObj);
        }
      } catch (dbErr) {
        console.warn('[MEDICINES] DB togglePause note:', dbErr.message);
      }
    }

    // In-memory fallback
    const cached = inMemoryMedicines.get(String(id));
    if (!cached || !matchesUser(cached, user)) {
      return res.status(404).json({ error: "Medicine reminder not found." });
    }

    cached.is_paused = !cached.is_paused;
    cached.updated_at = new Date().toISOString();
    inMemoryMedicines.set(String(id), cached);
    savePersistentMedicines();
    res.json(cached);
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
    if (!id) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        const med = await Medicine.findOne({ ...query, user_id: user._id });
        if (med) {
          med.is_taken = !med.is_taken;
          if (med.is_taken) {
            med.pills_remaining = Math.max(0, med.pills_remaining - 1);
            med.last_taken_at = new Date();
            try {
              await MedicineLog.create({
                medicine_id: med._id,
                taken_at: new Date(),
                status: "Logged"
              });
            } catch (logErr) {
              console.warn('[MEDICINES] MedicineLog create note:', logErr.message);
            }
          }
          await med.save();
          const medObj = med.toObject ? med.toObject() : { ...med };
          medObj.id = toIdString(med._id);
          inMemoryMedicines.set(String(medObj.id), medObj);
          savePersistentMedicines();
          return res.json(medObj);
        }
      } catch (dbErr) {
        console.warn('[MEDICINES] DB logTaken note:', dbErr.message);
      }
    }

    // In-memory fallback
    const cached = inMemoryMedicines.get(String(id));
    if (!cached || !matchesUser(cached, user)) {
      return res.status(404).json({ error: "Medicine reminder not found." });
    }

    cached.is_taken = !cached.is_taken;
    if (cached.is_taken) {
      cached.pills_remaining = Math.max(0, (cached.pills_remaining || 30) - 1);
      cached.last_taken_at = new Date().toISOString();
    }
    cached.updated_at = new Date().toISOString();
    inMemoryMedicines.set(String(id), cached);
    savePersistentMedicines();
    res.json(cached);
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
    if (!id) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }

    let deletedFromDb = false;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        const deleted = await Medicine.findOneAndDelete({ ...query, user_id: user._id });
        if (deleted) deletedFromDb = true;
      } catch (dbErr) {
        console.warn('[MEDICINES] DB deleteMedicine note:', dbErr.message);
      }
    }

    const cached = inMemoryMedicines.get(String(id));
    if (cached && matchesUser(cached, user)) {
      inMemoryMedicines.delete(String(id));
      savePersistentMedicines();
      return res.json({ success: true, message: "Medicine reminder deleted." });
    }

    if (deletedFromDb) {
      return res.json({ success: true, message: "Medicine reminder deleted." });
    }

    res.status(404).json({ error: "Medicine reminder not found or access denied." });
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
    let cleanedMeds = [];
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        cleanedMeds = await Medicine.find({ user_id: user._id }).sort({ created_at: -1 });
      } catch (e) {
        console.warn('[MEDICINES] cleanupDuplicates fetch note:', e.message);
      }
    }
    if (cleanedMeds.length === 0) {
      cleanedMeds = Array.from(inMemoryMedicines.values()).filter(m => matchesUser(m, user));
    }

    res.json({ success: true, count: cleanedMeds.length, medicines: cleanedMeds });
  } catch (error) {
    next(error);
  }
};
