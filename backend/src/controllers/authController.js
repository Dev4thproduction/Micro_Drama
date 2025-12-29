const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { sendSuccess } = require('../utils/response');
const User = require('../models/User');

const allowedSignupRoles = ['viewer', 'creator'];

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { email, password, displayName, role } = req.body || {};

    if (!email || !password) {
      return next({ status: 400, message: 'Email and password are required' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return next({ status: 400, message: 'Email and password must be strings' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return next({ status: 409, message: 'Email already registered' });
    }

    if (role === 'admin') {
      return next({ status: 403, message: 'Admin users cannot be self-registered' });
    }

    const sanitizedRole = allowedSignupRoles.includes(role) ? role : 'viewer';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      displayName,
      role: sanitizedRole
    });

    const token = generateToken(user);
    res.status(201);
    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        displayName: user.displayName
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return next({ status: 400, message: 'Email and password are required' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return next({ status: 400, message: 'Email and password must be strings' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return next({ status: 401, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return next({ status: 403, message: 'User is not active' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next({ status: 401, message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        displayName: user.displayName
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { displayName, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return next({ status: 404, message: 'User not found' });

    // Update Display Name
    if (displayName) {
      user.displayName = displayName;
    }

    // Update Password (if provided)
    if (newPassword) {
      if (!currentPassword) {
        return next({ status: 400, message: 'Current password is required to set a new one' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return next({ status: 401, message: 'Incorrect current password' });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return sendSuccess(res, {
      id: user._id,
      email: user.email,
      role: user.role,
      displayName: user.displayName
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login, updateProfile };
