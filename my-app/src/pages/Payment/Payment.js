import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./Payment.css";

export default function Payment() {
  const [items, setItems] = useState([
    { id: 1, name: "Tiền phòng", amount: 1200000, checked: false },
    { id: 2, name: "Tiền điện", amount: 150000, checked: false },
    { id: 3, name: "Tiền nước", amount: 80000, checked: false },
    { id: 4, name: "Phí phát sinh", amount: 50000, checked: false },
  ]);

  const [showQR, setShowQR] = useState(false);

  const handleCheck = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const total = items
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.amount, 0);

  const handlePay = () => {
    if (total === 0) {
      alert("Vui lòng chọn ít nhất 1 khoản cần thanh toán!");
      return;
    }
    setShowQR(true);
  };
  const handleBack = () => {
    setShowQR(false);
  };
  return (
    <div className="payment-container">
      {!showQR ? (
        <>
          <h2>Danh sách các khoản cần thanh toán</h2>
          <table className="payment-table">
            <thead>
              <tr>
                <th>Khoản mục</th>
                <th>Số tiền (VNĐ)</th>
                <th>Chọn</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.amount.toLocaleString()}</td>
                  <td className="center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheck(item.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="payment-summary">
            <p>
              <strong>Tổng tiền:</strong> {total.toLocaleString()} VNĐ
            </p>
            <button onClick={handlePay} className="pay-btn">
              Thanh toán
            </button>
          </div>
        </>
      ) : (
        <div className="qr-section">
          <h3>Quét mã QR để thanh toán</h3>
          {/* <QRCodeCanvas
            value="https://example.com/thanh-toan-cuong" // 🧭 link QR thật của bạn để ở đây
            size={200}
          /> */}
          {/* <img src="/images/logo-Payment.jpg" alt="QR Thanh Toán" className="qr-image" /> */}
          <img
            src="/images/qr_cuong.jpg "
            alt="QR Thanh Toán"
            className="qr-image"
          />
          <p>Mã QR của Hồ Văn Cường</p>
          <button onClick={handleBack} className="back-btn">
            ← Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
