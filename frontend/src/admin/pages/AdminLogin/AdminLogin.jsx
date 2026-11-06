import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/AdminApi";
import { useLanguage } from "../../../context/useLanguage";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher/LanguageSwitcher";
import adminTranslations from "../../data/adminTranslations";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = adminTranslations[language] || adminTranslations.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    try {
      await loginAdmin(email, password);

      navigate("/admin", {
        replace: true,
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <section className="admin-login-showcase">
        <div className="admin-login-overlay"></div>

        <div className="admin-login-brand">
          <div className="admin-login-brand-icon">
            <i className="bi bi-stars"></i>
          </div>

          <div>
            <h1>Aurea Hotel</h1>
            <p>Tirana, Tirana</p>
          </div>
        </div>

        <div className="admin-login-showcase-content">
          <span className="admin-login-kicker">{t.loginKicker}</span>

          <h2>{t.loginShowcaseTitle}</h2>

          <p>{t.loginShowcaseText}</p>

          <div className="admin-login-features">
            <div>
              <i className="bi bi-check2-circle"></i>
              {t.instantUpdates}
            </div>

            <div>
              <i className="bi bi-shield-check"></i>
              {t.protectedAccess}
            </div>

            <div>
              <i className="bi bi-grid-1x2"></i>
              {t.centralized}
            </div>
          </div>
        </div>

        <div className="admin-login-showcase-footer">
          © {new Date().getFullYear()} Aurea Hotel
        </div>
      </section>

      <section className="admin-login-form-side">
        <div className="admin-login-language">
          <LanguageSwitcher />
        </div>
        <div className="admin-login-mobile-brand">
          <div className="admin-login-brand-icon">
            <i className="bi bi-stars"></i>
          </div>

          <div>
            <strong>Aurea</strong>
            <span>{t.adminConsole}</span>
          </div>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-heading">
            <span className="admin-login-eyebrow">{t.adminConsole}</span>

            <h2>{t.welcomeBack}</h2>

            <p>{t.loginIntro}</p>
          </div>

          {message && (
            <div className="admin-login-error" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{message}</span>
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-login-field">
              <label htmlFor="admin-email">Email</label>

              <div className="admin-login-input-wrap">
                <i className="bi bi-envelope"></i>

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">{t.password}</label>

              <div className="admin-login-input-wrap">
                <i className="bi bi-lock"></i>

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
                  required
                />

                <button
                  className="admin-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                >
                  <i
                    className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                  ></i>
                </button>
              </div>
            </div>

            <button
              className="admin-login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="admin-login-spinner"></span>
                  {t.loggingIn}
                </>
              ) : (
                <>
                  {t.loginButton}
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="admin-login-security">
            <i className="bi bi-shield-lock"></i>

            <span>{t.authorizedOnly}</span>
          </div>

          <a className="admin-login-back" href="/">
            <i className="bi bi-arrow-left"></i>
            {t.backWebsite}
          </a>
        </div>
      </section>
    </main>
  );
};

export default AdminLogin;
