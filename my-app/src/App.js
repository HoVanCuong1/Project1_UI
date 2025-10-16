import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SisUtcLayout from "./SisUtcLayout/SisUtcLayout";
import Home from "./pages/Home";
import News from "./pages/News";
import Bookings from "./pages/Bookings";
import BookingRoom from "./pages/BookingRoom";
import SisUtcLogin from "./SisUtcLogin/SisUtcLogin"; // đường dẫn đúng với file bạn lưu
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Công khai: login */}
        <Route path="/login" element={<SisUtcLogin />} />

        {/* Các route cần đăng nhập */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SisUtcLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="booking_room" element={<BookingRoom />} />
          {/* thêm các route khác */}
        </Route>
      </Routes>
    </Router>
  );
}
