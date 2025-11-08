import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentManager.css";

import {
  getRoomsPaged,
  searchRooms3,
  searchRooms4,
  getDormNames,
  getGlobalMaxFloor,
} from "../../../config/api";

export default function PaymentManager() {
  const navigate = useNavigate();

  // ======= FILTERS =======
  const [khu, setKhu] = useState("");            // dormName (vd: "Block A")
  const [gioiTinh, setGioiTinh] = useState("");  // MALE | FEMALE
  const [loaiPhong, setLoaiPhong] = useState(""); // số chỗ: 4/6/8
  const [tang, setTang] = useState("");          // "" | 1..maxFloor

  // ======= OPTIONS & PAGING & DATA =======
  const [khuOptions, setKhuOptions] = useState([]);
  const [maxFloor, setMaxFloor] = useState(1);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, pages: 1, total: 0 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasAnyFilterExceptFloor = useMemo(
    () => !!(khu || gioiTinh || loaiPhong),
    [khu, gioiTinh, loaiPhong]
  );

  // ======= LOAD OPTIONS + ROOMS =======
  useEffect(() => {
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
  }, [pageSize]);

  // ======= APIs =======
  const fetchAll = async (index = pageIndex, size = pageSize) => {
    try {
      setLoading(true);
      setError("");
      const res = await getRoomsPaged(index, size);
      setRooms(res?.result || []);
      setMeta(res?.meta || { page: 1, pageSize: size, pages: 1, total: 0 });
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
        floorOverride !== undefined ? floorOverride : tang ? Number(tang) : undefined;

      let res;
      if (typeof floorNum === "number") {
        res = await searchRooms4({
          dormName, type, maxOccupants, floor: floorNum, pageIndex: index, pageSize: size,
        });
      } else if (hasAnyFilterExceptFloor) {
        res = await searchRooms3({
          dormName, type, maxOccupants, pageIndex: index, pageSize: size,
        });
      } else {
        return fetchAll(index, size);
      }

      setRooms(res?.result || []);
      setMeta(res?.meta || { page: 1, pageSize: size, pages: 1, total: 0 });
    } catch (e) {
      setError("Không tìm kiếm được phòng.");
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

  // Mở trang lập hóa đơn
  const handleCreateInvoice = (room) => {
    navigate("/manager/payments-create", {
      state: {
        roomInfo: {
          id: room.id,
          name: room.name,
          dormName: room.dormName,
          floor: room.floor,
          type: room.type,
          price: room.price,
          maxOccupants: room.maxOccupants,
          currentOccupants: room.currentOccupants,
        },
      },
    });
  };

  // ======= RENDER =======
  return (
    <div className="pm-container">
      <div className="pm-header">
        <h2>Lập hóa đơn phòng</h2>
        <p className="pm-sub">Chọn phòng → Lập hóa đơn cho sinh viên trong phòng</p>
      </div>

      {/* ==== Bộ lọc ==== */}
      <div className="pm-toolbar">
        <div className="pm-filter-row">
          <label>
            Khu
            <select value={khu} onChange={(e) => setKhu(e.target.value)}>
              <option value="">Tất cả khu</option>
              {khuOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </label>

          <label>
            Giới tính
            <select value={gioiTinh} onChange={(e) => setGioiTinh(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </label>

          <label>
            Loại phòng
            <select value={loaiPhong} onChange={(e) => setLoaiPhong(e.target.value)}>
              <option value="">Tất cả</option>
              {[4, 6, 8].map((n) => (
                <option key={n} value={n}>{n} chỗ</option>
              ))}
            </select>
          </label>

          <div className="pm-actions-inline">
            <button className="btn btn-primary" onClick={handleSearch}>Tìm</button>
            <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
          </div>
        </div>

        {/* Tabs tầng */}
        <div className="pm-floor-tabs">
          <button className={`chip ${!tang ? "active" : ""}`} onClick={handleClearFloor}>
            Tất cả tầng
          </button>
          {Array.from({ length: Math.max(1, maxFloor) }, (_, i) => i + 1).map((f) => (
            <button
              key={f}
              className={`chip ${String(tang) === String(f) ? "active" : ""}`}
              onClick={() => handleSelectFloor(f)}
            >
              Tầng {f}
            </button>
          ))}
        </div>
      </div>

      {/* ==== Danh sách phòng ==== */}
      {loading && <p className="pm-loading">Đang tải...</p>}
      {error && <p className="warning">{error}</p>}

      {!loading && !error && (
        <div className="pm-room-list">
          {rooms.map((room) => {
            const remain = (room.maxOccupants ?? 0) - (room.currentOccupants ?? 0);
            const full = remain === 0;
            return (
              <div
                key={room.id}
                className={`pm-room-card ${full ? "full" : "available"}`}
                title={`Khu: ${room.dormName} • Tầng ${room.floor}`}
              >
                <div className="pm-room-header">
                  <div>
                    <h3 className="pm-room-name">{room.name}</h3>
                    <div className="pm-room-sub">Khu {room.dormName} • Tầng {room.floor} • {room.type}</div>
                  </div>
                  <div className="pm-room-price">
                    {Number(room.price).toLocaleString()} đ/tháng
                  </div>
                </div>

                <div className="pm-room-stats">
                  <div>Sức chứa: <b>{room.maxOccupants}</b></div>
                  <div>Đang ở: <b>{room.currentOccupants}</b></div>
                  <div className={`pm-count ${full ? "full" : ""}`}>
                    Còn trống: <b>{remain}</b> / {room.maxOccupants}
                  </div>
                </div>

                <div className="pm-card-actions">
                  <button
                    onClick={() => handleCreateInvoice(room)}
                    className="btn btn-primary"
                  >
                    Lập hóa đơn
                  </button>
                </div>
              </div>
            );
          })}
          {rooms.length === 0 && <p>Không có phòng phù hợp.</p>}
        </div>
      )}

      {/* ==== Phân trang ==== */}
      <div className="pm-paging">
        <div className="pm-paging-info">
          {meta?.total ?? 0} phòng • Trang {meta?.page ?? pageIndex + 1}/{meta?.pages ?? 1}
        </div>
        <div className="pm-paging-actions">
          <button onClick={() => handlePageChange(0)} disabled={pageIndex === 0} className="btn btn-light">«</button>
          <button onClick={() => handlePageChange(pageIndex - 1)} disabled={pageIndex === 0} className="btn btn-light">‹</button>
          <span className="pm-page-now">{pageIndex + 1}</span>
          <button
            onClick={() => handlePageChange(pageIndex + 1)}
            disabled={meta?.pages ? pageIndex >= meta.pages - 1 : true}
            className="btn btn-light"
          >
            ›
          </button>
          <button
            onClick={() => handlePageChange((meta?.pages ?? 1) - 1)}
            disabled={meta?.pages ? pageIndex >= meta.pages - 1 : true}
            className="btn btn-light"
          >
            »
          </button>
          <label className="pm-page-size">
            Size
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[5, 10, 20, 50].map((s) => (
                <option key={s} value={s}>{s}/trang</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
