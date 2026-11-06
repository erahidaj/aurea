import "./AvailableRoomCard.css";

const getLocalizedValue = (value, language) => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    return value[language] || value.en || "";
  }

  return "";
};

const AvailableRoomCard = ({ room, language, selected, onSelect, t }) => {
  const roomName = getLocalizedValue(room.name, language);

  const description = getLocalizedValue(room.shortDescription, language);

  const image = room.coverImage || room.images?.[0];

  return (
    <article className={`availability-room-card ${selected ? "selected" : ""}`}>
      <div className="availability-room-image-wrap">
        <img
          className="availability-room-image"
          src={image}
          alt={roomName}
          loading="lazy"
          decoding="async"
        />

        {selected && (
          <span className="availability-selected-badge">
            <i className="bi bi-check2"></i>{t.selected}
          </span>
        )}
      </div>

      <div className="availability-room-content">
        <div className="availability-room-heading">
          <div>
            <h3>{roomName}</h3>

            <div className="availability-room-meta">
              {room.capacity && (
                <span>
                  <i className="bi bi-people"></i>
                  {room.capacity} {t.visitors}
                </span>
              )}

              {room.size && (
                <span>
                  <i className="bi bi-aspect-ratio"></i>
                  {room.size}
                </span>
              )}
            </div>
          </div>

          <div className="availability-room-price">
            <strong>€{room.price.toFixed(2)}</strong>

            <span>/{t.night}</span>
          </div>
        </div>

        {description && (
          <p className="availability-room-description">{description}</p>
        )}

        <div className="availability-room-footer">
          <div>
            <div className="availability-total">
              {t.total}: <strong>€{room.totalPrice.toFixed(2)}</strong>
            </div>

            <span className="availability-room-left">
              {room.availableCount} {t.availableCount}
            </span>
          </div>

          <button
            className="availability-select-button"
            type="button"
            onClick={() => onSelect(room)}
          >
            {selected ? (
              <>
                <i className="bi bi-check2-circle"></i>{t.selected}
              </>
            ) : (
              <>
                {t.selectThisRoom}
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default AvailableRoomCard;
