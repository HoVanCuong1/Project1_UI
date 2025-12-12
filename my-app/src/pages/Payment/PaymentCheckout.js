import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import { createVnPayUrl } from "../../config/api"; // hàm mới

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoice || null;

  const [loadingVnPay, setLoadingVnPay] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState("");
  const [err, setErr] = useState("");

  const monthText = invoice?.month ? new Date(invoice.month).toISOString().slice(0, 7) : "-";
  const totalText = Number(invoice?.totalAmount || 0).toLocaleString();

  if (!invoice) {
    return (
      <div className="payment-container">
        <h2>Thanh toán</h2>
        <div className="warning">Thiếu dữ liệu hóa đơn. Vui lòng quay lại.</div>
        <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>
      </div>
    );
  }

  const handleVnPayCreate = async () => {
    // Tạo paymentUrl bằng api
    try {
      setErr("");
      setLoadingVnPay(true);
      setVnpayUrl("");
      // Nếu bạn muốn truyền payerStudentId: lấy từ invoice hoặc user
      const payload = {
        invoiceId: invoice.id,
        payerStudentId: invoice?.studentId || undefined,
      };
      const res = await createVnPayUrl(payload);
      // cấu trúc response: res.data.data.paymentUrl
      const paymentUrl = res?.paymentUrl || res?.data?.paymentUrl || res?.data?.data?.paymentUrl || null;

      console.log(paymentUrl)
      console.log(res?.data?.data?.paymentUrl)
      console.log(res?.data?.paymentUrl)
      if (!paymentUrl) {
        setErr("Không nhận được paymentUrl từ server.");
        return;
      }
      setVnpayUrl(paymentUrl);
      // Mở ra tab mới (gateway)
      window.open(paymentUrl, "_blank");
    } catch (e) {
      console.error("createVnPay error:", e);
      setErr("Tạo URL VNPAY thất bại. Kiểm tra console.");
    } finally {
      setLoadingVnPay(false);
    }
  };

  const handleOpenVnPay = () => {
    if (vnpayUrl) window.open(vnpayUrl, "_blank");
  };

  return (
    <div className="payment-container">
      <h2>Thanh toán hóa đơn</h2>

      <div className="card">
        <div className="header-row">
          <div>
            <div className="muted">Mã hóa đơn</div>
            <div className="big">{invoice.id}</div>
          </div>
          <div>
            <div className="muted">Phòng</div>
            <div className="big">{invoice.roomName}</div>
          </div>
          <div>
            <div className="muted">Tháng</div>
            <div className="big">{monthText}</div>
          </div>
          <div>
            <div className="muted">Tổng tiền</div>
            <div className="big">{totalText} đ</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <p className="muted">Các khoản (tóm tắt):</p>
          <table className="payment-table" style={{ marginTop: 6 }}>
            <thead>
              <tr><th>Khoản</th><th>Thông tin</th><th className="right">Số (đ)</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Tiền phòng</td>
                <td>Giá gốc phòng</td>
                <td className="right">{Number(invoice.roomFee || 0).toLocaleString()}</td>
              </tr>
              {Array.isArray(invoice.details) && invoice.details.map(d => (
                <tr key={d.detailId || `${d.serviceName}-${d.unit}`}>
                  <td>{d.serviceName}</td>
                  <td>{d.quantity} {d.unit} × {Number(d.unitPrice || 0).toLocaleString()}</td>
                  <td className="right">{Number(d.totalAmount || 0).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="total">
                <td colSpan={2} className="right"><b>TỔNG CỘNG</b></td>
                <td className="right"><b>{totalText}</b></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Momo button (nếu bạn tiếp tục dùng Momo) */}
            <button
              disabled
              className="pay-btn"
              onClick={() => {
                // nếu bạn có API Momo, dùng navigate hoặc open
                if (invoice?.momoUrl) window.open(invoice.momoUrl, "_blank");
                else alert("Chưa có cấu hình Momo tại client.");
              }}
              style={{ opacity: 0.6, cursor: 'not-allowed' }} // (Tùy chọn) Thêm style để nhìn cho giống nút chết
            >
              Thanh toán bằng Momo (Đang bảo trì)
            </button>

            {/* VNPAY */}
            <button
              className="pay-btn vn"
              onClick={handleVnPayCreate}
              disabled={loadingVnPay}
              title="Tạo URL VNPAY và mở trang thanh toán"
            >
              {loadingVnPay ? "Đang tạo VNPAY…" : "Thanh toán bằng VNPAY"}
            </button>

            {/* Nếu đã có vnpayUrl thì hiện nút mở lại */}
            {vnpayUrl && (
              <button className="btn-light" onClick={handleOpenVnPay}>
                Mở trang VNPAY
              </button>
            )}

            <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>
          </div>

          {err && <div className="warning" style={{ marginTop: 12 }}>{err}</div>}

          {/* hiển thị orderInfo + paymentId nếu có (debug) */}
          {invoice?.id && (
            <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
              Mã hóa đơn: {invoice.id} • Ghi chú: {invoice?.notes || invoice?.orderInfo || "-"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
