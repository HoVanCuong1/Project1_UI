// src/pages/Manager/RoomFilter.js
import React, { useState, useEffect } from "react";
import "./RoomFilter.css";

export default function RoomFilter({ onSelectRoom }) {
  const [filters, setFilters] = useState({
    khu: "",
    gioiTinh: "",
    loaiPhong: "",
    nha: "",
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const canSearch =
    filters.khu && filters.gioiTinh && filters.loaiPhong && filters.nha;

  const fetchRooms = async () => {
    if (!canSearch) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        dorm: filters.khu,
        gender: filters.gioiTinh,
        type: filters.loaiPhong,
        building: filters.nha,
      }).toString();

      const res = await fetch(`http://localhost:4000/api/rooms?${query}`);
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách phòng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canSearch) fetchRooms();
  }, [filters]);

  return (
    <>
      {/* Bộ lọc phòng */}
      <div className="booking-form">
        <h2>Quản lý phòng ký túc xá</h2>

        <div className="form-row">
          <label>Khu</label>
          <input
            type="text"
            placeholder="Nhập khu (A, B...)"
            value={filters.khu}
            onChange={(e) => setFilters({ ...filters, khu: e.target.value })}
          />
        </div>

        <div className="form-row">
          <label>Giới tính</label>
          <select
            value={filters.gioiTinh}
            onChange={(e) =>
              setFilters({ ...filters, gioiTinh: e.target.value })
            }
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        <div className="form-row">
          <label>Loại phòng</label>
          <input
            type="text"
            placeholder="Nhập loại phòng"
            value={filters.loaiPhong}
            onChange={(e) =>
              setFilters({ ...filters, loaiPhong: e.target.value })
            }
          />
        </div>

        <div className="form-row">
          <label>Nhà</label>
          <input
            type="text"
            placeholder="Nhập nhà"
            value={filters.nha}
            onChange={(e) => setFilters({ ...filters, nha: e.target.value })}
          />
        </div>
      </div>

      {/* Danh sách phòng */}
      {!canSearch ? (
        <p className="hint">
          * Hãy nhập đủ 4 trường: Khu, Giới tính, Loại phòng, Nhà để xem danh
          sách phòng.
        </p>
      ) : loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="rooms-list">
          {rooms.map((room) => (
            <div
              key={room.room_id}
              className="room-card"
              onClick={() => onSelectRoom(room)}
            >
              <div className="room-header">
                <h3>{room.room_name}</h3>
                <span>
                  {room.roomType === "MALE" ? "Nam" : "Nữ"} • Tầng {room.floor}
                </span>
              </div>

              <div className="room-body">
                <div className="beds">
                  {Array.from(
                    { length: room.maxOccupants },
                    (_, i) => (
                      <span
                        key={i}
                        className={`bed ${
                          i < (room.currentOccupants || 0) ? "red" : ""
                        }`}
                      >
                        👤
                      </span>
                    )
                  )}
                </div>
                <div className="counts">
                  {room.currentOccupants || 0}/{room.maxOccupants} sinh viên
                </div>
                <div className="price">
                  Giá: {room.roomPrice?.toLocaleString() || 0} VNĐ
                </div>
              </div>
            </div>
          ))}

          {rooms.length === 0 && (
            <p>Không tìm thấy phòng nào phù hợp với bộ lọc.</p>
          )}
        </div>
      )}
    </>
  );
}
