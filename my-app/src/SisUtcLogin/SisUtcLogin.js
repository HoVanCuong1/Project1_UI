import React, { useState } from "react";
import "./SisUtcLogin/SisUtcLogin.css";

export default function SisUtcLogin() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentId || !password) {
      setError("Vui lòng nhập mã sinh viên và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      // API giả lập
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Đăng nhập thành công (demo)");
    } catch (err) {
      setError("Đã xảy ra lỗi");
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
          <label>Mã sinh viên</label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="VD: 12345678"
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

        <div className="footer">
          © {new Date().getFullYear()} UTC — Phiên bản demo
        </div>
      </div>
    </div>
  );
}
