import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RoomDetailManager.css";
import { getRoomById, getStudentsInRoom } from "../../../config/api";

export default function RoomDetailManager() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;
    (async () => {
      try {
        setLoading(true); setError("");
        const [roomRes, studentRes] = await Promise.all([
          getRoomById(roomId),
          getStudentsInRoom(roomId),
        ]);
        const roomData = roomRes?.data?.data || roomRes?.data || roomRes;
        const listRaw = studentRes?.data?.data || studentRes?.data || studentRes || [];
        setRoom(roomData);
        setStudents(Array.isArray(listRaw) ? listRaw : []);
      } catch (e) {
        console.error(e); setError("Không tải được dữ liệu.");
      } finally { setLoading(false); }
    })();
  }, [roomId]);

  // Tính % lấp đầy để vẽ progress bar
  const calculateOccupancyPercent = () => {
    if (!room || !room.maxOccupants) return 0;
    return Math.min(100, Math.round((room.currentOccupants / room.maxOccupants) * 100));
  };

  const getOccupancyColor = (percent) => {
    if (percent >= 100) return "bg-danger";
    if (percent >= 75) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="rdm-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Quay lại
        </button>
        {room && <span className="badge bg-primary fs-6 px-3 py-2">{room.dormName}</span>}
      </div>

      {loading && <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && room && (
        <div className="row g-4">
          
          {/* CỘT TRÁI: THÔNG TIN PHÒNG */}
          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-sm rdm-info-card">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="rdm-room-icon">
                    <i className="bi bi-door-open-fill"></i>
                  </div>
                  <h3 className="fw-bold mt-3">Phòng {room.name}</h3>
                  <p className="text-muted mb-0">ID: {room.id}</p>
                </div>

                <div className="rdm-stat-grid">
                  <div className="rdm-stat-item">
                    <span className="label">Khu vực</span>
                    <span className="value">{room.dormName}</span>
                  </div>
                  <div className="rdm-stat-item">
                    <span className="label">Tầng</span>
                    <span className="value">{room.floor}</span>
                  </div>
                  <div className="rdm-stat-item">
                    <span className="label">Giới tính</span>
                    <span className={`badge ${room.type === 'MALE' ? 'bg-primary' : 'bg-danger-subtle text-danger'}`}>
                      {room.type === 'MALE' ? 'Nam' : 'Nữ'}
                    </span>
                  </div>
                  <div className="rdm-stat-item full-width">
                    <span className="label">Giá phòng</span>
                    <span className="value price text-primary">
                      {room.price ? Number(room.price).toLocaleString('vi-VN') : 0} đ <small>/ tháng</small>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-top">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark">Sức chứa</span>
                    <span className="text-muted small">{room.currentOccupants} / {room.maxOccupants} người</span>
                  </div>
                  <div className="progress" style={{height: '10px'}}>
                    <div 
                      className={`progress-bar ${getOccupancyColor(calculateOccupancyPercent())}`} 
                      role="progressbar" 
                      style={{width: `${calculateOccupancyPercent()}%`}}
                    ></div>
                  </div>
                  <p className="text-center mt-2 small text-muted">
                    {room.maxOccupants - room.currentOccupants === 0 ? "Đã hết chỗ" : `Còn trống ${room.maxOccupants - room.currentOccupants} chỗ`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH SINH VIÊN */}
          <div className="col-lg-8">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold"><i className="bi bi-people-fill me-2 text-primary"></i>Danh sách sinh viên</h5>
              </div>
              <div className="card-body p-0">
                {students.length === 0 ? (
                  <div className="text-center py-5">
                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="Empty" width="80" style={{opacity: 0.5}} />
                    <p className="text-muted mt-3">Phòng hiện tại đang trống.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 rdm-table">
                      <thead className="bg-light">
                        <tr>
                          <th className="ps-4">Sinh viên</th>
                          <th>Mã SV</th>
                          <th>Giới tính</th>
                          <th>Lớp</th>
                          <th>SĐT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => (
                          <tr key={s.id || idx}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-3">
                                <div className="rdm-avatar-circle">
                                  {(s.fullName || s.name || "U").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-bold text-dark">{s.fullName || s.name || "Không tên"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-primary fw-bold">{s.id || "-"}</td>
                            <td>
                              {s.gender === "MALE" ? <i className="bi bi-gender-male text-primary"></i> : <i className="bi bi-gender-female text-danger"></i>}
                            </td>
                            <td>{s.className || "-"}</td>
                            <td>{s.phone || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}