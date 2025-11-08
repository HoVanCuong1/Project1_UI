import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./SidebarRequest.css";

export default function SidebarRequest() {
  const [isOpen, setIsOpen] = useState(false); // ✅ đổi lại tên biến cho đồng nhất

  return (
    <div className="sidebar-request">
      <div
        className="sidebar-request-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Yêu cầu</span>
        <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <ul className="sidebar-request-list">
          {/* <li>
            <NavLink to="/bookings">Đăng ký ở lại</NavLink>
          </li> */}
          <li>
            <NavLink to="/request_Transfer">Yêu cầu trả phòng</NavLink>
          </li>
          <li>
            <NavLink to="/request_Fix">Yêu cầu sửa chữa</NavLink>
          </li>
        </ul>
      )}
    </div>
  );
}