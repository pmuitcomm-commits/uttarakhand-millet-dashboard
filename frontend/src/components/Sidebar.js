/**
 * Sidebar component module - Provides dashboard navigation by user role.
 *
 * The sidebar lists officer-specific dashboard links when authenticated and
 * keeps public dashboard links available for broader scheme visibility.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { dashboardClasses } from "./dashboardStyles";
import { defaultBlockDataSectionSlug } from "../data/blockDataSections";

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
    "Block Data": `/block/data/${defaultBlockDataSectionSlug}`,
  },
};

const sidebarLinkClassName = (isActive) =>
  [
    dashboardClasses.sidebarLink,
    isActive ? "bg-[#66b9ac] text-white shadow-[inset_3px_0_0_#fedd56]" : "",
  ].filter(Boolean).join(" ");

const isSidebarPathActive = (pathname, route) => {
  if (route.startsWith("/block/data")) {
    return pathname.startsWith("/block/data");
  }
  return pathname === route;
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
  const location = useLocation();
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
        <Link className={sidebarLinkClassName(location.pathname === "/dashboard")} to="/dashboard">{t('dashboard')}</Link>
        <Link className={sidebarLinkClassName(location.pathname === "/procurement")} to="/procurement">{t('procurement')}</Link>
        <Link className={sidebarLinkClassName(location.pathname === "/production")} to="/production">{t('production')}</Link>
        <Link className={sidebarLinkClassName(location.pathname === "/district")} to="/district">{t('districtAnalysis')}</Link>
        <Link className={sidebarLinkClassName(location.pathname === "/millet")} to="/millet">{t('milletAnalysis')}</Link>

        {roleConfig?.items.map((item) => {
          const route = roleSidebarRoutes[user?.role]?.[item] || `${roleConfig.basePath}#${slugify(item)}`;
          const isActive = isSidebarPathActive(location.pathname, route);

          return (
            <Link
              key={item}
              className={sidebarLinkClassName(isActive)}
              to={route}
            >
              {item}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
