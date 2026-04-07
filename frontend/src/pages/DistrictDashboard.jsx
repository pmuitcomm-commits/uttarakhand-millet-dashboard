import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

function DistrictDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not district officer
    if (isAuthenticated && user?.role !== 'district_officer') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="page-wrapper">
      <TopBar />
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <Header />

          <div className="page-heading-row" data-aos="fade-up">
            <h2>District Officer Dashboard</h2>
          </div>

          <div className="dashboard-table-card" data-aos="fade-up" data-aos-delay="300">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Welcome, {user?.username}</h3>
              <p>District: {user?.district || 'Not assigned'}</p>
              
              <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px', margin: '30px auto' }}>
                <h4>District Officer Features:</h4>
                <ul style={{ lineHeight: '1.8' }}>
                  <li>✓ Manage block officers in {user?.district || 'your district'}</li>
                  <li>✓ View district-wise procurement data</li>
                  <li>✓ View district-wise production data</li>
                  <li>✓ Manage farmers in the district</li>
                  <li>✓ Generate district reports</li>
                  <li>✓ Monitor block officer activities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DistrictDashboard;
