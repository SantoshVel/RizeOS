import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navStyle = {
    backgroundColor: '#1976d2',
    padding: '10px 20px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 10px',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={{ ...linkStyle, fontSize: '1.2em', fontWeight: 'bold' }}>
          JobPlatform
        </Link>
      </div>
      <div>
        <Link to="/" style={linkStyle}>Jobs</Link>
        {user ? (
          <>
            <Link to="/post-job" style={linkStyle}>Post Job</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
            <span style={{ margin: '0 10px' }}>Hi, {user.name}!</span>
            <button 
              onClick={handleLogout}
              style={{
                ...linkStyle,
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;