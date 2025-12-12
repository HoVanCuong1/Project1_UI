import React, { useEffect, useMemo, useState } from "react";
import "./ManagerSupportRequests.css";
import {
  // cần khai báo trong config/api:
  // GET /support-requests/by-status
  getSupportRequestsByStatus,
  // GET /support-requests/by-created-date
  getSupportRequestsByCreatedDate,
  // POST /support-requests
  createSupportRequest,
  // PUT /support-requests/{id}
  updateSupportRequest,
  // DELETE /support-requests/{id}
  deleteSupportRequest,
  // GET /webktx/user/myInfo
  getMyInfo,
  _obj,
} from "../../../config/api";

const REQUEST_TYPES = ["Yêu cầu trả phòng", "Yêu cầu sửa chữa", "Khiếu nại"];
const STATUSES = ["PROCESSING", "RESOLVED", "REJECTED"];

const normalizePaged = (res) => {
  const payload = res?.data?.data ?? res?.data ?? res ?? {};
  const meta = payload?.meta ?? {};
  const result = payload?.result ?? payload?.results ?? payload?.items ?? [];
  return {
    meta,
    result: Array.isArray(result) ? result : [],
  };
};

export default function ManagerSupportRequests() {
  // ====== USER (manager) ======
  const [managerId, setManagerId] = useState("");
  const [managerName, setManagerName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const meRes = await getMyInfo();
        const me = _obj(meRes);
        if (me?.id) {
          setManagerId(me.id);
          setManagerName(me.name || me.email || me.id);
        }
      } catch (e) {
        console.warn("Không lấy được myInfo:", e);
      }
    })();
  }, []);

  // ====== LIST + FILTER ======
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pages: 1,
    pageSize: 10,
    total: 0,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filter
  const [statusFilter, setStatusFilter] = useState("PROCESSING"); // default: đang xử lý
  const [dateFilter, setDateFilter] = useState(""); // yyyy-MM-dd
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // requestContent

  const fetchData = async (idx = pageIndex, sz = pageSize) => {
    try {
      setLoading(true);
      setErr("");

      let res;
      if (dateFilter) {
        // Ưu tiên filter theo ngày tạo nếu có chọn
        res = await getSupportRequestsByCreatedDate(dateFilter, idx, sz);
      } else {
        // Nếu không có ngày -> filter theo status (mặc định PROCESSING)
        const st = statusFilter || "PROCESSING";
        res = await getSupportRequestsByStatus(st, idx, sz);
      }

      const { meta, result } = normalizePaged(res);
      setRows(result);
      setMeta({
        page: meta?.page ?? idx + 1,
        pages: meta?.pages ?? 1,
        pageSize: meta?.pageSize ?? sz,
        total: meta?.total ?? result.length,
      });
    } catch (e) {
      console.error(e);
      setErr("Không tải được danh sách yêu cầu.");
      setRows([]);
      setMeta((m) => ({ ...m, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0, pageSize);
    setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const handleSearch = () => {
    setPageIndex(0);
    fetchData(0, pageSize);
  };

  const handleResetFilter = () => {
    setStatusFilter("PROCESSING");
    setDateFilter("");
    setKeyword("");
    setTypeFilter("");
    setPageIndex(0);
    fetchData(0, pageSize);
  };

  const handlePageChange = (next) => {
    if (next < 0) return;
    if (meta?.pages && next > meta.pages - 1) return;
    setPageIndex(next);
    fetchData(next, pageSize);
  };

  // client filter theo keyword + loại yêu cầu
  const displayRows = useMemo(() => {
    let arr = rows || [];
    if (typeFilter) {
      arr = arr.filter((r) => (r.requestContent || "") === typeFilter);
    }
    const q = (keyword || "").trim().toLowerCase();
    if (q) {
      arr = arr.filter((r) => {
        const pool = [
          r.id,
          r.studentId,
          r.studentName,
          r.roomName,
          r.requestContent,
          r.status,
          r.handledByName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return pool.includes(q);
      });
    }
    return arr;
  }, [rows, keyword, typeFilter]);

  // ====== FORM (THÊM / SỬA) ======
  const blankForm = {
    id: null,
    studentId: "",
    studentName: "",
    roomName: "",
    requestContent: REQUEST_TYPES[0],
    status: "PROCESSING",
    createdAt: "",
    resolvedAt: "",
    handledByName: "",
    noteExtend: "",
    content: "",
  };

  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  const handlePickRow = (row) => {
    setForm({
      id: row.id,
      studentId: row.studentId || "",
      studentName: row.studentName || "",
      roomName: row.roomName || "",
      requestContent: row.requestContent || REQUEST_TYPES[0],
      status: row.status || "PROCESSING",
      createdAt: row.createdAt || "",
      resolvedAt: row.resolvedAt || "",
      handledByName: row.handledByName || "",
      noteExtend: row.noteExtend || "",
      content: row.content || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá yêu cầu này?")) return;
    try {
      await deleteSupportRequest(id);
      if (form.id === id) setForm(blankForm);
      await fetchData(pageIndex, pageSize);
      alert("Đã xoá yêu cầu.");
    } catch (e) {
      console.error(e);
      alert("Xoá thất bại, vui lòng thử lại.");
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.studentId.trim()) {
      alert("Vui lòng nhập mã sinh viên.");
      return;
    }
    if (!form.roomName.trim()) {
      alert("Vui lòng nhập phòng.");
      return;
    }
    if (!form.content.trim()) {
      alert("Vui lòng nhập nội dung.");
      return;
    }

    try {
      setSaving(true);
      if (form.id) {
        // UPDATE
        const body = {
          status: form.status || "PROCESSING",
          handledById: managerId || undefined,
          noteExtend: form.noteExtend?.trim() || null,
          content: form.content?.trim() || "",
        };
        await updateSupportRequest(form.id, body);
        alert("Cập nhật yêu cầu thành công.");
      } else {
        // CREATE
        const payload = {
          studentId: form.studentId.trim(),
          roomName: form.roomName.trim(),
          requestContent: form.requestContent || REQUEST_TYPES[0],
          content: form.content.trim(),
          noteExtend: form.noteExtend?.trim() || null,
        };
        await createSupportRequest(payload);
        alert("Tạo yêu cầu thành công.");
      }
      await fetchData(pageIndex, pageSize);
    } catch (e) {
      console.error(e);
      alert("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ====== DETAIL MODAL ======
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const openDetail = (row) => {
    setDetailRow(row);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailRow(null);
  };

  const statusClass = (s) => {
    const val = (s || "").toUpperCase();
    if (val === "RESOLVED") return "status-badge resolved";
    if (val === "REJECTED") return "status-badge rejected";
    return "status-badge processing";
  };

  return (
    <div className="ms-wrap">
      <h2>Quản lý yêu cầu hỗ trợ</h2>

      {/* ==== FORM THÊM / SỬA ==== */}
      <div className="ms-card ms-form">
        <div className="ms-form-header">
          <h3>{form.id ? "Sửa yêu cầu" : "Tạo yêu cầu mới"}</h3>
          {managerName && (
            <div className="ms-handler">
              Người xử lý: <b>{managerName}</b>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitForm} className="ms-form-grid">
          <div className="ms-form-col">
            <label>
              Mã sinh viên
              <input
                type="text"
                value={form.studentId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studentId: e.target.value }))
                }
                placeholder="VD: STU001"
              />
            </label>

            <label>
              Tên sinh viên
              <input
                type="text"
                value={form.studentName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studentName: e.target.value }))
                }
                placeholder="VD: Nguyễn Văn A"
              />
            </label>

            <label>
              Phòng
              <input
                type="text"
                value={form.roomName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roomName: e.target.value }))
                }
                placeholder="VD: A102"
              />
            </label>

            <label>
              Loại yêu cầu
              <select
                value={form.requestContent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requestContent: e.target.value }))
                }
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Trạng thái
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="ms-form-col">
            <label>
              Nội dung
              <textarea
                rows={4}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Mô tả chi tiết nội dung yêu cầu hoặc phản hồi xử lý..."
              />
            </label>

            <label>
              Ghi chú thêm
              <textarea
                rows={3}
                value={form.noteExtend}
                onChange={(e) =>
                  setForm((f) => ({ ...f, noteExtend: e.target.value }))
                }
                placeholder="Ghi chú cho sinh viên hoặc BQL..."
              />
            </label>

            <div className="ms-form-meta">
              {form.createdAt && (
                <div>
                  Tạo lúc:{" "}
                  <b>
                    {new Date(form.createdAt).toLocaleString() || form.createdAt}
                  </b>
                </div>
              )}
              {form.resolvedAt && (
                <div>
                  Hoàn tất:{" "}
                  <b>
                    {new Date(form.resolvedAt).toLocaleString() ||
                      form.resolvedAt}
                  </b>
                </div>
              )}
              {form.handledByName && (
                <div>
                  Đã xử lý bởi: <b>{form.handledByName}</b>
                </div>
              )}
            </div>

            <div className="ms-form-actions">
              <button className="btn primary" type="submit" disabled={saving}>
                {saving
                  ? "Đang lưu..."
                  : form.id
                  ? "Cập nhật yêu cầu"
                  : "Tạo yêu cầu"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setForm(blankForm)}
              >
                Clear form
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ==== FILTER + LIST ==== */}
      <div className="ms-card">
        <div className="ms-filter">
          <div className="ms-filter-left">
            <input
              type="text"
              placeholder="Tìm theo mã SV, tên, phòng, nội dung..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tất cả loại yêu cầu</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="ms-filter-right">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button className="btn" onClick={handleSearch}>
              Tìm
            </button>
            <button className="btn" onClick={handleResetFilter}>
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <p className="muted">Đang tải...</p>
        ) : err ? (
          <p className="warning">{err}</p>
        ) : (
          <>
            <table className="ms-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã SV</th>
                  <th>Tên SV</th>
                  <th>Phòng</th>
                  <th>Loại yêu cầu</th>
                  <th>Người xử lý</th>
                  <th>Tạo lúc</th>
                  <th>Hoàn tất</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", opacity: 0.8 }}>
                      Không có yêu cầu phù hợp.
                    </td>
                  </tr>
                ) : (
                  displayRows.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.id}</td>
                      <td className="mono">{r.studentId}</td>
                      <td>{r.studentName}</td>
                      <td>{r.roomName}</td>
                      <td>{r.requestContent}</td>
                      <td>{r.handledByName || "-"}</td>
                      <td>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        {r.resolvedAt
                          ? new Date(r.resolvedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <span className={statusClass(r.status)}>
                          {r.status}
                        </span>
                      </td>
                      <td className="ms-actions">
                        <button
                          className="btn small"
                          onClick={() => handlePickRow(r)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn small"
                          onClick={() => openDetail(r)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() => handleDelete(r.id)}
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="ms-paging">
              <div className="ms-paging-info">
                Tổng: {meta?.total ?? 0} • Trang{" "}
                {meta?.page ?? pageIndex + 1}/{meta?.pages ?? 1}
              </div>
              <div className="ms-paging-actions">
                <button
                  className="btn light"
                  onClick={() => handlePageChange(0)}
                  disabled={(meta?.page ?? pageIndex + 1) <= 1}
                >
                  «
                </button>
                <button
                  className="btn light"
                  onClick={() =>
                    handlePageChange(Math.max(0, pageIndex - 1))
                  }
                  disabled={(meta?.page ?? pageIndex + 1) <= 1}
                >
                  ‹
                </button>
                <span className="page-now">
                  {meta?.page ?? pageIndex + 1}
                </span>
                <button
                  className="btn light"
                  onClick={() =>
                    handlePageChange(
                      Math.min((meta?.pages ?? 1) - 1, pageIndex + 1)
                    )
                  }
                  disabled={
                    (meta?.page ?? pageIndex + 1) >= (meta?.pages ?? 1)
                  }
                >
                  ›
                </button>
                <button
                  className="btn light"
                  onClick={() =>
                    handlePageChange((meta?.pages ?? 1) - 1)
                  }
                  disabled={
                    (meta?.page ?? pageIndex + 1) >= (meta?.pages ?? 1)
                  }
                >
                  »
                </button>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageIndex(0);
                  }}
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}/trang
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== MODAL CHI TIẾT ===== */}
      {detailOpen && detailRow && (
        <div className="modal-mask" onClick={closeDetail}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết yêu cầu</h3>
              <button className="icon-btn" onClick={closeDetail}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <table className="kv">
                <tbody>
                  <tr>
                    <th colSpan={2}>Thông tin chung</th>
                  </tr>
                  <tr>
                    <td>ID</td>
                    <td className="mono">{detailRow.id}</td>
                  </tr>
                  <tr>
                    <td>Trạng thái</td>
                    <td>
                      <span className={statusClass(detailRow.status)}>
                        {detailRow.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Loại yêu cầu</td>
                    <td>{detailRow.requestContent}</td>
                  </tr>
                  <tr>
                    <td>Thời gian tạo</td>
                    <td>
                      {detailRow.createdAt
                        ? new Date(detailRow.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td>Thời gian hoàn tất</td>
                    <td>
                      {detailRow.resolvedAt
                        ? new Date(detailRow.resolvedAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>

                  <tr>
                    <th colSpan={2}>Sinh viên</th>
                  </tr>
                  <tr>
                    <td>Mã sinh viên</td>
                    <td className="mono">{detailRow.studentId}</td>
                  </tr>
                  <tr>
                    <td>Họ tên</td>
                    <td>{detailRow.studentName}</td>
                  </tr>
                  <tr>
                    <td>Điện thoại</td>
                    <td>{detailRow.studentPhone || "-"}</td>
                  </tr>
                  <tr>
                    <td>Phòng</td>
                    <td>{detailRow.roomName}</td>
                  </tr>

                  <tr>
                    <th colSpan={2}>Nội dung</th>
                  </tr>
                  <tr>
                    <td>Nội dung yêu cầu</td>
                    <td>{detailRow.content || "-"}</td>
                  </tr>
                  <tr>
                    <td>Ghi chú</td>
                    <td>{detailRow.noteExtend || "-"}</td>
                  </tr>

                  <tr>
                    <th colSpan={2}>Xử lý</th>
                  </tr>
                  <tr>
                    <td>Người xử lý</td>
                    <td>{detailRow.handledByName || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button onClick={closeDetail}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
