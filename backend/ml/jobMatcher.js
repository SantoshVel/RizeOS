const axios = require("axios");

async function matchJobs(resumeBuffer, jobs) {
  try {
    console.log(`Starting job matching for ${jobs.length} jobs`);
    
    // Convert buffer to base64 for JSON transmission
    const resumeBase64 = resumeBuffer.toString('base64');
    
    // Prepare job descriptions with IDs for mapping
    const jobsData = jobs.map(job => {
      const skillsText = Array.isArray(job.skills) ? job.skills.join(' ') : (job.skills || '');
      const jobData = {
        id: job._id.toString(), // Use MongoDB _id
        description: job.description || '',
        title: job.title || '',
        skills: skillsText
      };
      
      console.log(`Job ${jobData.id}: ${jobData.title} - ${jobData.description.substring(0, 100)}...`);
      return jobData;
    });

    console.log('Sending request to Flask service...');
    console.log(`Resume size: ${resumeBase64.length} characters`);
    console.log(`Jobs data: ${jobsData.length} jobs`);

    // Test Flask connection first
    try {
      const healthResponse = await axios.get("http://localhost:5001/health", { timeout: 5000 });
      console.log('Flask health check:', healthResponse.data);
    } catch (healthError) {
      console.error('Flask service health check failed:', healthError.message);
      throw new Error('Flask service is not responding');
    }

    // Send JSON request to Flask
    const response = await axios.post("http://localhost:5001/match", {
      resume: resumeBase64,
      jobs: jobsData
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 second timeout for ML processing
    });

    console.log('Flask response received:', response.data);

    const matches = response.data.matches; // Array of { job_id, score }
    
    if (!matches || matches.length === 0) {
      console.log('No matches found - this might indicate an issue with the matching algorithm');
      console.log('Response data:', response.data);
      return [];
    }
    
    // Return job IDs sorted by score (highest first) - already sorted by Flask
    const jobIds = matches.map(match => {
      console.log(`Match found: Job ${match.job_id} with score ${match.score}`);
      return match.job_id;
    });
    
    console.log(`Returning ${jobIds.length} matched job IDs:`, jobIds);
    
    return jobIds;
      
  } catch (error) {
    console.error("Error calling Flask model:", error.message);
    
    if (error.response) {
      console.error("Flask response status:", error.response.status);
      console.error("Flask response data:", error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Flask service is not running on localhost:5001');
    }
    
    throw new Error(`Job matching failed: ${error.message}`);
  }
}

module.exports = matchJobs;