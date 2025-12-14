// src/pages/RoomDetail.js
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
        const res = await getRoomById(roomId);
        // Chuẩn hoá phòng: interceptor có thể đã unwrap, nhưng ta vẫn an toàn:
        const data =
          res?.data?.data ??
          res?.data?.result ??
          res?.data ??
          res?.result ??
          res ??
          null;

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
      isFree: i >= used, // true nếu chỗ trống
    }));
  }, [room]);

  const isFull = useMemo(() => {
    if (!room) return false;
    const total = Number(room.maxOccupants || 0);
    const used  = Number(room.currentOccupants || 0);
    return used >= total;
  }, [room]);

  // Auto-chọn chỗ trống đầu tiên nếu có
  useEffect(() => {
    if (!seats.length) return;
    const firstFree = seats.find(s => s.isFree);
    if (firstFree) setSelectedSeat(prev => prev ?? firstFree.id);
    else setSelectedSeat(null);
  }, [seats]);

  const handleContinue = () => {
    if (!room) return;

    if (!selectedSeat) {
      alert("Phòng đã đầy hoặc bạn chưa chọn chỗ!");
      return;
    }

    navigate("/studentform", {
      state: {
        bookingInfo: {
          ...bookingInfo,
          roomId: room.id,                 // RM-A101 (id phòng để BE dùng)
          phong: room.name,                // A101 (tên hiển thị)
          cho: selectedSeat,
          khu: room.dormName,              // Block A
          floor: room.floor,               // Tầng
          loaiPhong: `${room.maxOccupants} chỗ`,
          price: room.price,               // giá để hiện ở bước sau
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

  const remain = Math.max(
    0,
    Number(room.maxOccupants || 0) - Number(room.currentOccupants || 0)
  );

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
                {room.type === "MALE" ? "Nam" : room.type === "FEMALE" ? "Nữ" : room.type} • {room.maxOccupants} chỗ
              </td>
            </tr>
            <tr>
              <td>Giá</td>
              <td>{Number(room.price).toLocaleString()} đ/tháng</td>
            </tr>
            <tr>
              <td>Còn trống</td>
              <td><b>{remain}</b> / {room.maxOccupants}</td>
            </tr>
          </tbody>
        </table>

        {isFull && (
          <div className="full-banner">
            Phòng đã đầy — vui lòng chọn phòng khác.
          </div>
        )}
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
            {seats.map((cho) => {
              const disabled = !cho.isFree; // không phải "Trống" thì disable
              return (
                <tr key={cho.id}>
                  <td>
                    <label style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
                      <input
                        type="radio"
                        name="chonCho"
                        disabled={disabled}
                        checked={selectedSeat === cho.id}
                        onChange={() => !disabled && setSelectedSeat(cho.id)}
                      />{" "}
                      Chỗ {cho.id}
                    </label>
                  </td>
                  <td className={cho.isFree ? "trong" : "dangky"}>
                    {cho.isFree ? "Trống" : "Đã được đăng ký"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="buttons">
          <button onClick={() => navigate(-1)}>⬅ Trở lại</button>
          <button
            className="next-btn"
            onClick={handleContinue}
            disabled={isFull || !selectedSeat}
            title={isFull ? "Phòng đã đầy" : (!selectedSeat ? "Vui lòng chọn chỗ" : "")}
          >
            Tiếp tục ➡
          </button>
        </div>
      </div>
    </div>
  );
}
