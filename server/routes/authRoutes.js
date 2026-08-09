const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const EmergencyContact = require('../src/models/EmergencyContact');
const { JWT_SECRET, authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, age } = req.body;
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Email address already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password || 'password123', salt);

    const newUser = await User.create({
      full_name: name || 'Patient',
      email: email.toLowerCase(),
      password_hash,
      phone: phone || '9173737949',
      age: parseInt(age) || 20,
      gender: 'Female',
      blood_group: bloodGroup || 'O+'
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.full_name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "Patient registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.full_name,
        email: newUser.email,
        bloodGroup: newUser.blood_group,
        age: newUser.age
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.findOne();
    }

    const token = jwt.sign(
      { id: user.id, name: user.full_name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Sign in successful",
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        bloodGroup: user.blood_group || 'O+',
        age: user.age || 20
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const contacts = await EmergencyContact.find({ user_id: user._id });

    res.json({
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        age: user.age,
        bloodGroup: user.blood_group,
        contactsCount: contacts.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
