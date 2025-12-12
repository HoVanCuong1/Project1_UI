import React, { useEffect, useState } from "react";
import "./Complaint.css";
import {
  getMyInfo,
  getStudentById,
  createSupportRequest,
  getSupportRequestsByStudent,
  _obj,
} from "../../../config/api";

const REQUEST_CONTENT = "Khiếu nại";

const normalizePaged = (res) => {
  const payload = res?.data?.data ?? res?.data ?? res ?? {};
  const meta = payload?.meta ?? {};
  const result = payload?.result ?? payload?.results ?? payload?.items ?? [];
  return {
    meta,
    result: Array.isArray(result) ? result : [],
  };
};

export default function Complaint() {
  // ---- THÔNG TIN SINH VIÊN ----
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [studentError, setStudentError] = useState("");

  // ---- FORM KHIẾU NẠI ----
  const [title, setTitle] = useState("");      // tiêu đề / chủ đề khiếu nại
  const [content, setContent] = useState("");  // nội dung chi tiết
  const [note, setNote] = useState("");        // ghi chú thêm
  const [submitting, setSubmitting] = useState(false);

  // ---- DANH SÁCH KHIẾU NẠI (SUPPORT REQUESTS) ----
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pages: 1,
    pageSize: 10,
    total: 0,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState("");

  // ===== LOAD THÔNG TIN USER + STUDENT =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingStudent(true);
        setStudentError("");

        const meRes = await getMyInfo();
        const me = _obj(meRes);
        const sid = me?.studentId;
        if (!sid) {
          if (!cancelled) {
            setStudentError("Tài khoản hiện tại không gắn với sinh viên nào.");
          }
          return;
        }
        if (cancelled) return;
        setStudentId(sid);

        const stuRes = await getStudentById(sid);
        const stu = _obj(stuRes);
        if (cancelled) return;

        const fullName =
          `${stu?.lastName || ""} ${stu?.firstName || ""}`.trim() ||
          stu?.fullName ||
          sid;

        setStudentName(fullName);
        setRoomName(stu?.roomName || "");
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setStudentError("Không lấy được thông tin sinh viên. Vui lòng thử lại.");
        }
      } finally {
        if (!cancelled) setLoadingStudent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ===== LOAD DANH SÁCH YÊU CẦU THEO STUDENT =====
  const fetchRequests = async (sid, idx = pageIndex, sz = pageSize) => {
    if (!sid) return;
    try {
      setReqLoading(true);
      setReqError("");
      const res = await getSupportRequestsByStudent(sid, idx, sz);
      const { meta, result } = normalizePaged(res);
      setRequests(result);
      setMeta({
        page: meta?.page ?? idx + 1,
        pages: meta?.pages ?? 1,
        pageSize: meta?.pageSize ?? sz,
        total: meta?.total ?? result.length,
      });
    } catch (e) {
      console.error(e);
      setReqError("Không tải được danh sách yêu cầu đã gửi.");
      setRequests([]);
      setMeta((m) => ({ ...m, total: 0 }));
    } finally {
      setReqLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;
    fetchRequests(studentId, pageIndex, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, pageIndex, pageSize]);

  // ===== SUBMIT KHIẾU NẠI =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      alert("Không xác định được mã sinh viên.");
      return;
    }
    if (!roomName) {
      alert("Bạn chưa được gán vào phòng nào.");
      return;
    }
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung khiếu nại.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentId: studentId,
        roomName: roomName,
        requestContent: REQUEST_CONTENT,        // loại yêu cầu: Khiếu nại
        content: title
          ? `${title.trim()}\n\n${content.trim()}`
          : content.trim(),                     // gộp tiêu đề + nội dung
        noteExtend: note.trim() || null,
      };
      await createSupportRequest(payload);
      alert("Đã gửi khiếu nại thành công!");

      setTitle("");
      setContent("");
      setNote("");

      setPageIndex(0);
      fetchRequests(studentId, 0, pageSize);
    } catch (e) {
      console.error(e);
      alert("Gửi khiếu nại thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== PHÂN TRANG =====
  const handlePageChange = (next) => {
    if (next < 0) return;
    if (meta?.pages && next > meta.pages - 1) return;
    setPageIndex(next);
  };

  const statusClass = (s) => {
    const val = (s || "").toUpperCase();
    if (val === "RESOLVED") return "status-badge resolved";
    if (val === "REJECTED") return "status-badge rejected";
    return "status-badge processing"; // PROCESSING / default
  };

  return (
    <div className="complaint-container">
      <h2>📢 Gửi khiếu nại</h2>

      {/* FORM KHIẾU NẠI */}
      {loadingStudent ? (
        <p className="muted">Đang tải thông tin sinh viên...</p>
      ) : studentError ? (
        <p className="warning">{studentError}</p>
      ) : (
        <form className="complaint-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Họ và tên</label>
            <input type="text" value={studentName} disabled />
          </div>

          <div className="form-row">
            <label>Mã sinh viên</label>
            <input type="text" value={studentId} disabled />
          </div>

          <div className="form-row">
            <label>Phòng</label>
            <input type="text" value={roomName || "Chưa có phòng"} disabled />
          </div>

          <div className="form-row">
            <label>Loại yêu cầu</label>
            <input type="text" value={REQUEST_CONTENT} disabled />
          </div>

          <div className="form-row">
            <label>Tiêu đề khiếu nại</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Phản ánh về tiếng ồn, cơ sở vật chất..."
            />
          </div>

          <div className="form-row">
            <label>Nội dung chi tiết</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả rõ tình huống, thời gian, đối tượng liên quan..."
            />
          </div>

          <div className="form-row">
            <label>Ghi chú thêm (tuỳ chọn)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Đề xuất hướng xử lý, số điện thoại liên hệ..."
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi khiếu nại"}
          </button>
        </form>
      )}

      {/* LỊCH SỬ KHIẾU NẠI / HỖ TRỢ */}
      {studentId && (
        <div className="complaint-history">
          <h3>Các yêu cầu đã gửi</h3>

          {reqLoading ? (
            <p className="muted">Đang tải danh sách...</p>
          ) : reqError ? (
            <p className="warning">{reqError}</p>
          ) : requests.length === 0 ? (
            <p className="muted">Bạn chưa gửi khiếu nại/yêu cầu hỗ trợ nào.</p>
          ) : (
            <>
              <div className="complaint-list">
                {requests.map((r) => (
                  <div className="complaint-card" key={r.id}>
                    <div className="row-top">
                      <div className="col-main">
                        <div className="req-title">
                          {r.requestContent || "Yêu cầu hỗ trợ"}
                        </div>
                        <div className="req-student">
                          {r.studentName} • Phòng {r.roomName}
                        </div>
                      </div>
                      <div className="col-status">
                        <span className={statusClass(r.status)}>{r.status}</span>
                        <div className="req-time">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                    </div>

                    <div className="req-section">
                      <div className="label">Nội dung</div>
                      <div className="value">{r.content || "-"}</div>
                    </div>

                    {r.noteExtend && (
                      <div className="req-section">
                        <div className="label">Ghi chú</div>
                        <div className="value">{r.noteExtend}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="complaint-paging">
                <span className="info">
                  Tổng: {meta?.total ?? 0} • Trang{" "}
                  {meta?.page ?? pageIndex + 1}/{meta?.pages ?? 1}
                </span>
                <div className="actions">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={(meta?.page ?? pageIndex + 1) <= 1}
                  >
                    «
                  </button>
                  <button
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
                    {[5, 10, 20].map((n) => (
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
      )}
    </div>
  );
}
