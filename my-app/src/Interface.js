import React, { useState } from "react";
import "./Interface.css";

export default function ChangePassword() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [email, setEmail] = useState("");
  const [showRequestMenu, setShowRequestMenu] = useState(false); // 👈 Trạng thái mở menu “Yêu cầu”

  const handleSave = (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    alert("Lưu mật khẩu thành công!");
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src="/images/logo-utc.jpg" alt="logo" className="header-logo" />
          <h1 className="header-title">
            TRANG THÔNG TIN SINH VIÊN Ở KÝ TÚC XÁ ĐẠI HỌC QUỐC GIA
          </h1>
        </div>
        <div className="header-right">Welcome, Nguyễn Văn C ▾</div>
      </header>

      {/* Body */}
      <div className="body">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Thông tin sinh viên</h3>
          <ul>
            <li>Thông tin lưu trú</li>
            <li>Hóa đơn, biên lai</li>

            {/* Mục Yêu cầu có thể bấm mở/đóng */}
            <li
              className="dropdown"
              onClick={() => setShowRequestMenu(!showRequestMenu)}
            >
              <div className="dropdown-header">
                Yêu cầu
                <span className={`arrow ${showRequestMenu ? "up" : "down"}`}>
                  ▾
                </span>
              </div>

              {showRequestMenu && (
                <ul className="sub-menu">
                  <li>Đăng ký ở lại</li>
                  <li>Yêu cầu trả phòng</li>
                  <li>Yêu cầu sửa chữa</li>
                </ul>
              )}
            </li>
          </ul>

          <div className="notice">
            <h4>Thông báo</h4>
            <p>Hiện tại không có thông báo mới.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="content">
          <div className="alert">
            Vui lòng đổi mật khẩu cho lần đăng nhập tiếp theo
          </div>

          <form className="form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Mật khẩu cũ</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="save-btn">
              Lưu
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
