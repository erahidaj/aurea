const BookingTotals = ({ selectedRoom, totalNights, estimatedTotal, t }) => {
  if (!selectedRoom || totalNights <= 0) return null;

  return (
    <>
      <div className="col-12 col-lg-6">
        <label className="form-label" htmlFor="booking-nights">
          {t.totalNights}
        </label>
        <input
          id="booking-nights"
          type="text"
          readOnly
          className="form-control custom-input"
          value={totalNights}
        />
      </div>

      <div className="col-12 col-lg-6">
        <label className="form-label" htmlFor="estimated-total">
          {t.estimatedTotal}
        </label>
        <input
          id="estimated-total"
          type="text"
          readOnly
          className="form-control custom-input"
          value={`€${estimatedTotal}`}
        />
      </div>
    </>
  );
};

export default BookingTotals;
