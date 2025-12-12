import React, { useEffect, useState } from "react";
import "./RequestFix.css";
import {
  getMyInfo,
  getStudentById,
  createSupportRequest,
  getSupportRequestsByStudent,
  _obj,
} from "../../../config/api";

const REQUEST_CONTENT = "Yêu cầu sửa chữa";

const normalizePaged = (res) => {
  const payload = res?.data?.data ?? res?.data ?? res ?? {};
  const meta = payload?.meta ?? {};
  const result = payload?.result ?? [];
  return { meta, result: Array.isArray(result) ? result : [] };
};

export default function RequestFix() {
  // ---- THÔNG TIN SINH VIÊN ----
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [studentError, setStudentError] = useState("");

  // ---- FORM ----
  const [issue, setIssue] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---- REQUEST LIST ----
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [reqLoading, setReqLoading] = useState(false);

  // ===== LOAD STUDENT INFO =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await getMyInfo();
        const me = _obj(meRes);
        const sid = me?.studentId;
        if (!sid) {
          setStudentError("Không xác định được tài khoản sinh viên.");
          return;
        }
        setStudentId(sid);

        const stuRes = await getStudentById(sid);
        const stu = _obj(stuRes);

        const fullName = `${stu?.lastName || ""} ${stu?.firstName || ""}`.trim();
        setStudentName(fullName || sid);
        setRoomName(stu?.roomName || "-");
      } catch (e) {
        setStudentError("Không lấy được thông tin sinh viên.");
      } finally {
        setLoadingStudent(false);
      }
    })();

    return () => (cancelled = true);
  }, []);

  // ===== LOAD SUPPORT REQUESTS =====
  const fetchRequests = async (sid, idx = pageIndex, sz = pageSize) => {
    if (!sid) return;
    try {
      setReqLoading(true);
      const res = await getSupportRequestsByStudent(sid, idx, sz);
      const { meta, result } = normalizePaged(res);

      setRequests(result);
      setMeta({
        page: meta?.page ?? idx + 1,
        pages: meta?.pages ?? 1,
        total: meta?.total ?? result.length,
      });
    } finally {
      setReqLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;
    fetchRequests(studentId, pageIndex, pageSize);
    // eslint-disable-next-line
  }, [studentId, pageIndex, pageSize]);

  // ===== SUBMIT REQUEST =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issue.trim()) return alert("Vui lòng nhập vấn đề gặp phải.");

    try {
      setSubmitting(true);
      await createSupportRequest({
        studentId,
        roomName,
        requestContent: REQUEST_CONTENT,
        content: issue.trim(),
        noteExtend: note.trim() || null,
      });

      alert("Đã gửi yêu cầu sửa chữa!");
      setIssue("");
      setNote("");

      setPageIndex(0);
      fetchRequests(studentId, 0, pageSize);
    } catch (e) {
      alert("Gửi yêu cầu thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== PAGING =====
  const handlePageChange = (next) => {
    if (next < 0) return;
    if (meta.pages && next > meta.pages - 1) return;
    setPageIndex(next);
  };

  return (
    <div className="fix-container">
      <h2>🧰 Yêu cầu sửa chữa</h2>

      {loadingStudent ? (
        <p className="muted">Đang tải...</p>
      ) : studentError ? (
        <p className="warning">{studentError}</p>
      ) : (
        <form onSubmit={handleSubmit} className="fix-form">
          <div className="form-row">
            <label>Họ và tên</label>
            <input type="text" disabled value={studentName} />
          </div>

          <div className="form-row">
            <label>Mã sinh viên</label>
            <input type="text" disabled value={studentId} />
          </div>

          <div className="form-row">
            <label>Phòng</label>
            <input type="text" disabled value={roomName} />
          </div>

          <div className="form-row">
            <label>Vấn đề gặp phải</label>
            <textarea
              placeholder="VD: Hỏng bóng đèn, ổ cắm chập điện..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Ghi chú thêm (tuỳ chọn)</label>
            <textarea
              placeholder="Ghi chú thêm cho ban quản lý..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button className="btn-primary" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
      )}

      {/* === HISTORY === */}
      <div className="fix-history">
        <h3>Các yêu cầu sửa chữa đã gửi</h3>

        {reqLoading ? (
          <p className="muted">Đang tải...</p>
        ) : requests.length === 0 ? (
          <p className="muted">Bạn chưa gửi yêu cầu nào.</p>
        ) : (
          <>
            <table className="fix-table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Vấn đề</th>
                  <th>Ghi chú</th>
                  <th>Tạo lúc</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.roomName}</td>
                    <td>{r.requestContent}</td>
                    <td>{r.noteExtend || "-"}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="paging-fix">
              <button onClick={() => handlePageChange(0)} disabled={pageIndex === 0}>
                «
              </button>
              <button
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 0}
              >
                ‹
              </button>

              <span className="page-now">{meta.page}</span>

              <button
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={meta.page >= meta.pages}
              >
                ›
              </button>
              <button
                onClick={() => handlePageChange(meta.pages - 1)}
                disabled={meta.page >= meta.pages}
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
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}/trang
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
