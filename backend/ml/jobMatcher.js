const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function matchJobs(resumeBuffer, jobs) {
  try {
    // Convert buffer to base64 for JSON transmission
    const resumeBase64 = resumeBuffer.toString('base64');
    
    // Prepare job descriptions with IDs for mapping
    const jobsData = jobs.map(job => ({
      id: job.id || job._id.toString(),
      description: job.fullText || job.description,
      title: job.title,
      skills: job.skills || ''
    }));

    // Send JSON request to Flask
    const response = await axios.post("http://localhost:5001/match", {
      resume: resumeBase64,
      jobs: jobsData
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout for ML processing
    });

    const matches = response.data.matches; // Array of { job_id, score }
    
    // Return job IDs sorted by score (highest first)
    return matches
      .sort((a, b) => b.score - a.score)
      .map(match => match.job_id);
      
  } catch (error) {
    console.error("Error calling Flask model:", error.message);
    if (error.response) {
      console.error("Flask response:", error.response.data);
    }
    throw new Error(`Job matching failed: ${error.message}`);
  }
}

module.exports = matchJobs;