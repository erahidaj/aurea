const SelectedRoomSummary = ({ selectedRoom, selectedRoomName, t }) => {
  if (!selectedRoom) return null;

  return (
    <>
      <div className="col-12 col-lg-6">
        <label className="form-label" htmlFor="selected-room">
          {t.selectedRoom}
        </label>
        <input
          id="selected-room"
          type="text"
          readOnly
          className="form-control custom-input"
          value={selectedRoomName}
        />
      </div>

      <div className="col-12 col-lg-6">
        <label className="form-label" htmlFor="room-price">
          {t.pricePerNight}
        </label>
        <input
          id="room-price"
          type="text"
          readOnly
          className="form-control custom-input"
          value={`€${selectedRoom.price}/${t.night}`}
        />
      </div>
    </>
  );
};

export default SelectedRoomSummary;
