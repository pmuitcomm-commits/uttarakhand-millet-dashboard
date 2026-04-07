import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Sidebar() {
  const { t } = useLanguage();

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>{t('milletMIS')}</h2>
        <p>{t('uttarakhandAgriculture')}</p>
      </div>

      <nav>
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