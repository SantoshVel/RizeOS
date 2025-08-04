const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/resumes'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// PUT /users/profile
router.put('/profile', auth, upload.single('resume'), async (req, res) => {
  try {
    const { name, bio, linkedinUrl, walletAddress } = req.body;
    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.linkedinUrl = linkedinUrl || user.linkedinUrl;
    user.walletAddress = walletAddress || user.walletAddress;
    user.skills = skills.length > 0 ? skills : user.skills;

    if (req.file) {
      user.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        bio: user.bio,
        linkedinUrl: user.linkedinUrl,
        skills: user.skills,
        walletAddress: user.walletAddress,
        resumeUrl: user.resumeUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
