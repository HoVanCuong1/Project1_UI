import React, { useEffect, useState } from "react";
import "./RequestCheckout.css";
import {
  getMyInfo,
  getStudentById,
  createRoomRegistration,
  getCheckoutRegistrationsByStudent,
  _obj,
} from "../../../config/api";

const REQUEST_LABEL = "Yêu cầu trả phòng";

const normalizePaged = (res) => {
  const payload = res?.data?.data ?? res?.data ?? res ?? {};
  const meta = payload?.meta ?? res?.meta ?? {};
  const result = payload?.result ?? payload?.results ?? payload?.items ?? [];
  return {
    meta,
    result: Array.isArray(result) ? result : [],
  };
};

export default function RequestCheckout() {
  // Thông tin sinh viên hiện tại
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [studentError, setStudentError] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

  // Loading khi gửi yêu cầu
  const [submitting, setSubmitting] = useState(false);

  // Danh sách yêu cầu CHECKOUT của SV
  const [requests, setRequests] = useState([]);
  const [reqMeta, setReqMeta] = useState({
    page: 1,
    pages: 1,
    pageSize: 10,
    total: 0,
  });
  const [reqPageIndex, setReqPageIndex] = useState(0);
  const [reqPageSize, setReqPageSize] = useState(5);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState("");

  // ===== Load thông tin user + student + room =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingStudent(true);
        setStudentError("");

        // 1. Lấy myInfo -> studentId
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

        // 2. Lấy student -> roomId + roomName + fullName
        const stuRes = await getStudentById(sid);
        const stu = _obj(stuRes);
        if (cancelled) return;

        const fullName =
          `${stu?.lastName || ""} ${stu?.firstName || ""}`.trim() ||
          stu?.fullName ||
          sid;

        setStudentName(fullName);
        setRoomName(stu?.roomName || "");
        setRoomId(stu?.roomId || "");
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

  // ===== Fetch list yêu cầu CHECKOUT theo studentId =====
  const fetchRequests = async (sid, pageIdx = reqPageIndex, pageSz = reqPageSize) => {
    if (!sid) return;
    try {
      setReqLoading(true);
      setReqError("");
      const res = await getCheckoutRegistrationsByStudent(sid, pageIdx, pageSz);
      const { meta, result } = normalizePaged(res);
      setRequests(result);
      setReqMeta({
        page: meta?.page ?? pageIdx + 1,
        pages: meta?.pages ?? 1,
        pageSize: meta?.pageSize ?? pageSz,
        total: meta?.total ?? result.length,
      });
    } catch (e) {
      console.error(e);
      setReqError("Không tải được danh sách yêu cầu trả phòng.");
      setRequests([]);
      setReqMeta((m) => ({ ...m, total: 0 }));
    } finally {
      setReqLoading(false);
    }
  };

  // Khi có studentId hoặc đổi trang -> load danh sách yêu cầu
  useEffect(() => {
    if (!studentId) return;
    fetchRequests(studentId, reqPageIndex, reqPageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, reqPageIndex, reqPageSize]);

  // ===== Submit yêu cầu CHECKOUT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      alert("Không xác định được mã sinh viên.");
      return;
    }
    if (!roomId || !roomName) {
      alert("Bạn chưa được gán vào phòng nào. Không thể gửi yêu cầu trả phòng.");
      return;
    }

    if (
      !window.confirm(
        `Xác nhận gửi yêu cầu trả phòng ${roomName}?\nYêu cầu này sẽ được ban quản lý xem xét và duyệt.`
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentId: studentId,
        roomId: roomId,
        requestType: "CHECKOUT",
        registrationDate: null, // backend tự set ngày hiện tại
      };
      await createRoomRegistration(payload);
      alert("Yêu cầu trả phòng đã được gửi thành công!");

      // Sau khi gửi xong -> load lại danh sách yêu cầu, về trang 0
      setReqPageIndex(0);
      fetchRequests(studentId, 0, reqPageSize);
    } catch (e) {
      console.error(e);
      alert("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Phân trang list yêu cầu =====
  const handleReqPageChange = (next) => {
    if (next < 0) return;
    if (reqMeta?.pages && next > reqMeta.pages - 1) return;
    setReqPageIndex(next);
  };

  return (
    <div className="request-container">
      <h2>🏠 Yêu cầu trả phòng</h2>

      {/* Thông tin + form gửi yêu cầu */}
      {loadingStudent ? (
        <p className="muted">Đang tải thông tin sinh viên...</p>
      ) : studentError ? (
        <p className="warning">{studentError}</p>
      ) : (
        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-row">
            <label>Họ và tên</label>
            <input type="text" value={studentName} disabled />
          </div>

          <div className="form-row">
            <label>Mã sinh viên</label>
            <input type="text" value={studentId} disabled />
          </div>

          <div className="form-row">
            <label>Phòng hiện tại</label>
            <input
              type="text"
              value={roomName || "Chưa có phòng"}
              disabled
            />
          </div>

          <div className="form-row">
            <label>Nội dung yêu cầu</label>
            <input type="text" value={REQUEST_LABEL} disabled />
          </div>

          <p className="helper-text">
            Sau khi gửi yêu cầu, bạn vui lòng chờ Ban quản lý ký túc xá duyệt.
            Khi yêu cầu được duyệt, thông tin phòng của bạn sẽ được cập nhật.
          </p>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi yêu cầu trả phòng"}
          </button>
        </form>
      )}

      {/* Danh sách yêu cầu CHECKOUT của sinh viên – tách riêng, thoáng hơn */}
      {studentId && (
        <div className="request-history">
          <h3>Lịch sử yêu cầu trả phòng</h3>

          {reqLoading ? (
            <p className="muted">Đang tải danh sách...</p>
          ) : reqError ? (
            <p className="warning">{reqError}</p>
          ) : requests.length === 0 ? (
            <p className="muted">Bạn chưa gửi yêu cầu trả phòng nào.</p>
          ) : (
            <>
              <table className="request-table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Khu</th>
                    <th>Ngày yêu cầu</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>{r.roomName}</td>
                      <td>{r.dormName}</td>
                      <td>{r.registrationDate || "-"}</td>
                      <td>
                        <span
                          className={`status-badge ${(r.status || "")
                            .toLowerCase()
                            .toString()}`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="req-paging">
                <div className="req-paging-actions">
                  <span className="req-paging-info">
                    Tổng: {reqMeta?.total ?? 0} • Trang{" "}
                    {reqMeta?.page ?? reqPageIndex + 1}/{reqMeta?.pages ?? 1}
                  </span>
                  <button
                    onClick={() => handleReqPageChange(0)}
                    disabled={(reqMeta?.page ?? reqPageIndex + 1) <= 1}
                  >
                    «
                  </button>
                  <button
                    onClick={() =>
                      handleReqPageChange(Math.max(0, reqPageIndex - 1))
                    }
                    disabled={(reqMeta?.page ?? reqPageIndex + 1) <= 1}
                  >
                    ‹
                  </button>
                  <span className="page-now">
                    {reqMeta?.page ?? reqPageIndex + 1}
                  </span>
                  <button
                    onClick={() =>
                      handleReqPageChange(
                        Math.min(
                          (reqMeta?.pages ?? 1) - 1,
                          reqPageIndex + 1
                        )
                      )
                    }
                    disabled={
                      (reqMeta?.page ?? reqPageIndex + 1) >=
                      (reqMeta?.pages ?? 1)
                    }
                  >
                    ›
                  </button>
                  <button
                    onClick={() =>
                      handleReqPageChange((reqMeta?.pages ?? 1) - 1)
                    }
                    disabled={
                      (reqMeta?.page ?? reqPageIndex + 1) >=
                      (reqMeta?.pages ?? 1)
                    }
                  >
                    »
                  </button>

                  <select
                    value={reqPageSize}
                    onChange={(e) => {
                      setReqPageSize(Number(e.target.value));
                      setReqPageIndex(0);
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
