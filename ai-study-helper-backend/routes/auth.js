const express = require('express');
const passport = require('passport');
const router = express.Router();
const Helpers = require('../utils/helpers');

// Google OAuth login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173/dashboard');
  }
);

// Get current user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json(Helpers.formatResponse(true, {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }));
  } else {
    res.status(401).json(Helpers.formatResponse(false, null, 'Not authenticated'));
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json(Helpers.formatResponse(false, null, 'Logout failed'));
    }
    res.json(Helpers.formatResponse(true, null, 'Logged out successfully'));
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json(Helpers.formatResponse(true, {
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    } : null
  }));
});

module.exports = router;