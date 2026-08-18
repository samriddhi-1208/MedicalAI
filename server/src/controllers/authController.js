const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config');

// Helper to find authenticated user from req.user
async function getUserFromReq(req) {
  const userId = req.user?.id;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return await User.findById(userId);
  }
  if (req.user?.email) {
    return await User.findOne({ email: req.user.email.toLowerCase().trim() });
  }
  return null;
}

exports.signup = async (req, res, next) => {
  try {
    const { email, password, name, full_name, fullName } = req.body;
    
    const displayName = (name || full_name || fullName || '').trim();
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !password || !displayName) {
      return res.status(400).json({ error: "Full name, email, and password are required." });
    }

    // Password Complexity Validation: 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Char, Min 8 Chars
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({ 
        error: "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character." 
      });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists. Please sign in instead." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: cleanEmail,
      password_hash: passwordHash,
      full_name: displayName,
      profile_completed: false
    });

    console.log(`[AUTH DIAGNOSTIC] Registered new user in MongoDB: ID ${newUser.id} (${newUser.email})`);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.full_name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const userObj = newUser.toObject();
    delete userObj.password_hash;

    res.status(201).json({ token, user: userObj });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    console.log(`[AUTH DIAGNOSTIC] Login attempt for email: "${cleanEmail}" | User found in DB: ${Boolean(user)}`);

    if (!user) {
      return res.status(401).json({ error: "No account found with this email. Please click 'Create Account' below to sign up." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`[AUTH DIAGNOSTIC] Password verification match for user ID ${user.id}: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password. Please check your credentials and try again." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password_hash;

    console.log(`[AUTH DIAGNOSTIC] JWT generated successfully for user ID ${user.id} (${user.email})`);

    res.json({ token, user: userObj });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const userObj = user.toObject();
    delete userObj.password_hash;
    res.json({ user: userObj, ...userObj });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (req.body.password) {
      const { password } = req.body;
      const hasLength = password.length >= 8;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        return res.status(400).json({ 
          error: "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character." 
        });
      }

      req.body.password_hash = await bcrypt.hash(password, 10);
      delete req.body.password;
    }

    const updated = await User.findByIdAndUpdate(user._id, req.body, { new: true });
    const userObj = updated.toObject();
    delete userObj.password_hash;
    
    console.log(`[AUTH] Profile updated for ID ${updated.id}`);
    res.json({ user: userObj, ...userObj });
  } catch (error) {
    next(error);
  }
};
