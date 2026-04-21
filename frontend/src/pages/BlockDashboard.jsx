import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { dashboardClasses } from '../components/dashboardStyles';

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
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>Block Officer Dashboard</h2>
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="300">
            <div className="p-10 text-center">
              <h3 className="text-xl font-semibold text-[#024b37] dark:text-white">Welcome, {user?.username}</h3>
              <p className="mt-2 text-[#4a5568] dark:text-slate-200">District: {user?.district || 'Not assigned'}</p>
              
              <div className="mx-auto mt-[30px] max-w-[600px] text-left">
                <h4 className="font-semibold text-[#024b37] dark:text-white">Block Officer Features:</h4>
                <ul className="leading-[1.8] text-[#024b37] dark:text-slate-100">
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
