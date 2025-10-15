import React, { useState } from "react";
import "./BookingRoom.css";

export default function BookingRoom() {
  // State lưu giá trị được chọn
  const [filters, setFilters] = useState({
    roomType: "",
    dorm: "",
    floor: "",
    block: "",
  });

  // Xử lý khi người dùng thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Xử lý nút Reload
  const handleReload = () => {
    setFilters({ roomType: "", dorm: "", floor: "", block: "" });
  };

  return (
    <div className="booking-room">
      <h1>New Booking</h1>

      {/* Form chọn lọc */}
      <div className="form-grid">
        <div>
          <label>Room Type</label>
          <select
            name="roomType"
            value={filters.roomType}
            onChange={handleChange}
          >
            <option value="">-- Select Room Type --</option>
            <option value="SVVN-4">SVVN - 4 beds - 1.050.000đ</option>
            <option value="SVVN-6">SVVN - 6 beds - 850.000đ</option>
            <option value="SVQT-2">SVQT - 2 beds - 1.500.000đ</option>
          </select>
        </div>

        <div>
          <label>Dorm</label>
          <select name="dorm" value={filters.dorm} onChange={handleChange}>
            <option value="">-- Select Dorm --</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="F">F</option>
          </select>
        </div>

        <div>
          <label>Floor</label>
          <select name="floor" value={filters.floor} onChange={handleChange}>
            <option value="">-- Select Floor --</option>
            {[1, 2, 3, 4, 5].map((f) => (
              <option key={f} value={f}>
                Floor {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Block</label>
          <select name="block" value={filters.block} onChange={handleChange}>
            <option value="">-- Select Block --</option>
            <option value="1">Block 1</option>
            <option value="2">Block 2</option>
            <option value="3">Block 3</option>
          </select>
        </div>

        <button className="reload-btn" onClick={handleReload}>
          Reload
        </button>
      </div>

      <hr />

      <h2>Available Rooms</h2>
      <p>
        Showing rooms for:{" "}
        <strong>
          {filters.roomType || "All Types"} / {filters.dorm || "All Dorms"} /{" "}
          {filters.floor || "All Floors"} / {filters.block || "All Blocks"}
        </strong>
      </p>

      {/* Danh sách phòng mẫu */}
      <div className="room-list">
        <div className="room-card">
          <span className="room-num">1</span>
          <img src="/images/bed.png" alt="Bed" />
          <p>F407R</p>
        </div>
        <div className="room-card">
          <span className="room-num">2</span>
          <img src="/images/bed.png" alt="Bed" />
          <p>A514R</p>
        </div>
        <div className="room-card">
          <span className="room-num">3</span>
          <img src="/images/bed.png" alt="Bed" />
          <p>B312R</p>
        </div>
      </div>
    </div>
  );
}
