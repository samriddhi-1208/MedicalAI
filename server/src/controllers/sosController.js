const mongoose = require('mongoose');
const SOSEvent = require('../models/SOSEvent');
const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');
const sosAlertService = require('../services/sosAlertService');

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

exports.triggerSOS = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const contacts = await EmergencyContact.find({ user_id: user._id });

    const sosRecord = await SOSEvent.create({
      user_id: user._id,
      trigger_type: req.body.triggerType || "Manual SOS Button",
      latitude: req.body.latitude || 28.6139,
      longitude: req.body.longitude || 77.2090,
      status: "DISPATCHED",
      notes: req.body.notes || "Manual High-Intensity Emergency SOS Alert"
    });

    await sosAlertService.dispatchSOSAlert(user, contacts, req.body);

    res.status(201).json({ success: true, sos: sosRecord, contactsNotified: contacts.length });
  } catch (error) {
    next(error);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json([]);
    }

    const contacts = await EmergencyContact.find({ user_id: user._id });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

exports.addContact = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const created = await EmergencyContact.create({
      user_id: user._id,
      name: req.body.name,
      relation: req.body.relation || "Family",
      phone: req.body.phone,
      email: req.body.email,
      is_primary: 0,
      notify_on_sos: 1
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};
