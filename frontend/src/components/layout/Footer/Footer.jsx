import "./Footer.css";
import logo from "../../../assets/logo/star-logo.png";
import { useLanguage } from "../../../context/useLanguage";
import translations from "../../../data/translations";
import hotelInfo from "../../../data/hotelInfo";

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <footer className="site-footer">
      <div className="footer-pattern"></div>

      <div className="container footer-main">
        <div className="row gy-4">
          <div className="col-lg-4">
            <div className="footer-brand">
              <img src={logo} alt="Aurea Hotel" className="footer-logo" />

              <ul className="footer-contact-list">
                <li>
                  <span className="footer-contact-icon">
                    <i className="bi bi-telephone"></i>
                  </span>

                  <span>{hotelInfo.phone}</span>
                </li>

                <li>
                  <span className="footer-contact-icon">
                    <i className="bi bi-envelope"></i>
                  </span>

                  <span>{hotelInfo.email}</span>
                </li>

                <li>
                  <span className="footer-contact-icon">
                    <i className="bi bi-geo-alt"></i>
                  </span>

                  <span>{hotelInfo.address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="footer-title">{t.ourLinks}</h6>

            <ul className="footer-links">
              <li>
                <a href="/">{t.home}</a>
              </li>

              <li>
                <a href="/rooms">{t.rooms}</a>
              </li>

              <li>
                <a href="/booking">{t.booking}</a>
              </li>

              <li>
                <a href="/contact">{t.contact}</a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="footer-title">{t.ourServices}</h6>

            <ul className="footer-links">
              <li>
                <a href="/rooms">{t.luxuryRooms}</a>
              </li>

              <li>
                <a href="/booking">{t.reservation}</a>
              </li>

              <li>
                <a href="/contact">{t.support}</a>
              </li>

              <li>
                <a href="/contact">{t.termsConditions}</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h6 className="footer-title">{t.ourLocation}</h6>

            <p className="footer-desc">{hotelInfo.address}</p>

            <a
              href={hotelInfo.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-map-btn"
            >
              <i className="bi bi-geo-alt-fill"></i>

              {t.openInGoogleMaps}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
