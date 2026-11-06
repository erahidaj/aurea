const BookingSubmitButton = ({ t, isSubmitting }) => {
  return (
    <div className="col-12 d-flex justify-content-center">
      <button
        type="submit"
        className="btn btn-gold booking-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="booking-spinner"></span>
            {t.sendingRequest}
          </>
        ) : (
          t.submitReservation
        )}
      </button>
    </div>
  );
};

export default BookingSubmitButton;
