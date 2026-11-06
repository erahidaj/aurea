import { useEffect, useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import translations from "../../data/translations";
import hotelInfo from "../../data/hotelInfo";
import { Helmet } from "react-helmet-async";
import "./Contact.css";

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const Contact = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  // Automatically removes the success/error message after a few seconds
  useEffect(() => {
    if (!statusMessage) return;

    const timer = setTimeout(() => {
      setStatusMessage("");
      setStatusType("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contact-mail.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(t.errorSendingMessage);
      }

      setStatusType("success");
      setStatusMessage(t.messageSentSuccessfully);
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error.message === t.errorSendingMessage
          ? t.errorSendingMessage
          : t.serverErrorMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t.contactPageTitle}</title>
        <meta name="description" content={t.contactMetaDescription} />
        <link rel="canonical" href="https://example.com/contact" />
      </Helmet>

      <section className="section-space page-top-space contact-page">
        <div className="container">
          <div className="contact-shell">
            <div className="row g-4 align-items-stretch">
              {/* Contact information */}
              <div className="col-lg-5">
                <aside className="contact-info-box h-100">
                  <span className="section-kicker">{t.contact}</span>

                  <h1>{t.contactTitle}</h1>
                  <p className="contact-intro">{t.contactIntro}</p>

                  <div className="contact-info-list">
                    <div className="contact-item">
                      <span className="contact-icon-wrap">
                        <i className="bi bi-envelope"></i>
                      </span>

                      <div className="contact-item-content">
                        <a href={`mailto:${hotelInfo.email}`}>
                          {hotelInfo.email}
                        </a>
                      </div>
                    </div>

                    <div className="contact-item">
                      <span className="contact-icon-wrap">
                        <i className="bi bi-telephone"></i>
                      </span>

                      <div className="contact-item-content">
                        <a href={`tel:${hotelInfo.phone}`}>{hotelInfo.phone}</a>
                      </div>
                    </div>

                    <div className="contact-item">
                      <span className="contact-icon-wrap">
                        <i className="bi bi-geo-alt"></i>
                      </span>

                      <div className="contact-item-content">
                        <span>{hotelInfo.address}</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* Contact form */}
              <div className="col-lg-7">
                <div className="contact-form-box h-100">
                  <div className="contact-form-head">
                    <span className="section-kicker">{t.getInTouch}</span>
                    <h2>{t.conversationTitle}</h2>
                    <p>{t.contactFormText}</p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">{t.fullName}</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-control custom-input"
                          placeholder={t.yourFullName}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">{t.emailAddress}</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control custom-input"
                          placeholder={t.yourEmailAddress}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">{t.phoneNumber}</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-control custom-input"
                          placeholder={t.yourPhoneNumber}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">{t.subject}</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="form-control custom-input"
                          placeholder={t.messageSubject}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">{t.message}</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          className="form-control custom-input"
                          placeholder={t.writeYourMessage}
                          required
                        />
                      </div>

                      {statusMessage && (
                        <div className="col-12">
                          <div
                            className={`contact-message ${statusType}`}
                            role="status"
                          >
                            {statusMessage}
                          </div>
                        </div>
                      )}

                      <div className="col-12">
                        <div className="contact-form-actions">
                          <button
                            type="submit"
                            className="btn btn-gold contact-submit-btn"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="contact-spinner"></span>
                                {t.sendingRequest}
                              </>
                            ) : (
                              t.sendMessage
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Map section */}
            <div className="contact-map-section">
              <div className="contact-map-box">
                <div className="contact-map-head">
                  <span className="section-kicker">{t.ourLocation}</span>
                  <h2>{t.findUsEasily}</h2>
                  <p>{t.visitOurLocationText}</p>
                </div>

                <div className="contact-map-frame">
                  <iframe
                    src={hotelInfo.mapEmbed}
                    title={t.mapFrameTitle}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
