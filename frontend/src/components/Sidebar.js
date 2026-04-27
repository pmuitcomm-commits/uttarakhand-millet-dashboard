/**
 * Sidebar component module - Provides dashboard navigation by user role.
 *
 * The sidebar lists officer-specific dashboard links when authenticated and
 * keeps public dashboard links available for broader scheme visibility.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { dashboardClasses } from "./dashboardStyles";

/**
 * Sidebar - Responsive navigation panel for MIS dashboard pages.
 *
 * @component
 * @returns {React.ReactElement} Role-aware sidebar navigation.
 */
function Sidebar() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  return (
    /* Tailwind classes switch from a fixed side rail to horizontal navigation below 900px. */
    <div className={dashboardClasses.sidebar}>
      <div className={dashboardClasses.sidebarLogo}>
        <h2 className={dashboardClasses.sidebarLogoTitle}>{t('milletMIS')}</h2>
        <p className={dashboardClasses.sidebarLogoText}>{t('uttarakhandAgriculture')}</p>
      </div>

      <nav className={dashboardClasses.sidebarNav}>
        {isAuthenticated && user?.role === 'admin' && (
          <>
            <Link className={dashboardClasses.sidebarLink} to="/admin-dashboard" data-aos="fade-right" data-aos-delay="100">
              Admin Dashboard
            </Link>
          </>
        )}

        {isAuthenticated && user?.role === 'district_officer' && (
          <>
            <Link className={dashboardClasses.sidebarLink} to="/district-dashboard" data-aos="fade-right" data-aos-delay="100">
              District Dashboard
            </Link>
          </>
        )}

        {isAuthenticated && user?.role === 'block_officer' && (
          <>
            <Link className={dashboardClasses.sidebarLink} to="/block-dashboard" data-aos="fade-right" data-aos-delay="100">
              Block Dashboard
            </Link>
          </>
        )}

        {/* Public menu items remain visible for farmers and unauthenticated visitors. */}
        <Link className={dashboardClasses.sidebarLink} to="/dashboard" data-aos="fade-right" data-aos-delay="100">{t('dashboard')}</Link>
        <Link className={dashboardClasses.sidebarLink} to="/procurement" data-aos="fade-right" data-aos-delay="150">{t('procurement')}</Link>
        <Link className={dashboardClasses.sidebarLink} to="/production" data-aos="fade-right" data-aos-delay="200">{t('production')}</Link>
        <Link className={dashboardClasses.sidebarLink} to="/district" data-aos="fade-right" data-aos-delay="300">{t('districtAnalysis')}</Link>
        <Link className={dashboardClasses.sidebarLink} to="/millet" data-aos="fade-right" data-aos-delay="400">{t('milletAnalysis')}</Link>
      </nav>
    </div>
  );
}

export default Sidebar;
