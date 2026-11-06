import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import translations from "../../data/translations";
import roomsData from "../../data/roomsData";
import { getRoomSettings } from "../../services/roomsApi";
import "./RoomDetails.css";

const getLocalizedValue = (value, language) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    return value[language] || value.en || "";
  }

  return "";
};

const getLocalizedArray = (value, language) => {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    return value[language] || value.en || [];
  }

  return [];
};

const RoomDetails = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [roomSettings, setRoomSettings] = useState([]);

  useEffect(() => {
    const loadRoomSettings = async () => {
      try {
        const settings = await getRoomSettings();
        setRoomSettings(settings);
      } catch (error) {
        console.error("Room pricing could not be loaded:", error);
      }
    };

    loadRoomSettings();
  }, []);

  const room = useMemo(() => {
    const staticRoom = roomsData.find((item) => item.slug === slug);

    if (!staticRoom) {
      return null;
    }

    const databaseRoom = roomSettings.find(
      (item) => item.slug === staticRoom.slug,
    );

    return {
      ...staticRoom,
      price: databaseRoom?.price ?? staticRoom.price,
      available: databaseRoom?.available ?? true,
    };
  }, [slug, roomSettings]);

  if (!room) {
    return (
      <section className="section-space page-top-space room-details-page">
        <div className="container">
          <div className="details-summary-card text-center">
            <span className="section-kicker">{t.roomDetails}</span>

            <h2 className="mb-2">{t.roomNotFound}</h2>

            <p className="mb-4">{t.roomNotFoundText}</p>

            <Link to="/rooms" className="btn btn-gold">
              {t.backToRooms}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const roomName = getLocalizedValue(room.name, language);

  const roomType = getLocalizedValue(room.type, language);

  const roomDescription = getLocalizedValue(room.description, language);

  const roomViews = getLocalizedArray(room.views, language);

  const roomBathroom = getLocalizedArray(room.bathroom, language);

  const roomKitchen = getLocalizedArray(room.kitchen, language);

  const roomFacilities = getLocalizedArray(room.facilities, language);

  const mainHighlights = getLocalizedArray(room.highlights, language).slice(
    0,
    8,
  );

  const thumbnails = room.images || [];

  const bedText =
    room.beds
      ?.map((bed) => {
        const bedType = getLocalizedValue(bed.type, language);

        return `${bed.quantity} ${bedType}`;
      })
      .join(` ${t.and} `) || "";

  return (
    <section className="section-space page-top-space room-details-page">
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-7">
            <div className="details-gallery-card">
              <div
                id={`roomCarousel-${room.id}`}
                className="carousel slide details-image-wrap"
                data-bs-ride="carousel"
                data-bs-interval="4000"
              >
                {room.images?.length > 1 && (
                  <div className="carousel-indicators">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        data-bs-target={`#roomCarousel-${room.id}`}
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        aria-current={index === 0 ? "true" : undefined}
                        aria-label={`${t.slide} ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="carousel-inner">
                  {room.images?.map((image, index) => (
                    <div
                      key={index}
                      className={`carousel-item ${index === 0 ? "active" : ""}`}
                    >
                      <img
                        src={image}
                        alt={`${roomName} ${index + 1}`}
                        className="d-block w-100 details-image"
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "auto"}
                      />
                    </div>
                  ))}
                </div>

                {room.images?.length > 1 && (
                  <>
                    <button
                      className="carousel-control-prev booking-arrow"
                      type="button"
                      data-bs-target={`#roomCarousel-${room.id}`}
                      data-bs-slide="prev"
                      aria-label={t.previousImage}
                    >
                      <span className="booking-arrow-circle">
                        <i className="bi bi-chevron-left"></i>
                      </span>
                    </button>

                    <button
                      className="carousel-control-next booking-arrow"
                      type="button"
                      data-bs-target={`#roomCarousel-${room.id}`}
                      data-bs-slide="next"
                      aria-label={t.nextImage}
                    >
                      <span className="booking-arrow-circle">
                        <i className="bi bi-chevron-right"></i>
                      </span>
                    </button>
                  </>
                )}
              </div>

              {thumbnails.length > 1 && (
                <div className="details-thumbs">
                  {thumbnails.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`details-thumb ${index === 0 ? "active" : ""}`}
                      data-bs-target={`#roomCarousel-${room.id}`}
                      data-bs-slide-to={index}
                      aria-label={`${t.thumbnail} ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${roomName} thumbnail ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="details-summary-card">
              <span className="section-kicker">
                {t.roomDetails}
              </span>

              <div className="details-header">
                <h1 className="details-title">{roomName}</h1>

                <div className="details-price">
                  €{room.price}
                  <span>/{t.night}</span>
                </div>
              </div>

              <p className="details-text">{roomDescription}</p>

              <div className="details-meta-grid">
                {roomType && (
                  <div className="details-meta-item">
                    <i className="bi bi-door-open"></i>
                    <span>{roomType}</span>
                  </div>
                )}

                {room.size && (
                  <div className="details-meta-item">
                    <i className="bi bi-aspect-ratio"></i>
                    <span>{room.size}</span>
                  </div>
                )}

                {room.capacity && (
                  <div className="details-meta-item">
                    <i className="bi bi-people"></i>

                    <span>
                      {room.capacity} {t.guests}
                    </span>
                  </div>
                )}

                {bedText && (
                  <div className="details-meta-item">
                    <i className="bi bi-bed"></i>
                    <span>{bedText}</span>
                  </div>
                )}
              </div>

              {mainHighlights.length > 0 && (
                <div className="details-block">
                  <h4 className="details-block-title">
                    {t.highlights}
                  </h4>

                  <div className="details-tags">
                    {mainHighlights.map((item, index) => (
                      <span key={index} className="details-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {roomViews.length > 0 && (
                <div className="details-block">
                  <h4 className="details-block-title">{t.view}</h4>

                  <ul className="details-list">
                    {roomViews.map((item, index) => (
                      <li key={index}>
                        <i className="bi bi-check2"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {roomBathroom.length > 0 && (
                <div className="details-block">
                  <h4 className="details-block-title">
                    {t.privateBathroom}
                  </h4>

                  <ul className="details-list">
                    {roomBathroom.map((item, index) => (
                      <li key={index}>
                        <i className="bi bi-check2"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {roomKitchen.length > 0 && (
                <div className="details-block">
                  <h4 className="details-block-title">
                    {t.privateKitchen}
                  </h4>

                  <ul className="details-list">
                    {roomKitchen.map((item, index) => (
                      <li key={index}>
                        <i className="bi bi-check2"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {roomFacilities.length > 0 && (
                <div className="details-block">
                  <h4 className="details-block-title">
                    {t.facilities}
                  </h4>

                  <ul className="details-list">
                    {roomFacilities.map((item, index) => (
                      <li key={index}>
                        <i className="bi bi-check2"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="details-actions">
                <Link
                  to={`/booking?roomId=${room.id}&source=room-details`}
                  className="btn btn-gold"
                >
                  {t.reserveThisRoom}
                </Link>

                <Link to="/rooms" className="btn btn-outline-dark">
                  {t.backToRooms}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomDetails;
