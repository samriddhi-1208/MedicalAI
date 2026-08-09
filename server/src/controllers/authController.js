const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

exports.signup = async (req, res, next) => {
  try {
    const { email, name, phone, age, bloodGroup, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "User with this email already registered" });
    }

    const newUser = await User.create({
      email: email.toLowerCase(),
      full_name: name || 'Patient',
      phone: phone || '9173737949',
      age: parseInt(age) || 20,
      blood_group: bloodGroup || 'B+'
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.full_name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        full_name: email.split('@')[0].replace(/[._]/g, ' ')
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let user = userId ? await User.findById(userId) : null;
    if (!user) {
      user = await User.findOne();
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let user = userId ? await User.findById(userId) : null;
    if (!user) {
      user = await User.findOne();
    }

    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const updated = await User.findByIdAndUpdate(user._id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
