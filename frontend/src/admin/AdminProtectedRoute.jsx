import { cloneElement, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAdminSession } from "./services/AdminApi";
import { useLanguage } from "../context/useLanguage";
import adminTranslations from "./data/adminTranslations";

const AdminProtectedRoute = ({ children }) => {
  const { language } = useLanguage();
  const t = adminTranslations[language] || adminTranslations.en;
  const [status, setStatus] = useState("loading");
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const authenticatedAdmin = await getAdminSession();

        if (isMounted) {
          setAdmin(authenticatedAdmin);
          setStatus("authenticated");
        }
      } catch {
        if (isMounted) {
          setAdmin(null);
          setStatus("unauthenticated");
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center">
        <p>{t.sessionCheck}</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return cloneElement(children, {
    admin,
  });
};

export default AdminProtectedRoute;
