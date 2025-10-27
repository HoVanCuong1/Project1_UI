import React, { useEffect, useState } from "react";
import "./Approval.css";
import DefineData from "../../Define.json";

function Approval() {
  const [registrations, setRegistrations] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/registrations");
        const data = await res.json();
        if (data && data.length > 0) {
          setRegistrations(data);
          localStorage.setItem("room_registrations", JSON.stringify(data));
        } else {
          const localData = localStorage.getItem("room_registrations");
          if (localData) setRegistrations(JSON.parse(localData));
          else setRegistrations(DefineData.room_registrations || []);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu từ server:", error);
        const localData = localStorage.getItem("room_registrations");
        if (localData) setRegistrations(JSON.parse(localData));
        else setRegistrations(DefineData.room_registrations || []);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (registrations.length > 0) {
      localStorage.setItem("room_registrations", JSON.stringify(registrations));
    }
  }, [registrations]);

  // Cập nhật trạng thái duyệt / từ chối và đồng bộ lại số lượng phòng
  const handleStatusChange = async (id, newStatus) => {
    const updated = registrations.map((r) =>
      r.registration_id === id ? { ...r, status: newStatus } : r
    );
    setRegistrations(updated);

    try {
      const url =
        newStatus === "APPROVED"
          ? `http://localhost:4000/api/registrations/${id}/approve`
          : `http://localhost:4000/api/registrations/${id}/revoke`;

      await fetch(url, { method: "POST" });

      // Gọi reconcile để cập nhật số lượng sinh viên trong phòng
      await fetch("http://localhost:4000/api/reconcile", { method: "POST" });

      // Tải lại danh sách đăng ký
      const res = await fetch("http://localhost:4000/api/registrations");
      const updatedData = await res.json();
      setRegistrations(updatedData);
      localStorage.setItem("room_registrations", JSON.stringify(updatedData));
    } catch (err) {
      console.error("Không thể cập nhật trạng thái:", err);
    }
  };

  const filteredData =
    filterStatus === "All"
      ? registrations
      : registrations.filter((r) => r.status === filterStatus.toUpperCase());

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
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
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
                  reg.status === "APPROVED"
                    ? "status-approved"
                    : reg.status === "REJECTED"
                    ? "status-rejected"
                    : "status-pending"
                }
              >
                {reg.status}
              </td>
              <td>{reg.request_type}</td>
              <td>
                {reg.status === "PENDING" && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() =>
                        handleStatusChange(reg.registration_id, "APPROVED")
                      }
                    >
                      Duyệt
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() =>
                        handleStatusChange(reg.registration_id, "REJECTED")
                      }
                    >
                      Từ chối
                    </button>
                  </>
                )}
                {reg.status !== "PENDING" && (
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
