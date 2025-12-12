// src/pages/Manager/RoomManager.js (hoặc DormManager.js tùy m đặt)
// LƯU Ý: chỉ khác bản cũ ở phần import useNavigate + cột "Chi tiết"

import React, { useEffect, useMemo, useState } from "react";
import "./RoomManager.css";
import { useNavigate } from "react-router-dom";

import {
  getRoomsPaged,
  searchRooms3,
  searchRooms4,
  getDormNames,
  getGlobalMaxFloor,
} from "../../../config/api";

export default function RoomManager() {
  const navigate = useNavigate();

  // ======= FILTERS =======
  const [khu, setKhu] = useState(""); // dormName (vd: "Block A")
  const [gioiTinh, setGioiTinh] = useState(""); // MALE | FEMALE
  const [loaiPhong, setLoaiPhong] = useState(""); // số chỗ: 4/6/8
  const [tang, setTang] = useState(""); // "" | 1..maxFloor
  const [occupancyFilter, setOccupancyFilter] = useState(""); // '', 'FREE', 'ALMOST', 'FULL'

  // ======= OPTIONS & PAGING & DATA =======
  const [khuOptions, setKhuOptions] = useState([]);
  const [maxFloor, setMaxFloor] = useState(1);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 10,
    pages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasAnyFilterExceptFloor = useMemo(
    () => !!(khu || gioiTinh || loaiPhong),
    [khu, gioiTinh, loaiPhong]
  );

  // ======= LOAD OPTIONS + FIRST ROOMS =======
  useEffect(() => {
    (async () => {
      try {
        const [names, mf] = await Promise.all([
          getDormNames(),
          getGlobalMaxFloor(),
        ]);
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
  }, [pageSize]);

  // ======= APIs =======
  const fetchAll = async (index = pageIndex, size = pageSize) => {
    try {
      setLoading(true);
      setError("");
      const res = await getRoomsPaged(index, size);
      setRooms(res?.result || []);
      setMeta(
        res?.meta || { page: index + 1, pageSize: size, pages: 1, total: 0 }
      );
    } catch (e) {
      console.error(e);
      setError("Không tải được danh sách phòng.");
      setRooms([]);
      setMeta({ page: 1, pageSize: size, pages: 1, total: 0 });
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
        return fetchAll(index, size);
      }

      setRooms(res?.result || []);
      setMeta(
        res?.meta || { page: index + 1, pageSize: size, pages: 1, total: 0 }
      );
    } catch (e) {
      console.error(e);
      setError("Không tìm kiếm được phòng.");
      setRooms([]);
      setMeta({ page: 1, pageSize: size, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // ======= HANDLERS =======
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
    setOccupancyFilter("");
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

  // 👉 thêm: khi bấm "Chi tiết"
  const handleViewDetail = (roomId) => {
    // tuỳ m định nghĩa route, ví dụ: /manager/rooms/:roomId
    navigate(`/manager/rooms/${roomId}`);
  };

  // Lọc client-side theo trạng thái lấp đầy
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const max = room.maxOccupants ?? 0;
      const current = room.currentOccupants ?? 0;
      const remain = max - current;

      if (!occupancyFilter) return true;
      if (occupancyFilter === "FREE") return remain > 0;
      if (occupancyFilter === "FULL") return remain === 0;
      if (occupancyFilter === "ALMOST") {
        // gần đầy: còn <= 2 chỗ nhưng vẫn > 0
        return remain > 0 && remain <= 2;
      }
      return true;
    });
  }, [rooms, occupancyFilter]);

  // Helper badge cho tình trạng phòng
  const getOccupancyBadge = (room) => {
    const max = room.maxOccupants ?? 0;
    const current = room.currentOccupants ?? 0;
    const remain = max - current;

    if (max === 0) return { text: "Chưa cấu hình", className: "badge-empty" };
    if (remain === 0) return { text: "Đã đầy", className: "badge-full" };
    if (remain <= 2) return { text: `Sắp đầy (${remain} chỗ)`, className: "badge-almost" };
    return { text: `Còn ${remain} chỗ`, className: "badge-free" };
  };

  return (
    <div className="rm-container">
      {/* ===== HEADER ===== */}
      <div className="rm-header">
        <div>
          <h2>Quản lý phòng ký túc xá</h2>
          <p className="rm-sub">
            Xem nhanh tình trạng các phòng, số chỗ trống, khu nam/nữ, giá phòng...
          </p>
        </div>
        <div className="rm-header-stat">
          <span className="rm-stat-main">{meta?.total ?? 0}</span>
          <span className="rm-stat-label">phòng trong hệ thống</span>
        </div>
      </div>

      {/* ===== TOOLBAR / FILTERS ===== */}
      <div className="rm-toolbar card">
        <div className="rm-filter-row">
          <label>
            Khu
            <select value={khu} onChange={(e) => setKhu(e.target.value)}>
              <option value="">Tất cả khu</option>
              {khuOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>

          <label>
            Giới tính
            <select
              value={gioiTinh}
              onChange={(e) => setGioiTinh(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </label>

          <label>
            Loại phòng
            <select
              value={loaiPhong}
              onChange={(e) => setLoaiPhong(e.target.value)}
            >
              <option value="">Tất cả</option>
              {[4, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n} chỗ
                </option>
              ))}
            </select>
          </label>

          <label>
            Trạng thái
            <select
              value={occupancyFilter}
              onChange={(e) => setOccupancyFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="FREE">Còn chỗ</option>
              <option value="ALMOST">Sắp đầy</option>
              <option value="FULL">Đã đầy</option>
            </select>
          </label>

          <div className="rm-actions-inline">
            <button className="btn rm-btn-primary" onClick={handleSearch}>
              Tìm
            </button>
            <button className="btn rm-btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {/* Floor chips */}
        <div className="rm-floor-tabs">
          <button
            className={`rm-chip ${!tang ? "active" : ""}`}
            onClick={handleClearFloor}
          >
            Tất cả tầng
          </button>
          {Array.from({ length: Math.max(1, maxFloor) }, (_, i) => i + 1).map(
            (f) => (
              <button
                key={f}
                className={`rm-chip ${
                  String(tang) === String(f) ? "active" : ""
                }`}
                onClick={() => handleSelectFloor(f)}
              >
                Tầng {f}
              </button>
            )
          )}
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="rm-card">
        {loading && <p className="rm-loading">Đang tải danh sách phòng...</p>}
        {error && <p className="rm-warning">{error}</p>}

        {!loading && !error && (
          <>
            <table className="rm-table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Khu</th>
                  <th>Tầng</th>
                  <th>Giới tính</th>
                  <th>Số chỗ</th>
                  <th>Đang ở</th>
                  <th>Trạng thái</th>
                  <th>Giá (đ/tháng)</th>
                  <th></th> {/* cột Chi tiết */}
                </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", opacity: 0.7 }}>
                      Không có phòng phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => {
                    const badge = getOccupancyBadge(room);
                    return (
                      <tr key={room.id}>
                        <td>
                          <div className="rm-room-name">{room.name}</div>
                          <div className="rm-room-sub">
                            ID: <span className="mono">{room.id}</span>
                          </div>
                        </td>
                        <td>{room.dormName}</td>
                        <td>{room.floor}</td>
                        <td>
                          <span className={`rm-gender-tag ${room.type}`}>
                            {room.type === "MALE"
                              ? "Nam"
                              : room.type === "FEMALE"
                              ? "Nữ"
                              : room.type}
                          </span>
                        </td>
                        <td>{room.maxOccupants}</td>
                        <td>{room.currentOccupants}</td>
                        <td>
                          <span className={`rm-ocp-badge ${badge.className}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td>
                          {room.price != null
                            ? Number(room.price).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          <button
                            className="btn rm-btn-link"
                            onClick={() => handleViewDetail(room.id)}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* ===== PAGING ===== */}
            <div className="rm-paging">
              <div className="rm-paging-info">
                Tổng: {meta?.total ?? 0} phòng • Trang{" "}
                {meta?.page ?? pageIndex + 1}/{meta?.pages ?? 1}
              </div>
              <div className="rm-paging-actions">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={pageIndex === 0}
                  className="btn rm-btn-light"
                >
                  «
                </button>
                <button
                  onClick={() => handlePageChange(pageIndex - 1)}
                  disabled={pageIndex === 0}
                  className="btn rm-btn-light"
                >
                  ‹
                </button>
                <span className="rm-page-now">{pageIndex + 1}</span>
                <button
                  onClick={() => handlePageChange(pageIndex + 1)}
                  disabled={meta?.pages ? pageIndex >= meta.pages - 1 : true}
                  className="btn rm-btn-light"
                >
                  ›
                </button>
                <button
                  onClick={() =>
                    handlePageChange((meta?.pages ?? 1) - 1)
                  }
                  disabled={meta?.pages ? pageIndex >= meta.pages - 1 : true}
                  className="btn rm-btn-light"
                >
                  »
                </button>

                <label className="rm-page-size">
                  Size
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageIndex(0);
                    }}
                  >
                    {[5, 10, 20, 50].map((s) => (
                      <option key={s} value={s}>
                        {s}/trang
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
