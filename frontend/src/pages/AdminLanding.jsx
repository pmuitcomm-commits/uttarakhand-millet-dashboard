/**
 * AdminLanding page - Post-login transition screen for administrators.
 *
 * The screen confirms the role context before automatically forwarding the user
 * to the admin dashboard.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { landingClasses, landingVariants } from './landingStyles';

/**
 * AdminLanding - Render the administrator landing screen.
 *
 * @component
 * @returns {React.ReactElement} Admin landing page.
 */
function AdminLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-redirect after 3 seconds while keeping a manual continue option.
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
    <div className={`${landingClasses.container} ${landingVariants.admin.container}`}>
      <div className={landingClasses.header}>
        <div className={landingClasses.logoSection}>
          <img src="/logo1.png" alt="Logo" className={landingClasses.logo} />
        </div>
      </div>

      {/* Responsive Tailwind card centers the short role handoff on desktop and mobile. */}
      <div className={landingClasses.content}>
        <div className={landingClasses.card}>
          <h1 className={landingClasses.greeting}>Hi, {roleDisplay}</h1>
          <p className={landingClasses.welcomeMessage}>Welcome to dashboard managing panel</p>
          
          <div className={`${landingClasses.roleInfo} ${landingVariants.admin.roleInfo}`}>
            <p className={landingClasses.roleDescription}>You have access to all administrative functions and system-wide data.</p>
          </div>

          <button className={`${landingClasses.continueButton} ${landingVariants.admin.button}`} onClick={handleContinue}>
            Enter Dashboard
          </button>

          <p className={landingClasses.autoRedirect}>Redirecting in 3 seconds...</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLanding;
