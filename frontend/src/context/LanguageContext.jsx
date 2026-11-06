import { useEffect, useMemo, useState } from "react";

import { LanguageContext } from "./language-context";


const allowedLanguages = ["en", "al", "it"];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("lang");
    return allowedLanguages.includes(savedLanguage) ? savedLanguage : "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (!allowedLanguages.includes(lang)) return;
    setLanguage(lang);
  };

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

