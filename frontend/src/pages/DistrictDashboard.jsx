/**
 * DistrictDashboard page - District officer workspace for the Millet MIS.
 *
 * The page verifies role assignment and displays district-scoped operational
 * capabilities for future district-level management features.
 */

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { dashboardClasses } from '../components/dashboardStyles';

/**
 * DistrictDashboard - Render the district officer dashboard placeholder.
 *
 * @component
 * @returns {React.ReactElement} District officer dashboard view.
 */
function DistrictDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users who are outside the district role.
    if (isAuthenticated && user?.role !== 'district') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>District Officer Dashboard</h2>
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="300">
            <div className="p-10 text-center">
              <h3 className="text-xl font-semibold text-[#024b37] dark:text-white">Welcome, {user?.username}</h3>
              <p className="mt-2 text-[#4a5568] dark:text-slate-200">District: {user?.district || 'Not assigned'}</p>
              
              <div className="mx-auto mt-[30px] max-w-[600px] text-left">
                <h4 className="font-semibold text-[#024b37] dark:text-white">District Officer Features:</h4>
                <ul className="leading-[1.8] text-[#024b37] dark:text-slate-100">
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
