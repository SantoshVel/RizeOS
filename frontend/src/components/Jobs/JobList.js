import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import api from '../../services/api';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skill: '',
    location: '',
    tag: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.location) params.append('location', filters.location);
      if (filters.tag) params.append('tag', filters.tag);

      const response = await api.get(`/jobs?${params}`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      skill: '',
      location: '',
      tag: ''
    });
  };

  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px'
  };

  const filterStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    alignItems: 'center'
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading jobs...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: '30px' }}>Job Listings</h1>
      
      <div style={filterStyle}>
        <div>
          <label style={{ marginRight: '8px' }}>Skill:</label>
          <input
            type="text"
            name="skill"
            value={filters.skill}
            onChange={handleFilterChange}
            placeholder="e.g., React, Python"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ marginRight: '8px' }}>Location:</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="e.g., Remote, New York"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ marginRight: '8px' }}>Tag:</label>
          <input
            type="text"
            name="tag"
            value={filters.tag}
            onChange={handleFilterChange}
            placeholder="e.g., Full-time, Contract"
            style={inputStyle}
          />
        </div>
        <button onClick={clearFilters} style={buttonStyle}>
          Clear Filters
        </button>
      </div>

      {jobs.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or check back later for new opportunities.</p>
        </div>
      ) : (
        <div>
          {jobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;