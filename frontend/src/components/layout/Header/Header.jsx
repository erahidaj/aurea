import { Link, NavLink } from "react-router-dom";
import LanguageSwitcher from "../../common/LanguageSwitcher/LanguageSwitcher";
import { useLanguage } from "../../../context/useLanguage";
import translations from "../../../data/translations";
import logo from "../../../assets/logo/star-logo.png";
import "./Header.css";

const Header = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const closeMobileMenu = () => {
    const menu = document.getElementById("mobileMenu");
    if (!menu) return;

    const bsOffcanvas = window.bootstrap?.Offcanvas.getInstance(menu);
    if (bsOffcanvas) {
      bsOffcanvas.hide();
    }
  };

  return (
    <>
      <header className="site-header sticky-top">
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <Link className="navbar-brand logo-wrapper" to="/">
              <img src={logo} alt="Aurea Hotel " className="logo-icon" />
            </Link>

            <div className="desktop-nav ms-auto d-none d-lg-flex">
              <div className="desktop-nav-links">
                <NavLink to="/" className="nav-link">
                  {t.home}
                </NavLink>
                <NavLink to="/rooms" className="nav-link">
                  {t.rooms}
                </NavLink>
                <NavLink to="/booking" className="nav-link">
                  {t.booking}
                </NavLink>
                <NavLink to="/contact" className="nav-link">
                  {t.contact}
                </NavLink>
              </div>

              <div className="desktop-nav-actions">
                <LanguageSwitcher />
                <Link to="/booking" className="btn btn-gold header-cta">
                  {t.checkAvailability}
                </Link>
              </div>
            </div>

            <button
              className="navbar-toggler border-0 shadow-none d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileMenu"
              aria-controls="mobileMenu"
              aria-label={t.toggleNavigation}
            >
              <span className="custom-toggler-icon"></span>
            </button>
          </div>
        </nav>
      </header>

      <div
        className="offcanvas offcanvas-end mobile-offcanvas d-lg-none"
        tabIndex="-1"
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
      >
        <div className="offcanvas-header">
          <Link
            to="/"
            className="mobile-brand text-decoration-none"
            onClick={closeMobileMenu}
          >
            <img src={logo} alt="Star Hotel" className="mobile-logo-icon" />
          </Link>

          <button
            type="button"
            className="btn-close shadow-none"
            data-bs-dismiss="offcanvas"
            aria-label={t.closeMenu}
          ></button>
        </div>

        <div className="offcanvas-body">
          <div className="mobile-nav-links">
            <NavLink
              to="/"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {t.home}
            </NavLink>
            <NavLink
              to="/rooms"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {t.rooms}
            </NavLink>
            <NavLink
              to="/booking"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {t.booking}
            </NavLink>
            <NavLink
              to="/contact"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {t.contact}
            </NavLink>
          </div>

          <div className="mobile-language-wrapper">
            <LanguageSwitcher />
          </div>

          <div className="mobile-bottom-box">
            <Link
              to="/booking"
              className="btn btn-gold header-cta"
              onClick={closeMobileMenu}
            >
              {t.checkAvailability}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
