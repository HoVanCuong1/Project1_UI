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
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/news">News</NavLink>
          </li>
          <li>
            <NavLink to="/bookings">Bookings</NavLink>
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
