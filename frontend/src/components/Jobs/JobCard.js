import React from 'react';

const JobCard = ({ job }) => {
  const cardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    marginBottom: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  };

  const titleStyle = {
    fontSize: '1.3em',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '5px'
  };

  const metaStyle = {
    color: '#666',
    fontSize: '0.9em',
    marginBottom: '10px'
  };

  const tagStyle = {
    display: 'inline-block',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '3px 8px',
    margin: '2px',
    borderRadius: '12px',
    fontSize: '0.8em'
  };

  const skillStyle = {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    color: '#333',
    padding: '3px 8px',
    margin: '2px',
    borderRadius: '12px',
    fontSize: '0.8em'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={{ flex: 1 }}>
          <h3 style={titleStyle}>{job.title}</h3>
          <div style={metaStyle}>
            Posted by {job.postedBy.name} (@{job.postedBy.username}) • {formatDate(job.createdAt)}
          </div>
        </div>
        {job.budget && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            color: '#2e7d32', 
            padding: '8px 12px', 
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            {job.budget}
          </div>
        )}
      </div>

      <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
        {job.description}
      </p>

      {job.location && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Location:</strong> {job.location}
        </div>
      )}

      {job.skills && job.skills.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Required Skills:</strong>
          <div style={{ marginTop: '5px' }}>
            {job.skills.map((skill, index) => (
              <span key={index} style={skillStyle}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {job.tags && job.tags.length > 0 && (
        <div>
          <strong>Tags:</strong>
          <div style={{ marginTop: '5px' }}>
            {job.tags.map((tag, index) => (
              <span key={index} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;