import React, { useEffect, useMemo, useState } from "react";
import "./InvoiceManager.css";
import {
  getInvoice,
  updateInvoice,
  recomputeInvoice,
  addInvoiceDetail,
  removeInvoiceDetail,
  _obj,
} from "../../../config/api";

export default function InvoiceEditorModal({ invoiceId, onClose, onChanged }) {
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Editable fields
  const [roomFee, setRoomFee] = useState("");
  const [status, setStatus] = useState("UNPAID");

  // Add detail form
  const [svcName, setSvcName] = useState("Phat sinh");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("lan");
  const [unitPrice, setUnitPrice] = useState("");
  const [desc, setDesc] = useState("");

  const fmtMoney = (n) => (Number(n||0)).toLocaleString();

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const res = await getInvoice(invoiceId);
      const data = _obj(res);
      setInv(data);
      setRoomFee(Number(data?.roomFee || 0));
      setStatus(String(data?.status || "UNPAID"));
    } catch (e) {
      setErr("Không tải được chi tiết hóa đơn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [invoiceId]);

  const handleSave = async () => {
    try {
      await updateInvoice(invoiceId, {
        roomFee: Number(roomFee || 0),
        status,
        // Không gửi details khi chỉ update giá/ trạng thái
      });
      await load();
      onChanged?.();
      alert("Đã lưu.");
    } catch (e) {
      alert("Lưu thất bại.");
    }
  };

  const handleRecompute = async () => {
    try {
      await recomputeInvoice(invoiceId);
      await load();
      onChanged?.();
      alert("Đã tính lại tổng.");
    } catch (e) {
      alert("Recompute thất bại.");
    }
  };

  const handleAddDetail = async () => {
    try {
      const body = {
        serviceName: svcName,
        quantity: Number(quantity || 0),
        unit,
      };
      // Chỉ đính kèm unitPrice & description khi là "Phat sinh" hoặc khi user nhập
      if (unitPrice) body.unitPrice = Number(unitPrice);
      if (desc) body.description = desc;

      await addInvoiceDetail(invoiceId, body);
      setUnitPrice(""); setDesc("");
      await load();
      onChanged?.();
    } catch (e) {
      alert("Thêm dòng chi tiết thất bại.");
    }
  };

  const handleRemoveDetail = async (detailId) => {
    if (!window.confirm("Xóa dòng chi tiết này?")) return;
    try {
      await removeInvoiceDetail(invoiceId, detailId);
      await load();
      onChanged?.();
    } catch (e) {
      alert("Xóa dòng chi tiết thất bại.");
    }
  };

  if (!invoiceId) return null;

  return (
    <div className="im-modal">
      <div className="im-modal-panel">
        <div className="im-modal-head">
          <h3>Hóa đơn #{invoiceId.slice(0,8)}…</h3>
          <button className="btn btn-light" onClick={onClose}>✕</button>
        </div>

        {loading && <p className="im-loading">Đang tải…</p>}
        {err && <p className="warning">{err}</p>}

        {!loading && inv && (
          <>
            <div className="im-two-col">
              <div className="im-box">
                <h4>Thông tin</h4>
                <table className="kv">
                  <tbody>
                    <tr><td>Phòng</td><td><b>{inv.roomName}</b> <span className="muted">{inv.roomId}</span></td></tr>
                    <tr><td>Tháng</td><td>{String(inv.month).slice(0,7)}</td></tr>
                    <tr><td>Ngày tạo</td><td>{inv.createdAt || "-"}</td></tr>
                    <tr><td>Trạng thái</td>
                      <td>
                        <select value={status} onChange={(e)=> setStatus(e.target.value)}>
                          <option value="UNPAID">UNPAID</option>
                          <option value="PAID">PAID</option>
                        </select>
                      </td>
                    </tr>
                    <tr><td>Tiền phòng</td>
                      <td>
                        <input type="number" value={roomFee} onChange={(e)=> setRoomFee(e.target.value)} />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="im-actions-inline">
                  <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
                  <button className="btn btn-secondary" onClick={handleRecompute}>Recompute</button>
                </div>
              </div>

              <div className="im-box">
                <h4>Thêm dòng chi tiết</h4>
                <div className="im-grid">
                  <label>
                    Dịch vụ
                    <select value={svcName} onChange={(e)=> setSvcName(e.target.value)}>
                      <option value="Phat sinh">Phat sinh</option>
                      <option value="Dien">Dien</option>
                      <option value="Nuoc">Nuoc</option>
                    </select>
                  </label>
                  <label>
                    Số lượng
                    <input type="number" min="0" value={quantity} onChange={(e)=> setQuantity(e.target.value)} />
                  </label>
                  <label>
                    Đơn vị
                    <input value={unit} onChange={(e)=> setUnit(e.target.value)} placeholder="kWh/m3/lan" />
                  </label>
                  <label>
                    Đơn giá (tuỳ chọn)
                    <input type="number" min="0" value={unitPrice} onChange={(e)=> setUnitPrice(e.target.value)} />
                  </label>
                  <label className="col-span-2">
                    Mô tả
                    <input value={desc} onChange={(e)=> setDesc(e.target.value)} placeholder="Ghi chú" />
                  </label>
                </div>
                <div className="im-actions-inline">
                  <button className="btn btn-primary" onClick={handleAddDetail}>Thêm</button>
                </div>
              </div>
            </div>

            <div className="im-box">
              <h4>Chi tiết dịch vụ</h4>
              <table className="im-table">
                <thead>
                  <tr>
                    <th>Dịch vụ</th>
                    <th className="right">SL</th>
                    <th>Đơn vị</th>
                    <th className="right">Đơn giá</th>
                    <th className="right">Thành tiền</th>
                    <th>Mô tả</th>
                    <th className="center">Xoá</th>
                  </tr>
                </thead>
                <tbody>
                  {(inv.details || []).map(d => (
                    <tr key={d.detailId}>
                      <td>{d.serviceName}</td>
                      <td className="right">{d.quantity}</td>
                      <td>{d.unit}</td>
                      <td className="right">{fmtMoney(d.unitPrice)}</td>
                      <td className="right">{fmtMoney(d.totalAmount)}</td>
                      <td>{d.description || "-"}</td>
                      <td className="center">
                        <button className="btn btn-danger" onClick={()=> handleRemoveDetail(d.detailId)}>Xoá</button>
                      </td>
                    </tr>
                  ))}
                  {(!inv.details || inv.details.length===0) && (
                    <tr><td colSpan={7} style={{textAlign:"center"}}>Chưa có dòng chi tiết.</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="right"><b>Tổng dịch vụ</b></td>
                    <td className="right"><b>{fmtMoney(inv.totalServiceFee)}</b></td>
                    <td colSpan={2}></td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="right"><b>TỔNG CỘNG</b></td>
                    <td className="right"><b>{fmtMoney(inv.totalAmount)}</b></td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
