import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Bookings.css";
import Define from "../../Define.json";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const studentData = location.state?.student;

  const [khu, setKhu] = useState("");
  const [gioiTinh, setGioiTinh] = useState("");
  const [loaiPhong, setLoaiPhong] = useState("");
  const [nha, setNha] = useState("");
  const [tang, setTang] = useState(1);
  const [floorsData, setFloorsData] = useState({});
  const [floorsSorted, setFloorsSorted] = useState([]);
  const [roomsFromServer, setRoomsFromServer] = useState([]);

  const khuOptions = Array.from(
    new Set((Define.LayDSToaNha?.response || []).map((i) => i.TenKhu))
  );
  const nhaOptions = Define.LayDSToaNha?.response || [];
  const roomTypeOptions =
    (Define.LayDSLoaiPhong?.response || []).map((i) => i.LoaiPhong) || [];

  // lấy dữ liệu thật từ server
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/rooms");
        const data = await res.json();
        setRoomsFromServer(data);
      } catch (err) {
        console.error("Không thể tải danh sách phòng từ server:", err);
      }
    };
    fetchRooms();
  }, []);

  function buildFullRoomList() {
    if (!nha || !gioiTinh || !loaiPhong) return [];
    const toa = (Define.LayDSTangTheoToa?.response || []).find(
      (t) => t.MaToa === nha
    );
    if (!toa) return [];

    const rooms = toa.DanhSachPhong.filter(
      (p) => p.GioiTinh === gioiTinh && p.LoaiPhong === loaiPhong
    );

    const serverRooms = roomsFromServer.filter((r) => r.dormName === nha);
    const merged = rooms.map((p) => {
      const serverRoom = serverRooms.find((r) => r.room_id === p.MaPhong);
      const current = serverRoom ? serverRoom.currentOccupants : 0;
      return {
        ...p,
        occupants: current,
        capacity: p.LoaiPhong.includes("6") ? 6 : 4,
        Tang: p.Tang,
      };
    });

    return merged;
  }

  useEffect(() => {
    const allFilled = khu && gioiTinh && loaiPhong && nha;
    if (!allFilled) {
      setFloorsData({});
      setFloorsSorted([]);
      return;
    }

    const fullRooms = buildFullRoomList();
    const grouped = {};
    fullRooms.forEach((r) => {
      if (!grouped[r.Tang]) grouped[r.Tang] = [];
      grouped[r.Tang].push(r);
    });

    const sorted = Object.keys(grouped)
      .map((n) => parseInt(n, 10))
      .sort((a, b) => a - b);
    setFloorsData(grouped);
    setFloorsSorted(sorted);
    setTang(sorted[0] || 1);
  }, [khu, gioiTinh, loaiPhong, nha, roomsFromServer]);

  const handleRoomClick = (roomId) => {
    navigate("/student", {
      state: {
        bookingInfo: { khu, gioiTinh, loaiPhong, nha, tang, phong: roomId },
      },
    });
  };

  const handleConfirm = () => {
    console.log("Thông tin sinh viên:", studentData);
    alert("Đăng ký thành công!");
    navigate("/success");
  };

  const handleKhuChange = (e) => {
    setKhu(e.target.value);
    setGioiTinh("");
    setLoaiPhong("");
    setNha("");
  };
  const handleGioiTinhChange = (e) => {
    setGioiTinh(e.target.value);
    setLoaiPhong("");
    setNha("");
  };
  const handleLoaiPhongChange = (e) => {
    setLoaiPhong(e.target.value);
    setNha("");
  };

  const getBedIcons = (used, total) => {
    const arr = [];
    for (let i = 0; i < used; i++)
      arr.push(
        <span key={"r" + i} className="bed red">
          👤
        </span>
      );
    for (let i = 0; i < total - used; i++)
      arr.push(
        <span key={"g" + i} className="bed green">
          🧍‍♂️
        </span>
      );
    return arr;
  };

  return (
    <div className="booking-container">
      <h2>Chọn phòng ký túc xá</h2>
      {studentData ? (
        <p className="welcome">
          Xin chào <b>{studentData.fullName}</b> ({studentData.studentId}) –{" "}
          {studentData.gender}
        </p>
      ) : (
        <p className="warning">Không có thông tin sinh viên!</p>
      )}

      {/* Bộ lọc */}
      <div className="filter-row">
        <select value={khu} onChange={handleKhuChange}>
          <option value="">-- Chọn Khu --</option>
          {khuOptions.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select
          value={gioiTinh}
          onChange={handleGioiTinhChange}
          disabled={!khu}
        >
          <option value="">-- Giới tính --</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>

        <select
          value={loaiPhong}
          onChange={handleLoaiPhongChange}
          disabled={!gioiTinh}
        >
          <option value="">-- Loại phòng --</option>
          {roomTypeOptions.map((lp) => (
            <option key={lp} value={lp}>
              {lp}
            </option>
          ))}
        </select>

        <select
          value={nha}
          onChange={(e) => setNha(e.target.value)}
          disabled={!loaiPhong}
        >
          <option value="">-- Nhà --</option>
          {nhaOptions
            .filter((n) => n.TenKhu === khu)
            .map((n) => (
              <option key={n.MaToa} value={n.MaToa}>
                {n.MaToa}
              </option>
            ))}
        </select>
      </div>

      {/* Thông tin sinh viên */}
      {studentData && (
        <table className="student-table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ và Tên</th>
              <th>Giới tính</th>
              <th>Ngày sinh</th>
              <th>Lớp</th>
              <th>Khoa</th>
              <th>Quê Quán</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{studentData.studentId}</td>
              <td>{studentData.fullName}</td>
              <td>{studentData.gender}</td>
              <td>{studentData.dateOfBirth}</td>
              <td>{studentData.className}</td>
              <td>{studentData.department}</td>
              <td>{studentData.address}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Danh sách phòng */}
      {nha && floorsSorted.length > 0 && (
        <>
          <div className="legend">
            <span className="legend-item red">👤 Đã có SV</span>
            <span className="legend-item green">🧍‍♂️ Còn trống</span>
          </div>

          <div className="floor-tabs">
            {floorsSorted.map((f) => (
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
            {floorsData[tang]?.map((room) => (
              <div
                key={room.MaPhong}
                className="room-card"
                onClick={() => handleRoomClick(room.MaPhong)}
              >
                <h3>{room.MaPhong}</h3>
                <p>
                  {room.LoaiPhong} <br />
                  <span className="count">
                    Còn trống: {room.capacity - room.occupants}/{room.capacity}
                  </span>
                </p>
                <div className="beds">
                  {getBedIcons(room.occupants, room.capacity)}
                </div>
              </div>
            ))}
          </div>

          <div className="confirm-btn">
            <button onClick={handleConfirm}>Xác nhận đăng ký</button>
          </div>
        </>
      )}
    </div>
  );
}
