const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In production, store these in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'f05b6b30d7bbea439991a14d275b3fbad07fea3c55d7529ef4f951fcf0fc58aeee764d64db446c665a6039ab87febcbb333617d73701ab6a171ac1211838d3b7';

// In production, store admin credentials in database
// For demo purposes, using hardcoded values (hashed password)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  // Password: 'admin123' (hashed)
  passwordHash: '$2b$10$z/Lo/UogsAvJzSVLiAVxAuKJSaHSuUQ1kybIC.yLtULWUIhx2JlVq'
};

// @route   POST /api/auth/login
// @desc    Login admin user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Check username
    if (username !== ADMIN_CREDENTIALS.username) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { username: username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        username: username,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify
// @desc    Verify JWT token
// @access  Public
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

module.exports = router;