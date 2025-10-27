import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./SisUtcLayout.css";

export default function SisUtcLayout() {
  return (
    <div className="sis-layout">
      {/* Header */}
      <header className="sis-header">
        <div className="header-left">
          <img src="/images/logo-utc.jpg" alt="UTC Logo" className="utc-logo" />
          <div className="header-text">
            <h1>Trường ĐH Giao thông vận tải</h1>
            <p>UNIVERSITY OF TRANSPORT AND COMMUNICATIONS</p>
          </div>
        </div>
        <div className="header-right">
          <span>
            <strong>Support:</strong> support@st.utc.edu.vn
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <nav className="sis-sidebar">
        <ul>
          <li>
            <NavLink to="/" end>
              Trang Chủ
            </NavLink>
          </li>
          <li>
            <NavLink to="/news">Tin Tức</NavLink>
          </li>
          <li>
            <NavLink to="/bookings">Đăng Kí KTX</NavLink>
          </li>
          <li>
            <NavLink to="/payments">Thanh toán</NavLink>
          </li>
          <li>
            <NavLink to="/payment-historys">Lịch sử thanh toán</NavLink>
          </li>
        </ul>
      </nav>

      {/* Nội dung */}
      <main className="sis-content">
        <Outlet /> {/* nơi render Home */}
      </main>
    </div>
  );
}
