import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RegistrationStatus.css";
import { getRegistrationsByStudentId, getMyInfo, getRoomById,getStudentById } from "../../config/api";

export default function RegistrationStatus() {
  // Chuẩn hoá profile Student -> shape dùng ở UI
const mergeStudentProfile = (prev, p) => ({
  ...prev,
  studentId: p?.id ?? prev?.studentId,
  fullName: prev?.fullName || `${p?.lastName || ""} ${p?.firstName || ""}`.trim(),
  gender: prev?.gender || p?.gender,              // MALE/FEMALE
  dateOfBirth: p?.birthDate ?? prev?.dateOfBirth, // <-- Ngày sinh
  className: p?.className ?? prev?.className,     // <-- Lớp
  academicYear: p?.academicYear ?? prev?.academicYear, // <-- Khóa
  address: p?.hometown ?? prev?.address,          // <-- Quê quán
});
  const [roomDetail, setRoomDetail] = React.useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // id điều hướng (nếu có)
  const search = new URLSearchParams(location.search);
  const preferredId = search.get("id") || null;

  // state nhận từ Bookings (nếu có)
  const stateReg = location.state?.registration || null;
  const stateStudent = location.state?.student || null;

  const [student, setStudent] = React.useState(stateStudent || null);
  const [allRegs, setAllRegs] = React.useState([]);
  const [currentReg, setCurrentReg] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  // helper: chuẩn hoá mảng trả về từ axios
  const normalizeList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data?.result)) return res.data.result;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.result)) return res.result;
    return [];
  };

  // 1) Lấy student (ưu tiên từ state; fallback getMyInfo)
  React.useEffect(() => {
    let cancelled = false;
    const ensureStudent = async () => {
      if (student?.studentId) return; // đã có đầy đủ
      try {
        const me = await getMyInfo?.();
        if (!cancelled && me) {
          // tuỳ payload getMyInfo của bạn: {studentId, fullName,...}
          setStudent((prev) => prev || me);
        }
      } catch {
        /* ignore: vẫn có thể hiển thị một phần */
      }
    };
    ensureStudent();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.studentId]);

  // 2) Fetch danh sách đăng ký theo studentId
  React.useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      if (!student?.studentId) return;
      try {
        setLoading(true);
        setErr("");
        const res = await getRegistrationsByStudentId(student.studentId);
        const list = normalizeList(res);

        if (cancelled) return;

        // Sắp xếp mới nhất trước (theo registrationDate; fallback createdAt nếu có)
        const parseDate = (d) => new Date(d || 0).getTime();
        list.sort((a, b) => parseDate(b.registrationDate) - parseDate(a.registrationDate));

        // Chọn currentReg:
        // - Ưu tiên id trên query
        let cur = preferredId ? list.find((x) => x.id === preferredId) : null;

        // - Nếu chưa, ưu tiên bản PENDING mới nhất
        if (!cur) {
          cur = list.find((x) => (x.status || "").toUpperCase() === "PENDING") || null;
        }

        // - Nếu vẫn chưa, lấy bản mới nhất (nếu có)
        if (!cur && list.length > 0) {
          cur = list[0];
        }

        setAllRegs(list);
        setCurrentReg(cur);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("Không tải được danh sách đăng ký.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [student?.studentId, preferredId]);

  React.useEffect(() => {
  let cancelled = false;

  const fetchRoom = async () => {
    if (!currentReg?.roomId) { setRoomDetail(null); return; }
    try {
      const res = await getRoomById(currentReg.roomId);
      // Chuẩn hoá payload (tuỳ backend)
      const rd =
        res?.data?.data ?? res?.data?.result ?? res?.data ?? res?.result ?? res ?? null;
      if (!cancelled) setRoomDetail(rd);
    } catch (e) {
      if (!cancelled) setRoomDetail(null); // không chặn UI nếu lỗi
    }
  };

  fetchRoom();
  return () => { cancelled = true; };
}, [currentReg?.roomId]);

  // Nếu chưa có studentId và cũng không fetch được => quay về /bookings
  React.useEffect(() => {
    if (!loading && !student?.studentId && !currentReg) {
      navigate("/bookings", { replace: true });
    }
  }, [loading, student?.studentId, currentReg, navigate]);

  React.useEffect(() => {
  // ưu tiên id từ state student, fallback đăng ký hiện tại
  const sid = student?.studentId || currentReg?.studentId;
  if (!sid) return;

  let cancelled = false;
  (async () => {
    try {
      const res = await getStudentById(sid);
      // payload mẫu bạn đưa: { resultCode, data: {...} }
      const p = res?.data?.data ?? res?.data ?? res;
      if (!cancelled && p) {
        setStudent(prev => mergeStudentProfile(prev, p));
      }
    } catch (e) {
      console.warn("getStudentById error:", e);
      // không chặn UI nếu lỗi
    }
  })();

  return () => { cancelled = true; };
}, [student?.studentId, currentReg?.studentId]);


  // Lịch sử = tất cả trừ currentReg
  const historyRegs = React.useMemo(() => {
    if (!currentReg) return allRegs || [];
    return (allRegs || []).filter((r) => r.id !== currentReg.id);
  }, [allRegs, currentReg]);

  if (loading) {
    return (
      <div className="reg-status-container">
        <h2>Đăng ký nội trú đã được gửi</h2>
        <p className="hint">Đang tải dữ liệu…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="reg-status-container">
        <h2>Đăng ký nội trú đã được gửi</h2>
        <p className="warning">{err}</p>
        <div className="actions">
          <button onClick={() => navigate("/bookings", { replace: true })} className="primary">
            Quay lại trang đăng ký
          </button>
        </div>
      </div>
    );
  }

  if (!currentReg) {
    return (
      <div className="reg-status-container">
        <h2>Đăng ký nội trú</h2>
        <p className="hint">Bạn chưa có đăng ký nào.</p>
        <div className="actions">
          <button onClick={() => navigate("/bookings", { replace: true })} className="primary">
            Tạo đăng ký mới
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị
  return (
  <div className="reg-status-container">
    <h2>Đăng ký nội trú đã được gửi</h2>
    <p className="hint">
      {currentReg && currentReg.status === "PENDING"
        ? "Vui lòng chờ quản trị viên duyệt yêu cầu của bạn."
        : "Không có thông tin"}
    </p>

    {/* CHỈ HIỆN PHẦN DƯỚI NẾU ĐANG Ở TRẠNG THÁI PENDING */}
    {currentReg && currentReg.status === "PENDING" && (
      <div className="card single">
        <table className="kv-table">
          <tbody>
            <tr className="section">
              <th colSpan={2}>Thông tin sinh viên</th>
            </tr>
            <tr><td className="key">Mã SV</td><td className="val">{student?.studentId || "-"}</td></tr>
            <tr><td className="key">Họ và Tên</td><td className="val">{student?.fullName || currentReg.studentName || "-"}</td></tr>
            <tr><td className="key">Giới tính</td><td className="val">
              {student?.gender ||
                (currentReg.gender === "MALE"
                  ? "Nam"
                  : currentReg.gender === "FEMALE"
                  ? "Nữ"
                  : currentReg.gender) || "-"}
            </td></tr>
            <tr><td className="key">Ngày sinh</td><td className="val">{student?.dateOfBirth || "-"}</td></tr>
            <tr><td className="key">Lớp</td><td className="val">{student?.className || currentReg.className || "-"}</td></tr>
            <tr><td className="key">Khóa</td><td className="val">{student?.academicYear ?? currentReg.academicYear ?? "-"}</td></tr>
            <tr><td className="key">Quê quán</td><td className="val">{student?.address || "-"}</td></tr>

            <tr className="section"><th colSpan={2}>Thông tin đăng ký</th></tr>
            <tr><td className="key">Mã đăng ký</td><td className="val">{currentReg.id}</td></tr>
            <tr><td className="key">Loại yêu cầu</td><td className="val">{currentReg.requestType}</td></tr>
            <tr>
              <td className="key">Trạng thái</td>
              <td className="val">
                <span className={`status-badge ${(currentReg.status || "").toLowerCase()}`}>
                  {currentReg.status || "PENDING"}
                </span>
              </td>
            </tr>
            <tr><td className="key">Ngày đăng ký</td><td className="val">{currentReg.registrationDate || "-"}</td></tr>
            <tr><td className="key">Khu</td><td className="val">{currentReg.dormName || "-"}</td></tr>
            <tr><td className="key">Phòng</td><td className="val">{currentReg.roomName || currentReg.roomId}</td></tr>
            <tr>
              <td className="key">Giá</td>
              <td className="val">
                {roomDetail?.price != null
                  ? `${Number(roomDetail.price).toLocaleString()} đ/tháng`
                  : "-"}
              </td>
            </tr>
            <tr>
              <td className="key">Số chỗ</td>
              <td className="val">
                {roomDetail?.maxOccupants != null
                  ? `${roomDetail.maxOccupants} chỗ`
                  : "-"}
              </td>
            </tr>
            <tr>
              <td className="key">Đang ở / Còn trống</td>
              <td className="val">
                {roomDetail?.currentOccupants != null &&
                roomDetail?.maxOccupants != null
                  ? `${roomDetail.currentOccupants} / ${
                      roomDetail.maxOccupants - roomDetail.currentOccupants
                    }`
                  : "-"}
              </td>
            </tr>
            <tr><td className="key">Tầng</td><td className="val">{roomDetail?.floor ?? "-"}</td></tr>
          </tbody>
        </table>
      </div>
    )}

    {/* LỊCH SỬ CÁC ĐĂNG KÝ KHÔNG PHẢI PENDING */}
    <h3 style={{ marginTop: 20 }}>Lịch sử đăng ký của bạn</h3>
    {historyRegs.length > 0 ? (
      <div className="card">
        <table className="list-table">
          <thead>
            <tr>
              <th>Mã đăng ký</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Loại</th>
              <th>Khu</th>
              <th>Phòng</th>
            </tr>
          </thead>
          <tbody>
            {historyRegs.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.registrationDate || "-"}</td>
                <td>
                  <span className={`status-badge ${(r.status || "").toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.requestType}</td>
                <td>{r.dormName || "-"}</td>
                <td>{r.roomName || r.roomId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>Không có lịch sử đăng ký.</p>
    )}

    <div className="actions">
      <button onClick={() => navigate("/", { replace: true })} className="secondary">
        Về trang chủ
      </button>
      <button onClick={() => navigate("/bookings", { replace: true })} className="primary">
        Quay lại trang đăng ký
      </button>
    </div>
  </div>
);

}
