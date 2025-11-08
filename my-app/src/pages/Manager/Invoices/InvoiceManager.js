import React, { useEffect, useMemo, useState } from "react";
import "./InvoiceManager.css";
import {
  getInvoicesPaged,
  searchInvoicesByMonth,
  searchInvoicesByRoom,
  searchInvoicesByStatus,
  deleteInvoice,
  _arr,
  _obj,
} from "../../../config/api";
import InvoiceEditorModal from "./InvoiceEditorModal";

export default function InvoiceManager() {
  // Filters
  const [month, setMonth] = useState("");     // input type="month" -> "YYYY-MM"
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("");   // "", UNPAID, PAID

  // Paging
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Data
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Modal editor
  const [openId, setOpenId] = useState(null);

  const anyFilter = useMemo(() => !!(month || roomId || status), [month, roomId, status]);

  const fetchDefault = async (idx = pageIndex, size = pageSize) => {
    setLoading(true); setErr("");
    try {
      const res = await getInvoicesPaged(idx, size);
      setRows(_arr(res?.data?.data ? res.data.data : res?.data?.result ? res.data.result : res));
      setMeta(res?.data?.data?.meta ?? res?.data?.meta ?? res?.meta ?? { page: idx+1, pageSize: size, pages: 1, total: 0 });
    } catch (e) {
      setErr("Không tải được danh sách hóa đơn.");
    } finally {
      setLoading(false);
    }
  };

  const fetchByFilters = async (idx = pageIndex, size = pageSize) => {
    setLoading(true); setErr("");
    try {
      let res;
      if (month) {
        // API nhận month=YYYY-MM (không kèm -01)
        res = await searchInvoicesByMonth(month, idx, size);
      } else if (roomId) {
        res = await searchInvoicesByRoom(roomId, idx, size);
      } else if (status) {
        res = await searchInvoicesByStatus(status, idx, size);
      } else {
        return fetchDefault(idx, size);
      }
      const data = res?.data?.data ?? res?.data ?? res;
      setRows(data?.result ?? _arr(data));
      setMeta(data?.meta ?? { page: idx+1, pageSize: size, pages: 1, total: (data?.result ?? []).length });
    } catch (e) {
      setErr("Không tìm kiếm được hóa đơn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefault(0, pageSize);
    setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const handleSearch = () => {
    setPageIndex(0);
    fetchByFilters(0, pageSize);
  };

  const handleReset = () => {
    setMonth("");
    setRoomId("");
    setStatus("");
    setPageIndex(0);
    fetchDefault(0, pageSize);
  };

  const handlePageChange = (next) => {
    if (next < 0) return;
    const last = (meta?.pages ?? 1) - 1;
    if (next > last) return;
    setPageIndex(next);
    if (anyFilter) fetchByFilters(next, pageSize); else fetchDefault(next, pageSize);
  };

  const fmtMoney = (n) => (Number(n || 0)).toLocaleString();
  const fmtMonth = (iso) => iso ? String(iso).slice(0,7) : "-";

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa hóa đơn này?")) return;
    try {
      await deleteInvoice(id);
      if (anyFilter) fetchByFilters(pageIndex, pageSize); else fetchDefault(pageIndex, pageSize);
    } catch (e) {
      alert("Xóa thất bại.");
    }
  };

  return (
    <div className="im-container">
      <div className="im-header">
        <h2>Quản lý hóa đơn</h2>
        <p className="im-sub">Tìm kiếm, chỉnh sửa, xoá hóa đơn.</p>
      </div>

      {/* Filters */}
      <div className="im-toolbar">
        <div className="im-row">
          <label>
            Tháng
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="YYYY-MM"
            />
          </label>

          <label>
            Phòng
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="VD: RM-A101"
            />
          </label>

          <label>
            Trạng thái
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
            </select>
          </label>

          <div className="im-actions-inline">
            <button className="btn btn-primary" onClick={handleSearch}>Tìm</button>
            <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && <p className="im-loading">Đang tải...</p>}
      {err && <p className="warning">{err}</p>}

      {!loading && !err && (
        <div className="im-card">
          <table className="im-table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Tháng</th>
                <th>Ngày tạo</th>
                <th className="right">Tiền phòng</th>
                <th className="right">Dịch vụ</th>
                <th className="right">Tổng</th>
                <th>Trạng thái</th>
                <th className="center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.roomName}</b> <div className="muted">{r.roomId}</div></td>
                  <td>{fmtMonth(r.month)}</td>
                  <td>{r.createdAt || "-"}</td>
                  <td className="right">{fmtMoney(r.roomFee)}</td>
                  <td className="right">{fmtMoney(r.totalServiceFee)}</td>
                  <td className="right">{fmtMoney(r.totalAmount)}</td>
                  <td>
                    <span className={`badge ${String(r.status).toLowerCase()}`}>{r.status}</span>
                  </td>
                  <td className="center">
                    <button className="btn btn-light" onClick={() => setOpenId(r.id)}>Chi tiết / Sửa</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(r.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:"center"}}>Không có hóa đơn.</td></tr>
              )}
            </tbody>
          </table>

          {/* Paging */}
          <div className="im-paging">
            <div className="im-paging-info">
              {meta?.total ?? 0} hoá đơn • Trang {meta?.page ?? pageIndex+1}/{meta?.pages ?? 1}
            </div>
            <div className="im-paging-actions">
              <button className="btn btn-light" onClick={() => handlePageChange(0)} disabled={pageIndex===0}>«</button>
              <button className="btn btn-light" onClick={() => handlePageChange(pageIndex-1)} disabled={pageIndex===0}>‹</button>
              <span className="im-page-now">{pageIndex+1}</span>
              <button className="btn btn-light" onClick={() => handlePageChange(pageIndex+1)} disabled={(meta?.pages ?? 1)-1 <= pageIndex}>›</button>
              <button className="btn btn-light" onClick={() => handlePageChange((meta?.pages ?? 1)-1)} disabled={(meta?.pages ?? 1)-1 <= pageIndex}>»</button>

              <label className="im-page-size">
                Size
                <select value={pageSize} onChange={(e)=> setPageSize(Number(e.target.value))}>
                  {[5,10,20,50].map(s => <option key={s} value={s}>{s}/trang</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Modal editor */}
      {openId && <InvoiceEditorModal invoiceId={openId} onClose={() => setOpenId(null)} onChanged={()=>{
        anyFilter ? fetchByFilters(pageIndex, pageSize) : fetchDefault(pageIndex, pageSize);
      }}/>}
    </div>
  );
}
