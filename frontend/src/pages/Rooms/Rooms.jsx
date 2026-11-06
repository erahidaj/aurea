import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import SectionTitle from "../../components/common/SectionTitle/SectionTitle";
import RoomCard from "../../components/rooms/RoomCard/RoomCard";
import roomsData from "../../data/roomsData";
import translations from "../../data/translations";
import { useLanguage } from "../../context/useLanguage";
import { getRoomSettings } from "../../services/roomsApi";
import "./Rooms.css";

const getLocalizedValue = (value, language) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    return value[language] || value.en || "";
  }

  return "";
};

const getLocalizedArray = (value, language) => {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    return value[language] || value.en || [];
  }

  return [];
};

const Rooms = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [roomSettings, setRoomSettings] = useState([]);

  useEffect(() => {
    const loadRoomSettings = async () => {
      try {
        const settings = await getRoomSettings();
        setRoomSettings(settings);
      } catch (error) {
        console.error(error);
      }
    };

    loadRoomSettings();
  }, []);

  const roomListings = roomsData
    .map((room) => {
      const databaseRoom = roomSettings.find((item) => item.slug === room.slug);

      return {
        id: room.id,
        slug: room.slug,
        name: getLocalizedValue(room.name, language),
        image: room.coverImage || room.images?.[0],
        shortDescription: getLocalizedValue(room.shortDescription, language),
        price: databaseRoom?.price ?? room.price,
        available: databaseRoom?.available ?? true,
        size: room.size,
        capacity: room.capacity,
        highlights: getLocalizedArray(room.highlights, language).slice(0, 5),
        featured: room.featured,
      };
    })
    .filter((room) => room.available);

  return (
    <>
      <Helmet>
        <title>{t.roomsPageTitle}</title>

        <meta name="description" content={t.roomsMetaDescription} />

        <link rel="canonical" href="https://example.com/rooms" />
      </Helmet>

      <section className="section-space page-top-space rooms-page">
        <div className="container">
          <SectionTitle subtitle={t.ourRooms} title={t.roomsTitle} center />

          <div className="row g-4 mt-3">
            {roomListings.map((room) => (
              <div key={room.id} className="col-12 col-md-6 col-lg-4">
                <RoomCard room={room} variant="listing" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Rooms;
