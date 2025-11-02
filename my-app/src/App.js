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
import RegistrationStatus from "./pages/Register/RegistrationStatus";
// ====== Thêm import cho manager ======
import ManagerLayout from "./pages/SisUtcLayout/ManagerLayout";
import ManagerHome from "./pages/ManagerHome";
import Approval from "./pages/Manager/Approval";
import Dorms from "./pages/Manager/Dorms";

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
          <Route path="/roomdetail/:roomId" element={<RoomDetail />} />
          <Route path="/studentform" element={<StudentForm />} />
          <Route path="/booking/status" element={<RegistrationStatus />} />
        </Route>

         {/* Route cho manager */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <RoleRoute allowed={["ADMIN", "MANAGER"]}>
                <ManagerLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerHome />} />
          <Route path="approval" element={<Approval />} />
          <Route path="dorms" element={<Dorms />} /> {/* ← thêm dòng này */}
        </Route>

         {/* /admin: chỉ ADMIN hoặc MANAGER */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowed={["ADMIN"]}>
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
