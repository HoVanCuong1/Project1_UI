import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SisUtcLayout from "./pages/SisUtcLayout/SisUtcLayout";
import Home from "./pages/Home";
import News from "./pages/News";
import Bookings from "./pages/Register/Bookings";
import SisUtcLogin from "./pages/SisUtcLogin/SisUtcLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import RoomDetail from "./pages/Register/RoomDetail";
import StudentForm from "./pages/Register/StudentForm";

// ====== Thêm import cho admin ======
import AdminLayout from "./pages/SisUtcLayout/AdminLayout";
import AdminHome from "./pages/AdminHome";

// ====== Thêm import cho manager ======
import ManagerLayout from "./pages/SisUtcLayout/ManagerLayout";
import ManagerHome from "./pages/ManagerHome";
import Approval from "./pages/Manager/Approval";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Trang công khai: login */}
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
          <Route path="room/:roomId" element={<RoomDetail />} />
          <Route path="student" element={<StudentForm />} />
        </Route>

        {/* Route cho admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
        </Route>

        {/* Route cho manager */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerHome />} />
          <Route path="approval" element={<Approval />} />
        </Route>
      </Routes>
    </Router>
  );
}