import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SisUtcLogin.css";

export default function SisUtcLogin() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ====== Tài khoản demo ======
  const DEMO_USER = { studentId: "20180001", password: "123456", role: "student" };
  const DEMO_ADMIN = { studentId: "admin", password: "123", role: "admin" };
  const DEMO_MANAGER = { studentId: "manager1", password: "123", role: "manager" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentId || !password) {
      setError("Vui lòng nhập mã sinh viên và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      // Giả lập request tới API
      await new Promise((resolve) => setTimeout(resolve, 700));

      let user = null;

      // ====== Kiểm tra tài khoản demo ======
      if (studentId === DEMO_USER.studentId && password === DEMO_USER.password) {
        user = DEMO_USER;
      } else if (studentId === DEMO_ADMIN.studentId && password === DEMO_ADMIN.password) {
        user = DEMO_ADMIN;
      } else if (studentId === DEMO_MANAGER.studentId && password === DEMO_MANAGER.password) {
        user = DEMO_MANAGER;
      }

      if (user) {
        // Lưu trạng thái đăng nhập
        const userData = { studentId, role: user.role, remember };
        if (remember) {
          localStorage.setItem("utc_user", JSON.stringify(userData));
        } else {
          sessionStorage.setItem("utc_user", JSON.stringify(userData));
        }

        // ====== Điều hướng theo role ======
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.role === "manager") {
          navigate("/manager", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError("Mã sinh viên hoặc mật khẩu không đúng");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src="/images/logo-utc.jpg" alt="UTC" className="logo" />
          <div>
            <h1>Hệ thống thông tin sinh viên</h1>
            <p>Trường Đại học Giao thông vận tải</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Mã sinh viên / Admin / Manager</label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="VD: 20180001, admin hoặc manager1"
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
          />

          <div className="form-footer">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>
            <a href="#">Quên mật khẩu?</a>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="footer">© {new Date().getFullYear()} UTC — Phiên bản demo</div>
      </div>
    </div>
  );
}