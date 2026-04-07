import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

function BlockDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not block officer
    if (isAuthenticated && user?.role !== 'block_officer') {
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
            <h2>Block Officer Dashboard</h2>
          </div>

          <div className="dashboard-table-card" data-aos="fade-up" data-aos-delay="300">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Welcome, {user?.username}</h3>
              <p>District: {user?.district || 'Not assigned'}</p>
              
              <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px', margin: '30px auto' }}>
                <h4>Block Officer Features:</h4>
                <ul style={{ lineHeight: '1.8' }}>
                  <li>✓ View block-wise procurement data</li>
                  <li>✓ View block-wise production data</li>
                  <li>✓ Manage farmers in the block</li>
                  <li>✓ View farmer details and records</li>
                  <li>✓ Generate block reports</li>
                  <li>✓ Monitor block activities</li>
                  <li>✓ Read-only access (no user management)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockDashboard;
