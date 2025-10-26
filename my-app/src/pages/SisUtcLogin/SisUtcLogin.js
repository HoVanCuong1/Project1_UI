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

  // ====== Danh sách tài khoản demo ======
  const DEMO_USERS = [
    { studentId: "221230001", password: "123", role: "USER" },
    { studentId: "221230002", password: "123", role: "USER" },
    { studentId: "221230003", password: "123", role: "USER" },
    { studentId: "221230004", password: "123", role: "USER" },
    { studentId: "221230005", password: "123", role: "USER" },
    { studentId: "221230006", password: "123", role: "USER" },
    { studentId: "221230007", password: "123", role: "USER" },
    { studentId: "221230008", password: "123", role: "USER" },
    { studentId: "221230009", password: "123", role: "USER" },
    { studentId: "221230010", password: "123", role: "USER" }
  ];

  const DEMO_MANAGER = { studentId: "manager", password: "123", role: "MANAGER" };
  const DEMO_ADMIN = { studentId: "admin", password: "123", role: "ADMIN" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentId || !password) {
      setError("Vui lòng nhập mã tài khoản và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      // Giả lập request tới API
      await new Promise((resolve) => setTimeout(resolve, 700));

      let user = DEMO_USERS.find(
        (u) => u.studentId === studentId && u.password === password
      );

      if (!user) {
        if (studentId === DEMO_MANAGER.studentId && password === DEMO_MANAGER.password)
          user = DEMO_MANAGER;
        else if (studentId === DEMO_ADMIN.studentId && password === DEMO_ADMIN.password)
          user = DEMO_ADMIN;
      }

      if (user) {
        const userData = { studentId, role: user.role, remember };
        if (remember)
          localStorage.setItem("utc_user", JSON.stringify(userData));
        else
          sessionStorage.setItem("utc_user", JSON.stringify(userData));

        if (user.role === "ADMIN") navigate("/admin", { replace: true });
        else if (user.role === "MANAGER") navigate("/manager", { replace: true });
        else navigate("/", { replace: true });
      } else {
        setError("Sai thông tin đăng nhập");
      }
    } catch {
      setError("Lỗi hệ thống, vui lòng thử lại");
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
            <h1>Hệ thống quản lý ký túc xá</h1>
            <p>Trường Đại học Giao thông Vận tải</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Tài khoản</label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="VD: 221230001, manager hoặc admin"
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu: 123"
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
