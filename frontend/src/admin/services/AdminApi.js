const API_URL = import.meta.env.VITE_API_URL;

let csrfToken = "";

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

const saveCsrfToken = (data) => {
  if (typeof data?.csrfToken === "string" && data.csrfToken !== "") {
    csrfToken = data.csrfToken;
  }
};

export const loginAdmin = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login.php`, {
    method: "POST",
    credentials: "include",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await parseResponse(response);

  saveCsrfToken(data);

  return data.admin;
};

export const getAdminSession = async () => {
  const response = await fetch(`${API_URL}/auth/me.php`, {
    method: "GET",
    credentials: "include",

    headers: {
      Accept: "application/json",
    },
  });

  const data = await parseResponse(response);

  saveCsrfToken(data);

  return data.admin;
};

const ensureCsrfToken = async () => {
  if (csrfToken !== "") {
    return csrfToken;
  }

  await getAdminSession();

  if (csrfToken === "") {
    throw new Error("Token-i i sigurisë nuk u ngarkua. Bëj përsëri login.");
  }

  return csrfToken;
};

const sendProtectedRequest = async (endpoint, body) => {
  await ensureCsrfToken();

  const createRequest = () =>
    fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify(body),
    });

  let response = await createRequest();

  /*
   * If the token has expired, retrieve it again
   * from the session and retry the request
   * only once.
   */
  if (response.status === 403) {
    csrfToken = "";

    await getAdminSession();

    response = await createRequest();
  }

  return parseResponse(response);
};

export const getAdminBookings = async (status = "") => {
  const queryParameters = new URLSearchParams();

  if (status) {
    queryParameters.set("status", status);
  }

  queryParameters.set("_timestamp", Date.now().toString());

  const response = await fetch(
    `${API_URL}/admin/bookings/list.php?${queryParameters.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",

      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse(response);
};

export const updateBookingStatus = async ({
  bookingId,
  status,
  adminNotes = "",
}) => {
  return sendProtectedRequest("/admin/bookings/update-status.php", {
    bookingId: Number(bookingId),
    status,
    adminNotes,
  });
};

export const updateRoom = async ({ id, price, available }) => {
  return sendProtectedRequest("/admin/update-room.php", {
    id: Number(id),
    price: Number(price),
    available: Boolean(available),
  });
};

export const logoutAdmin = async () => {
  await ensureCsrfToken();

  const createRequest = () =>
    fetch(`${API_URL}/auth/logout.php`, {
      method: "POST",
      credentials: "include",

      headers: {
        Accept: "application/json",
        "X-CSRF-Token": csrfToken,
      },
    });

  let response = await createRequest();

  if (response.status === 403) {
    csrfToken = "";

    await getAdminSession();

    response = await createRequest();
  }

  const data = await parseResponse(response);

  csrfToken = "";

  return data;
};

export const getCsrfToken = () => csrfToken;
