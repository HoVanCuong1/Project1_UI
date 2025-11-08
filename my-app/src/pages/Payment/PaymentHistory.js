import React, { useEffect, useState } from "react";
import "./PaymentHistory.css";
import {
  getMyInfo,
  getStudentById,
  searchInvoicesByRoom,
  _obj,
  _arr,
} from "../../config/api";

export default function PaymentHistory() {
  const [roomId, setRoomId] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1️⃣ Lấy roomId từ tài khoản đang đăng nhập
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError("");
        const meRes = await getMyInfo();
        const me = _obj(meRes);
        if (!me?.studentId) {
          setError("Không tìm thấy studentId trong tài khoản hiện tại.");
          return;
        }

        const stuRes = await getStudentById(me.studentId);
        const stu = _obj(stuRes);
        if (!stu?.roomId) {
          setError("Tài khoản chưa được gán phòng.");
          return;
        }

        setRoomId(stu.roomId);
      } catch (e) {
        console.error(e);
        setError("Không xác định được phòng của bạn.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, []);

  // 2️⃣ Gọi API lấy lịch sử hóa đơn theo roomId
  useEffect(() => {
    const fetchHistory = async () => {
      if (!roomId) return;
      try {
        setLoading(true);
        setError("");
        const res = await searchInvoicesByRoom(roomId, 0, 20);
        const arr = _arr(res);
        setHistory(arr || []);
      } catch (e) {
        console.error(e);
        setError("Không tải được lịch sử thanh toán.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [roomId]);

  // 3️⃣ Hàm helper hiển thị trạng thái
  const renderStatus = (status) => {
    switch (status) {
      case "PAID":
        return <span className="status success">Đã thanh toán</span>;
      case "UNPAID":
        return <span className="status pending">Chưa thanh toán</span>;
      default:
        return <span className="status failed">{status}</span>;
    }
  };

  return (
    <div className="history-container">
      <h1>Lịch sử thanh toán</h1>

      {loading && <p className="muted">Đang tải...</p>}
      {error && <p className="warning">{error}</p>}

      {!loading && !error && roomId && (
        <>
          <div className="muted">
            Mã phòng: <b>{roomId}</b>
          </div>
          {history.length === 0 ? (
            <p className="muted">Chưa có hóa đơn nào.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Tháng</th>
                  <th>Tiền phòng (VNĐ)</th>
                  <th>Tiền dịch vụ (VNĐ)</th>
                  <th>Tổng tiền (VNĐ)</th>
                  <th>Trạng thái</th>
                  <th>Ngày lập</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{item.roomName}</td>
                    <td>
                      {item.month
                        ? new Date(item.month).toISOString().slice(0, 7)
                        : "-"}
                    </td>
                    <td>{Number(item.roomFee || 0).toLocaleString()}</td>
                    <td>{Number(item.totalServiceFee || 0).toLocaleString()}</td>
                    <td>
                      <b>{Number(item.totalAmount || 0).toLocaleString()}</b>
                    </td>
                    <td>{renderStatus(item.status)}</td>
                    <td>{item.createdAt || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
