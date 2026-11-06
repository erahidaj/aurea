import { useLanguage } from "../../../context/useLanguage";
import translations from "../../../data/translations";
import { Link } from "react-router-dom";
import heroImage from "../../../assets/hero/hero.jpg";
import "./HeroSection.css";

const HeroSection = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <section className="hero" style={{ "--hero-image": `url(${heroImage})` }}>
      <div className="hero-overlay"></div>

      <div className="container position-relative">
        <div className="row align-items-center min-vh-100">
          <div className="col-lg-8 col-xl-7">
            <div className="hero-content">
              <span className="hero-kicker">{t.heroKicker}</span>
              <h1>{t.heroTitle}</h1>
              <p>{t.heroText}</p>

              <div className="hero-actions">
                <Link to="/booking" className="btn btn-gold header-cta">
                  {t.checkAvailability}
                </Link>
                <Link to="/rooms" className="btn  btn-outline-light header-cta">
                  {t.exploreRooms}
                </Link>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <strong>10+</strong>
                  <span>{t.luxuryRooms}</span>
                </div>
                <div className="hero-stat">
                  <strong>24/7</strong>
                  <span>{t.guestSupport}</span>
                </div>
                <div className="hero-stat">
                  <strong>{t.premiumLabel}</strong>
                  <span>{t.serviceQuality}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
