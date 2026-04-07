import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function TopBar() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(16);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const handleIncreaseFontSize = () => {
    if (fontSize < 24) {
      const newSize = fontSize + 2;
      setFontSize(newSize);
      document.documentElement.style.fontSize = newSize + 'px';
    }
  };

  const handleDecreaseFontSize = () => {
    if (fontSize > 12) {
      const newSize = fontSize - 2;
      setFontSize(newSize);
      document.documentElement.style.fontSize = newSize + 'px';
    }
  };

  const handleResetFontSize = () => {
    setFontSize(16);
    document.documentElement.style.fontSize = '16px';
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleToggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    toggleLanguage(newLang);
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <img src="/logo3.png" alt="Logo 3" className="topbar-logo logo3-no-bg" />
        <div className="logo-separator">|</div>
        <img src="/logo2.png" alt="Logo 2" className="topbar-logo" />
        <div className="logo-separator">|</div>
        <img src="/logo1.png" alt="Logo 1" className="topbar-logo" />
      </div>

      <div className="top-bar-center">
        <h1 className="dashboard-title">
          {t('appTitle')}
        </h1>
      </div>

      <div className="top-bar-right">
        <button onClick={handleIncreaseFontSize} className="topbar-btn" title="Increase Font Size">
          A+
        </button>
        <button onClick={handleResetFontSize} className="topbar-btn" title="Reset Font Size">
          A
        </button>
        <button onClick={handleDecreaseFontSize} className="topbar-btn" title="Decrease Font Size">
          A-
        </button>
        <button onClick={handleToggleTheme} className="topbar-btn" title="Toggle Theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={handleToggleLanguage} className="topbar-btn" title="Switch Language">
          {language === 'en' ? 'हिंदी' : 'Eng'}
        </button>
        <button onClick={handleLogout} className="topbar-btn logout-btn" title="Logout">
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

export default TopBar;
