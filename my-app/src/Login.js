import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [cccd, setCccd] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Đăng nhập với lms: ${cccd}, Mật khẩu: ${password}`);
  };

  return (
    <div className="login-container">
      {/* Header */}
      <div className="login-header">
        <img src="/images/logo-utc.jpg" alt="logo" className="login-logo" />
        <h1 className="login-title">
          TRANG THÔNG TIN SINH VIÊN Ở KÝ TÚC XÁ ĐẠI HỌC QUỐC GIA
        </h1>
      </div>

      {/* Login box */}
      <form onSubmit={handleSubmit} className="login-box">
        <h2 className="login-heading">ĐĂNG NHẬP</h2>

        <input
          type="text"
          value={cccd}
          onChange={(e) => setCccd(e.target.value)}
          placeholder="Nhập lms"
          list="cccd-list"
          required
        />
        <datalist id="cccd-list">
          <option value="1553800037" />
          <option value="187872" />
          <option value="848555" />
          <option value="000022444" />
          <option value="27002480" />
          <option value="1641556" />
        </datalist>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          required
        />

        <button type="submit" className="login-button">
          Đăng nhập
        </button>
        <button
          type="button"
          className="forgot-button"
          onClick={() => alert("Liên hệ ban quản lý để cấp lại mật khẩu!")}
        >
          Quên mật khẩu
        </button>
      </form>

      {/* Guide */}
      <div className="login-guide">
        <h3>HƯỚNG DẪN SINH VIÊN ĐĂNG NHẬP VÀO TRANG TRA CỨU THÔNG TIN</h3>
        <p>
          👉 <strong>User:</strong> CMND/CCCD
        </p>
        <p>
          👉 <strong>Mật khẩu:</strong> Mặc định là số CMND/CCCD.
        </p>
        <p>
          Sau khi đăng nhập lần đầu, bạn nên đổi mật khẩu để bảo mật thông tin
          cá nhân. Nếu quên mật khẩu, hãy liên hệ ban quản lý ký túc xá.
        </p>
      </div>
    </div>
  );
}
