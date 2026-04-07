import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (isAuthenticated && user?.role !== 'admin') {
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
            <h2>Admin Dashboard</h2>
          </div>

          <div className="dashboard-table-card" data-aos="fade-up" data-aos-delay="300">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Welcome, {user?.username}</h3>
              <p>Admin Dashboard - User Management</p>
              
              <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px', margin: '30px auto' }}>
                <h4>Admin Features:</h4>
                <ul style={{ lineHeight: '1.8' }}>
                  <li>✓ Manage all users (Admin, District Officers, Block Officers)</li>
                  <li>✓ View system-wide data</li>
                  <li>✓ Update user roles and permissions</li>
                  <li>✓ Access all district and block information</li>
                  <li>✓ Generate system reports</li>
                  <li>✓ System configuration and settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
