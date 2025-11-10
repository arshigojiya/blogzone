const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { processUserProfile, getAvatarUrl } = require('../utils/imageUrl');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: { firstName, lastName },
    });

    await user.save();

    // Process user to include full URLs for avatar
    const processedUser = processUserProfile(user);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: processedUser._id,
        username: processedUser.username,
        email: processedUser.email,
        role: processedUser.role,
        profile: processedUser.profile,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Process user to include full URLs for avatar
    const processedUser = processUserProfile(user);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: processedUser._id,
        username: processedUser.username,
        email: processedUser.email,
        role: processedUser.role,
        profile: processedUser.profile,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    // Process user to include full URLs for avatar
    const processedUser = processUserProfile(user);
    res.json(processedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    user.profile = {
      ...user.profile,
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      bio: bio || user.profile.bio,
      avatar: avatar ? {
        ...avatar,
        url: avatar.url || (avatar.filename ? getAvatarUrl(avatar.filename) : user.profile.avatar?.url)
      } : user.profile.avatar
    };
    await user.save();

    // Process user to include full URLs for avatar
    const processedUser = processUserProfile(user);
    res.json(processedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;