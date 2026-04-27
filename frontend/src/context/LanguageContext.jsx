/**
 * LanguageContext module - Supplies bilingual labels for the Millet MIS.
 *
 * Components call ``t(key)`` to retrieve English or Hindi text from the shared
 * translation map without duplicating language-selection state.
 */

import React, { createContext, useState, useContext } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

/**
 * LanguageProvider - Stores the selected interface language.
 *
 * @component
 * @param {Object} props - Provider properties.
 * @param {React.ReactNode} props.children - Application subtree.
 * @returns {React.ReactElement} Language context provider.
 */
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  const t = (key) => {
    // Missing translation keys intentionally fall back to the key for safe rendering.
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage - Read the active language context.
 *
 * @returns {Object} Language state and translation helper.
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
