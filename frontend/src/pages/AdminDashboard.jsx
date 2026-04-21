import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { dashboardClasses } from '../components/dashboardStyles';

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
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>Admin Dashboard</h2>
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="300">
            <div className="p-10 text-center">
              <h3 className="text-xl font-semibold text-[#024b37] dark:text-white">Welcome, {user?.username}</h3>
              <p className="mt-2 text-[#4a5568] dark:text-slate-200">Admin Dashboard - User Management</p>
              
              <div className="mx-auto mt-[30px] max-w-[600px] text-left">
                <h4 className="font-semibold text-[#024b37] dark:text-white">Admin Features:</h4>
                <ul className="leading-[1.8] text-[#024b37] dark:text-slate-100">
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
