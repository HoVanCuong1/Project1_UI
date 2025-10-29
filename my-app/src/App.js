import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import SisUtcLayout from "./pages/SisUtcLayout/SisUtcLayout";
import Home from "./pages/Home";
import News from "./pages/News";
import Bookings from "./pages/Register/Bookings";
import SisUtcLogin from "./pages/SisUtcLogin/SisUtcLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import RoomDetail from "./pages/Register/RoomDetail";
import StudentForm from "./pages/Register/StudentForm";
import RoleRoute from "./components/RoleRoute";
import Forbidden from "./pages/Forbidden";
// (giả sử có AdminLayout / AdminPage)
// import AdminLayout from "./pages/admin/AdminLayout";
import Payment from "./pages/Payment/Payment";
import PaymentHistory from "./pages/Payment/PaymentHistory";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Trang công khai: login */}
        <Route path="/login" element={<SisUtcLogin />} />
        <Route path="/403" element={<Forbidden />} />
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
          <Route path="payments" element={<Payment />} />
          <Route path="payment-historys" element={<PaymentHistory />} />
          <Route path="room/:roomId" element={<RoomDetail />} />
          <Route path="student" element={<StudentForm />} />
        </Route>
         {/* /admin: chỉ ADMIN hoặc MANAGER */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowed={["ADMIN", "MANAGER"]}>
                {/* <AdminLayout /> */}
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
