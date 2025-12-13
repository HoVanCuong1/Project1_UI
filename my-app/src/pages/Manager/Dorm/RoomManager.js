import React, { useEffect, useMemo, useState } from "react";
import "./RoomManager.css";
import { useNavigate } from "react-router-dom";
import {
  getRoomsPaged,
  searchRooms3,
  searchRooms4,
  getDormNames,
  getGlobalMaxFloor,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../../../config/api";

export default function RoomManager() {
  const navigate = useNavigate();

  // ======= FILTERS =======
  const [khu, setKhu] = useState("");
  const [gioiTinh, setGioiTinh] = useState("");
  const [loaiPhong, setLoaiPhong] = useState("");
  const [tang, setTang] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("");

  // ======= DATA & PAGING =======
  const [khuOptions, setKhuOptions] = useState([]);
  const [maxFloor, setMaxFloor] = useState(1);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======= MODAL STATE =======
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    dormId: "",
    name: "",
    type: "MALE",
    maxOccupants: 4,
    price: 0,
    floor: 1,
  });

  const hasAnyFilterExceptFloor = useMemo(
    () => !!(khu || gioiTinh || loaiPhong),
    [khu, gioiTinh, loaiPhong]
  );

  // ======= LOAD DATA =======
  useEffect(() => {
    (async () => {
      try {
        const [names, mf] = await Promise.all([getDormNames(), getGlobalMaxFloor()]);
        setKhuOptions(Array.isArray(names) ? names : []);
        setMaxFloor(typeof mf === "number" ? mf : 1);
      } catch (e) { /* ignore */ } 
      finally {
        await fetchAll(0, pageSize);
      }
    })();
  }, [pageSize]);

  // ======= API CALLS =======
  const fetchAll = async (index = pageIndex, size = pageSize) => {
    try {
      setLoading(true); setError("");
      const res = await getRoomsPaged(index, size);
      const dataNode = res.result ? res : (res.data && res.data.result) ? res.data : {};
      setRooms(dataNode.result || []);
      setMeta(dataNode.meta || { page: index + 1, pageSize: size, pages: 1, total: 0 });
    } catch (e) {
      console.error(e); setError("Không tải được danh sách phòng.");
    } finally { setLoading(false); }
  };

  const doSearch = async (index = pageIndex, size = pageSize, floorOverride) => {
    try {
      setLoading(true); setError("");
      const dormName = khu || undefined;
      const type = gioiTinh || undefined;
      const maxOccupants = loaiPhong ? Number(loaiPhong) : undefined;
      const floorNum = floorOverride !== undefined ? floorOverride : (tang ? Number(tang) : undefined);

      let res;
      if (typeof floorNum === "number") {
        res = await searchRooms4({ dormName, type, maxOccupants, floor: floorNum, pageIndex: index, pageSize: size });
      } else if (hasAnyFilterExceptFloor) {
        res = await searchRooms3({ dormName, type, maxOccupants, pageIndex: index, pageSize: size });
      } else {
        return fetchAll(index, size);
      }
      setRooms(res?.result || []);
      setMeta(res?.meta || { page: index + 1, pageSize: size, pages: 1, total: 0 });
    } catch (e) {
      console.error(e); setError("Không tìm kiếm được phòng."); setRooms([]);
    } finally { setLoading(false); }
  };

  // ======= CRUD HANDLERS =======
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ id: "", dormId: "DORMA", name: "", type: "MALE", maxOccupants: 4, price: 0, floor: 1 });
    setShowModal(true);
  };

  const handleOpenEdit = (room) => {
    setIsEdit(true);
    setFormData({
      id: room.id,
      dormId: room.dormId,
      name: room.name,
      type: room.type,
      maxOccupants: room.maxOccupants,
      price: room.price,
      floor: room.floor
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const { id, dormId, ...updateBody } = formData;
        await updateRoom(formData.id, updateBody);
        alert("Cập nhật phòng thành công!");
      } else {
        await createRoom(formData);
        alert("Tạo phòng mới thành công!");
      }
      setShowModal(false);
      fetchAll(pageIndex, pageSize);
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng ${id}?`)) {
      try {
        await deleteRoom(id);
        alert("Xóa phòng thành công!");
        fetchAll(pageIndex, pageSize);
      } catch (error) {
        alert("Không thể xóa: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ======= FILTER HANDLERS =======
  const handleSearch = () => { setPageIndex(0); if (tang) doSearch(0, pageSize, Number(tang)); else if (hasAnyFilterExceptFloor) doSearch(0, pageSize); else fetchAll(0, pageSize); };
  const handleReset = () => { setKhu(""); setGioiTinh(""); setLoaiPhong(""); setTang(""); setOccupancyFilter(""); setPageIndex(0); fetchAll(0, pageSize); };
  const handlePageChange = (nextIndex) => { if (nextIndex < 0 || (meta?.pages && nextIndex >= meta.pages)) return; setPageIndex(nextIndex); if (tang) doSearch(nextIndex, pageSize, Number(tang)); else if (hasAnyFilterExceptFloor) doSearch(nextIndex, pageSize); else fetchAll(nextIndex, pageSize); };
  const handleSelectFloor = (f) => { setTang(String(f)); setPageIndex(0); doSearch(0, pageSize, Number(f)); };
  const handleClearFloor = () => { setTang(""); setPageIndex(0); if (hasAnyFilterExceptFloor) doSearch(0, pageSize, undefined); else fetchAll(0, pageSize); };
  
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const max = room.maxOccupants ?? 0; const current = room.currentOccupants ?? 0; const remain = max - current;
      if (!occupancyFilter) return true;
      if (occupancyFilter === "FREE") return remain > 0;
      if (occupancyFilter === "FULL") return remain === 0;
      if (occupancyFilter === "ALMOST") return remain > 0 && remain <= 2;
      return true;
    });
  }, [rooms, occupancyFilter]);

  const getOccupancyBadge = (room) => {
    const max = room.maxOccupants ?? 0; const current = room.currentOccupants ?? 0; const remain = max - current;
    if (max === 0) return { text: "N/A", className: "badge-empty" };
    if (remain === 0) return { text: "Đầy", className: "badge-full" };
    if (remain <= 2) return { text: `Sắp đầy (${remain})`, className: "badge-almost" };
    return { text: `Còn ${remain}`, className: "badge-free" };
  };

  return (
    <div className="rm-container">
      {/* HEADER */}
      <div className="rm-header">
        <div>
          <h2 className="rm-title"><i className="bi bi-grid-fill me-2"></i>Quản lý phòng Ký Túc Xá</h2>
          <p className="rm-sub">Quản lý danh sách, thêm, sửa, xóa phòng ở.</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
            <div className="rm-stat-box">
                <span className="rm-stat-number">{meta?.total ?? 0}</span>
                <span className="rm-stat-label">Tổng phòng</span>
            </div>
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleOpenAdd}>
                <i className="bi bi-plus-lg"></i> Thêm phòng
            </button>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="rm-toolbar">
        <div className="rm-filters">
          <div className="rm-form-group">
            <label>Khu vực</label>
            <select value={khu} onChange={(e) => setKhu(e.target.value)}>
              <option value="">Tất cả</option>
              {khuOptions.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="rm-form-group">
            <label>Giới tính</label>
            <select value={gioiTinh} onChange={(e) => setGioiTinh(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </div>
          <div className="rm-form-group">
            <label>Loại phòng</label>
            <select value={loaiPhong} onChange={(e) => setLoaiPhong(e.target.value)}>
              <option value="">Tất cả</option>
              {[4, 6, 8].map((n) => <option key={n} value={n}>{n} chỗ</option>)}
            </select>
          </div>
          <div className="rm-form-group">
            <label>Trạng thái</label>
            <select value={occupancyFilter} onChange={(e) => setOccupancyFilter(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="FREE">Còn chỗ</option>
              <option value="ALMOST">Sắp đầy</option>
              <option value="FULL">Đã đầy</option>
            </select>
          </div>
          <div className="rm-actions">
            <button className="btn rm-btn-search" onClick={handleSearch}><i className="bi bi-search"></i> Tìm</button>
            <button className="btn rm-btn-reset" onClick={handleReset}><i className="bi bi-arrow-counterclockwise">Reset</i></button>
          </div>
        </div>
        {/* Floor Tabs */}
        <div className="rm-floor-tabs">
          <span className="rm-floor-label">Lọc tầng:</span>
          <button className={`rm-chip ${!tang ? "active" : ""}`} onClick={handleClearFloor}>Tất cả</button>
          {Array.from({ length: Math.max(1, maxFloor) }, (_, i) => i + 1).map((f) => (
            <button key={f} className={`rm-chip ${String(tang) === String(f) ? "active" : ""}`} onClick={() => handleSelectFloor(f)}>
              Tầng {f}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="rm-content">
        {loading && <div className="rm-loading"><div className="spinner-border text-primary"></div> Loading...</div>}
        {error && <div className="rm-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="table-responsive rm-table-wrapper">
              <table className="table rm-table align-middle">
                <thead>
                  <tr>
                    <th>Phòng / ID</th>
                    <th>Khu</th>
                    <th className="text-center">Tầng</th>
                    <th>Loại</th>
                    <th className="text-center">Chỗ</th>
                    <th className="text-center">Đang ở</th>
                    <th className="text-end">Giá (VNĐ)</th>
                    <th className="text-center">TT</th>
                    <th className="text-end" style={{minWidth: '160px'}}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-5 text-muted">Không tìm thấy dữ liệu.</td></tr>
                  ) : (
                    filteredRooms.map((room) => {
                      const badge = getOccupancyBadge(room);
                      return (
                        <tr key={room.id}>
                          <td>
                            <div className="fw-bold">{room.name}</div>
                            <small className="text-muted">{room.id}</small>
                          </td>
                          <td>{room.dormName}</td>
                          <td className="text-center">{room.floor}</td>
                          <td>
                            <span className={`badge-gender ${room.type}`}>
                              {room.type === "MALE" ? "Nam" : "Nữ"}
                            </span>
                          </td>
                          <td className="text-center">{room.maxOccupants}</td>
                          <td className="text-center fw-bold">{room.currentOccupants}</td>
                          <td className="text-end text-primary fw-bold">
                            {Number(room.price).toLocaleString('vi-VN')}
                          </td>
                          <td className="text-center">
                            <span className={`rm-status-badge ${badge.className}`}>{badge.text}</span>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-light me-1" title="Chi tiết" onClick={() => navigate(`/manager/rooms/${room.id}`)}>
                                <i className="bi bi-eye"></i>Chi tiết
                            </button>
                            <button className="btn btn-sm btn-light text-primary me-1" title="Sửa" onClick={() => handleOpenEdit(room)}>
                                <i className="bi bi-pencil-square"></i>Sửa
                            </button>
                            <button className="btn btn-sm btn-light text-danger" title="Xóa" onClick={() => handleDelete(room.id)}>
                                <i className="bi bi-trash"></i>Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paging */}
            <div className="rm-paging">
               <div className="text-muted small">Hiển thị {filteredRooms.length} phòng</div>
               <div className="d-flex align-items-center gap-2">
                 <select className="form-select form-select-sm" style={{width:'auto'}} value={pageSize} onChange={(e)=>{setPageSize(Number(e.target.value)); setPageIndex(0)}}>
                    {[5,10,20,50].map(s => <option key={s} value={s}>{s} / trang</option>)}
                 </select>
                 <div className="btn-group">
                    <button className="btn btn-sm btn-outline-secondary" disabled={pageIndex===0} onClick={()=>handlePageChange(pageIndex-1)}>«</button>
                    <button className="btn btn-sm btn-outline-secondary" disabled>{pageIndex+1}/{meta?.pages||1}</button>
                    <button className="btn btn-sm btn-outline-secondary" disabled={pageIndex>=(meta?.pages||1)-1} onClick={()=>handlePageChange(pageIndex+1)}>»</button>
                 </div>
               </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop-custom">
            <div className="modal-content-custom">
                <div className="modal-header-custom">
                    <h5 className="mb-0">{isEdit ? "Cập nhật phòng" : "Thêm phòng mới"}</h5>
                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body-custom">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Mã phòng (ID)</label>
                                <input type="text" className="form-control" name="id" 
                                    value={formData.id} onChange={handleInputChange} 
                                    disabled={isEdit} required placeholder="VD: RM-A302" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Tên hiển thị</label>
                                <input type="text" className="form-control" name="name" 
                                    value={formData.name} onChange={handleInputChange} required placeholder="VD: A302"/>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Khu (Dorm ID)</label>
                                <select className="form-select" name="dormId" value={formData.dormId} onChange={handleInputChange}>
                                    <option value="DORMA">Block A (DORMA)</option>
                                    <option value="DORMB">Block B (DORMB)</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Tầng</label>
                                <input type="number" className="form-control" name="floor" 
                                    value={formData.floor} onChange={handleInputChange} required min={1}/>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Loại phòng</label>
                                <select className="form-select" name="type" value={formData.type} onChange={handleInputChange}>
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Sức chứa (Max)</label>
                                <input type="number" className="form-control" name="maxOccupants" 
                                    value={formData.maxOccupants} onChange={handleInputChange} required min={1}/>
                            </div>
                            <div className="col-12">
                                <label className="form-label small fw-bold">Giá phòng (VNĐ)</label>
                                <input type="number" className="form-control" name="price" 
                                    value={formData.price} onChange={handleInputChange} required min={0}/>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer-custom">
                        <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Hủy</button>
                        <button type="submit" className="btn btn-primary">{isEdit ? "Lưu thay đổi" : "Tạo mới"}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}