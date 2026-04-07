import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>{t('milletMIS')}</h2>
        <p>{t('uttarakhandAgriculture')}</p>
      </div>

      <nav>
        {isAuthenticated && user?.role === 'admin' && (
          <>
            <Link to="/admin-dashboard" data-aos="fade-right" data-aos-delay="100">
              Admin Dashboard
            </Link>
          </>
        )}

        {isAuthenticated && user?.role === 'district_officer' && (
          <>
            <Link to="/district-dashboard" data-aos="fade-right" data-aos-delay="100">
              District Dashboard
            </Link>
          </>
        )}

        {isAuthenticated && user?.role === 'block_officer' && (
          <>
            <Link to="/block-dashboard" data-aos="fade-right" data-aos-delay="100">
              Block Dashboard
            </Link>
          </>
        )}

        {/* Public menu items for all users (farmers) */}
        <Link to="/dashboard" data-aos="fade-right" data-aos-delay="100">{t('dashboard')}</Link>
        <Link to="/procurement" data-aos="fade-right" data-aos-delay="150">{t('procurement')}</Link>
        <Link to="/production" data-aos="fade-right" data-aos-delay="200">{t('production')}</Link>
        <Link to="/district" data-aos="fade-right" data-aos-delay="300">{t('districtAnalysis')}</Link>
        <Link to="/millet" data-aos="fade-right" data-aos-delay="400">{t('milletAnalysis')}</Link>
      </nav>
    </div>
  );
}

export default Sidebar;