import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./SisUtcLayout.css";
import { useAuth } from "../../contexts/AuthContext";

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const rememberedEmail = typeof window !== "undefined"
    ? localStorage.getItem("remember_email")
    : null;

  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? rememberedEmail ?? "-";

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="sis-layout">
      <header className="sis-header">
        <div className="header-left">
          <img src="/images/logo-utc.jpg" alt="UTC Logo" className="utc-logo" />
          <div className="header-text">
            <h1>Trường ĐH Giao thông vận tải</h1>
            <p>UNIVERSITY OF TRANSPORT AND COMMUNICATIONS</p>
          </div>
        </div>

        <div className="header-right" ref={menuRef}>
          <button className="user-chip" onClick={() => setOpen(v => !v)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"/></svg>
            <span className="user-name">{displayName}</span>
          </button>

          {open && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-info-email">{displayEmail}</div>
              </div>
              <div className="user-divider" />
              {/* <button className="user-action" onClick={() => setOpen(false)}>Information</button> */}
              <button className="user-action danger" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <nav className="sis-sidebar">
        <ul>
          <li><NavLink to="/manager" end>Dashboard</NavLink></li>
          <li><NavLink to="/manager/RoomManager">Quản lý phòng</NavLink></li> {/* ← đổi đường dẫn này */}
          <li><NavLink to="/manager/student-management">Quản lý sinh viên</NavLink></li>
          <li><NavLink to="/manager/payment-manager">Lập hóa đơn</NavLink></li>
          <li><NavLink to="/manager/invoices">Quản lý thanh toán</NavLink></li>
          <li><NavLink to="/manager/approval">Duyệt đăng ký phòng</NavLink></li>
          <li><NavLink to="/manager/supportRequestManager">Quản lý yêu cầu</NavLink></li>
          <li><NavLink to="/manager/announcements">Quản lý thông báo</NavLink></li>
        </ul>
      </nav>

      <main className="sis-content">
        <Outlet />
      </main>
    </div>
  );
}
