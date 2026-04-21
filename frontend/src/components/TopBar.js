import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Home,
  Info,
  Landmark,
  LayoutDashboard,
  SearchCheck,
  User,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { schemes } from "../data/schemes";

const FONT_SCALE_LEVELS = [0.9, 1, 1.1, 1.2];
const DEFAULT_FONT_SCALE_INDEX = 1;

function TopBar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const headerRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [fontScaleIndex, setFontScaleIndex] = useState(DEFAULT_FONT_SCALE_INDEX);

  useEffect(() => {
    const storedIndex = Number(window.localStorage.getItem("appFontScaleIndex"));
    if (Number.isInteger(storedIndex) && FONT_SCALE_LEVELS[storedIndex]) {
      setFontScaleIndex(storedIndex);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-font-scale",
      String(FONT_SCALE_LEVELS[fontScaleIndex]),
    );
    window.localStorage.setItem("appFontScaleIndex", String(fontScaleIndex));
  }, [fontScaleIndex]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navigateAndClose = (path, options) => {
    setOpenMenu(null);
    navigate(path, options);
  };

  const handleHomeClick = () => {
    setOpenMenu(null);
    logout();
    navigate("/", { replace: true });
  };

  const handleSchemeOpen = (pdfUrl) => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
    setOpenMenu(null);
  };

  const toggleMenu = (menuName) => {
    setOpenMenu((currentMenu) => (currentMenu === menuName ? null : menuName));
  };

  const increaseFontSize = () => {
    setFontScaleIndex((currentIndex) =>
      Math.min(currentIndex + 1, FONT_SCALE_LEVELS.length - 1),
    );
  };

  const decreaseFontSize = () => {
    setFontScaleIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  const resetFontSize = () => {
    setFontScaleIndex(DEFAULT_FONT_SCALE_INDEX);
  };

  const handleToggleLanguage = () => {
    toggleLanguage(language === "en" ? "hi" : "en");
  };

  const navButtonClass =
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition hover:text-[#d9ef87] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d9ef87]";
  const controlButtonClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-white/25 bg-white/10 px-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-[#053b47]";
  const dropdownClass =
    "absolute top-full z-20 mt-2 overflow-hidden rounded-xl border border-[#eae6de] bg-white text-[#1a2b1e] shadow-[0_16px_36px_rgba(0,0,0,0.22)]";

  return (
    <header
      ref={headerRef}
      className="relative z-50 shrink-0 border-b border-white/10 bg-[#053b47] text-white shadow-lg"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 lg:flex-nowrap lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d79652] to-[#9a5a1d] text-[0.63rem] font-bold text-white shadow-lg">
            UTTARAKHAND
          </div>
          <div className="min-w-0">
            <div className="truncate text-2xl font-black tracking-tight md:text-3xl">
              UTTARAKHAND
            </div>
            <div className="truncate text-xs uppercase tracking-[0.2em] text-white/80">
              Millet Project
            </div>
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full flex-wrap items-center justify-center gap-2 text-sm font-semibold lg:order-none lg:w-auto lg:gap-4"
        >
          <button type="button" className={navButtonClass} onClick={handleHomeClick}>
            <Home className="h-4 w-4" />
            Home
          </button>

          <button
            type="button"
            className={navButtonClass}
            onClick={() => navigateAndClose("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Program
          </button>

          <div className="relative">
            <button
              type="button"
              className={navButtonClass}
              aria-haspopup="menu"
              aria-expanded={openMenu === "resources"}
              onClick={() => toggleMenu("resources")}
            >
              <BookOpen className="h-4 w-4" />
              Resources
              <ChevronDown
                className={`h-4 w-4 transition ${openMenu === "resources" ? "rotate-180" : ""}`}
              />
            </button>

            {openMenu === "resources" && (
              <div
                role="menu"
                aria-label="Schemes"
                className={`${dropdownClass} left-1/2 max-h-[340px] w-[min(90vw,380px)] -translate-x-1/2 overflow-y-auto lg:left-0 lg:translate-x-0`}
              >
                <div className="border-b border-[#eae6de] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-[#024b37]">
                  Schemes
                </div>
                {schemes.map((scheme) => (
                  <div
                    key={scheme.name}
                    role="menuitem"
                    className="flex items-center justify-between gap-3 border-b border-[#eae6de] px-4 py-3 last:border-b-0 hover:bg-[#f3f9f6]"
                  >
                    <span className="text-sm font-bold leading-snug">{scheme.name}</span>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#024b37] px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#035e47]"
                      onClick={() => handleSchemeOpen(scheme.pdfUrl)}
                    >
                      PDF
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className={controlButtonClass}
            onClick={increaseFontSize}
            aria-label="Increase font size"
            title="Increase font size"
          >
            A+
          </button>
          <button
            type="button"
            className={controlButtonClass}
            onClick={resetFontSize}
            aria-label="Reset font size"
            title="Reset font size"
          >
            A
          </button>
          <button
            type="button"
            className={controlButtonClass}
            onClick={decreaseFontSize}
            aria-label="Decrease font size"
            title="Decrease font size"
          >
            A-
          </button>
          <button
            type="button"
            className={`${controlButtonClass} min-w-[68px]`}
            onClick={handleToggleLanguage}
            aria-label="Switch language"
            title="Switch language"
          >
            {language === "en" ? "Hindi" : "English"}
          </button>

          <div className="relative">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/70 bg-transparent text-white transition hover:bg-white hover:text-[#053b47]"
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={openMenu === "profile"}
              onClick={() => toggleMenu("profile")}
            >
              <User className="h-5 w-5" />
            </button>

            {openMenu === "profile" && (
              <div
                role="menu"
                aria-label="Profile links"
                className={`${dropdownClass} right-0 w-[min(90vw,270px)]`}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-3 border-b border-[#eae6de] px-4 py-3 text-left text-sm font-bold transition hover:bg-[#f3f9f6]"
                  onClick={() => navigateAndClose("/register-farmer")}
                >
                  <UserPlus className="h-4 w-4 text-[#024b37]" />
                  Register Farmer
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-3 border-b border-[#eae6de] px-4 py-3 text-left text-sm font-bold transition hover:bg-[#f3f9f6]"
                  onClick={() => navigateAndClose("/enrollment-status")}
                >
                  <SearchCheck className="h-4 w-4 text-[#024b37]" />
                  Check Enrollment Status
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold transition hover:bg-[#f3f9f6]"
                  onClick={() => navigateAndClose("/about-programme")}
                >
                  <Info className="h-4 w-4 text-[#024b37]" />
                  About Programme
                </button>
              </div>
            )}
          </div>

          <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-white/85 text-[#053b47] shadow lg:flex">
            <Landmark className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
