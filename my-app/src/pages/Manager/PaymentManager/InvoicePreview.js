import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./InvoicePreview.css";
import { createInvoice, _obj } from "../../../config/api";

export default function InvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoiceDraft || null;

  if (!invoice) {
    return (
      <div className="ip-container">
        <h2>Hóa đơn</h2>
        <p className="warning">Thiếu dữ liệu. Vui lòng lập hóa đơn lại.</p>
        <button onClick={() => navigate("/manager/payments")} className="primary">⬅ Về quản lý</button>
      </div>
    );
  }

  const { date, roomInfo, items, total, students = [] } = invoice;

  // yyyy-mm-01 từ invoice.date
  const monthFirst = (() => {
    const d = invoice?.date;
    if (!d) return null;
    const [y, m] = String(d).split("-");
    return `${y}-${m}-01`;
  })();

  const managerName = "Manager Name";
  const managerEmail = "manager@webktx.com";

  const handleSend = async () => {
    try {
      if (!roomInfo?.id || !monthFirst) {
        alert("Thiếu roomId hoặc tháng.");
        return;
      }
      const details = [
        { serviceName: "Dien", quantity: Number(items?.electric?.kwh || 0), unit: "kWh" },
        { serviceName: "Nuoc", quantity: Number(items?.water?.m3 || 0), unit: "m3" },
      ];
      const extraQty = Number(items?.misc?.qty || 0);
      const extraUnitPrice = Number(items?.misc?.unitPrice || 0);
      if (extraQty > 0 && extraUnitPrice >= 0) {
        details.push({
          serviceName: "Phat sinh",
          quantity: extraQty,
          unitPrice: extraUnitPrice,
          unit: items?.misc?.unit || "lan",
          description: items?.misc?.note || null,
        });
      }

      const payload = { roomId: roomInfo.id, month: monthFirst, details };
      const res = await createInvoice(payload);
      const data = _obj(res);
      if (!data?.id) {
        alert("Tạo hóa đơn không thành công.");
        return;
      }
      alert("Đã tạo và gửi hóa đơn cho sinh viên!");
      navigate("/manager/invoices", { replace: true });
    } catch (e) {
      console.error(e);
      alert("Không gửi được hóa đơn. Vui lòng thử lại.");
    }
  };

  return (
    <div className="ip-container">
      <div className="ip-header">
        <h2>Hóa đơn phòng KTX</h2>
        <div className="ip-sub">Ngày lập: <b>{date}</b></div>
      </div>

      <div className="ip-grid">
        <div className="ip-card">
          <h3>Thông tin phòng</h3>
          <table className="kv">
            <tbody>
              <tr><td>Phòng</td><td><b>{roomInfo.name}</b></td></tr>
              <tr><td>Khu</td><td>{roomInfo.dormName}</td></tr>
              <tr><td>Tầng</td><td>{roomInfo.floor}</td></tr>
              <tr><td>Loại</td><td>{roomInfo.type} • {roomInfo.maxOccupants} chỗ</td></tr>
            </tbody>
          </table>
        </div>

        <div className="ip-card">
          <h3>Thông tin người lập</h3>
          <table className="kv">
            <tbody>
              <tr><td>Họ tên</td><td>{managerName}</td></tr>
              <tr><td>Email</td><td>{managerEmail}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Danh sách sinh viên */}
      <div className="ip-card">
        <h3>Sinh viên trong phòng</h3>
        {students.length === 0 ? (
          <div className="muted">Không có dữ liệu sinh viên.</div>
        ) : (
          <table className="table table-compact">
            <thead>
              <tr>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Giới tính</th>
                <th>Lớp</th>
                <th>Khóa</th>
                <th>Điện thoại</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.fullName}</td>
                  <td>{s.gender}</td>
                  <td>{s.className ?? "-"}</td>
                  <td>{s.academicYear ?? "-"}</td>
                  <td>{s.phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="ip-card">
        <h3>Các khoản phải nộp</h3>
        <table className="bill">
          <thead>
            <tr>
              <th>Khoản</th>
              <th>Thông tin</th>
              <th className="right">Thành tiền (đ)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tiền phòng</td>
              <td>Giá gốc phòng</td>
              <td className="right">{Number(items.roomFee).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Tiền điện</td>
              <td>{items.electric.kwh} kWh × {Number(items.electric.price).toLocaleString()}</td>
              <td className="right">{Number(items.electric.money).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Tiền nước</td>
              <td>{items.water.m3} m³ × {Number(items.water.price).toLocaleString()}</td>
              <td className="right">{Number(items.water.money).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Chi phí phát sinh</td>
              <td>
                {Number(items?.misc?.qty || 0)} {items?.misc?.unit || "lan"} × {Number(items?.misc?.unitPrice || 0).toLocaleString()} đ
                {items?.misc?.note ? ` — ${items.misc.note}` : ""}
              </td>
              <td className="right">{Number(items?.misc?.money || 0).toLocaleString()}</td>
            </tr>
            <tr className="total">
              <td colSpan={2} className="right"><b>TỔNG CỘNG</b></td>
              <td className="right"><b>{Number(total).toLocaleString()}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="ip-actions">
        <button onClick={() => navigate(-1)} className="primary">⬅ Sửa</button>
        <button className="primary" onClick={handleSend}>
          Gửi cho sinh viên
        </button>
      </div>
    </div>
  );
}
