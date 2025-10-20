import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./RoomDetail.css";

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Giả lập dữ liệu phòng
  const roomData = {
    P101: {
      khu: "A",
      nha: "A10",
      phong: "P101",
      loaiPhong: "Phòng 6 sinh viên",
      choNgoi: [
        { id: 1, trangThai: "Đã được đăng ký" },
        { id: 2, trangThai: "Trống" },
        { id: 3, trangThai: "Đã được đăng ký" },
        { id: 4, trangThai: "Trống" },
        { id: 5, trangThai: "Đã được đăng ký" },
        { id: 6, trangThai: "Đã được đăng ký" },
      ],
    },
    P202: {
      khu: "A",
      nha: "A11",
      phong: "P202",
      loaiPhong: "Phòng 4 sinh viên",
      choNgoi: [
        { id: 1, trangThai: "Trống" },
        { id: 2, trangThai: "Trống" },
        { id: 3, trangThai: "Đã được đăng ký" },
        { id: 4, trangThai: "Trống" },
      ],
    },
  };

  const phong = roomData[roomId];

  if (!phong) {
    return (
      <div className="room-detail-container">
        <h2>Không tìm thấy thông tin phòng {roomId}</h2>
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
              <td>{phong.khu}</td>
            </tr>
            <tr>
              <td>Nhà</td>
              <td>{phong.nha}</td>
            </tr>
            <tr>
              <td>Phòng</td>
              <td>{phong.phong}</td>
            </tr>
            <tr>
              <td>Loại phòng</td>
              <td>{phong.loaiPhong}</td>
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
            {phong.choNgoi.map((cho) => (
              <tr key={cho.id}>
                <td>
                  <input
                    type="radio"
                    disabled={cho.trangThai !== "Trống"}
                    name="chonCho"
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
          <button className="next-btn">Tiếp tục ➡</button>
        </div>
      </div>
    </div>
  );
}
