import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SisUtcLogin.css";                // giữ lại CSS cũ
import { useAuth } from "../contexts/AuthContext";

export default function SisUtcLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // vẫn dùng email/password thật (không dùng studentId nữa),
  // nhưng giữ nguyên giao diện/label nếu bạn muốn
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // nếu muốn auto-fill email đã “ghi nhớ”
  useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true); 
    try {
      await login({ email, password }); // gọi API thật -> BE set cookie AUTH
      if (remember) localStorage.setItem("remember_email", email);
      else localStorage.removeItem("remember_email");

      navigate("/", { replace: true });
    } catch (err) {
      // FormatResponse phía BE: {resultCode, resultDesc, data}
      const msg =
        err?.response?.data?.resultDesc ||
        err?.message ||
        "Đăng nhập thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Header + logo như cũ */}
        <div className="login-header">
          <img src="/images/logo-utc.jpg" alt="UTC" className="logo" />
          <div>
            <h1>Hệ thống thông tin sinh viên</h1>
            <p>Trường Đại học Giao thông vận tải</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nếu muốn giữ label “Mã sinh viên” thì đổi chữ, còn dữ liệu là email */}
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
