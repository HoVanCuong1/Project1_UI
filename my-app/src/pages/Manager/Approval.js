import React, { useEffect, useMemo, useState } from "react";
import "./Approval.css";
import {
  getRegistrationsByStatus,
  approveRegistration,
  rejectRegistration,
  getRoomById,
  getStudentById,
} from "../../config/api";

const normalizePaged = (res) => {
  // Chuẩn hoá payload { data: { meta, result } } hoặc các biến thể
  const payload = res?.data?.data ?? res?.data ?? res ?? {};
  const meta = payload?.meta ?? res?.meta ?? {};
  const result = payload?.result ?? payload?.results ?? payload?.items ?? [];
  return { meta, result: Array.isArray(result) ? result : [] };
};

export default function Approval() {
  const [statusTab, setStatusTab] = useState("PENDING"); // PENDING | APPROVED | REJECTED
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, pageSize: 10, total: 0 });

  const [search, setSearch] = useState(""); // lọc client theo id sv/phòng/đk
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal chi tiết
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailReg, setDetailReg] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [detailRoom, setDetailRoom] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ===== Fetch list theo status + paging
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await getRegistrationsByStatus(statusTab, pageIndex, pageSize);
        const { meta, result } = normalizePaged(res);
        if (cancelled) return;

        setMeta({
          page: meta?.page ?? pageIndex + 1,
          pages: meta?.pages ?? 1,
          pageSize: meta?.pageSize ?? pageSize,
          total: meta?.total ?? result.length,
        });
        setRows(result);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("Không tải được danh sách đăng ký.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusTab, pageIndex, pageSize]);

  // ===== Lọc client theo search (mã SV / mã phòng / id / tên SV)
  const filteredRows = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const pool = [
        r.id,
        r.studentId,
        r.studentName,
        r.roomId,
        r.roomName,
        r.dormId,
        r.dormName,
        r.requestType,
        r.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return pool.includes(q);
    });
  }, [rows, search]);

  // ===== Hành động duyệt / từ chối
  const doApprove = async (reg) => {
    if (!window.confirm(`Duyệt đăng ký ${reg.id} ?`)) return;
    try {
      await approveRegistration(reg.id);
      // Sau khi duyệt: refetch list hiện tại.
      // Nếu đang ở tab PENDING, bản ghi sẽ biến mất khỏi tab này (đúng mong muốn).
      // Người dùng chuyển tab APPROVED sẽ thấy nó.
      const res = await getRegistrationsByStatus(statusTab, pageIndex, pageSize);
      const { meta, result } = normalizePaged(res);
      setMeta({
        page: meta?.page ?? pageIndex + 1,
        pages: meta?.pages ?? 1,
        pageSize: meta?.pageSize ?? pageSize,
        total: meta?.total ?? result.length,
      });
      setRows(result);
      alert("Duyệt thành công!");
    } catch (e) {
      console.error(e);
      alert("Không thể duyệt. Vui lòng thử lại.");
    }
  };

  const doReject = async (reg) => {
    if (!window.confirm(`Từ chối đăng ký ${reg.id} ?`)) return;
    try {
      await rejectRegistration(reg.id);
      const res = await getRegistrationsByStatus(statusTab, pageIndex, pageSize);
      const { meta, result } = normalizePaged(res);
      setMeta({
        page: meta?.page ?? pageIndex + 1,
        pages: meta?.pages ?? 1,
        pageSize: meta?.pageSize ?? pageSize,
        total: meta?.total ?? result.length,
      });
      setRows(result);
      alert("Từ chối thành công!");
    } catch (e) {
      console.error(e);
      alert("Không thể từ chối. Vui lòng thử lại.");
    }
  };

  // ===== Chi tiết: mở modal + load student/room
  const openDetail = async (reg) => {
    setDetailOpen(true);
    setDetailReg(reg);
    setDetailStudent(null);
    setDetailRoom(null);
    setDetailLoading(true);
    try {
      const [stuRes, roomRes] = await Promise.allSettled([
        reg?.studentId ? getStudentById(reg.studentId) : Promise.resolve(null),
        reg?.roomId ? getRoomById(reg.roomId) : Promise.resolve(null),
      ]);

      if (stuRes.status === "fulfilled") {
        const s = stuRes.value?.data?.data ?? stuRes.value?.data ?? stuRes.value ?? null;
        setDetailStudent(s);
      }
      if (roomRes.status === "fulfilled") {
        const r = roomRes.value?.data?.data ?? roomRes.value?.data ?? roomRes.value ?? null;
        setDetailRoom(r);
      }
    } catch (e) {
      console.warn("Load detail failed:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailReg(null);
    setDetailStudent(null);
    setDetailRoom(null);
    setDetailLoading(false);
  };

  // ======= UI
  return (
    <div className="approval-container">
      <div className="approval-header">
        <h2>Duyệt đăng ký phòng</h2>
        <div className="right-tools">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo Mã SV / Phòng / ID / Tên"
          />
          <select
            value={statusTab}
            onChange={(e) => {
              setStatusTab(e.target.value);
              setPageIndex(0);
            }}
          >
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Đang tải…</p>
      ) : err ? (
        <p className="warning">{err}</p>
      ) : (
        <>
          <table className="approval-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Phòng</th>
                <th>Khu</th>
                <th>Ngày đăng ký</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", opacity: 0.8 }}>
                    Không có bản ghi.
                  </td>
                </tr>
              ) : (
                filteredRows.map((reg) => (
                  <tr key={reg.id}>
                    <td className="mono">{reg.id}</td>
                    <td className="mono">{reg.studentId}</td>
                    <td>{reg.studentName}</td>
                    <td className="mono">{reg.roomName || reg.roomId}</td>
                    <td>{reg.dormName}</td>
                    <td>{reg.registrationDate || "-"}</td>
                    <td>{reg.requestType}</td>
                    <td>
                      <span className={`status-badge ${(reg.status || "").toLowerCase()}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-detail" onClick={() => openDetail(reg)}>
                        Chi tiết
                      </button>
                      {statusTab === "PENDING" ? (
                        <>
                          <button className="btn-approve" onClick={() => doApprove(reg)}>
                            Duyệt
                          </button>
                          <button className="btn-reject" onClick={() => doReject(reg)}>
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <span className="no-action">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="paging">
            <div className="left">
              Tổng: {meta?.total ?? 0} • Trang {meta?.page ?? pageIndex + 1}/{meta?.pages ?? 1}
            </div>
            <div className="right">
              <button
                onClick={() => setPageIndex(0)}
                disabled={(meta?.page ?? pageIndex + 1) <= 1}
              >
                «
              </button>
              <button
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={(meta?.page ?? pageIndex + 1) <= 1}
              >
                ‹
              </button>
              <span className="mono">{(meta?.page ?? pageIndex + 1)}</span>
              <button
                onClick={() =>
                  setPageIndex((p) =>
                    Math.min((meta?.pages ?? 1) - 1, p + 1)
                  )
                }
                disabled={(meta?.page ?? pageIndex + 1) >= (meta?.pages ?? 1)}
              >
                ›
              </button>
              <button
                onClick={() => setPageIndex((meta?.pages ?? 1) - 1)}
                disabled={(meta?.page ?? pageIndex + 1) >= (meta?.pages ?? 1)}
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
                  <option key={n} value={n}>{n}/trang</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Modal chi tiết */}
      {detailOpen && (
        <div className="modal-mask" onClick={closeDetail}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đăng ký</h3>
              <button className="icon-btn" onClick={closeDetail}>✕</button>
            </div>

            {detailLoading ? (
              <p>Đang tải chi tiết…</p>
            ) : (
              <div className="modal-body">
                <table className="kv">
                  <tbody>
                    <tr><th colSpan={2}>Thông tin đăng ký</th></tr>
                    <tr><td>ID</td><td className="mono">{detailReg?.id}</td></tr>
                    <tr><td>Trạng thái</td>
                      <td>
                        <span className={`status-badge ${(detailReg?.status || "").toLowerCase()}`}>
                          {detailReg?.status}
                        </span>
                      </td>
                    </tr>
                    <tr><td>Loại</td><td>{detailReg?.requestType}</td></tr>
                    <tr><td>Ngày đăng ký</td><td>{detailReg?.registrationDate || "-"}</td></tr>
                    <tr><td>Khu</td><td>{detailReg?.dormName || "-"}</td></tr>
                    <tr><td>Phòng</td><td>{detailReg?.roomName || detailReg?.roomId}</td></tr>

                    <tr><th colSpan={2}>Thông tin sinh viên</th></tr>
                    <tr><td>Mã SV</td><td className="mono">{detailReg?.studentId}</td></tr>
                    <tr><td>Họ tên</td><td>{detailReg?.studentName}</td></tr>
                    <tr><td>Giới tính</td><td>{detailReg?.gender}</td></tr>
                    <tr><td>Lớp</td><td>{detailReg?.className ?? detailStudent?.className ?? "-"}</td></tr>
                    <tr><td>Khóa</td><td>{detailReg?.academicYear ?? detailStudent?.academicYear ?? "-"}</td></tr>
                    <tr><td>Ngày sinh</td><td>{detailStudent?.birthDate ?? "-"}</td></tr>
                    <tr><td>Quê quán</td><td>{detailStudent?.hometown ?? "-"}</td></tr>
                    <tr><td>Email</td><td>{detailStudent?.userEmail ?? "-"}</td></tr>
                    <tr><td>Điện thoại</td><td>{detailStudent?.phone ?? "-"}</td></tr>

                    <tr><th colSpan={2}>Thông tin phòng</th></tr>
                    <tr><td>Tầng</td><td>{detailRoom?.floor ?? "-"}</td></tr>
                    <tr><td>Số chỗ</td><td>{detailRoom?.maxOccupants != null ? `${detailRoom.maxOccupants} chỗ` : "-"}</td></tr>
                    <tr><td>Đang ở / Còn trống</td>
                      <td>
                        {detailRoom?.currentOccupants != null && detailRoom?.maxOccupants != null
                          ? `${detailRoom.currentOccupants} / ${detailRoom.maxOccupants - detailRoom.currentOccupants}`
                          : "-"}
                      </td>
                    </tr>
                    <tr><td>Giá</td>
                      <td>
                        {detailRoom?.price != null
                          ? `${Number(detailRoom.price).toLocaleString()} đ/tháng`
                          : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>
            )}
            <div className="modal-footer">
              {statusTab === "PENDING" && detailReg && (
                <>
                  <button className="btn-approve" onClick={() => doApprove(detailReg)}>Duyệt</button>
                  <button className="btn-reject" onClick={() => doReject(detailReg)}>Từ chối</button>
                </>
              )}
              <button onClick={closeDetail}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
