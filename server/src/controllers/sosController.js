const mongoose = require('mongoose');
const SOSEvent = require('../models/SOSEvent');
const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');
const sosAlertService = require('../services/sosAlertService');

// Helper to safely find user from req with strict authentication (NO cross-user fallback)
async function getUserFromReq(req) {
  const userId = req.user?.id;
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const found = await User.findById(userId);
      if (found) return found;
    }
    if (req.user?.email) {
      const foundByEmail = await User.findOne({ email: req.user.email.toLowerCase() });
      if (foundByEmail) return foundByEmail;
    }
  }

  const authCtrl = require('./authController');
  const userEmail = (req.user?.email || '').toLowerCase().trim();
  if (userEmail && authCtrl.__inMemoryUsers?.has(userEmail)) {
    return {
      ...authCtrl.__inMemoryUsers.get(userEmail),
      toObject: function() { return { ...this }; }
    };
  } else if (req.user) {
    return {
      _id: userId || 'u-101',
      id: userId || 'u-101',
      full_name: req.user?.name || 'Patient',
      email: req.user?.email || 'patient@example.com'
    };
  }
  return null;
}

exports.triggerSOS = async (req, res, next) => {
  try {
    let user = await getUserFromReq(req);
    const isPublicEmergency = !user;

    if (!user) {
      user = {
        _id: 'public-emergency-' + Date.now(),
        id: 'public-emergency-' + Date.now(),
        full_name: req.body?.callerName || 'Emergency Bystander / Citizen',
        email: req.body?.callerContact || 'emergency-portal@medguardian.local'
      };
    }

    const { latitude, longitude, triggerType, notes, emergencyContacts: customContacts } = req.body;

    // Strict validation: Require real live browser GPS coordinates (NO DEFAULT HARDCODED DELHI COORDINATES)
    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      return res.status(400).json({ error: "Live location is required to send an SOS." });
    }

    let contacts = [];
    if (Array.isArray(customContacts) && customContacts.length > 0) {
      contacts = customContacts;
    }

    const sosData = {
      user_id: user._id,
      trigger_type: triggerType || (isPublicEmergency ? "Public Zero-Login SOS" : "Manual SOS Button"),
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: "DISPATCHED",
      notes: notes || (isPublicEmergency ? "ZERO-LOGIN PUBLIC EMERGENCY DISPATCH" : "Manual High-Intensity Emergency SOS Alert")
    };

    let sosRecord = null;
    if (!isPublicEmergency && mongoose.connection && mongoose.connection.readyState === 1) {
      const dbContacts = await EmergencyContact.find({ user_id: user._id });
      if (contacts.length === 0) contacts = dbContacts;
      sosRecord = await SOSEvent.create(sosData);
    } else {
      sosRecord = {
        _id: 'sos-' + Date.now(),
        ...sosData
      };
    }

    await sosAlertService.dispatchSOSAlert(user, contacts, { ...req.body, latitude: Number(latitude), longitude: Number(longitude) });

    res.status(201).json({ success: true, sos: sosRecord, contactsNotified: contacts.length, isPublicEmergency });
  } catch (error) {
    next(error);
  }
};

exports.cancelSOS = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json({ success: true, message: "Emergency SOS standby state restored." });
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await SOSEvent.updateMany(
        { user_id: user._id, status: "DISPATCHED" },
        { $set: { status: "CANCELLED", notes: "Emergency SOS cancelled by patient (Stand-down)" } }
      );
    }

    res.json({ success: true, message: "Emergency SOS alert cancelled." });
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

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const contacts = await EmergencyContact.find({ user_id: user._id });
      return res.json(contacts);
    }
    return res.json([]);
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

    const contactData = {
      user_id: user._id,
      name: name.trim(),
      relation: (relation || "Family").trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      is_primary: 0,
      notify_on_sos: 1
    };

    let created = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      created = await EmergencyContact.create(contactData);
    } else {
      created = {
        _id: 'c-' + Date.now(),
        ...contactData
      };
    }

    return res.status(201).json(created);
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
    if (!id) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
      const deleted = await EmergencyContact.findOneAndDelete({ ...query, user_id: user._id });
      if (!deleted) {
        return res.status(404).json({ error: "Emergency contact not found or access denied." });
      }
    }

    res.json({ success: true, message: "Emergency contact deleted." });
  } catch (error) {
    next(error);
  }
};
