const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Job = require("../models/Job");
const matchJobs = require("../ml/jobMatcher");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");

router.get("/match-jobs/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query; // Optional limit parameter

    console.log(`Starting job matching for user: ${userId}`);

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: "Invalid user ID format",
        error: "INVALID_USER_ID"
      });
    }

    // Find user with resume
    const user = await User.findById(userId).select('resumeUrl name');
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }

    console.log(`Found user: ${user.name}, Resume URL: ${user.resumeUrl}`);

    if (!user.resumeUrl) {
      return res.status(404).json({ 
        message: "No resume uploaded for this user",
        error: "RESUME_NOT_FOUND"
      });
    }

    // Construct resume file path
    const resumePath = path.join(__dirname, "..", user.resumeUrl);
    console.log(`Resume path: ${resumePath}`);

    // Check if resume file exists
    try {
      await fs.access(resumePath);
      console.log('Resume file exists');
    } catch (error) {
      console.error(`Resume file not found: ${resumePath}`);
      return res.status(404).json({ 
        message: "Resume file not found on server",
        error: "RESUME_FILE_NOT_FOUND"
      });
    }

    // Read resume file
    let resumeBuffer;
    try {
      resumeBuffer = await fs.readFile(resumePath);
      console.log(`Resume file size: ${resumeBuffer.length} bytes`);
    } catch (error) {
      console.error(`Error reading resume file: ${error.message}`);
      return res.status(500).json({ 
        message: "Error reading resume file",
        error: "RESUME_READ_ERROR"
      });
    }

    // Fetch active jobs - include skills array for better matching
    const jobs = await Job.find(
      { isActive: true }, 
      { description: 1, _id: 1, title: 1, skills: 1, budget: 1, location: 1 }
    );

    // Log jobs for debugging
    console.log(`Found ${jobs.length} active jobs:`);
    jobs.forEach(job => {
      console.log(`- ${job.title}: ${job.description.substring(0, 100)}... Skills: ${job.skills}`);
    });

    if (jobs.length === 0) {
      return res.status(200).json({
        message: "No active jobs available for matching",
        jobs: [],
        totalJobs: 0
      });
    }

    console.log(`Matching ${jobs.length} jobs for user ${userId}`);

    // Pass jobs directly to the local matcher
    const matchedJobIds = await matchJobs(resumeBuffer, jobs);

    console.log(`Received ${matchedJobIds.length} matched job IDs:`, matchedJobIds);

    // Limit results if specified
    const limitedJobIds = matchedJobIds.slice(0, parseInt(limit));

    // Fetch full job details in the order of matching scores
    const matchedJobs = [];
    for (const jobId of limitedJobIds) {
      const job = await Job.findById(jobId)
        .populate('postedBy', 'name username')
        .select('-__v');
      if (job) {
        matchedJobs.push(job);
        console.log(`Added job to results: ${job.title}`);
      } else {
        console.log(`Job with ID ${jobId} not found in database`);
      }
    }

    console.log(`Successfully matched ${matchedJobs.length} jobs for user ${userId}`);

    res.status(200).json({
      message: "Jobs matched successfully",
      jobs: matchedJobs,
      totalMatched: matchedJobs.length,
      totalAvailable: jobs.length,
      userName: user.name
    });

  } catch (error) {
    console.error("Job matching error:", error);
    
    // Handle specific error types
    if (error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        message: "ML service unavailable. Please try again later.",
        error: "ML_SERVICE_UNAVAILABLE"
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(408).json({ 
        message: "Job matching request timed out. Please try again.",
        error: "TIMEOUT"
      });
    }

    res.status(500).json({ 
      message: "Internal server error during job matching",
      error: "INTERNAL_SERVER_ERROR",
      details: error.message
    });
  }
});

// Health check endpoint for the matching service
router.get("/match-jobs/health", async (req, res) => {
  try {
    const axios = require("axios");
    const response = await axios.get("http://localhost:5001/health", {
      timeout: 5000
    });
    
    res.status(200).json({
      status: "healthy",
      mlService: response.data
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: "ML service unavailable",
      details: error.message
    });
  }
});

module.exports = router;