import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { useLanguage } from "../../context/useLanguage";
import translations from "../../data/translations";
import roomsData from "../../data/roomsData";
import { getRoomSettings } from "../../services/roomsApi";

import BookingHeader from "./components/BookingHeader";
import SelectedRoomSummary from "./components/SelectedRoomSummary";
import BookingFormFields from "./components/BookingFormFields";
import BookingTotals from "./components/BookingTotals";
import BookingSubmitButton from "./components/BookingSubmitButton";
import AvailabilitySearch from "./components/AvailabilitySearch/AvailabilitySearch";

import "./Booking.css";

const API_URL = import.meta.env.VITE_API_URL;

const getLocalizedValue = (value, language) => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    return value[language] || value.en || "";
  }

  return "";
};

const formatDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB");
};

const Booking = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [searchParams] = useSearchParams();

  const roomIdParam = Number(searchParams.get("roomId")) || null;

  const bookingSource = searchParams.get("source") || "direct";

  /*
  |--------------------------------------------------------------------------
  | Room data retrieved from the database
  |--------------------------------------------------------------------------
  */

  const [roomSettings, setRoomSettings] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | Room selected after the availability check
  |--------------------------------------------------------------------------
  */

  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [roomVerified, setRoomVerified] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Post-booking completion state
  |--------------------------------------------------------------------------
  */

  const [bookingCompleted, setBookingCompleted] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Booking form state
  |--------------------------------------------------------------------------
  */

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [checkInDate, setCheckInDate] = useState(null);

  const [checkOutDate, setCheckOutDate] = useState(null);

  const [rooms, setRooms] = useState(1);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Dropdown controls
  |--------------------------------------------------------------------------
  */

  const [showRooms, setShowRooms] = useState(false);
  const [showGuests, setShowGuests] = useState(false);

  const roomsRef = useRef(null);
  const guestsRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Request state
  |--------------------------------------------------------------------------
  */

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formMessage, setFormMessage] = useState("");

  const [formStatus, setFormStatus] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Mobile date picker state
  |--------------------------------------------------------------------------
  */

  const [isMobileDate, setIsMobileDate] = useState(
    () => window.innerWidth <= 991,
  );

  /*
  |--------------------------------------------------------------------------
  | Load room pricing and configuration
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Merge static room content with database values
  |--------------------------------------------------------------------------
  |
  | roomsData provides:
  | - the room name
  | - images
  | - the description
  | - capacity
  |
  | The database provides:
  | - the current price
  | - availability
  |
  */

  const selectedRoom = useMemo(() => {
    const activeRoomId = Number(selectedRoomId);

    if (!activeRoomId) {
      return null;
    }

    const staticRoom = roomsData.find(
      (room) => Number(room.id) === activeRoomId,
    );

    if (!staticRoom) {
      return null;
    }

    const databaseRoom = roomSettings.find(
      (room) =>
        Number(room.id) === activeRoomId || room.slug === staticRoom.slug,
    );

    return {
      ...staticRoom,
      ...databaseRoom,

      id: staticRoom.id,
      slug: staticRoom.slug,
      name: staticRoom.name,

      image:
        staticRoom.coverImage || staticRoom.image || staticRoom.images?.[0],

      price: Number(databaseRoom?.price ?? staticRoom.price),

      available:
        databaseRoom?.available !== undefined
          ? Boolean(databaseRoom.available)
          : true,
    };
  }, [selectedRoomId, roomSettings]);

  const selectedRoomName = selectedRoom
    ? getLocalizedValue(selectedRoom.name, language)
    : "";

  /*
  |--------------------------------------------------------------------------
  | Adjust the adult count after a room is selected
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    setAdults((currentAdults) =>
      Math.max(
        1,
        Math.min(currentAdults, Number(selectedRoom.capacity) || currentAdults),
      ),
    );
  }, [selectedRoom]);

  /*
  |--------------------------------------------------------------------------
  | Clear error messages automatically
  |--------------------------------------------------------------------------
  |
  | The success message remains visible until the user starts a new booking.
  |
  */

  useEffect(() => {
    if (!formMessage || formStatus === "success") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFormMessage("");
      setFormStatus("");
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [formMessage, formStatus]);

  /*
  |--------------------------------------------------------------------------
  | Page-level event listeners
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roomsRef.current && !roomsRef.current.contains(event.target)) {
        setShowRooms(false);
      }

      if (guestsRef.current && !guestsRef.current.contains(event.target)) {
        setShowGuests(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowRooms(false);
        setShowGuests(false);
      }
    };

    const handleResize = () => {
      setIsMobileDate(window.innerWidth <= 991);
    };

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEscape);

    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Revalidate the room whenever the search criteria change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setRoomVerified(false);
    setSelectedRoomId("");
  }, [checkInDate, checkOutDate, rooms, adults, children, infants]);

  /*
  |--------------------------------------------------------------------------
  | Guest and room counters
  |--------------------------------------------------------------------------
  */

  const decreaseValue = (type) => {
    if (type === "rooms") {
      setRooms((previous) => Math.max(1, previous - 1));
    }

    if (type === "adults") {
      setAdults((previous) => Math.max(1, previous - 1));
    }

    if (type === "children") {
      setChildren((previous) => Math.max(0, previous - 1));
    }

    if (type === "infants") {
      setInfants((previous) => Math.max(0, previous - 1));
    }
  };

  const increaseValue = (type) => {
    if (type === "rooms") {
      setRooms((previous) => previous + 1);
    }

    if (type === "adults") {
      setAdults((previous) => previous + 1);
    }

    if (type === "children") {
      setChildren((previous) => previous + 1);
    }

    if (type === "infants") {
      setInfants((previous) => previous + 1);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Computed labels
  |--------------------------------------------------------------------------
  */

  const totalGuests = adults + children + infants;

  const roomLabel = `${rooms} ${rooms > 1 ? t.roomPlural : t.roomSingle}`;

  const guestLabel = `${totalGuests} ${
    totalGuests > 1 ? t.guestPlural : t.guestSingle
  }`;

  const guestDetails = [
    `${adults} ${adults > 1 ? t.adultPlural : t.adultSingle}`,

    children > 0
      ? `${children} ${children > 1 ? t.childPlural : t.childSingle}`
      : null,

    infants > 0
      ? `${infants} ${infants > 1 ? t.infantPlural : t.infantSingle}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  /*
  |--------------------------------------------------------------------------
  | Number of nights and estimated total
  |--------------------------------------------------------------------------
  */

  const totalNights =
    checkInDate && checkOutDate
      ? Math.max(
          0,
          Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const estimatedTotal =
    selectedRoom && totalNights > 0
      ? Number(selectedRoom.price) * totalNights * rooms
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Dropdown controls
  |--------------------------------------------------------------------------
  */

  const toggleRooms = () => {
    setShowRooms((previous) => {
      const next = !previous;

      if (next) {
        setShowGuests(false);
      }

      return next;
    });
  };

  const toggleGuests = () => {
    setShowGuests((previous) => {
      const next = !previous;

      if (next) {
        setShowRooms(false);
      }

      return next;
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Available-room selection
  |--------------------------------------------------------------------------
  */

  const handleSelectRoom = (room) => {
    if (!room) {
      setSelectedRoomId("");
      setRoomVerified(false);
      return;
    }

    setSelectedRoomId(Number(room.id));
    setRoomVerified(true);

    setFormMessage("");
    setFormStatus("");
  };

  /*
  |--------------------------------------------------------------------------
  | Submit the booking request
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!checkInDate || !checkOutDate) {
      setFormStatus("error");

      setFormMessage(t.selectDatesError);

      return;
    }

    if (checkOutDate <= checkInDate) {
      setFormStatus("error");

      setFormMessage(t.checkoutAfterCheckinError);

      return;
    }

    if (!roomVerified || !selectedRoom) {
      setFormStatus("error");

      setFormMessage(t.selectAvailableRoomError);

      return;
    }

    if (!fullName.trim()) {
      setFormStatus("error");

      setFormMessage(t.enterNameError);

      return;
    }

    if (!email.trim()) {
      setFormStatus("error");

      setFormMessage(t.enterEmailError);

      return;
    }

    setIsSubmitting(true);
    setFormMessage("");
    setFormStatus("");

    const bookingData = {
      guest: {
        fullName: fullName.trim(),
        email: email.trim(),
      },

      booking: {
        source: bookingSource,

        roomId: Number(selectedRoom.id),

        roomName: getLocalizedValue(selectedRoom.name, language),

        pricePerNight: Number(selectedRoom.price),

        checkInDate: formatDate(checkInDate),

        checkOutDate: formatDate(checkOutDate),

        nights: totalNights,

        rooms,

        adults,

        children,

        infants,

        totalGuests,

        estimatedTotal,
      },
    };

    try {
      const response = await fetch(`${API_URL}/create-booking.php`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",
        },

        body: JSON.stringify(bookingData),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(t.invalidServerResponse);
      }

      if (!response.ok || !data.success) {
        throw new Error(t.bookingError || t.bookingSendFailure);
      }

      setFormStatus("success");

      setFormMessage(t.bookingSuccess);

      setBookingCompleted(true);

      /*
      |--------------------------------------------------------------------------
      | Reset all form fields
      |--------------------------------------------------------------------------
      */

      setFullName("");
      setEmail("");

      setCheckInDate(null);
      setCheckOutDate(null);

      setRooms(1);
      setAdults(1);
      setChildren(0);
      setInfants(0);

      setSelectedRoomId("");
      setRoomVerified(false);

      setShowRooms(false);
      setShowGuests(false);
    } catch (error) {
      setFormStatus("error");

      setFormMessage(
        error.message === t.invalidServerResponse
          ? t.invalidServerResponse
          : t.serverError || t.bookingError || t.bookingSendFailure,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Start a new booking
  |--------------------------------------------------------------------------
  */

  const handleNewBooking = () => {
    setBookingCompleted(false);

    setFormMessage("");
    setFormStatus("");

    setFullName("");
    setEmail("");

    setCheckInDate(null);
    setCheckOutDate(null);

    setRooms(1);
    setAdults(1);
    setChildren(0);
    setInfants(0);

    setSelectedRoomId("");
    setRoomVerified(false);

    setShowRooms(false);
    setShowGuests(false);
  };

  return (
    <>
      <Helmet>
        <title>{t.bookingPageTitle}</title>

        <meta name="description" content={t.bookingMetaDescription} />

        <link rel="canonical" href="https://example.com/booking" />
      </Helmet>

      <section className="section-space page-top-space booking-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-7 col-lg-9">
              <div className="booking-box">
                <BookingHeader bookingSource={bookingSource} t={t} />

                {bookingCompleted ? (
                  <div className="booking-completed">
                    <div className="booking-message success" role="status">
                      {formMessage || t.bookingSuccess}
                    </div>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="btn btn-gold"
                        onClick={handleNewBooking}
                      >
                        {t.makeAnotherBooking}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="booking-form" onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <BookingFormFields
                        t={t}
                        showContactFields={roomVerified}
                        fullName={fullName}
                        setFullName={setFullName}
                        email={email}
                        setEmail={setEmail}
                        checkInDate={checkInDate}
                        setCheckInDate={setCheckInDate}
                        checkOutDate={checkOutDate}
                        setCheckOutDate={setCheckOutDate}
                        isMobileDate={isMobileDate}
                        rooms={rooms}
                        showRooms={showRooms}
                        toggleRooms={toggleRooms}
                        roomLabel={roomLabel}
                        roomsRef={roomsRef}
                        showGuests={showGuests}
                        toggleGuests={toggleGuests}
                        guestLabel={guestLabel}
                        guestDetails={guestDetails}
                        guestsRef={guestsRef}
                        adults={adults}
                        children={children}
                        infants={infants}
                        decreaseValue={decreaseValue}
                        increaseValue={increaseValue}
                      />

                      {!roomVerified && (
                        <AvailabilitySearch
                          checkInDate={checkInDate}
                          checkOutDate={checkOutDate}
                          rooms={rooms}
                          adults={adults}
                          children={children}
                          infants={infants}
                          language={language}
                          preferredRoomId={roomIdParam}
                          selectedRoomId={selectedRoomId}
                          onSelectRoom={handleSelectRoom}
                        />
                      )}

                      {roomVerified && selectedRoom && (
                        <>
                          <SelectedRoomSummary
                            selectedRoom={selectedRoom}
                            selectedRoomName={selectedRoomName}
                            t={t}
                          />

                          <BookingTotals
                            selectedRoom={selectedRoom}
                            totalNights={totalNights}
                            estimatedTotal={estimatedTotal}
                            t={t}
                          />

                          {formMessage && (
                            <div className="col-12">
                              <div
                                className={`booking-message ${formStatus}`}
                                role={
                                  formStatus === "error" ? "alert" : "status"
                                }
                              >
                                {formMessage}
                              </div>
                            </div>
                          )}

                          <BookingSubmitButton
                            t={t}
                            isSubmitting={isSubmitting}
                          />
                        </>
                      )}

                      {!roomVerified && formMessage && (
                        <div className="col-12">
                          <div
                            className={`booking-message ${formStatus}`}
                            role="alert"
                          >
                            {formMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Booking;
