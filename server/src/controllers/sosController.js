const mongoose = require('mongoose');
const SOSEvent = require('../models/SOSEvent');
const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');
const sosAlertService = require('../services/sosAlertService');

// Helper to safely find user from req with strict authentication (NO cross-user fallback)
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

exports.triggerSOS = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required to trigger Emergency SOS." });
    }

    const { latitude, longitude, triggerType, notes } = req.body;

    // Strict validation: Require real live browser GPS coordinates (NO DEFAULT HARDCODED DELHI COORDINATES)
    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      return res.status(400).json({ error: "Live location is required to send an SOS." });
    }

    const contacts = await EmergencyContact.find({ user_id: user._id });

    const sosRecord = await SOSEvent.create({
      user_id: user._id,
      trigger_type: triggerType || "Manual SOS Button",
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: "DISPATCHED",
      notes: notes || "Manual High-Intensity Emergency SOS Alert"
    });

    await sosAlertService.dispatchSOSAlert(user, contacts, { ...req.body, latitude: Number(latitude), longitude: Number(longitude) });

    res.status(201).json({ success: true, sos: sosRecord, contactsNotified: contacts.length });
  } catch (error) {
    next(error);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
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
      return res.status(401).json({ error: "Authentication required." });
    }

    const { name, relation, phone, email } = req.body;
    if (!name || !name.trim() || !phone || !phone.trim()) {
      return res.status(400).json({ error: "Contact name and phone number are required." });
    }

    const created = await EmergencyContact.create({
      user_id: user._id,
      name: name.trim(),
      relation: (relation || "Family").trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      is_primary: 0,
      notify_on_sos: 1
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const deleted = await EmergencyContact.findOneAndDelete({ _id: id, user_id: user._id });
    if (!deleted) {
      return res.status(404).json({ error: "Emergency contact not found or access denied." });
    }

    res.json({ success: true, message: "Emergency contact deleted." });
  } catch (error) {
    next(error);
  }
};
