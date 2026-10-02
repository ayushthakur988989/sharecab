import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: sign JWT
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'sharecab_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // DEMO MODE: If MongoDB is not connected, return a mock token
  if (!getIsConnected()) {
    const mockUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      phone,
      role: role || 'passenger',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
      rating: 5.0,
      walletBalance: 500,
      isVerified: false,
    };
    const token = signToken({ id: mockUser.id, email, role: mockUser.role });
    return res.status(201).json({ success: true, token, user: mockUser });
  }

  try {
    // Check existing user
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email or phone already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: role || 'passenger',
    });

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating,
        walletBalance: user.walletBalance,
        isVerified: user.isVerified,
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, phone, password, role } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json({ success: false, message: 'Email/phone and password are required.' });
  }

  // DEMO MODE: If MongoDB is not connected, return a mock token
  if (!getIsConnected()) {
    const demoUsers = {
      passenger: {
        id: 'usr_991',
        name: 'Alex Mercer',
        email: email || 'alex.mercer@gmail.com',
        phone: phone || '+91 98765 43210',
        role: 'passenger',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rating: 4.92,
        walletBalance: 450,
        isVerified: true,
      },
      driver: {
        id: 'drv_101',
        name: 'Rajesh Kumar',
        email: email || 'rajesh@gmail.com',
        phone: phone || '+91 98765 43210',
        role: 'driver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rating: 4.88,
        walletBalance: 3250,
        isVerified: true,
      },
      admin: {
        id: 'adm_001',
        name: 'Admin User',
        email: email || 'admin@sharecab.com',
        phone: phone || '+91 99999 00000',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=1e293b&color=34d399',
        rating: 5.0,
        walletBalance: 0,
        isVerified: true,
      }
    };

    const user = demoUsers[role] || demoUsers.passenger;
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(200).json({ success: true, token, user });
  }

  try {
    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating,
        walletBalance: user.walletBalance,
        isVerified: user.isVerified,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ── VERIFY OTP (demo) ─────────────────────────────────────────────────────────
router.post('/verify-otp', (req, res) => {
  res.status(200).json({ success: true, message: 'OTP verified successfully' });
});

// ── GET CURRENT USER (protected) ──────────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
  if (!getIsConnected()) {
    return res.status(200).json({ success: true, user: req.user });
  }

  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
