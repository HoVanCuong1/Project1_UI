import React, { useState } from "react";
import "./PaymentHistory.css";

export default function PaymentHistory() {
  const [history, setHistory] = useState([
    {
      id: 1,
      item: "Tiền phòng",
      amount: 1200000,
      date: "2025-10-10",
      status: "Thành công",
    },
    {
      id: 2,
      item: "Tiền điện",
      amount: 250000,
      date: "2025-10-15",
      status: "Thành công",
    },
    {
      id: 3,
      item: "Tiền nước",
      amount: 100000,
      date: "2025-10-17",
      status: "Thành công",
    },
    {
      id: 4,
      item: "Phí phát sinh",
      amount: 50000,
      date: "2025-10-20",
      status: "Đang xử lý",
    },
  ]);

  return (
    <div className="history-container">
      <h1>Lịch sử thanh toán</h1>

      <table className="history-table">
        <thead>
          <tr>
            <th>Mục giao dịch</th>
            <th>Số tiền (VNĐ)</th>
            <th>Ngày giao dịch</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id}>
              <td>{item.item}</td>
              <td>{item.amount.toLocaleString()}</td>
              <td>{item.date}</td>
              <td
                className={
                  item.status === "Thành công"
                    ? "status success"
                    : item.status === "Đang xử lý"
                    ? "status pending"
                    : "status failed"
                }
              >
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
