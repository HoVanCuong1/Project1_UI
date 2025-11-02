// Bookings.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Bookings.css";

import {
  getRoomsPaged,
  searchRooms3,
  searchRooms4,
  getDormNames,
  getGlobalMaxFloor,
  createRoomRegistration,
} from "../../config/api";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  // ======= STATE NHẬN TỪ StudentForm / RoomDetail (khi đã điền form) =======
  const studentData = location.state?.student || null;
  const bookingInfo = location.state?.bookingInfo || {}; // để {} cho đỡ null-check

  // ======= BỘ LỌC (chỉ dùng khi CHƯA có studentData) =======
  const [khu, setKhu] = useState("");            // dormName (vd: "Block A")
  const [gioiTinh, setGioiTinh] = useState("");  // MALE | FEMALE
  const [loaiPhong, setLoaiPhong] = useState(""); // số chỗ: 4/6/8
  const [tang, setTang] = useState("");          // "" | 1..maxFloor

  // ======= OPTIONS & PHÂN TRANG & DATA =======
  const [khuOptions, setKhuOptions] = useState([]);
  const [maxFloor, setMaxFloor] = useState(1);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, pages: 1, total: 0 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======= REGISTRATION RESULT =======
  const [regInfo, setRegInfo] = useState(null); // nhận về {status, registrationDate, ...}

  // ======= CHỌN PHÒNG TRONG DANH SÁCH =======
  const [selectedRoom, setSelectedRoom] = useState(null);
  console.log("[Bookings] location.state:", location.state);
console.log("[Bookings] bookingInfo:", bookingInfo);
console.log("[Bookings] studentData:", studentData);

  // roomId gửi đăng ký: ưu tiên cái đã lưu ở bookingInfo, fallback selectedRoom
  const roomIdToSend =
    bookingInfo.roomId || bookingInfo.phong || selectedRoom?.id || "";

  const hasStudentData = !!studentData;
  const hasAnyFilterExceptFloor = useMemo(
    () => !!(khu || gioiTinh || loaiPhong),
    [khu, gioiTinh, loaiPhong]
  );

  // ======= LOAD OPTIONS + ROOMS (chỉ khi CHƯA có studentData) =======
  useEffect(() => {
    if (hasStudentData) return; // đã ở chế độ tóm tắt -> không load danh sách phòng
    (async () => {
      try {
        const [names, mf] = await Promise.all([getDormNames(), getGlobalMaxFloor()]);
        setKhuOptions(Array.isArray(names) ? names : []);
        setMaxFloor(typeof mf === "number" ? mf : 1);
      } catch (e) {
        // ignore
      } finally {
        await fetchAll(0, pageSize);
        setPageIndex(0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, hasStudentData]);

  // ======= APIs =======
  const fetchAll = async (index = pageIndex, size = pageSize) => {
    try {
      setLoading(true);
      setError("");
      const res = await getRoomsPaged(index, size); // {meta, result}
      setRooms(res?.result || []);
      setMeta(res?.meta || { page: 1, pageSize: size, pages: 1, total: 0 });
      setSelectedRoom(null);
    } catch (e) {
      setError("Không tải được danh sách phòng.");
    } finally {
      setLoading(false);
    }
  };

  const doSearch = async (index = pageIndex, size = pageSize, floorOverride) => {
    try {
      setLoading(true);
      setError("");

      const dormName = khu || undefined;
      const type = gioiTinh || undefined;
      const maxOccupants = loaiPhong ? Number(loaiPhong) : undefined;
      const floorNum =
        floorOverride !== undefined
          ? floorOverride
          : tang
          ? Number(tang)
          : undefined;

      let res;
      if (typeof floorNum === "number") {
        res = await searchRooms4({
          dormName,
          type,
          maxOccupants,
          floor: floorNum,
          pageIndex: index,
          pageSize: size,
        });
      } else if (hasAnyFilterExceptFloor) {
        res = await searchRooms3({
          dormName,
          type,
          maxOccupants,
          pageIndex: index,
          pageSize: size,
        });
      } else {
        // Không có filter -> lấy tất cả
        return fetchAll(index, size);
      }

      setRooms(res?.result || []);
      setMeta(res?.meta || { page: 1, pageSize: size, pages: 1, total: 0 });
      setSelectedRoom(null);
    } catch (e) {
      setError("Không tìm kiếm được phòng.");
    } finally {
      setLoading(false);
    }
  };

  // ======= HANDLERS: FILTER/TABS/PAGING =======
  const handleSearch = () => {
    setPageIndex(0);
    if (tang) doSearch(0, pageSize, Number(tang));
    else if (hasAnyFilterExceptFloor) doSearch(0, pageSize);
    else fetchAll(0, pageSize);
  };

  const handleReset = () => {
    setKhu("");
    setGioiTinh("");
    setLoaiPhong("");
    setTang("");
    setPageIndex(0);
    fetchAll(0, pageSize);
  };

  const handlePageChange = (nextIndex) => {
    if (nextIndex < 0) return;
    if (meta?.pages && nextIndex > meta.pages - 1) return;
    setPageIndex(nextIndex);

    if (tang) doSearch(nextIndex, pageSize, Number(tang));
    else if (hasAnyFilterExceptFloor) doSearch(nextIndex, pageSize);
    else fetchAll(nextIndex, pageSize);
  };

  const handleSelectFloor = (floorNum) => {
    setTang(String(floorNum));
    setPageIndex(0);
    doSearch(0, pageSize, Number(floorNum));
  };

  const handleClearFloor = () => {
    setTang("");
    setPageIndex(0);
    if (hasAnyFilterExceptFloor) doSearch(0, pageSize, undefined);
    else fetchAll(0, pageSize);
  };

  const handleRoomClick = (room) => setSelectedRoom(room);

  // ======= FLOW: SANG RoomDetail -> StudentForm =======
  const handleConfirm = () => {
    if (!selectedRoom) {
      alert("Vui lòng chọn phòng trước khi xác nhận!");
      return;
    }
    navigate(`/roomdetail/${selectedRoom.id}`, {
      state: {
        bookingInfo: {
          khu: selectedRoom.dormName,
          gioiTinh: selectedRoom.type,                // MALE/FEMALE
          loaiPhong: `${selectedRoom.maxOccupants} beds`,
          tang: selectedRoom.floor,
          phong: selectedRoom.id,
          price: selectedRoom.price,
        },
        student: studentData || null,
      },
    });
  };

  // ======= GỬI ĐĂNG KÝ =======
  const handleSendRegistration = async () => {
  if (!studentData?.studentId) {
    alert("Thiếu mã sinh viên.");
    return;
  }
  const roomIdToSend = bookingInfo.roomId || bookingInfo.phong || selectedRoom?.id || "";
  if (!roomIdToSend) {
    alert("Thiếu phòng đã chọn.");
    return;
  }

  try {
    const res = await createRoomRegistration({
      studentId: studentData.studentId,
      roomId: roomIdToSend,
      requestType: "REGISTER",
      registrationDate: null,
    });

    // Log để biết hàm api trả về dạng gì
    console.log("[Bookings] createRoomRegistration raw res =", res);

    // Chuẩn hóa payload: hỗ trợ cả 2 trường hợp
    // 1) res = { resultCode, data: {...} }
    // 2) res = { ...payload } (đã unwrap sẵn)
    const payload = res?.data?.data ?? res?.data ?? res;

    if (!payload?.id) {
      console.warn("[Bookings] payload không có id, payload =", payload);
      alert("Không đọc được dữ liệu đăng ký trả về.");
      return;
    }

    // Điều hướng sang trang trạng thái
    navigate(`/booking/status?id=${payload.id}`, {
      replace: true,
      state: { student: studentData }
    });
  } catch (e) {
    console.error("[Bookings] createRoomRegistration error:", e);
    alert("Gửi đăng ký thất bại. Vui lòng thử lại.");
  }
};

  // ======= XÓA TÓM TẮT (quay lại chế độ chọn) =======
  const handleClearAll = () => {
    setRegInfo(null);
    navigate("/bookings", { replace: true }); // clear state
  };

  // ======= UI helpers =======
  const getBedIcons = (used, total) => {
    const arr = [];
    for (let i = 0; i < used; i++) {
      arr.push(<span key={"r" + i} className="bed red">👤</span>);
    }
    for (let i = 0; i < total - used; i++) {
      arr.push(<span key={"g" + i} className="bed green">🧍‍♂️</span>);
    }
    return arr;
  };

  // ======= RENDER =======
  return (
    <div className="booking-container">
      <h2>Chọn phòng ký túc xá</h2>

      {/* ===== CHẾ ĐỘ CHỌN PHÒNG (chỉ hiện khi CHƯA có dữ liệu sinh viên) ===== */}
      {!hasStudentData && (
        <>
          {/* ==== Bộ lọc ==== */}
          <div className="filter-row">
            <select value={khu} onChange={(e) => setKhu(e.target.value)}>
              <option value="">-- Chọn Khu --</option>
              {khuOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>

            <select value={gioiTinh} onChange={(e) => setGioiTinh(e.target.value)}>
              <option value="">-- Giới tính --</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>

            <select value={loaiPhong} onChange={(e) => setLoaiPhong(e.target.value)}>
              <option value="">-- Loại phòng (số chỗ) --</option>
              {[4, 6, 8].map((n) => (
                <option key={n} value={n}>{n} chỗ</option>
              ))}
            </select>

            <button onClick={handleSearch}>Tìm</button>
            <button onClick={handleReset} className="secondary">Reset</button>
          </div>

          {/* ==== Legend + Tabs tầng ==== */}
          <div className="legend">
            <span className="legend-item red">👤 Đã có SV</span>
            <span className="legend-item green">🧍‍♂️ Còn trống</span>
          </div>

          <div className="floor-tabs">
            <button className={!tang ? "active" : ""} onClick={handleClearFloor}>
              Tất cả tầng
            </button>
            {Array.from({ length: Math.max(1, maxFloor) }, (_, i) => i + 1).map((f) => (
              <button
                key={f}
                className={String(tang) === String(f) ? "active" : ""}
                onClick={() => handleSelectFloor(f)}
              >
                Tầng {f}
              </button>
            ))}
          </div>

          {/* ==== Danh sách phòng ==== */}
          {loading && <p>Đang tải...</p>}
          {error && <p className="warning">{error}</p>}

          {!loading && !error && (
            <div className="room-list">
              {rooms.map((room) => {
                const remain = (room.maxOccupants ?? 0) - (room.currentOccupants ?? 0);
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <div
                    key={room.id}
                    className={`room-card ${remain === 0 ? "full" : "available"} ${isSelected ? "selected" : ""}`}
                    onClick={() => handleRoomClick(room)}
                    title={`Khu: ${room.dormName} • Tầng ${room.floor}`}
                  >
                    <h3>{room.name}</h3>
                    <p>
                      Khu: <b>{room.dormName}</b> • Tầng <b>{room.floor}</b> • Loại: <b>{room.type}</b>
                      <br />
                      Sức chứa: {room.maxOccupants} — Đang có: {room.currentOccupants}
                      <br />
                      <span className="count">Còn trống: {remain}/{room.maxOccupants}</span>
                    </p>
                    <div className="price">{Number(room.price).toLocaleString()} đ/tháng</div>
                    <div className="beds">{getBedIcons(room.currentOccupants, room.maxOccupants)}</div>
                  </div>
                );
              })}
              {rooms.length === 0 && <p>Không có phòng phù hợp.</p>}
            </div>
          )}

          {/* ==== Phân trang ==== */}
          <div className="paging-compact">
            <div className="paging-info">
              {meta?.total ?? 0} phòng • Trang {meta?.page ?? pageIndex + 1}/{meta?.pages ?? 1}
            </div>
            <div className="paging-actions">
              <button onClick={() => handlePageChange(0)} disabled={pageIndex === 0}>«</button>
              <button onClick={() => handlePageChange(pageIndex - 1)} disabled={pageIndex === 0}>‹</button>
              <span>{pageIndex + 1}</span>
              <button
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={meta?.pages ? pageIndex >= meta.pages - 1 : true}
              >
                ›
              </button>
              <button
                onClick={() => handlePageChange((meta?.pages ?? 1) - 1)}
                disabled={meta?.pages ? pageIndex >= meta.pages - 1 : true}
              >
                »
              </button>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {[5, 10, 20, 50].map((s) => (
                  <option key={s} value={s}>{s}/trang</option>
                ))}
              </select>
            </div>
          </div>

          {/* ==== Nút xác nhận -> RoomDetail ==== */}
          <div className="confirm-btn">
            <button onClick={handleConfirm}>Xác nhận đăng ký</button>
          </div>
        </>
      )}

      {/* ===== CHẾ ĐỘ TÓM TẮT + GỬI (khi ĐÃ có studentData) ===== */}
      {hasStudentData && (
        <>
          {/* Thông tin sinh viên */}
          <table className="student-table">
            <thead>
              <tr>
                <th>Mã SV</th>
                <th>Họ và Tên</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Lớp</th>
                <th>Khóa</th>
                <th>Quê Quán</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{studentData.studentId}</td>
                <td>{studentData.fullName}</td>
                <td>{studentData.gender}</td>
                <td>{studentData.dateOfBirth}</td>
                <td>{studentData.className}</td>
                <td>{studentData.academicYear ?? "-"}</td>
                <td>{studentData.address}</td>
              </tr>
            </tbody>
          </table>

          {/* Thông tin phòng đã chọn */}
          <table className="room-table">
            <thead>
              <tr>
                <th>Khu</th>
                <th>Tầng</th>
                <th>Giá</th>
                <th>Phòng</th>
                <th>Chỗ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{bookingInfo.khu || "-"}</td>
                <td>{bookingInfo.tang || bookingInfo.floor || "-"}</td>
                <td>
                  {bookingInfo.price != null
                    ? `${Number(bookingInfo.price).toLocaleString()} đ/tháng`
                    : "-"}
                </td>
                <td>{bookingInfo.phong || bookingInfo.roomId || "-"}</td>
                <td>{bookingInfo.cho || "-"}</td>
              </tr>
            </tbody>
          </table>

          {/* Nếu đã gửi: hiện trạng thái + ngày. Nếu chưa: hiện nút Gửi / Xóa */}
          {regInfo ? (
            <div className="reg-result">
              <span className={`status-badge ${regInfo.status?.toLowerCase() || ""}`}>
                {regInfo.status || "PENDING"}
              </span>
              <span className="reg-date">Ngày đăng ký: {regInfo.registrationDate || "-"}</span>
              <div className="hint">Đã gửi đăng ký — chờ admin duyệt.</div>
            </div>
          ) : (
            <div className="confirm-btn-row">
              <button
                onClick={handleSendRegistration}
                disabled={!roomIdToSend}
                className="primary"
              >
                Gửi đăng ký
              </button>
              <button onClick={handleClearAll} className="secondary danger">
                Xóa
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
  
}
