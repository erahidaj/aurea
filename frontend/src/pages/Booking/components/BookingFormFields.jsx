import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingFormFields = ({
  t,
  fullName,
  setFullName,
  email,
  setEmail,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  isMobileDate,
  rooms,
  showRooms,
  toggleRooms,
  roomLabel,
  roomsRef,
  showGuests,
  toggleGuests,
  guestLabel,
  guestDetails,
  guestsRef,
  adults,
  children,
  infants,
  decreaseValue,
  increaseValue,
}) => {
  return (
    <>
      <div className="col-12 col-lg-6">
        <label className="form-label" htmlFor="booking-name">
          {t.fullName}
        </label>
        <input
          id="booking-name"
          type="text"
          autoComplete="new-password"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="form-control custom-input"
          placeholder={t.enterFullName}
        />
      </div>

      <div className="col-12 col-lg-6">
        <label className="form-label" htmlFor="booking-email">
          {t.email}
        </label>
        <input
          id="booking-email"
          type="email"
          autoComplete="new-password"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control custom-input"
          placeholder={t.enterEmail}
        />
      </div>

      <div className="col-12 col-lg-6">
        <label className="form-label">{t.checkIn}</label>
        <DatePicker
          selected={checkInDate}
          onChange={(date) => {
            setCheckInDate(date);
            if (checkOutDate && date && checkOutDate < date) {
              setCheckOutDate(null);
            }
          }}
          minDate={new Date()}
          dateFormat="MM/dd/yyyy"
          placeholderText={t.selectCheckInDate}
          className="form-control custom-input booking-datepicker-input"
          wrapperClassName="booking-datepicker-wrapper"
          popperClassName="booking-datepicker-popper"
          calendarClassName="booking-datepicker-calendar"
          popperPlacement="bottom-start"
          withPortal={isMobileDate}
          required
        />
      </div>

      <div className="col-12 col-lg-6">
        <label className="form-label">{t.checkOut}</label>
        <DatePicker
          selected={checkOutDate}
          onChange={(date) => setCheckOutDate(date)}
          minDate={checkInDate || new Date()}
          dateFormat="MM/dd/yyyy"
          placeholderText={t.selectCheckOutDate}
          className="form-control custom-input booking-datepicker-input"
          wrapperClassName="booking-datepicker-wrapper"
          popperClassName="booking-datepicker-popper"
          calendarClassName="booking-datepicker-calendar"
          popperPlacement="bottom-start"
          withPortal={isMobileDate}
          required
        />
      </div>

      <div className="col-12 col-lg-6 dropdown-col">
        <label className="form-label">{t.roomsLabel}</label>

        <div className="selector-box" ref={roomsRef}>
          <button
            type="button"
            className={`selector-summary ${showRooms ? "active" : ""}`}
            onClick={toggleRooms}
            aria-expanded={showRooms}
            aria-haspopup="true"
          >
            <div className="selector-summary-content">
              <span className="selector-main-label">{roomLabel}</span>
            </div>

            <span className="selector-arrow" aria-hidden="true">
              {showRooms ? "−" : "+"}
            </span>
          </button>

          {showRooms && (
            <div className="selector-dropdown">
              <div className="selector-row selector-row-last">
                <div className="selector-info">
                  <span className="selector-label">{t.roomsLabel}</span>
                  <span className="selector-note">{t.selectNumberOfRooms}</span>
                </div>

                <div className="counter">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => decreaseValue("rooms")}
                  >
                    −
                  </button>

                  <span className="counter-value">{rooms}</span>

                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => increaseValue("rooms")}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="col-12 col-lg-6 dropdown-col">
        <label className="form-label">{t.guestsLabel}</label>

        <div className="selector-box" ref={guestsRef}>
          <button
            type="button"
            className={`selector-summary ${showGuests ? "active" : ""}`}
            onClick={toggleGuests}
            aria-expanded={showGuests}
            aria-haspopup="true"
          >
            <div className="selector-summary-content">
              <span className="selector-main-label">{guestLabel}</span>

              {guestDetails && (
                <span className="selector-subtext">{guestDetails}</span>
              )}
            </div>

            <span className="selector-arrow" aria-hidden="true">
              {showGuests ? "−" : "+"}
            </span>
          </button>

          {showGuests && (
            <div className="selector-dropdown">
              <div className="selector-row">
                <div className="selector-info">
                  <span className="selector-label">{t.adults}</span>
                  <span className="selector-note">{t.age13Plus}</span>
                </div>

                <div className="counter">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => decreaseValue("adults")}
                  >
                    −
                  </button>

                  <span className="counter-value">{adults}</span>

                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => increaseValue("adults")}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="selector-row">
                <div className="selector-info">
                  <span className="selector-label">{t.children}</span>
                  <span className="selector-note">{t.age2To12}</span>
                </div>

                <div className="counter">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => decreaseValue("children")}
                  >
                    −
                  </button>

                  <span className="counter-value">{children}</span>

                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => increaseValue("children")}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="selector-row selector-row-last">
                <div className="selector-info">
                  <span className="selector-label">{t.infants}</span>
                  <span className="selector-note">{t.under2Years}</span>
                </div>

                <div className="counter">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => decreaseValue("infants")}
                  >
                    −
                  </button>

                  <span className="counter-value">{infants}</span>

                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => increaseValue("infants")}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingFormFields;
