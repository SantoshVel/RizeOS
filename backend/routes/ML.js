const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Job = require("../models/Job");
const authMiddleware = require("../middleware/auth");

// =======================================
// GET /users/resume - Get current user's resume (Auth Required)
// =======================================
router.get("/users/resume", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.resumeUrl) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json({ resumeUrl: user.resumeUrl });
  } catch (err) {
    console.error("Error fetching resume:", err);
    res.status(500).json({ message: "Server error while fetching resume" });
  }
});

// =======================================
// GET /jobs - Get all job descriptions
// =======================================
router.get("/jobs", async (req, res) => {
  try {
    const jobDescriptions = await Job.find({}, { description: 1, _id: 0 }).sort(
      { createdAt: -1 }
    );
    res.status(200).json(jobDescriptions);
  } catch (err) {
    console.error("Error fetching job descriptions:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching job descriptions" });
  }
});

module.exports = router;
