import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRoomSettings } from "../../../services/roomsApi";
import { logoutAdmin, updateRoom } from "../../services/AdminApi";
import { useLanguage } from "../../../context/useLanguage";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher/LanguageSwitcher";
import adminTranslations from "../../data/adminTranslations";
import "./AdminDashboard.css";

const roomNames = {
  "deluxe-queen-suite": "Deluxe Queen Suite",
  "deluxe-double-room": "Deluxe Double Room",
  "family-studio": "Family Studio",
  "deluxe-triple-room": "Deluxe Triple Room",
};

const AdminDashboard = ({ admin }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = adminTranslations[language] || adminTranslations.en;

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRoomSettings();
        setRooms(data);
      } catch (error) {
        setMessage(error.message);
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);
  const getAdminInitials = (email = "") => {
    const name = email.split("@")[0];

    return name
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };
  const availableRooms = useMemo(
    () => rooms.filter((room) => room.available).length,
    [rooms],
  );

  const averagePrice = useMemo(() => {
    if (!rooms.length) return 0;

    const total = rooms.reduce((sum, room) => sum + Number(room.price || 0), 0);

    return Math.round(total / rooms.length);
  }, [rooms]);

  const handleChange = (id, field, value) => {
    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        room.id === id
          ? {
              ...room,
              [field]: value,
            }
          : room,
      ),
    );
  };

  const handleSave = async (room) => {
    setSavingId(room.id);
    setMessage("");

    try {
      await updateRoom({
        id: room.id,
        price: room.price,
        available: room.available,
      });

      setMessage(`${roomNames[room.slug] || room.slug} ${t.savedSuccess}`);

      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("danger");
    } finally {
      setSavingId(null);
    }
  };

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

          <Link className="admin-nav-item active" to="/admin">
            <i className="bi bi-grid-1x2"></i>
            {t.rooms}
          </Link>

          <Link className="admin-nav-item" to="/admin/bookings">
            <i className="bi bi-calendar-check"></i>
            {t.bookings}
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
              <strong>{t.rooms}</strong>
            </div>

            <div className="admin-topbar-language">
              <LanguageSwitcher />
            </div>
            <div className="admin-profile">
              <div className="admin-profile-avatar">
                {getAdminInitials(admin?.email) || "A"}
              </div>

              <div className="admin-profile-details">
                <strong>{t.administrator}</strong>
                <span>{admin?.email}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          <div className="admin-page-header">
            <div>
              <span className="admin-eyebrow">{t.hotelManagement}</span>

              <h2>{t.roomsTitle}</h2>

              <p>{t.roomsIntro}</p>
            </div>
          </div>

          <div className="admin-stats">
            <article className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="bi bi-door-open"></i>
              </div>

              <div>
                <div className="admin-stat-label">{t.totalRooms}</div>

                <div className="admin-stat-value">{rooms.length}</div>
              </div>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="bi bi-check-circle"></i>
              </div>

              <div>
                <div className="admin-stat-label">{t.availableRooms}</div>

                <div className="admin-stat-value">{availableRooms}</div>
              </div>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-icon">
                <i className="bi bi-currency-euro"></i>
              </div>

              <div>
                <div className="admin-stat-label">{t.averagePrice}</div>

                <div className="admin-stat-value">€{averagePrice}</div>
              </div>
            </article>
          </div>

          {message && (
            <div className={`admin-message ${messageType}`}>
              <i
                className={
                  messageType === "success"
                    ? "bi bi-check-circle"
                    : "bi bi-exclamation-circle"
                }
              ></i>

              {message}
            </div>
          )}

          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h3>{t.inventory}</h3>
                <p>{t.publishHint}</p>
              </div>

              <span className="admin-room-count">
                {rooms.length} {t.roomsCount}
              </span>
            </div>

            {loading ? (
              <div className="admin-loading">{t.loadingRooms}</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t.room}</th>
                      <th>{t.priceNight}</th>
                      <th>{t.status}</th>
                      <th>{t.action}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id}>
                        <td>
                          <div className="admin-room-info">
                            <div className="admin-room-icon">
                              <i className="bi bi-door-closed"></i>
                            </div>

                            <div>
                              <div className="admin-room-name">
                                {roomNames[room.slug] || room.slug}
                              </div>

                              <div className="admin-room-slug">{room.slug}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-price-field">
                            <span className="admin-price-symbol">€</span>

                            <input
                              className="admin-price-input"
                              type="number"
                              min="0"
                              max="100000"
                              step="0.01"
                              value={room.price}
                              onChange={(event) =>
                                handleChange(
                                  room.id,
                                  "price",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                        </td>

                        <td>
                          <div className="admin-availability">
                            <label className="admin-switch">
                              <input
                                type="checkbox"
                                checked={room.available}
                                onChange={(event) =>
                                  handleChange(
                                    room.id,
                                    "available",
                                    event.target.checked,
                                  )
                                }
                              />

                              <span className="admin-switch-track"></span>
                            </label>

                            <span
                              className={`admin-status ${
                                room.available ? "available" : "unavailable"
                              }`}
                            >
                              {room.available ? t.available : t.unavailable}
                            </span>
                          </div>
                        </td>

                        <td>
                          <button
                            className="admin-save-button"
                            type="button"
                            disabled={
                              savingId === room.id ||
                              room.price === "" ||
                              Number(room.price) < 0
                            }
                            onClick={() => handleSave(room)}
                          >
                            <i className="bi bi-check2"></i>

                            {savingId === room.id ? t.saving : t.save}
                          </button>
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
    </main>
  );
};

export default AdminDashboard;
