import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    linkedinUrl: '',
    skills: [],
    walletAddress: '',
    resumeUrl: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        linkedinUrl: user.linkedinUrl || '',
        skills: user.skills || [],
        walletAddress: user.walletAddress || '',
        resumeUrl: user.resumeUrl || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmed]
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

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      data.append('linkedinUrl', formData.linkedinUrl);
      data.append('walletAddress', formData.walletAddress);
      data.append('skills', JSON.stringify(formData.skills));
      if (resumeFile) data.append('resume', resumeFile);

      const response = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser(response.data.user);
      setMessage('✅ Profile updated successfully!');
    } catch (error) {
      setMessage('❌ Error: ' + (error.response?.data?.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2>My Profile</h2>
      {message && <div style={{
        padding: '10px', borderRadius: '4px',
        marginBottom: '20px',
        backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
        color: message.includes('Error') ? '#c62828' : '#2e7d32'
      }}>{message}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Full Name:</label>
        <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} required />

        <label>Bio:</label>
        <textarea name="bio" value={formData.bio} onChange={handleChange} style={{ ...inputStyle, height: '100px' }} />

        <label>LinkedIn URL:</label>
        <input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} style={inputStyle} />

        <label>Wallet Address:</label>
        <input name="walletAddress" value={formData.walletAddress} onChange={handleChange} style={inputStyle} />

        <label>Skills:</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            style={{ ...inputStyle, flex: 1, margin: 0 }}
          />
          <button type="button" onClick={addSkill} style={buttonStyle}>Add</button>
        </div>
        <div>
          {formData.skills.map((skill, i) => (
            <span key={i} style={{ display: 'inline-block', background: '#e3f2fd', color: '#1976d2', padding: '5px 10px', margin: '5px', borderRadius: '20px' }}>
              {skill}
              <button onClick={() => removeSkill(skill)} type="button" style={{ border: 'none', background: 'transparent', color: '#1976d2', marginLeft: '8px' }}>×</button>
            </span>
          ))}
        </div>

        <label>Upload Resume (PDF):</label>
        <input type="file" accept=".pdf" onChange={handleResumeChange} style={inputStyle} />
        {formData.resumeUrl && (
          <p>Current: <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></p>
        )}

        <button type="submit" disabled={loading} style={{ ...buttonStyle, width: '100%' }}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
