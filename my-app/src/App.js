import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import SisUtcLayout from "./pages/SisUtcLayout/SisUtcLayout";
import Home from "./pages/Home";
import News from "./pages/New/News";
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
import StudentDetail from "./pages/Manager/StudentDetail"; // ← thêm dòng này
import PaymentManager from "./pages/Manager/PaymentManager/PaymentManager";
import CreateInvoice from "./pages/Manager/PaymentManager/CreateInvoice"
import InvoicePreview from "./pages/Manager/PaymentManager/InvoicePreview"
import InvoiceManager from "./pages/Manager/Invoices/InvoiceManager";
import PaymentCheckout from "./pages/Payment/PaymentCheckout";
import NewsDetail from "./pages/New/NewsDetail";
import ManagerAnnouncements from "./pages/Manager/New/ManagerAnnouncements";
import RequestFix from "./pages/Request/RequestFix/RequestFix";
import RequestCheckout from "./pages/Request/RequestCheckout/RequestCheckout";
import RequestTransfer from "./pages/Request/RequestTransfer/RequestTransfer";
import Complaint from "./pages/Request/Complaint/Complaint";
import ManagerSupportRequests from "./pages/Manager/Request/ManagerSupportRequests";
import RoomManager from "./pages/Manager/Dorm/RoomManager";
import RoomDetailManager from "./pages/Manager/Dorm/RoomDetailManager";
import VnPayReturn from "./pages/Payment/VnPayReturn";
import Reports from "./pages/Manager/Report/Reports";
import UserManagement from "./pages/Admin/User/UserManagement";
import StudentManagement from "./pages/Manager/Students/StudentManagement";

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
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="payments" element={<Payment />} />
          <Route path="/payments/:roomId" element={<Payment />} />
          <Route path="/payments/checkout" element={<PaymentCheckout />} />
          <Route path="payment-historys" element={<PaymentHistory />} />
          <Route path="/roomdetail/:roomId" element={<RoomDetail />} />
          <Route path="/studentform" element={<StudentForm />} />
          <Route path="/booking/status" element={<RegistrationStatus />} />
          <Route path="request_Fix" element={<RequestFix />} />
          <Route path="request_RequestCheckout" element={<RequestCheckout />} />
          <Route path="request_RequestTransfer" element={<RequestTransfer />} />
          <Route path="complaint" element={<Complaint />} />
          <Route path="vnpay-return" element={<VnPayReturn />} />

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
          <Route path="student-management" element={<StudentManagement />} />
          <Route path="student-detail" element={<StudentDetail />} /> {/* ← thêm dòng này */}
          <Route path="payment-manager" element={<PaymentManager />} />
          <Route path="payments-create" element={<CreateInvoice />} />
          <Route path="payments-preview" element={<InvoicePreview />} />
          <Route path="invoices" element={<InvoiceManager />} />
          <Route path="announcements" element={<ManagerAnnouncements />} />
          <Route path="supportRequestManager" element={<ManagerSupportRequests />} />
          <Route path="RoomManager" element={<RoomManager />} />
          <Route path="rooms/:roomId" element={<RoomDetailManager />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UserManagement />} />

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
