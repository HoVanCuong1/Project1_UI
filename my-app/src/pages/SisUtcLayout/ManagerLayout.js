import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./SisUtcLayout.css";

export default function ManagerLayout() {
  return (
    <div className="sis-layout">
      <header className="sis-header">
        <div className="header-left">
          <img src="/images/logo-utc.jpg" alt="UTC Logo" className="utc-logo" />
          <div className="header-text">
            <h1>Quản lý KTX</h1>
            <p>Manager Dashboard</p>
          </div>
        </div>
        <div className="header-right">
          <span><strong>Support:</strong> support@st.utc.edu.vn</span>
        </div>
      </header>

      <nav className="sis-sidebar">
        <ul>
          <li><NavLink to="/manager" end>Dashboard</NavLink></li>
          <li><NavLink to="/manager/rooms">Quản lý phòng</NavLink></li>
          <li><NavLink to="/manager/payments">Quản lý thanh toán</NavLink></li>
        </ul>
      </nav>

      <main className="sis-content">
        <Outlet />
      </main>
    </div>
  );
}
