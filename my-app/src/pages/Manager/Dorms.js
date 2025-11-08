import React, { useEffect, useState } from "react";
import "./Dorms.css";
import "./RoomFilter.css";
import "./RoomStudentList.css";
import Define from "../../Define.json";

/**
 * Dorms.js – cập nhật tự động từ server demo-data/
 * Dữ liệu luôn đồng bộ theo rooms.json và students.json
 */

export default function Dorms() {
  const [filters, setFilters] = useState({ khu: "", gender: "", roomType: "", nha: "" });
  const [floorsData, setFloorsData] = useState({});
  const [floorsSorted, setFloorsSorted] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [studentsInRoom, setStudentsInRoom] = useState([]);

  const khuOptions = Array.from(new Set((Define.LayDSToaNha?.response || []).map(i => i.TenKhu)));
  const nhaOptions = (Define.LayDSToaNha?.response || []);
  const roomTypeOptions = (Define.LayDSLoaiPhong?.response || []).map(i => i.LoaiPhong);

  // Lấy danh sách phòng thật từ server thay vì Define.json
  async function fetchRooms() {
    const { nha, gender } = filters;
    if (!nha || !gender) return [];

    try {
      const res = await fetch("http://localhost:4000/api/rooms");
      const data = await res.json();
      return data.filter(r => {
        const matchesDorm = r.dormName === nha;
        const matchesGender = r.roomType === (gender === "Nam" ? "MALE" : "FEMALE");
        return matchesDorm && matchesGender;
      });
    } catch (err) {
      console.error("Lỗi tải dữ liệu phòng:", err);
      return [];
    }
  }


  async function buildFullRoomList() {
    const { nha, gender, roomType } = filters;
    if (!nha || !gender || !roomType) return [];

    const rooms = await fetchRooms();
    const regs = (Define.room_registrations || []).filter(
      r => r.nha === nha && r.room_type === roomType && r.gender === gender
    );

    return rooms.map(r => {
      const capacity = roomType.includes("6") ? 6 : 4;
      const inRoom = regs.filter(reg => reg.room_id === r.room_id && reg.status === "APPROVED");
      return {
        ...r,
        occupants: r.currentOccupants || inRoom.length,
        capacity,
        Tang: r.floor || 1,
        students: inRoom
      };
    });
  }

  useEffect(() => {
    const loadRooms = async () => {
      const allFilled = Object.values(filters).every(Boolean);
      if (!allFilled) {
        setFloorsData({});
        setFloorsSorted([]);
        setSelectedFloor(null);
        setSelectedRoom(null);
        return;
      }

      const fullRooms = await buildFullRoomList();
      const grouped = {};
      fullRooms.forEach(r => {
        if (!grouped[r.Tang]) grouped[r.Tang] = [];
        grouped[r.Tang].push(r);
      });

      const sorted = Object.keys(grouped)
        .map(n => parseInt(n, 10))
        .sort((a, b) => a - b);
      setFloorsData(grouped);
      setFloorsSorted(sorted);
      setSelectedFloor(sorted[0] || null);
      setSelectedRoom(null);
    };
    loadRooms();
  }, [filters]);

  async function handleRoomClick(room) {
    setSelectedRoom(room);
    try {
      const res = await fetch(`http://localhost:4000/api/rooms/${room.room_id}/students`);
      const data = await res.json();
      setStudentsInRoom(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách sinh viên trong phòng:", err);
      setStudentsInRoom([]);
    }
  }

  function resetToFilters() {
    setSelectedRoom(null);
    setStudentsInRoom([]);
  }

  function getBedIcons(used, total) {
    const arr = [];
    for (let i = 0; i < used; i++) arr.push(<span key={"r" + i} className="bed red">👤</span>);
    for (let i = 0; i < total - used; i++) arr.push(<span key={"g" + i} className="bed green">🧍‍♂️</span>);
    return arr;
  }

  return (
    <div className="dorms-container">
      <h2>Quản lý phòng ký túc xá</h2>

      {!selectedRoom && (
        <>
          <div className="filter-row">
            <select value={filters.khu} onChange={e => setFilters({ ...filters, khu: e.target.value, nha: "" })}>
              <option value="">-- Chọn Khu --</option>
              {khuOptions.map(k => <option key={k} value={k}>{k}</option>)}
            </select>

            <select value={filters.gender} onChange={e => setFilters({ ...filters, gender: e.target.value })}>
              <option value="">-- Giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>

            <select value={filters.roomType} onChange={e => setFilters({ ...filters, roomType: e.target.value })}>
              <option value="">-- Loại phòng --</option>
              {roomTypeOptions.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>

            <select
              value={filters.nha}
              onChange={e => setFilters({ ...filters, nha: e.target.value })}
            >
              <option value="">-- Nhà --</option>
              {nhaOptions
                .filter(n => n.TenKhu === filters.khu)
                .map(n => <option key={n.MaToa} value={n.MaToa}>{n.MaToa}</option>)}
            </select>
          </div>

          {filters.nha && floorsSorted.length > 0 && (
            <>
              <div className="legend">
                <span className="legend-item red">👤 Đã có SV</span>
                <span className="legend-item green">🧍‍♂️ Còn trống</span>
              </div>

              <div className="floor-tabs">
                {floorsSorted.map(f => (
                  <button
                    key={f}
                    className={selectedFloor === f ? "active" : ""}
                    onClick={() => setSelectedFloor(f)}
                  >
                    Tầng {f}
                  </button>
                ))}
              </div>

              <div className="room-list">
                {floorsData[selectedFloor]?.map(room => (
                  <div
                    key={room.room_id}
                    className="room-card"
                    onClick={() => handleRoomClick(room)}
                  >
                    <h3>{room.room_name}</h3>
                    <p>
                      {room.roomType === "MALE" ? "Phòng Nam" : "Phòng Nữ"} <br />
                      <span className="count">
                        Còn trống: {room.capacity - room.occupants}/{room.capacity}
                      </span>
                    </p>
                    <div className="beds">{getBedIcons(room.occupants, room.capacity)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {selectedRoom && (
        <div className="room-students">
          <div className="header">
            <button className="btn-back" onClick={resetToFilters}>← Quay lại</button>
            <h3>Phòng {selectedRoom.room_name}</h3>
          </div>

          <table className="rs-table">
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ và tên</th>
                <th>Giới tính</th>
                <th>Lớp</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {studentsInRoom.length === 0 ? (
                <tr><td colSpan="5">Phòng hiện trống.</td></tr>
              ) : studentsInRoom.map(s => (
                <tr key={s.student_id}>
                  <td>{s.student_id}</td>
                  <td>{s.full_name || s.last_name + " " + s.first_name}</td>
                  <td>{s.gender}</td>
                  <td>{s.class_name || "-"}</td>
                  <td>{s.status || "APPROVED"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}