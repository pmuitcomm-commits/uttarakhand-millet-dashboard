import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/landing.css';

function BlockLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-redirect after 3 seconds, or allow manual navigation
    const timer = setTimeout(() => {
      navigate('/block-dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/block-dashboard');
  };

  const roleDisplay = 'Block';
  const blockName = user?.block || 'Block Officer';

  return (
    <div className="landing-container block-landing">
      <div className="landing-header">
        <div className="header-logo-section">
          <img src="/logo1.png" alt="Logo" className="landing-logo" />
        </div>
      </div>

      <div className="landing-content">
        <div className="welcome-card block-card">
          <h1 className="greeting">Hi, {roleDisplay}</h1>
          <p className="welcome-message">Welcome to dashboard managing panel</p>
          
          <div className="role-info block-info">
            <p className="role-description">Manage block-level operations</p>
            <p className="block-name">{blockName}</p>
          </div>

          <button className="continue-btn block-btn" onClick={handleContinue}>
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

export default BlockLanding;
