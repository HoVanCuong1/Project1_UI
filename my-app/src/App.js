import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//LayOut
import Home from "./pages/Home";
import News from "./pages/News";
import SisUtcLayout from "./pages/SisUtcLayout/SisUtcLayout";
import SisUtcLogin from "./pages/SisUtcLogin/SisUtcLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import Payment from "./pages/Payment/Payment";
import PaymentHistory from "./pages/Payment/PaymentHistory";
//Yêu cầu
import Bookings from "./pages/Request/Register/Bookings";
import RequestFix from "./pages/Request/RequestFix/RequestFix";
import RequestTransfer from "./pages/Request/RequestTransfer/RequestTransfer";
import RoomDetail from "./pages/Request/Register/RoomDetail";
import StudentForm from "./pages/Request/Register/StudentForm";

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
          <Route path="payments" element={<Payment />} />
          <Route path="request_Fix" element={<RequestFix />} />
          <Route path="request_Transfer" element={<RequestTransfer />} />
          <Route path="payment-historys" element={<PaymentHistory />} />
          {/* Sửa ở đây ↓↓↓ */}
          <Route path="roomdetail/:roomId" element={<RoomDetail />} />
          <Route path="studentform" element={<StudentForm />} />
        </Route>
      </Routes>
    </Router>
  );
}
