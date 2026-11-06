import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout/MainLayout";
import Home from "../pages/Home/Home";
import Rooms from "../pages/Rooms/Rooms";
import RoomDetails from "../pages/RoomDetails/RoomDetails";
import Booking from "../pages/Booking/Booking";
import Contact from "../pages/Contact/Contact";

import AdminLogin from "../admin/pages/AdminLogin/AdminLogin";
import AdminDashboard from "../admin/pages/AdminDashboard/AdminDashboard";
import AdminBookings from "../admin/pages/AdminBookings/AdminBookings";
import AdminProtectedRoute from "../admin/AdminProtectedRoute";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/rooms"
          element={
            <MainLayout>
              <Rooms />
            </MainLayout>
          }
        />

        <Route
          path="/rooms/:slug"
          element={
            <MainLayout>
              <RoomDetails />
            </MainLayout>
          }
        />

        <Route
          path="/booking"
          element={
            <MainLayout>
              <Booking />
            </MainLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <MainLayout>
              <Contact />
            </MainLayout>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdminProtectedRoute>
              <AdminBookings />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
