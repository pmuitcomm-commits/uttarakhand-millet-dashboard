import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/landing.css';

function AdminLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-redirect after 3 seconds, or allow manual navigation
    const timer = setTimeout(() => {
      navigate('/admin-dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/admin-dashboard');
  };

  const roleDisplay = user?.role === 'admin' ? 'Admin' : user?.role?.replace('_', ' ').toUpperCase() || 'ADMIN';

  return (
    <div className="landing-container admin-landing">
      <div className="landing-header">
        <div className="header-logo-section">
          <img src="/logo1.png" alt="Logo" className="landing-logo" />
        </div>
      </div>

      <div className="landing-content">
        <div className="welcome-card admin-card">
          <h1 className="greeting">Hi, {roleDisplay}</h1>
          <p className="welcome-message">Welcome to dashboard managing panel</p>
          
          <div className="role-info admin-info">
            <p className="role-description">You have access to all administrative functions and system-wide data.</p>
          </div>

          <button className="continue-btn admin-btn" onClick={handleContinue}>
            Enter Dashboard
          </button>

          <p className="auto-redirect-text">Redirecting in 3 seconds...</p>
        </div>
      </div>

      <div className="landing-footer">
        <p className="footer-text">Millet Dashboard Management System</p>
      </div>
    </div>
  );
}

export default AdminLanding;
