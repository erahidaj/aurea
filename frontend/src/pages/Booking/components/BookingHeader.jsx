const BookingHeader = ({ bookingSource, t }) => {
  return (
    <div className="text-center mb-4">
      <span className="section-kicker">{t.bookingKicker}</span>
      <h2 className="mb-2">
        {bookingSource === "room-card"
          ? t.bookingTitle
          : t.checkAvailabilityTitle}
      </h2>
      <p className="mb-0 booking-intro">
        {bookingSource === "room-card"
          ? t.bookingIntro
          : t.checkAvailabilityIntro}
      </p>
    </div>
  );
};

export default BookingHeader;
