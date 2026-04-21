import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { landingClasses, landingVariants } from './landingStyles';

function AdminLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-redirect after 3 seconds, or allow manual navigation
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

      <div className={landingClasses.footer}>
        <p className={landingClasses.footerText}>Millet Dashboard Management System</p>
      </div>
    </div>
  );
}

export default AdminLanding;
