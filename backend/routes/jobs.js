const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { skill, location, tag } = req.query;
    let filter = { isActive: true };

    if (skill) {
      filter.skills = { $in: [new RegExp(skill, 'i')] };
    }
    if (location) {
      filter.location = new RegExp(location, 'i');
    }
    if (tag) {
      filter.tags = { $in: [new RegExp(tag, 'i')] };
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name username')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create job
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, skills, budget, location, tags } = req.body;

    const job = new Job({
      title,
      description,
      skills: skills || [],
      budget,
      location,
      tags: tags || [],
      postedBy: req.user._id
    });

    await job.save();
    await job.populate('postedBy', 'name username');

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's jobs
router.get('/my-jobs', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('postedBy', 'name username')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;