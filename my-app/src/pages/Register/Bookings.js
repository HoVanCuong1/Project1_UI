import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Bookings.css";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const studentData = location.state?.student;

  // Các state cần đặt ở đầu component
  const [khu, setKhu] = useState("");
  const [gioiTinh, setGioiTinh] = useState("");
  const [loaiPhong, setLoaiPhong] = useState("");
  // const [nha, setNha] = useState("");
  const [tang, setTang] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [isSent, setIsSent] = useState(false);

  // Dữ liệu mẫu
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

  // Danh sách phòng từng tầng
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

  // Khi click vào phòng → chuyển sang trang chi tiết
  //Lưu giá trị phòng
  const handleRoomClick = (roomId) => {
    setSelectedRoom(roomId); // chỉ lưu tạm thời
  };

  // Khi nhấn xác nhận
  const handleConfirm = () => {
    if (!khu || !loaiPhong || !tang) {
      alert(
        "Vui lòng chọn đủ khu, nhà, loại phòng và tầng trước khi xác nhận!"
      );
      return;
    }

    navigate(`/roomdetail/${selectedRoom || "P101"}`, {
      state: {
        bookingInfo: {
          khu,
          gioiTinh,
          loaiPhong,
          // nha,
          tang,
        },
      },
    });
  };

  // Khi thay đổi select
  const handleKhuChange = (e) => {
    setKhu(e.target.value);
    setGioiTinh("");
    setLoaiPhong("");
  };

  const handleGioiTinhChange = (e) => {
    setGioiTinh(e.target.value);
    setLoaiPhong("");
  };

  const handleLoaiPhongChange = (e) => {
    setLoaiPhong(e.target.value);
  };
  const handleSendToAdmin = (student) => {
    if (!student) {
      alert("Không có thông tin sinh viên để gửi!");
      return;
    }

    // Giả lập gửi dữ liệu
    console.log("Đã gửi thông tin sinh viên lên admin:", student);
    setIsSent(true); // ✅ Cập nhật trạng thái đã gửi
    alert(`Đã gửi đăng ký của ${student.fullName} lên admin!`);
  };

  const handleDelete = (studentId) => {
    if (window.confirm("Bạn có chắc muốn xóa đăng ký này không?")) {
      console.log("Đã xóa sinh viên có ID:", studentId);
      alert("Xóa thành công!");
      // Có thể thêm code điều hướng hoặc xóa khỏi state tại đây
    }
  };

  // Render icon giường
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
      <h2>Chọn phòng ký túc xá</h2>
      {studentData ? (
        <p className="welcome">
          Xin chào <b>{studentData.fullName}</b> ({studentData.studentId}) –{" "}
          {studentData.gender}
        </p>
      ) : (
        <p className="warning">Không có thông tin sinh viên!</p>
      )}
      {/* Hàng chọn bộ lọc */}
      <div className="filter-row">
        <select value={khu} onChange={handleKhuChange}>
          <option value="">-- Chọn Khu --</option>
          {Object.keys(data).map((k) => (
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
          {khu &&
            Object.keys(data[khu]).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
        </select>

        <select
          value={loaiPhong}
          onChange={handleLoaiPhongChange}
          disabled={!gioiTinh}
        >
          <option value="">-- Loại phòng --</option>
          {khu &&
            gioiTinh &&
            Object.keys(data[khu][gioiTinh]).map((lp) => (
              <option key={lp} value={lp}>
                {lp}
              </option>
            ))}
        </select>
      </div>
      {/* Bảng hiển thị thông tin sinh viên */}
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
              <th>Xác Nhận</th>
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
              <td>
                {isSent ? (
                  <span className="sent-status">✅ Đã gửi</span>
                ) : (
                  <>
                    <button
                      className="send-btn"
                      onClick={() => handleSendToAdmin(studentData)}
                    >
                      Gửi
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(studentData.studentId)}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {studentData && (
        <table className="room-table">
          <thead>
            <tr>
              <th>Khu </th>
              <th>Tầng</th>
              <th>Loại phòng</th>
              <th>Phòng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{studentData.khu}</td>
              <td>{studentData.tang}</td>
              <td>{studentData.loaiPhong}</td>
              <td>{studentData.phong}</td>
            </tr>
          </tbody>
        </table>
      )}
      {/* Khi đã chọn nhà */}
      {loaiPhong && (
        <>
          <div className="legend">
            <span className="legend-item red">👤 Đã có SV</span>
            <span className="legend-item green">🧍‍♂️ Còn trống</span>
          </div>

          {/* Các tầng hiển thị ngang */}
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

          {/* Danh sách phòng */}
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
          <div className="confirm-btn">
            <button onClick={handleConfirm}>Xác nhận đăng ký</button>
          </div>
        </>
      )}
    </div>
  );
}
