import User from '../models/User.js';
import { logActivity } from '../services/logService.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const { username, password, role, fullName } = req.body;

    // Validate required fields
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, and role are required'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Create user
    const user = new User({
      username: username.toLowerCase(),
      password,
      role,
      fullName,
      createdBy: req.user._id
    });

    await user.save();

    // Log activity
    await logActivity(
      'USER_CREATED',
      'USER',
      `Created new user: ${user.username} (${user.role})`,
      {
        userId: user._id,
        username: user.username,
        role: user.role,
        createdBy: req.user.username
      },
      req.user.username
    );

    res.status(201).json({
      success: true,
      data: user.toSafeObject()
    });
  } catch (error) {
    console.error('Create user error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, fullName, isActive } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Build update object
    const updates = {};
    if (username) updates.username = username.toLowerCase();
    if (password) updates.password = password; // Will be hashed by pre-save hook
    if (role) updates.role = role;
    if (fullName !== undefined) updates.fullName = fullName;
    if (isActive !== undefined) updates.isActive = isActive;

    // Check if username is being changed and already exists
    if (username && username.toLowerCase() !== user.username) {
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }
    }

    // Apply updates
    Object.assign(user, updates);
    await user.save();

    // Log activity
    await logActivity(
      'USER_UPDATED',
      'USER',
      `Updated user: ${user.username}`,
      {
        userId: user._id,
        username: user.username,
        updates: Object.keys(updates),
        updatedBy: req.user.username
      },
      req.user.username
    );

    res.json({
      success: true,
      data: user.toSafeObject()
    });
  } catch (error) {
    console.error('Update user error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log activity
    await logActivity(
      'USER_DELETED',
      'USER',
      `Deleted user: ${user.username}`,
      {
        userId: user._id,
        username: user.username,
        role: user.role,
        deletedBy: req.user.username
      },
      req.user.username
    );

    res.json({
      success: true,
      data: { message: 'User deleted successfully' }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};
