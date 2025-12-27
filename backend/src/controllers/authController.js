import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logActivity } from '../services/logService.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user (include password for verification)
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Log activity
    await logActivity(
      'USER_LOGIN',
      'AUTH',
      `User logged in: ${user.username}`,
      {
        userId: user._id,
        username: user.username,
        role: user.role
      },
      user.username
    );

    // Return user data and token
    res.json({
      success: true,
      data: {
        token,
        user: user.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// Verify token (get current user)
export const verify = async (req, res) => {
  try {
    // User is already attached by authenticate middleware
    res.json({
      success: true,
      data: {
        user: req.user.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // Log activity
    await logActivity(
      'USER_LOGOUT',
      'AUTH',
      `User logged out: ${req.user.username}`,
      {
        userId: req.user._id,
        username: req.user.username
      },
      req.user.username
    );

    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};
