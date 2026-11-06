const API_URL = import.meta.env.VITE_API_URL;

const parseResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Serveri ktheu një përgjigje të pavlefshme.");
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Kërkesa nuk mund të realizohej.");
  }

  return data;
};

export const getRoomSettings = async () => {
  const response = await fetch(`${API_URL}/rooms.php`, {
    method: "GET",
    cache: "no-store",

    headers: {
      Accept: "application/json",
    },
  });

  const data = await parseResponse(response);

  if (!Array.isArray(data.rooms)) {
    throw new Error("Lista e dhomave është e pavlefshme.");
  }

  return data.rooms.map((room) => ({
    ...room,
    id: Number(room.id),
    price: Number(room.price),
    available: Number(room.available) === 1,
  }));
};

export const checkAvailability = async ({
  checkInDate,
  checkOutDate,
  rooms,
  adults,
  children,
  infants,
  roomId,
}) => {
  const response = await fetch(`${API_URL}/availability.php`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      rooms,
      adults,
      children,
      infants,
      roomId: roomId || null,
    }),
  });

  return parseResponse(response);
};
