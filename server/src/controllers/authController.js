const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

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

exports.signup = async (req, res, next) => {
  try {
    const { email, name, phone, birthDate, age, gender, bloodGroup, height, weight, physician, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "User with this email already registered" });
    }

    const newUser = await User.create({
      email: email.toLowerCase(),
      full_name: name || 'Patient',
      phone: phone || '',
      birth_date: birthDate || '',
      age: parseInt(age) || 20,
      gender: gender || 'Female',
      blood_group: bloodGroup || 'O+',
      height: height ? (height.includes('cm') ? height : `${height} cm`) : '',
      weight: weight ? (weight.includes('kg') ? weight : `${weight} kg`) : '',
      primary_physician: physician || ''
    });

    console.log(`[AUTH] New patient registered in MongoDB Atlas: ID ${newUser.id} (${newUser.email}) - Age: ${newUser.age}, Height: ${newUser.height}, Weight: ${newUser.weight}`);

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
      console.log(`[AUTH] Auto-created new patient in MongoDB Atlas: ID ${user.id} (${user.email})`);
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
    const user = await getUserFromReq(req);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const updated = await User.findByIdAndUpdate(user._id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
