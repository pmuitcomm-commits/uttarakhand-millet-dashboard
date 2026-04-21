import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { dashboardClasses } from "./dashboardStyles";

function TopBar() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(16);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleHomeClick = () => {
    logout();
    navigate("/");
  };

  const handleAboutClick = () => {
    navigate("/about-programme");
  };

  const handleIncreaseFontSize = () => {
    if (fontSize < 24) {
      const newSize = fontSize + 2;
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}px`;
    }
  };

  const handleDecreaseFontSize = () => {
    if (fontSize > 12) {
      const newSize = fontSize - 2;
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}px`;
    }
  };

  const handleResetFontSize = () => {
    setFontSize(16);
    document.documentElement.style.fontSize = "16px";
  };

  const handleToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.body.classList.add("dark-theme");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark-theme");
      document.documentElement.classList.remove("dark");
    }
  };

  const handleToggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    toggleLanguage(newLang);
  };

  return (
    <div className={dashboardClasses.topBar}>
      <div className={dashboardClasses.topBarLeft}>
        <img
          src="/logo3.png"
          alt="Logo 3"
          className={`${dashboardClasses.topBarLogo} ${dashboardClasses.topBarLogoBlend}`}
        />
        <div className={dashboardClasses.logoSeparator}>|</div>
        <img src="/logo2.png" alt="Logo 2" className={dashboardClasses.topBarLogo} />
        <div className={dashboardClasses.logoSeparator}>|</div>
        <img src="/logo1.png" alt="Logo 1" className={dashboardClasses.topBarLogo} />
      </div>

      <div className={dashboardClasses.topBarCenter}>
        <h1 className={dashboardClasses.dashboardTitle}>{t("appTitle")}</h1>
      </div>

      <div className={dashboardClasses.topBarRight}>
        <button onClick={handleHomeClick} className={dashboardClasses.topBarButton} title="Go to Home">
          Home
        </button>

        <button onClick={handleAboutClick} className={dashboardClasses.topBarButton} title="About Programme">
          About
        </button>

        <button onClick={handleIncreaseFontSize} className={dashboardClasses.topBarButton} title="Increase Font Size">
          A+
        </button>
        <button onClick={handleResetFontSize} className={dashboardClasses.topBarButton} title="Reset Font Size">
          A
        </button>
        <button onClick={handleDecreaseFontSize} className={dashboardClasses.topBarButton} title="Decrease Font Size">
          A-
        </button>
        <button onClick={handleToggleTheme} className={dashboardClasses.topBarButton} title="Toggle Theme">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <button onClick={handleToggleLanguage} className={dashboardClasses.topBarButton} title="Switch Language">
          {language === "en" ? "Hindi" : "Eng"}
        </button>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className={`${dashboardClasses.topBarButton} ${dashboardClasses.topBarLogoutButton}`}
            title="Logout"
          >
            {t("logout")}
          </button>
        )}
      </div>
    </div>
  );
}

export default TopBar;
