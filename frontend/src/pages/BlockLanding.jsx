/**
 * BlockLanding page - Post-login transition screen for block officers.
 *
 * The screen displays block context before forwarding the user to the
 * block-level dashboard.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { landingClasses, landingVariants } from './landingStyles';

/**
 * BlockLanding - Render the block officer landing screen.
 *
 * @component
 * @returns {React.ReactElement} Block landing page.
 */
function BlockLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-redirect after 3 seconds while keeping a manual continue option.
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
    <div className={`${landingClasses.container} ${landingVariants.block.container}`}>
      <div className={landingClasses.header}>
        <div className={landingClasses.logoSection}>
          <img src="/logo1.png" alt="Logo" className={landingClasses.logo} />
        </div>
      </div>

      <div className={landingClasses.content}>
        <div className={landingClasses.card}>
          <h1 className={landingClasses.greeting}>Hi, {roleDisplay}</h1>
          <p className={landingClasses.welcomeMessage}>Welcome to dashboard managing panel</p>
          
          <div className={`${landingClasses.roleInfo} ${landingVariants.block.roleInfo}`}>
            <p className={landingClasses.roleDescription}>Manage block-level operations</p>
            <p className={landingClasses.districtBlockName}>{blockName}</p>
          </div>

          <button className={`${landingClasses.continueButton} ${landingVariants.block.button}`} onClick={handleContinue}>
            Enter Dashboard
          </button>

          <p className={landingClasses.autoRedirect}>Redirecting in 3 seconds...</p>
        </div>
      </div>
    </div>
  );
}

export default BlockLanding;
