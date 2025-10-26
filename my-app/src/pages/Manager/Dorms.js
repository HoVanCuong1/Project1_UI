import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dorms.css";

export default function Dorms() {
  const navigate = useNavigate();

  // Bộ lọc
  const [khu, setKhu] = useState("");
  const [gioiTinh, setGioiTinh] = useState("");
  const [loaiPhong, setLoaiPhong] = useState("");
  const [nha, setNha] = useState("");
  const [tang, setTang] = useState(1);

  // Dữ liệu mẫu (giống Bookings.js)
  const data = {
    A: {
      Nam: {
        "Phòng 6 sinh viên": ["A10", "A11"],
        "Phòng 4 sinh viên": ["A12"],
      },
      Nữ: { "Phòng 6 sinh viên": ["A12"] },
    },
    B: {
      Nam: { "Phòng 4 sinh viên": ["B1", "B2"] },
      Nữ: { "Phòng 6 sinh viên": ["B3", "B4"] },
    },
  };

  const roomsByFloor = {
    1: [
      { id: "P101", name: "P101", total: 6, used: 5 },
      { id: "P102", name: "P102", total: 6, used: 6 },
      { id: "P103", name: "P103", total: 6, used: 4 },
    ],
    2: [
      { id: "P201", name: "P201", total: 6, used: 6 },
      { id: "P202", name: "P202", total: 6, used: 5 },
      { id: "P203", name: "P203", total: 6, used: 2 },
    ],
    3: [
      { id: "P301", name: "P301", total: 6, used: 3 },
      { id: "P302", name: "P302", total: 6, used: 5 },
      { id: "P303", name: "P303", total: 6, used: 6 },
    ],
    4: [
      { id: "P401", name: "P401", total: 6, used: 4 },
      { id: "P402", name: "P402", total: 6, used: 6 },
      { id: "P403", name: "P403", total: 6, used: 1 },
    ],
  };

  // Click phòng
  const handleRoomClick = (roomId) => {
    navigate(`/manager/room/${roomId}`, {
      state: { khu, gioiTinh, loaiPhong, nha, tang },
    });
  };

  const getBedIcons = (used, total) => {
    const arr = [];
    for (let i = 0; i < used; i++) {
      arr.push(
        <span key={"r" + i} className="bed red">
          👤
        </span>
      );
    }
    for (let i = 0; i < total - used; i++) {
      arr.push(
        <span key={"g" + i} className="bed green">
          🧍‍♂️
        </span>
      );
    }
    return arr;
  };

  return (
    <div className="booking-container">
      <h2>Quản lý phòng ký túc xá</h2>

      {/* Bộ lọc */}
      <div className="filter-row">
        <select value={khu} onChange={(e) => {setKhu(e.target.value); setGioiTinh(""); setLoaiPhong(""); setNha("");}}>
          <option value="">-- Chọn Khu --</option>
          {Object.keys(data).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        <select value={gioiTinh} onChange={(e) => {setGioiTinh(e.target.value); setLoaiPhong(""); setNha("");}} disabled={!khu}>
          <option value="">-- Giới tính --</option>
          {khu && Object.keys(data[khu]).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select value={loaiPhong} onChange={(e) => {setLoaiPhong(e.target.value); setNha("");}} disabled={!gioiTinh}>
          <option value="">-- Loại phòng --</option>
          {khu && gioiTinh && Object.keys(data[khu][gioiTinh]).map((lp) => (
            <option key={lp} value={lp}>{lp}</option>
          ))}
        </select>

        <select value={nha} onChange={(e) => setNha(e.target.value)} disabled={!loaiPhong}>
          <option value="">-- Nhà --</option>
          {khu && gioiTinh && loaiPhong && data[khu][gioiTinh][loaiPhong].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Khi đã chọn Nhà */}
      {nha && (
        <>
          <div className="legend">
            <span className="legend-item red">👤 Đã có SV</span>
            <span className="legend-item green">🧍‍♂️ Còn trống</span>
          </div>

          <div className="floor-tabs">
            {[1, 2, 3, 4].map((f) => (
              <button
                key={f}
                className={tang === f ? "active" : ""}
                onClick={() => setTang(f)}
              >
                Tầng {f}
              </button>
            ))}
          </div>

          <div className="room-list">
            {roomsByFloor[tang].map((room) => (
              <div
                key={room.id}
                className="room-card"
                onClick={() => handleRoomClick(room.id)}
              >
                <h3>{room.name}</h3>
                <p>
                  Phòng {room.total} sinh viên <br />
                  <span className="count">
                    Còn trống: {room.total - room.used}/{room.total}
                  </span>
                </p>
                <div className="beds">{getBedIcons(room.used, room.total)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
