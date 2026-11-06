import "./WhatsAppButton.css";
import { useLanguage } from "../../../context/useLanguage";
import translations from "../../../data/translations";

const WhatsAppButton = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const phone = "355000000000";

  const message = t.whatsappMessage;

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.chatOnWhatsApp}
    >
      <i className="bi bi-whatsapp whatsapp-float-icon"></i>
    </a>
  );
};

export default WhatsAppButton;
