/** @type {import('tailwindcss').Config} */
// Tailwind configuration for the Millet MIS React frontend.
// Custom colors, fonts, shadows, and animations map the government dashboard
// visual system to reusable utility classes.
module.exports = {
  darkMode: "class",
  // Scan only custom source files so generated build output and dependencies
  // are excluded from utility generation.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Named palette mirrors the project brand and MIS status colors.
      colors: {
        millet: {
          green: "#024b37",
          greenDark: "#023628",
          greenHover: "#035e47",
          blue: "#003366",
          teal: "#66b9ac",
          yellow: "#fedd56",
          maroon: "#831843",
          red: "#c12f2f",
          paper: "#f0ece4",
        },
      },
      // Font families correspond to imported Google fonts in index.css.
      fontFamily: {
        montserrat: ["Montserrat", "system-ui", "sans-serif"],
        lato: ["Lato", "system-ui", "sans-serif"],
        playfair: ["Playfair Display", "Georgia", "serif"],
        dm: ["DM Sans", "system-ui", "sans-serif"],
      },
      // Shared elevation tokens for cards, forms, and modals.
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "form-card":
          "0 2px 4px rgba(2, 50, 36, 0.04), 0 8px 24px rgba(2, 50, 36, 0.08), 0 24px 56px rgba(2, 50, 36, 0.07)",
        modal: "0 20px 40px rgba(0, 0, 0, 0.2)",
      },
      // Animation keyframes support page entry, status banners, modals, and
      // the login notification marquee.
      keyframes: {
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInSoft: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        modalSlideIn: {
          "0%": { opacity: "0", transform: "translateY(-20px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        verticalScroll: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
      animation: {
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.3s ease",
        "slide-in-soft": "slideInSoft 0.4s ease-out",
        "modal-slide-in": "modalSlideIn 0.3s ease",
        "fade-in": "fadeIn 0.3s ease",
        "vertical-scroll": "verticalScroll 18s linear infinite",
      },
    },
  },
  plugins: [],
};
