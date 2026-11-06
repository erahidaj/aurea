import { Link } from "react-router-dom";
import { useLanguage } from "../../../context/useLanguage";
import translations from "../../../data/translations";
import "./RoomCard.css";

const getLocalizedValue = (value, language) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    return value[language] || value.en || "";
  }

  return "";
};

const RoomCard = ({ room, variant = "default" }) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const isCompact = variant === "compact";
  const isListing = variant === "listing";

  const roomName = getLocalizedValue(room.name, language);
  const roomShortDescription = getLocalizedValue(
    room.shortDescription,
    language,
  );

  return (
    <article className={`room-card h-100 ${variant}`}>
      <div className="room-image-wrap">
        <img
          src={room.image}
          alt={roomName}
          className="room-image"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        {room.featured && (
          <span className="room-badge">
            <i className="bi bi-star-fill"></i>
            {t.featured}
          </span>
        )}
      </div>

      <div className="room-card-body">
        <div className="room-card-head">
          <h5 className="room-title">{roomName}</h5>

          <span className="room-price">
            €{room.price}
            <small>/{t.night}</small>
          </span>
        </div>

        <p className="room-description">
          <i className="bi bi-info-circle"></i>
          <span>{roomShortDescription}</span>
        </p>

        <div className="room-meta">
          {room.capacity && (
            <span className="meta-item">
              <i className="bi bi-people"></i>
              {room.capacity} {t.guests}
            </span>
          )}

          {room.size && (
            <span className="meta-item">
              <i className="bi bi-aspect-ratio"></i>
              {room.size}
            </span>
          )}

          <span className="meta-item">
            <i className="bi bi-wifi"></i>
            WiFi
          </span>
        </div>

        {!isCompact && !isListing && room.highlights?.length > 0 && (
          <div className="room-features">
            {room.highlights.map((item, index) => (
              <span key={index} className="room-feature-pill">
                <i className="bi bi-check2"></i>
                {getLocalizedValue(item, language)}
              </span>
            ))}
          </div>
        )}

        <div className="room-actions">
          <Link
            to={`/rooms/${room.slug}`}
            className="btn btn-outline-dark room-btn"
          >
            {t.details}
          </Link>

          <Link
            to={`/booking?roomId=${room.id}&source=room-card`}
            className="btn btn-gold room-btn"
          >
            {t.bookNow}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default RoomCard;
