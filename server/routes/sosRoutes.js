const express = require('express');
const router = express.Router();
const SOSEvent = require('../src/models/SOSEvent');
const EmergencyContact = require('../src/models/EmergencyContact');
const User = require('../src/models/User');
const { authenticateToken } = require('../middleware/authMiddleware');
const { sendEmergencySOSAlert } = require('../services/sosAlertService');

// POST /api/sos/trigger
router.post('/trigger', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const { latitude = 28.6139, longitude = 77.2090, triggerType = "Manual SOS Button", notes } = req.body;

    const contacts = await EmergencyContact.find({ user_id: user._id });

    const alertResult = await sendEmergencySOSAlert({
      userName: user.full_name,
      contacts: contacts.length > 0 ? contacts : [
        { name: "Dr. Aris Thorne", relationship: "Primary Physician", phone: "+1 (555) 911-4040", email: "dr.thorne@apexhealth.org" }
      ],
      latitude,
      longitude,
      triggerType,
      notes
    });

    const sosEvent = await SOSEvent.create({
      user_id: user._id,
      latitude,
      longitude,
      trigger_type: triggerType,
      status: "Dispatched",
      notes: notes || "Manual High-Intensity Emergency SOS Alert"
    });

    res.status(201).json({
      message: "Emergency SOS dispatched to emergency contacts via Email and SMS channel",
      sosEvent,
      mapLink: alertResult.mapLink,
      dispatchedTo: alertResult.dispatchedTo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sos/logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const logs = await SOSEvent.find({ user_id: user._id });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sos/contacts
router.get('/contacts', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const contacts = await EmergencyContact.find({ user_id: user._id });
    res.json({ contacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sos/contacts
router.post('/contacts', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const { name, email, phone, relationship } = req.body;
    const newContact = await EmergencyContact.create({
      user_id: user._id,
      name,
      email,
      phone,
      relation: relationship || "Emergency Contact"
    });
    res.status(201).json({ message: "Emergency contact added", contact: newContact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
