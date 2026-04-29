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

const roleSidebarItems = {
  admin: {
    basePath: "/admin",
    items: [
      "User Management",
      "Role & Permissions",
      "System Reports",
      "System Settings",
      "All Regions Data",
    ],
  },
  district: {
    basePath: "/district",
    items: [
      "Block Officer Management",
      "District Monitoring",
      "District Farmers",
      "District Reports",
      "District Data",
    ],
  },
  block: {
    basePath: "/block",
    items: [
      "Farmer Records",
      "Block Monitoring",
      "Block Farmers",
      "Block Reports",
      "Block Data",
    ],
  },
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const roleSidebarRoutes = {
  district: {
    "District Data": "/district/data",
  },
  block: {
    "Block Data": "/block/data",
  },
};

/**
 * Sidebar - Responsive navigation panel for MIS dashboard pages.
 *
 * @component
 * @returns {React.ReactElement} Role-aware sidebar navigation.
 */
function Sidebar() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const roleConfig = isAuthenticated ? roleSidebarItems[user?.role] : null;

  return (
    /* Tailwind classes switch from a fixed side rail to horizontal navigation below 900px. */
    <div className={dashboardClasses.sidebar}>
      <div className={dashboardClasses.sidebarLogo}>
        <h2 className={dashboardClasses.sidebarLogoTitle}>{t('milletMIS')}</h2>
        <p className={dashboardClasses.sidebarLogoText}>{t('uttarakhandAgriculture')}</p>
      </div>

      <nav className={dashboardClasses.sidebarNav}>
        {/* Public menu items remain visible for farmers and unauthenticated visitors. */}
        <Link className={dashboardClasses.sidebarLink} to="/dashboard" data-aos="fade-right" data-aos-delay="100">{t('dashboard')}</Link>
        <Link className={dashboardClasses.sidebarLink} to="/procurement" data-aos="fade-right" data-aos-delay="150">{t('procurement')}</Link>
        <Link className={dashboardClasses.sidebarLink} to="/production" data-aos="fade-right" data-aos-delay="200">{t('production')}</Link>
        <Link className={dashboardClasses.sidebarLink} to="/district" data-aos="fade-right" data-aos-delay="300">{t('districtAnalysis')}</Link>
        <Link className={dashboardClasses.sidebarLink} to="/millet" data-aos="fade-right" data-aos-delay="400">{t('milletAnalysis')}</Link>

        {roleConfig?.items.map((item, index) => (
          <Link
            key={item}
            className={dashboardClasses.sidebarLink}
            to={roleSidebarRoutes[user?.role]?.[item] || `${roleConfig.basePath}#${slugify(item)}`}
            data-aos="fade-right"
            data-aos-delay={String(450 + index * 50)}
          >
            {item}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
