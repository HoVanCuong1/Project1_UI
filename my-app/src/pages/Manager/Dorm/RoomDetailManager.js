// src/pages/Manager/RoomDetailManager.js

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RoomDetailManager.css";
import { getRoomById, getStudentsInRoom } from "../../../config/api";

export default function RoomDetailManager() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [roomRes, studentRes] = await Promise.all([
          getRoomById(roomId),
          getStudentsInRoom(roomId),
        ]);

        // tuỳ API của m, nếu res.data.result thì sửa lại
        const roomData = roomRes?.data?.data || roomRes?.data || roomRes;
        const studentData = studentRes?.data?.data || studentRes?.data || [];

        setRoom(roomData);
        setStudents(Array.isArray(studentData) ? studentData : []);
      } catch (e) {
        console.error(e);
        setError("Không tải được thông tin phòng hoặc danh sách sinh viên.");
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  const getOccupancyText = () => {
    if (!room) return "";
    const max = room.maxOccupants ?? 0;
    const current = room.currentOccupants ?? 0;
    const remain = max - current;

    if (max === 0) return "Chưa cấu hình số chỗ";
    if (remain === 0) return "Phòng đã đầy";
    if (remain <= 2) return `Sắp đầy (còn ${remain} chỗ)`;
    return `Còn ${remain} chỗ`;
  };

  return (
    <div className="rdm-container">
      <div className="rdm-header">
        <button className="btn rdm-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <div>
          <h2>Chi tiết phòng</h2>
          <p className="rdm-sub">
            Xem thông tin phòng và danh sách sinh viên hiện đang ở trong phòng.
          </p>
        </div>
      </div>

      {loading && <p className="rdm-loading">Đang tải dữ liệu...</p>}
      {error && <p className="rdm-error">{error}</p>}

      {!loading && !error && room && (
        <>
          {/* Thông tin phòng */}
          <div className="rdm-card rdm-room-info">
            <div className="rdm-room-main">
              <h3>
                Phòng {room.name}{" "}
                <span className="rdm-room-id">(ID: {room.id})</span>
              </h3>
              <p className="rdm-room-dorm">
                Khu: <strong>{room.dormName}</strong> • Tầng:{" "}
                <strong>{room.floor}</strong>
              </p>
              <p className="rdm-room-type">
                Giới tính:{" "}
                <strong>
                  {room.type === "MALE"
                    ? "Nam"
                    : room.type === "FEMALE"
                    ? "Nữ"
                    : room.type}
                </strong>{" "}
                • Số chỗ: <strong>{room.maxOccupants}</strong> • Đang ở:{" "}
                <strong>{room.currentOccupants}</strong>
              </p>
              <p className="rdm-room-occupancy">{getOccupancyText()}</p>
            </div>
            <div className="rdm-room-extra">
              <div className="rdm-price-box">
                <span>Giá phòng</span>
                <div className="rdm-price">
                  {room.price != null
                    ? Number(room.price).toLocaleString()
                    : "-"}{" "}
                  đ/tháng
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách sinh viên */}
          <div className="rdm-card">
            <div className="rdm-card-header">
              <h3>Danh sách sinh viên trong phòng</h3>
              <span className="rdm-count">
                {students.length} sinh viên đang ở
              </span>
            </div>

            {students.length === 0 ? (
              <p style={{ opacity: 0.7 }}>Hiện chưa có sinh viên nào trong phòng này.</p>
            ) : (
              <div className="rdm-table-wrapper">
                <table className="rdm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã sinh viên</th>
                      <th>Họ tên</th>
                      <th>Giới tính</th>
                      <th>Lớp</th>
                      <th>SĐT</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.id || s.studentId || idx}>
                        <td>{idx + 1}</td>
                        <td>{s.studentCode || s.studentId || "-"}</td>
                        <td>{s.fullName || s.name || "-"}</td>
                        <td>
                          {s.gender === "MALE"
                            ? "Nam"
                            : s.gender === "FEMALE"
                            ? "Nữ"
                            : s.gender || "-"}
                        </td>
                        <td>{s.className || s.classCode || "-"}</td>
                        <td>{s.phone || s.phoneNumber || "-"}</td>
                        <td>{s.email || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
