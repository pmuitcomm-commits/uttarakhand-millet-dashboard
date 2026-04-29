/**
 * RoleDashboard component - Shared layout for officer dashboard placeholders.
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import { dashboardClasses } from "./dashboardStyles";

function RoleDashboard({ requiredRole, title, summary, featureTitle, features }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role !== requiredRole) {
      navigate("/");
    }
  }, [isAuthenticated, navigate, requiredRole, user]);

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>{title}</h2>
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="300">
            <div className="p-10 text-center">
              <h3 className="text-xl font-semibold text-[#024b37] dark:text-white">
                Welcome, {user?.username}
              </h3>
              <p className="mt-2 text-[#4a5568] dark:text-slate-200">{summary(user)}</p>

              <div className="mx-auto mt-[30px] max-w-[600px] text-left">
                <h4 className="font-semibold text-[#024b37] dark:text-white">{featureTitle}</h4>
                <ul className="leading-[1.8] text-[#024b37] dark:text-slate-100">
                  {features(user).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleDashboard;
