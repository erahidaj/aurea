import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../../context/useLanguage";
import translations from "../../../data/translations";
import "./LanguageSwitcher.css";

const languages = [
  { code: "en", short: "EN", label: "English" },
  { code: "al", short: "AL", label: "Shqip" },
  { code: "it", short: "IT", label: "Italiano" },
];

const GlobeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M3.5 12H20.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M12 3C14.5 5.7 16 8.8 16 12C16 15.2 14.5 18.3 12 21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M12 3C9.5 5.7 8 8.8 8 12C8 15.2 9.5 18.3 12 21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();
  const t = translations[language] || translations.en;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLanguage =
    languages.find((item) => item.code === language) || languages[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const handleSelectLanguage = (lang) => {
    changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div
      className={`language-dropdown ${open ? "open" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="language-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={t.chooseLanguage}
      >
        <span className="language-trigger-icon">
          <GlobeIcon />
        </span>

        <span className="language-trigger-text">
          <span className="language-active-short">{activeLanguage.short}</span>
          <span className="language-active-label">{activeLanguage.label}</span>
        </span>

        <span className="language-trigger-caret"></span>
      </button>

      <div className="language-menu">
        <span className="language-menu-title">{t.chooseLanguage}</span>
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            className={`language-option ${language === item.code ? "active" : ""}`}
            onClick={() => handleSelectLanguage(item.code)}
          >
            <span className="language-option-code">{item.short}</span>
            <span className="language-option-label">{item.label}</span>
            {language === item.code && (
              <i className="bi bi-check2 language-option-check"></i>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
