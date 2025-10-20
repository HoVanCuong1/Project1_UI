import React from "react";
import "./RoomDetail.css";
import { useNavigate, useParams } from "react-router-dom";

export default function RoomDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // ví dụ id = "P104"

  // Giả lập dữ liệu phòng (sau này bạn có thể fetch API thật)
  const roomData = {
    khu: "Khu A",
    nha: "A05",
    phong: id,
    loaiphong: "Phòng 6 sinh viên",
    choTrong: [
      { id: 1, tinhtrang: "Đã được đăng ký" },
      { id: 2, tinhtrang: "Trống" },
      { id: 3, tinhtrang: "Đã được đăng ký" },
      { id: 4, tinhtrang: "Trống" },
      { id: 5, tinhtrang: "Đã được đăng ký" },
      { id: 6, tinhtrang: "Đã được đăng ký" },
    ],
  };

  return (
    <div className="room-detail-container">
      <div className="room-info">
        <h3>THÔNG TIN PHÒNG</h3>
        <table>
          <tbody>
            <tr>
              <td>Khu</td>
              <td>
                <b>{roomData.khu}</b>
              </td>
            </tr>
            <tr>
              <td>Nhà</td>
              <td>
                <b>{roomData.nha}</b>
              </td>
            </tr>
            <tr>
              <td>Phòng</td>
              <td>
                <b>{roomData.phong}</b>
              </td>
            </tr>
            <tr>
              <td>Loại phòng</td>
              <td>
                <b>{roomData.loaiphong}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="room-available">
        <h3>DANH SÁCH CHỖ TRỐNG</h3>
        <table>
          <thead>
            <tr>
              <th>Chỗ trống</th>
              <th>Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            {roomData.choTrong.map((cho) => (
              <tr key={cho.id}>
                <td>
                  <input
                    type="radio"
                    disabled={cho.tinhtrang !== "Trống"}
                    name="cho"
                  />{" "}
                  <button
                    className={`cho-btn ${
                      cho.tinhtrang !== "Trống" ? "disabled" : ""
                    }`}
                  >
                    Chỗ {cho.id}
                  </button>
                </td>
                <td className={cho.tinhtrang === "Trống" ? "trong" : "dangky"}>
                  {cho.tinhtrang}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Trở lại
        </button>
        <button className="next-btn">Tiếp tục →</button>
      </div>
    </div>
  );
}
