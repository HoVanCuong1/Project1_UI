import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CreateInvoice.css";
import { getStudentsInRoom, getElectricWaterPrices, _arr } from "../../../config/api";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const roomInfo = location.state?.roomInfo || null;

  // form fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [electricKwh, setElectricKwh] = useState(""); // số kWh
  const [electricPrice, setElectricPrice] = useState(3500); // đ/kWh
  const [waterM3, setWaterM3] = useState(""); // số m3
  const [waterPrice, setWaterPrice] = useState(7000); // đ/m3
  const [miscAmount, setMiscAmount] = useState(""); // đơn giá phát sinh (đ/lần)
  const [miscQty, setMiscQty] = useState(1);         // số lần
  const [miscNote, setMiscNote] = useState("");      // mô tả

  // danh sách SV trong phòng
  const [students, setStudents] = useState([]);
  const [loadingStu, setLoadingStu] = useState(false);

  // load SV trong phòng
  useEffect(() => {
    const fetchStudents = async () => {
      if (!roomInfo?.id) return;
      try {
        setLoadingStu(true);
        const res = await getStudentsInRoom(roomInfo.id); // /students/{roomId}/students
        setStudents(_arr(res));
      } catch (e) {
        console.error("Load students error:", e);
        setStudents([]);
      } finally {
        setLoadingStu(false);
      }
    };
    fetchStudents();
  }, [roomInfo?.id]);

  // load giá điện nước chuẩn từ BE
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const res = await getElectricWaterPrices(); // [{name:"Dien",price:3500},{name:"Nuoc",price:7000}]
        const arr = _arr(res);
        const dien = arr.find(x => String(x.name).toLowerCase() === "dien");
        const nuoc = arr.find(x => String(x.name).toLowerCase() === "nuoc");
        if (dien?.price != null) setElectricPrice(Number(dien.price));
        if (nuoc?.price != null) setWaterPrice(Number(nuoc.price));
      } catch (e) {
        // fallback giữ default
      }
    };
    loadPrices();
  }, []);

  const baseRoom = Number(roomInfo?.price ?? 0);

  const electricMoney = useMemo(() => {
    const kwh = Number(electricKwh || 0);
    const p = Number(electricPrice || 0);
    return kwh * p;
  }, [electricKwh, electricPrice]);

  const waterMoney = useMemo(() => {
    const m3 = Number(waterM3 || 0);
    const p = Number(waterPrice || 0);
    return m3 * p;
  }, [waterM3, waterPrice]);

  const miscMoney = Number(miscAmount || 0) * Number(miscQty || 0);
  const total = baseRoom + electricMoney + waterMoney + miscMoney;

  const handlePreview = () => {
    if (!roomInfo) {
      alert("Thiếu thông tin phòng.");
      return;
    }
    navigate("/manager/payments-preview", {
      state: {
        invoiceDraft: {
          date,
          roomInfo,
          students, // truyền sang xem trước
          items: {
            roomFee: baseRoom,
            electric: { kwh: Number(electricKwh || 0), price: Number(electricPrice || 0), money: electricMoney },
            water: { m3: Number(waterM3 || 0), price: Number(waterPrice || 0), money: waterMoney },
            misc: {
              unitPrice: Number(miscAmount || 0),
              qty: Number(miscQty || 0),
              unit: "lan",
              money: miscMoney,
              note: miscNote
            },
          },
          total,
        },
      },
    });
  };

  if (!roomInfo) {
    return (
      <div className="ci-container">
        <h2>Lập hóa đơn</h2>
        <p className="warning">Thiếu thông tin phòng. Vui lòng quay lại chọn phòng.</p>
        <button onClick={() => navigate("/manager/payments")} className="secondary">⬅ Quay lại</button>
      </div>
    );
  }

  return (
    <div className="ci-container">
      <h2>Lập hóa đơn</h2>

      <div className="ci-grid">
        {/* Thông tin phòng */}
        <div className="ci-card">
          <h3>Thông tin phòng</h3>
          <table className="kv">
            <tbody>
              <tr><td>Phòng</td><td><b>{roomInfo.name}</b></td></tr>
              <tr><td>Khu</td><td>{roomInfo.dormName}</td></tr>
              <tr><td>Tầng</td><td>{roomInfo.floor}</td></tr>
              <tr><td>Loại</td><td>{roomInfo.type} • {roomInfo.maxOccupants} chỗ</td></tr>
              <tr><td>Giá gốc</td><td>{Number(roomInfo.price).toLocaleString()} đ/tháng</td></tr>
            </tbody>
          </table>
        </div>

        {/* Danh sách sinh viên trong phòng */}
        <div className="ci-card">
          <h3>Sinh viên trong phòng</h3>
          {loadingStu ? (
            <div className="muted">Đang tải...</div>
          ) : students.length === 0 ? (
            <div className="muted">Chưa có sinh viên.</div>
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

        {/* Form lập hóa đơn */}
        <div className="ci-card">
          <h3>Thông tin lập hóa đơn</h3>
          <div className="ci-form">
            <label>
              Ngày lập
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>

            <div className="ci-row">
              <div>
                <label>
                  Điện (kWh)
                  <input type="number" min="0" value={electricKwh} onChange={(e) => setElectricKwh(e.target.value)} />
                </label>
              </div>
              <div>
                <label>
                  Giá điện (đ/kWh)
                  <input type="number" min="0" value={electricPrice} onChange={(e) => setElectricPrice(e.target.value)} />
                </label>
              </div>
              <div className="ci-money">= {electricMoney.toLocaleString()} đ</div>
            </div>

            <div className="ci-row">
              <div>
                <label>
                  Nước (m³)
                  <input type="number" min="0" value={waterM3} onChange={(e) => setWaterM3(e.target.value)} />
                </label>
              </div>
              <div>
                <label>
                  Giá nước (đ/m³)
                  <input type="number" min="0" value={waterPrice} onChange={(e) => setWaterPrice(e.target.value)} />
                </label>
              </div>
              <div className="ci-money">= {waterMoney.toLocaleString()} đ</div>
            </div>

            <div className="ci-row">
              <div>
                <label>
                  Đơn giá phát sinh (đ/lần)
                  <input
                    type="number"
                    min="0"
                    value={miscAmount}
                    onChange={(e) => setMiscAmount(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Số lần
                  <input
                    type="number"
                    min="0"
                    value={miscQty}
                    onChange={(e) => setMiscQty(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Đơn vị
                  <input type="text" value="lan" disabled />
                </label>
              </div>
              <div className="ci-col-span">
                <label>
                  Mô tả chi phí
                  <input
                    type="text"
                    value={miscNote}
                    onChange={(e) => setMiscNote(e.target.value)}
                    placeholder="VD: Sửa khóa, vệ sinh..."
                  />
                </label>
              </div>
              <div className="ci-money">= {miscMoney.toLocaleString()} đ</div>
            </div>

            <div className="ci-total">
              <div>Mục bắt buộc: Tiền phòng</div>
              <div className="sum">
                Tổng cộng: <b>{total.toLocaleString()} đ</b>
              </div>
            </div>

            <div className="ci-actions">
              <button onClick={() => navigate(-1)} className="secondary">⬅ Quay lại</button>
              <button onClick={handlePreview} className="primary">Xem hóa đơn ➜</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
