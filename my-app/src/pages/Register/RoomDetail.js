import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./RoomDetail.css";
import { getRoomById } from "../../config/api";

export default function RoomDetail() {
  const { roomId } = useParams();           // ví dụ: RM-A101
  const navigate = useNavigate();
  const location = useLocation();
  const bookingInfo = location.state?.bookingInfo || {};

  const [room, setRoom] = useState(null);   // dữ liệu từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);

  // tải room theo id
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getRoomById(roomId); // interceptor trả thẳng object room
        if (mounted) setRoom(data || null);
      } catch (e) {
        if (mounted) setError("Không tải được thông tin phòng.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [roomId]);

  // sinh danh sách chỗ dựa trên max/current
  const seats = useMemo(() => {
    if (!room) return [];
    const total = Number(room.maxOccupants || 0);
    const used = Number(room.currentOccupants || 0);
    return Array.from({ length: total }, (_, i) => ({
      id: i + 1,
      trangThai: i < used ? "Đã được đăng ký" : "Trống",
    }));
  }, [room]);

  const handleContinue = () => {
    if (!selectedSeat) {
      alert("Vui lòng chọn chỗ trống trước khi tiếp tục!");
      return;
    }
    if (!room) return;

    navigate("/studentform", {
      state: {
        bookingInfo: {
          ...bookingInfo,
          roomId: room.id,                 // RM-A101
          phong: room.name,                // A101 (tên phòng để hiển thị)
          cho: selectedSeat,
          khu: room.dormName,              // Block A
          floor: room.floor,               // Tầng
          loaiPhong: `${room.maxOccupants} chỗ`,
          price: room.price,               // truyền giá nếu cần dùng ở bước sau
          type: room.type,                 // MALE/FEMALE
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="room-detail-container">
        <p>Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="room-detail-container">
        <h2>{error || `Không tìm thấy thông tin phòng ${roomId}`}</h2>
        <button onClick={() => navigate(-1)}>⬅ Trở lại</button>
      </div>
    );
  }

  return (
    <div className="room-detail-container">
      <div className="info-box">
        <h2>THÔNG TIN PHÒNG</h2>
        <table>
          <tbody>
            <tr>
              <td>Khu</td>
              <td>{room.dormName}</td>
            </tr>
            <tr>
              <td>Phòng</td>
              <td>{room.name}</td>
            </tr>
            <tr>
              <td>Tầng</td>
              <td>{room.floor}</td>
            </tr>
            <tr>
              <td>Loại</td>
              <td>
                {room.type} • {room.maxOccupants} chỗ
              </td>
            </tr>
            <tr>
              <td>Giá</td>
              <td>{Number(room.price).toLocaleString()} đ/tháng</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="slots-box">
        <h2>DANH SÁCH CHỖ TRỐNG</h2>
        <table>
          <thead>
            <tr>
              <th>Chỗ</th>
              <th>Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            {seats.map((cho) => (
              <tr key={cho.id}>
                <td>
                  <input
                    type="radio"
                    name="chonCho"
                    disabled={cho.trangThai !== "Trống"}
                    onChange={() => setSelectedSeat(cho.id)}
                  />{" "}
                  Chỗ {cho.id}
                </td>
                <td className={cho.trangThai === "Trống" ? "trong" : "dangky"}>
                  {cho.trangThai}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="buttons">
          <button onClick={() => navigate(-1)}>⬅ Trở lại</button>
          <button className="next-btn" onClick={handleContinue}>
            Tiếp tục ➡
          </button>
        </div>
      </div>
    </div>
  );
}
