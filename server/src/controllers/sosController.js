const SOSEvent = require('../models/SOSEvent');
const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');
const sosAlertService = require('../services/sosAlertService');

exports.triggerSOS = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let user = userId ? await User.findById(userId) : null;
    if (!user) {
      user = await User.findOne();
    }

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
    const userId = req.user?.id;
    let user = userId ? await User.findById(userId) : null;
    if (!user) {
      user = await User.findOne();
    }

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
    const userId = req.user?.id;
    let user = userId ? await User.findById(userId) : null;
    if (!user) {
      user = await User.findOne();
    }

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
