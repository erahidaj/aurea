import { useEffect, useState } from "react";
import roomsData from "../../../../data/roomsData";
import { checkAvailability } from "../../../../services/roomsApi";
import AvailableRoomCard from "../AvailableRoomCard/AvailableRoomCard";
import translations from "../../../../data/translations";
import "./AvailabilitySearch.css";

const formatApiDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AvailabilitySearch = ({
  checkInDate,
  checkOutDate,
  rooms,
  adults,
  children,
  infants,
  language,
  preferredRoomId,
  selectedRoomId,
  onSelectRoom,
}) => {
  const t = translations[language] || translations.en;
  const [availableRooms, setAvailableRooms] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [hasSearched, setHasSearched] = useState(false);

  /*
   * When the user changes dates or occupancy values,
   * clear the previous availability results.
   */
  useEffect(() => {
    setAvailableRooms([]);
    setError("");
    setHasSearched(false);
  }, [checkInDate, checkOutDate, rooms, adults, children, infants]);

  const handleCheckAvailability = async () => {
    setError("");

    if (!checkInDate || !checkOutDate) {
      setError(t.selectDatesError);

      return;
    }

    if (checkOutDate <= checkInDate) {
      setError(t.checkoutAfterCheckinError);

      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const result = await checkAvailability({
        checkInDate: formatApiDate(checkInDate),
        checkOutDate: formatApiDate(checkOutDate),
        rooms,
        adults,
        children,
        infants,
        roomId: preferredRoomId || null,
      });

      /*
       * The API provides pricing and availability.
       * roomsData provides images, localized names, and room details.
       */
      const mergedRooms = result.rooms
        .map((availableRoom) => {
          const staticRoom = roomsData.find(
            (room) => room.slug === availableRoom.slug,
          );

          if (!staticRoom) {
            return null;
          }

          return {
            ...staticRoom,
            ...availableRoom,

            price: Number(availableRoom.price),

            totalPrice: Number(availableRoom.totalPrice),

            availableCount: Number(availableRoom.availableCount),
          };
        })
        .filter(Boolean);

      setAvailableRooms(mergedRooms);

      /*
       * If the selected room is no longer present
       * in the refreshed results, clear the selection.
       */
      const selectedStillAvailable = mergedRooms.some(
        (room) => room.id === Number(selectedRoomId),
      );

      if (selectedRoomId && !selectedStillAvailable) {
        onSelectRoom(null);
      }
    } catch {
      setAvailableRooms([]);

      setError(t.availabilityCheckError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="availability-search">
      <div className="availability-search-heading">
        <div>
          <span className="availability-search-kicker">{t.nextStep}</span>

          <h3>{t.checkAvailableRooms}</h3>

          <p>{t.availabilityCriteriaText}</p>
        </div>

        <button
          className="availability-check-button"
          type="button"
          onClick={handleCheckAvailability}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="availability-spinner"></span>
              {t.checkingAvailability}
            </>
          ) : (
            t.checkAvailability
          )}
        </button>
      </div>

      {error && (
        <div className="availability-error" role="alert">
          <i className="bi bi-exclamation-circle"></i>
          {error}
        </div>
      )}

      {hasSearched && !loading && !error && availableRooms.length === 0 && (
        <div className="availability-empty">
          <div className="availability-empty-icon">
            <i className="bi bi-calendar-x"></i>
          </div>

          <h4>{t.noAvailableRooms}</h4>

          <p>{t.noAvailableRoomsText}</p>
        </div>
      )}

      {availableRooms.length > 0 && (
        <div className="availability-results">
          <div className="availability-results-header">
            <strong>
              {availableRooms.length}{" "}
              {availableRooms.length === 1
                ? t.availableRoomType
                : t.availableRoomTypes}
            </strong>

            <span>{t.selectRoomToContinue}</span>
          </div>

          <div className="availability-room-list">
            {availableRooms.map((room) => (
              <AvailableRoomCard
                key={room.id}
                room={room}
                language={language}
                t={t}
                selected={Number(selectedRoomId) === room.id}
                onSelect={onSelectRoom}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AvailabilitySearch;
