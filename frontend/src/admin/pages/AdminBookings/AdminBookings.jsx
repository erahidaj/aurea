import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/useLanguage";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher/LanguageSwitcher";
import adminTranslations from "../../data/adminTranslations";

import AdminConfirmModal from "../../../components/AdminConfirmModal/AdminConfirmModal";

import {
  getAdminBookings,
  logoutAdmin,
  updateBookingStatus,
} from "../../services/AdminApi";

import "../AdminDashboard/AdminDashboard.css";
import "./AdminBookings.css";

const roomNames = {
  "deluxe-queen-suite": "Deluxe Queen Suite",
  "deluxe-double-room": "Deluxe Double Room",
  "family-studio": "Family Studio",
  "deluxe-triple-room": "Deluxe Triple Room",
};

const emptyStatistics = {
  total: 0,
  pending: 0,
  confirmed: 0,
  rejected: 0,
  cancelled: 0,
  completed: 0,
};

const formatDate = (value, locale = "sq-AL") => {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCreatedAt = (value, locale = "sq-AL") => {
  if (!value) {
    return "—";
  }

  const normalizedValue = value.replace(" ", "T");

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getInitials = (value = "") => {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "G";
};

const getAdminInitials = (email = "") => {
  const username = email.split("@")[0] || "";

  return (
    username
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "A"
  );
};

const AdminBookings = ({ admin }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = adminTranslations[language] || adminTranslations.en;
  const locale =
    language === "al" ? "sq-AL" : language === "it" ? "it-IT" : "en-GB";

  const statusLabels = {
    pending: t.pending,
    confirmed: t.confirmed,
    rejected: t.rejected,
    cancelled: t.cancelled,
    completed: t.completed,
  };

  const statusOptions = [
    { value: "", label: t.all },
    { value: "pending", label: t.pending },
    { value: "confirmed", label: t.confirmedPlural },
    { value: "rejected", label: t.rejectedPlural },
    { value: "cancelled", label: t.cancelledPlural },
    { value: "completed", label: t.completedPlural },
  ];

  const statusModalSettings = {
    confirmed: {
      title: t.confirmBooking,
      action: t.confirmAction,
      confirmLabel: t.yesConfirm,
      variant: "success",
    },
    rejected: {
      title: t.rejectBooking,
      action: t.rejectAction,
      confirmLabel: t.yesReject,
      variant: "danger",
    },
    cancelled: {
      title: t.cancelBooking,
      action: t.cancelAction,
      confirmLabel: t.yesCancel,
      variant: "danger",
    },
    completed: {
      title: t.completeBooking,
      action: t.completeAction,
      confirmLabel: t.yesComplete,
      variant: "success",
    },
  };

  const [bookings, setBookings] = useState([]);

  const [statistics, setStatistics] = useState(emptyStatistics);

  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Professional confirmation modal
  |--------------------------------------------------------------------------
  */

  const [confirmation, setConfirmation] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load bookings
  |--------------------------------------------------------------------------
  */

  const loadBookings = useCallback(
    async (status = selectedStatus, clearMessage = true) => {
      setLoading(true);

      if (clearMessage) {
        setMessage("");
        setMessageType("");
      }

      try {
        const data = await getAdminBookings(status);

        setBookings(Array.isArray(data.bookings) ? data.bookings : []);

        setStatistics({
          ...emptyStatistics,
          ...(data.statistics || {}),
        });

        return true;
      } catch (error) {
        setMessage(error.message || t.bookingsLoadError);

        setMessageType("danger");

        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedStatus, t.bookingsLoadError],
  );

  useEffect(() => {
    loadBookings(selectedStatus, true);
  }, [selectedStatus, loadBookings]);

  /*
  |--------------------------------------------------------------------------
  | Open the confirmation modal
  |--------------------------------------------------------------------------
  */

  const requestStatusUpdate = (booking, newStatus) => {
    if (actionLoading || updatingId !== null) {
      return;
    }

    const settings = statusModalSettings[newStatus];

    if (!settings) {
      setMessage(t.invalidStatus);

      setMessageType("danger");

      return;
    }

    const bookingCode = booking.bookingCode || `#${booking.id}`;

    setConfirmation({
      booking,
      newStatus,
      title: settings.title,
      confirmLabel: settings.confirmLabel,
      variant: settings.variant,

      message:
        `${t.areYouSure} ${settings.action} ` + `rezervimin ${bookingCode}?`,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Close the confirmation modal
  |--------------------------------------------------------------------------
  */

  const closeConfirmationModal = () => {
    if (actionLoading) {
      return;
    }

    setConfirmation(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Update the booking status in the backend
  |--------------------------------------------------------------------------
  */

  const handleStatusUpdate = async (booking, newStatus) => {
    setUpdatingId(booking.id);

    setMessage("");
    setMessageType("");

    try {
      const result = await updateBookingStatus({
        bookingId: booking.id,
        status: newStatus,
        adminNotes: "",
      });

      /*
       * Update the status immediately
       * in the dashboard table.
       */

      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === booking.id
            ? {
                ...currentBooking,

                status: newStatus,

                adminNotes:
                  result.booking?.adminNotes ?? currentBooking.adminNotes,
              }
            : currentBooking,
        ),
      );

      /*
       * Update the statistics
       * immediately in the user interface.
       */

      setStatistics((currentStatistics) => {
        const previousStatus = booking.status;

        const nextStatistics = {
          ...currentStatistics,
        };

        if (
          Object.prototype.hasOwnProperty.call(nextStatistics, previousStatus)
        ) {
          nextStatistics[previousStatus] = Math.max(
            0,
            Number(nextStatistics[previousStatus] || 0) - 1,
          );
        }

        if (Object.prototype.hasOwnProperty.call(nextStatistics, newStatus)) {
          nextStatistics[newStatus] =
            Number(nextStatistics[newStatus] || 0) + 1;
        }

        return nextStatistics;
      });

      setMessage(result.message || t.statusSuccess);

      /*
       * If the status was saved but the email
       * was not sent, display a warning.
       */

      if (result.emailSent === false) {
        setMessageType("warning");
      } else {
        setMessageType("success");
      }

      /*
       * Synchronize the data with MySQL again.
       */

      await loadBookings(selectedStatus, false);

      return true;
    } catch (error) {
      setMessage(error.message || t.statusError);

      setMessageType("danger");

      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Confirm the requested action from the modal
  |--------------------------------------------------------------------------
  */

  const confirmStatusUpdate = async () => {
    if (!confirmation || actionLoading) {
      return;
    }

    setActionLoading(true);

    try {
      const wasSuccessful = await handleStatusUpdate(
        confirmation.booking,
        confirmation.newStatus,
      );

      if (wasSuccessful) {
        setConfirmation(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Sign out
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error(error);
    } finally {
      navigate("/admin/login", {
        replace: true,
      });
    }
  };

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <i className="bi bi-stars"></i>
          </div>

          <div>
            <h1>Aurea Hotel</h1>
            <p>{t.managementConsole}</p>
          </div>
        </div>

        <nav className="admin-navigation">
          <span className="admin-nav-label">{t.workspace}</span>

          <Link className="admin-nav-item" to="/admin">
            <i className="bi bi-grid-1x2"></i>
            {t.rooms}
          </Link>

          <Link className="admin-nav-item active" to="/admin/bookings">
            <i className="bi bi-calendar-check"></i>
            {t.bookings}
            {statistics.pending > 0 && (
              <span className="admin-nav-count">{statistics.pending}</span>
            )}
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout" type="button" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            {t.logout}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-content">
            <div className="admin-breadcrumb">
              <span>{t.dashboard}</span>

              <i className="bi bi-chevron-right"></i>

              <strong>{t.bookings}</strong>
            </div>

            <div className="admin-topbar-language">
              <LanguageSwitcher />
            </div>
            <div className="admin-profile">
              <div className="admin-profile-avatar">
                {getAdminInitials(admin?.email)}
              </div>

              <div className="admin-profile-details">
                <strong>{t.administrator}</strong>

                <span>{admin?.email || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          <div className="admin-page-header">
            <div>
              <span className="admin-eyebrow">{t.hotelManagement}</span>

              <h2>{t.bookings}</h2>

              <p>{t.bookingsIntro}</p>
            </div>

            <button
              className="bookings-refresh"
              type="button"
              onClick={() => loadBookings(selectedStatus, true)}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>

              {loading ? t.loading : t.refresh}
            </button>
          </div>

          <div className="admin-stats bookings-stats">
            <article className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="bi bi-calendar3"></i>
              </div>

              <div>
                <div className="admin-stat-label">{t.total}</div>

                <div className="admin-stat-value">{statistics.total}</div>
              </div>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-icon pending">
                <i className="bi bi-clock"></i>
              </div>

              <div>
                <div className="admin-stat-label">{t.pending}</div>

                <div className="admin-stat-value">{statistics.pending}</div>
              </div>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-icon confirmed">
                <i className="bi bi-check2-circle"></i>
              </div>

              <div>
                <div className="admin-stat-label">{t.confirmedPlural}</div>

                <div className="admin-stat-value">{statistics.confirmed}</div>
              </div>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-icon rejected">
                <i className="bi bi-x-circle"></i>
              </div>

              <div>
                <div className="admin-stat-label">{t.rejectedPlural}</div>

                <div className="admin-stat-value">{statistics.rejected}</div>
              </div>
            </article>
          </div>

          {message && (
            <div
              className={`admin-message ${messageType || "danger"}`}
              role={messageType === "danger" ? "alert" : "status"}
            >
              <i
                className={
                  messageType === "success"
                    ? "bi bi-check-circle"
                    : messageType === "warning"
                      ? "bi bi-exclamation-triangle"
                      : "bi bi-exclamation-circle"
                }
              ></i>

              {message}
            </div>
          )}

          <div className="admin-panel">
            <div className="admin-panel-header bookings-panel-header">
              <div>
                <h3>{t.requests}</h3>

                <p>{t.pendingFirst}</p>
              </div>

              <label className="bookings-filter">
                <span>{t.filterStatus}</span>

                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading ? (
              <div className="admin-loading">{t.loadingBookings}</div>
            ) : bookings.length === 0 ? (
              <div className="bookings-empty">
                <div className="bookings-empty-icon">
                  <i className="bi bi-calendar-x"></i>
                </div>

                <h3>{t.noBookings}</h3>

                <p>{t.noBookingsText}</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table bookings-table">
                  <thead>
                    <tr>
                      <th>{t.booking}</th>
                      <th>{t.client}</th>
                      <th>{t.room}</th>
                      <th>{t.stay}</th>
                      <th>{t.totalPrice}</th>
                      <th>{t.status}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="booking-code">
                            {booking.bookingCode}
                          </div>

                          <div className="booking-created">
                            {t.created}:{" "}
                            {formatCreatedAt(booking.createdAt, locale)}
                          </div>
                        </td>

                        <td>
                          <div className="booking-guest">
                            <div className="booking-guest-avatar">
                              {getInitials(booking.guestName)}
                            </div>

                            <div>
                              <strong>{booking.guestName}</strong>

                              <a href={`mailto:${booking.guestEmail}`}>
                                {booking.guestEmail}
                              </a>

                              {booking.guestPhone && (
                                <a href={`tel:${booking.guestPhone}`}>
                                  {booking.guestPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="booking-room-name">
                            {roomNames[booking.roomName] || booking.roomName}
                          </div>

                          <div className="booking-room-meta">
                            {booking.roomsCount} {t.roomsUnit} ·{" "}
                            {booking.adults} {t.adults}
                          </div>
                        </td>

                        <td>
                          <div className="booking-dates">
                            <strong>
                              {formatDate(booking.checkIn, locale)}
                            </strong>

                            <i className="bi bi-arrow-right"></i>

                            <strong>
                              {formatDate(booking.checkOut, locale)}
                            </strong>
                          </div>

                          <div className="booking-room-meta">
                            {booking.nights} {t.nights}
                          </div>
                        </td>

                        <td>
                          <div className="booking-total">
                            €{Number(booking.totalPrice).toFixed(2)}
                          </div>

                          <div className="booking-room-meta">
                            €{Number(booking.pricePerNight).toFixed(2)}
                            {t.perNight}
                          </div>
                        </td>

                        <td>
                          <span className={`booking-status ${booking.status}`}>
                            <span></span>

                            {statusLabels[booking.status] || booking.status}
                          </span>
                        </td>

                        <td>
                          <div className="booking-actions">
                            {booking.status === "pending" && (
                              <>
                                <button
                                  className="booking-action confirm"
                                  type="button"
                                  disabled={
                                    updatingId === booking.id || actionLoading
                                  }
                                  onClick={() =>
                                    requestStatusUpdate(booking, "confirmed")
                                  }
                                >
                                  <i className="bi bi-check2"></i>
                                  {t.confirm}
                                </button>

                                <button
                                  className="booking-action reject"
                                  type="button"
                                  disabled={
                                    updatingId === booking.id || actionLoading
                                  }
                                  onClick={() =>
                                    requestStatusUpdate(booking, "rejected")
                                  }
                                >
                                  <i className="bi bi-x"></i>
                                  {t.reject}
                                </button>
                              </>
                            )}

                            {booking.status === "confirmed" && (
                              <>
                                <button
                                  className="booking-action complete"
                                  type="button"
                                  disabled={
                                    updatingId === booking.id || actionLoading
                                  }
                                  onClick={() =>
                                    requestStatusUpdate(booking, "completed")
                                  }
                                >
                                  <i className="bi bi-check-circle"></i>
                                  {t.complete}
                                </button>

                                <button
                                  className="booking-action cancel"
                                  type="button"
                                  disabled={
                                    updatingId === booking.id || actionLoading
                                  }
                                  onClick={() =>
                                    requestStatusUpdate(booking, "cancelled")
                                  }
                                >
                                  <i className="bi bi-slash-circle"></i>
                                  {t.cancel}
                                </button>
                              </>
                            )}

                            {updatingId === booking.id && (
                              <span className="booking-updating">
                                {t.saving}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      <AdminConfirmModal
        isOpen={Boolean(confirmation)}
        title={confirmation?.title || ""}
        message={confirmation?.message || ""}
        confirmLabel={confirmation?.confirmLabel || t.confirm}
        cancelLabel={t.goBack}
        eyebrow={t.confirmationRequired}
        loadingLabel={t.saving}
        closeLabel={t.close}
        variant={confirmation?.variant || "success"}
        loading={actionLoading}
        onConfirm={confirmStatusUpdate}
        onClose={closeConfirmationModal}
      />
    </main>
  );
};

export default AdminBookings;
