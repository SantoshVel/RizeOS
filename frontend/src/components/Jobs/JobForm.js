import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const JobForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    location: '',
    skills: [],
    tags: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/jobs', formData);
      navigate('/');
    } catch (error) {
      setError('Error creating job: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  };

  const buttonStyle = {
    padding: '12px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  };

  const tagStyle = {
    display: 'inline-block',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '5px 10px',
    margin: '5px',
    borderRadius: '20px',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '30px' }}>Post a New Job</h2>
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Job Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={inputStyle}
            required
            placeholder="e.g., Senior React Developer"
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...inputStyle, height: '150px', resize: 'vertical' }}
            required
            placeholder="Describe the job requirements, responsibilities, and what you're looking for..."
          />
        </div>

        <div>
          <label>Budget/Salary:</label>
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g., $50-80/hour, $80,000-120,000/year"
          />
        </div>

        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g., Remote, New York, San Francisco"
          />
        </div>

        <div>
          <label>Required Skills:</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              style={{ ...inputStyle, margin: 0, flex: 1 }}
              placeholder="Add a required skill..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button type="button" onClick={addSkill} style={buttonStyle}>
              Add
            </button>
          </div>
          <div>
            {formData.skills.map((skill, index) => (
              <span key={index} style={tagStyle}>
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  style={{
                    marginLeft: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label>Tags:</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              style={{ ...inputStyle, margin: 0, flex: 1 }}
              placeholder="Add a tag (e.g., Full-time, Contract, Urgent)..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button type="button" onClick={addTag} style={buttonStyle}>
              Add
            </button>
          </div>
          <div>
            {formData.tags.map((tag, index) => (
              <span key={index} style={tagStyle}>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{
                    marginLeft: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ ...buttonStyle, width: '100%' }}>
          {loading ? 'Posting Job...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default JobForm;