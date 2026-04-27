/**
 * DistrictLanding page - Post-login transition screen for district officers.
 *
 * The screen displays the assigned district context before forwarding the user
 * to the district dashboard.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { landingClasses, landingVariants } from './landingStyles';

/**
 * DistrictLanding - Render the district officer landing screen.
 *
 * @component
 * @returns {React.ReactElement} District landing page.
 */
function DistrictLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-redirect after 3 seconds while keeping a manual continue option.
    const timer = setTimeout(() => {
      navigate('/district-dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/district-dashboard');
  };

  const roleDisplay = 'District';
  const districtName = user?.district || 'District Officer';

  return (
    <div className={`${landingClasses.container} ${landingVariants.district.container}`}>
      <div className={landingClasses.header}>
        <div className={landingClasses.logoSection}>
          <img src="/logo1.png" alt="Logo" className={landingClasses.logo} />
        </div>
      </div>

      <div className={landingClasses.content}>
        <div className={landingClasses.card}>
          <h1 className={landingClasses.greeting}>Hi, {roleDisplay}</h1>
          <p className={landingClasses.welcomeMessage}>Welcome to dashboard managing panel</p>
          
          <div className={`${landingClasses.roleInfo} ${landingVariants.district.roleInfo}`}>
            <p className={landingClasses.roleDescription}>Manage district-level operations</p>
            <p className={landingClasses.districtBlockName}>{districtName}</p>
          </div>

          <button className={`${landingClasses.continueButton} ${landingVariants.district.button}`} onClick={handleContinue}>
            Enter Dashboard
          </button>

          <p className={landingClasses.autoRedirect}>Redirecting in 3 seconds...</p>
        </div>
      </div>
    </div>
  );
}

export default DistrictLanding;
