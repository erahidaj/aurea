import { useEffect, useState } from "react";
import HeroSection from "../../components/home/HeroSection/HeroSection";
import SectionTitle from "../../components/common/SectionTitle/SectionTitle";
import RoomCard from "../../components/rooms/RoomCard/RoomCard";
import roomsData from "../../data/roomsData";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import translations from "../../data/translations";
import { getRoomSettings } from "../../services/roomsApi";
import { Helmet } from "react-helmet-async";
import "./Home.css";

const Home = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [roomSettings, setRoomSettings] = useState([]);

  useEffect(() => {
    const loadRoomPrices = async () => {
      try {
        const settings = await getRoomSettings();
        setRoomSettings(settings);
      } catch (error) {
        console.error("Room pricing could not be loaded:", error);
      }
    };

    loadRoomPrices();
  }, []);

  const featuredRooms = roomsData
    .filter((room) => room.featured)
    .slice(0, 3)
    .map((room) => {
      const databaseRoom = roomSettings.find((item) => item.slug === room.slug);

      return {
        id: room.id,
        slug: room.slug,
        name: room.name,
        image: room.coverImage || room.images?.[0],
        shortDescription: room.shortDescription,
        price: databaseRoom?.price ?? room.price,
        size: room.size,
        capacity: room.capacity,
        featured: room.featured,
      };
    });

  return (
    <>
      <Helmet>
        <title>{t.homePageTitle}</title>

        <meta name="description" content={t.homeMetaDescription} />

        <link rel="canonical" href="https://example.com/" />
      </Helmet>

      <HeroSection />

      <section className="section-space home-section home-about bg-white">
        <div className="container">
          <SectionTitle
            subtitle={t.aboutSubtitle}
            title={t.aboutTitle}
            center
          />

          <div className="row g-4">
            <div className="col-md-6 col-xl-4">
              <div className="info-box h-100">
                <div className="info-icon">
                  <i className="bi bi-stars"></i>
                </div>

                <h5>{t.luxuryComfort}</h5>
                <p>{t.luxuryComfortText}</p>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="info-box h-100">
                <div className="info-icon">
                  <i className="bi bi-wifi"></i>
                </div>

                <h5>{t.modernAmenities}</h5>
                <p>{t.modernAmenitiesText}</p>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="info-box h-100">
                <div className="info-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>

                <h5>{t.primeLocation}</h5>
                <p>{t.primeLocationText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space home-section home-featured section-light">
        <div className="container">
          <SectionTitle
            subtitle={t.featuredRooms}
            title={t.featuredRoomsTitle}
            center
          />

          <div className="row g-4">
            {featuredRooms.map((room) => (
              <div key={room.id} className="col-md-6 col-lg-4">
                <RoomCard room={room} variant="compact" />
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link to="/rooms" className="btn btn-gold px-4">
              {t.viewAllRooms}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space home-section home-cta bg-white">
        <div className="container">
          <div className="cta-banner">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="section-kicker">{t.ctaKicker}</span>

                <h2 className="mb-2">{t.ctaTitle}</h2>
                <p className="mb-0">{t.ctaText}</p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <Link
                  to="/booking?source=home"
                  className="btn btn-gold cta-btn"
                >
                  {t.startBooking}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
