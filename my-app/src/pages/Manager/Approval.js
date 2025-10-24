// ============================
// File: src/pages/Manager/Approval.js
// ============================

import React, { useEffect, useState } from "react";
import "./Approval.css";
import DefineData from "../../Define.json";

function Approval() {
  const [registrations, setRegistrations] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  // Load data từ localStorage hoặc Define.json
  useEffect(() => {
    const localData = localStorage.getItem("room_registrations");
    if (localData) {
      setRegistrations(JSON.parse(localData));
    } else {
      setRegistrations(DefineData.room_registrations || []);
    }
  }, []);

  // Lưu vào localStorage mỗi khi cập nhật
  useEffect(() => {
    if (registrations.length > 0) {
      localStorage.setItem("room_registrations", JSON.stringify(registrations));
    }
  }, [registrations]);

  const handleStatusChange = (id, newStatus) => {
    const updated = registrations.map((r) =>
      r.registration_id === id ? { ...r, status: newStatus } : r
    );
    setRegistrations(updated);
  };

  const filteredData =
    filterStatus === "All"
      ? registrations
      : registrations.filter((r) => r.status === filterStatus);

  return (
    <div className="approval-container">
      <h2>Duyệt đăng ký phòng</h2>

      <div className="filter-bar">
        <label>Lọc theo trạng thái: </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">Tất cả</option>
          <option value="Pending">Chờ duyệt</option>
          <option value="Approved">Đã duyệt</option>
          <option value="Rejected">Từ chối</option>
        </select>
      </div>

      <table className="approval-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mã sinh viên</th>
            <th>Mã phòng</th>
            <th>Ngày đăng ký</th>
            <th>Trạng thái</th>
            <th>Loại yêu cầu</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((reg) => (
            <tr key={reg.registration_id}>
              <td>{reg.registration_id}</td>
              <td>{reg.student_id}</td>
              <td>{reg.room_id}</td>
              <td>{reg.registration_date}</td>
              <td
                className={
                  reg.status === "Approved"
                    ? "status-approved"
                    : reg.status === "Rejected"
                    ? "status-rejected"
                    : "status-pending"
                }
              >
                {reg.status}
              </td>
              <td>{reg.request_type}</td>
              <td>
                {reg.status === "Pending" && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() =>
                        handleStatusChange(reg.registration_id, "Approved")
                      }
                    >
                      Duyệt
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() =>
                        handleStatusChange(reg.registration_id, "Rejected")
                      }
                    >
                      Từ chối
                    </button>
                  </>
                )}
                {reg.status !== "Pending" && (
                  <span className="no-action">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Approval;