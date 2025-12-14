import React, { useEffect, useState } from "react";
import {
  getAllStudents,
  getStudentsWithRoom, // <-- Import API mới
  getStudentDetail,
  removeStudentFromRoom,
} from "../../../config/api";
import "./StudentManagement.css";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filterWithRoom, setFilterWithRoom] = useState(false); // false: All, true: Only with room

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // --- HÀM GỌI API ---
  const fetchStudents = async () => {
    setLoading(true);
    try {
      let res;
      if (filterWithRoom) {
        // Nếu đang bật lọc "Đã có phòng" -> Gọi API mới
        res = await getStudentsWithRoom();
      } else {
        // Mặc định -> Lấy tất cả
        res = await getAllStudents();
      }
      setStudents(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại API khi chế độ lọc thay đổi
  useEffect(() => {
    // Nếu đang có nội dung tìm kiếm thì ko tự load lại list, để user tự bấm tìm
    if (!searchTerm) {
        fetchStudents();
    }
  }, [filterWithRoom]);

  // --- HÀM TÌM KIẾM ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchStudents();
      return;
    }

    setLoading(true);
    try {
      const res = await getStudentDetail(searchTerm.trim());
      if (res) {
        setStudents([res]); 
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Không tìm thấy sinh viên:", error);
      setStudents([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    fetchStudents();
  };

  // --- CÁC HÀM XỬ LÝ KHÁC ---
  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleKickFromRoom = async (student) => {
    if (!student.roomId) return;
    const confirmMsg = `Bạn có chắc muốn xóa sinh viên ${student.firstName} ${student.lastName} ra khỏi phòng ${student.roomName}?`;
    if (window.confirm(confirmMsg)) {
      try {
        await removeStudentFromRoom(student.id);
        alert("Đã xóa sinh viên khỏi phòng thành công!");
        
        if(searchTerm) handleSearch({preventDefault: ()=>{}}); 
        else fetchStudents();

      } catch (error) {
        alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="student-manager-container p-4">
      {/* Header & Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Quản Lý Sinh Viên</h4>
          <p className="text-muted mb-0 small">Thông tin hồ sơ và quản lý nơi ở</p>
        </div>
        
        <div className="d-flex gap-3 align-items-center">
            {/* TOGGLE FILTER BUTTON */}
            <button 
                className={`btn d-flex align-items-center gap-2 ${filterWithRoom ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterWithRoom(!filterWithRoom)}
                title={filterWithRoom ? "Hiển thị tất cả sinh viên" : "Chỉ hiện sinh viên đã có phòng"}
            >
                {filterWithRoom ? <i className="bi bi-house-check-fill"></i> : <i className="bi bi-house"></i>}
                {filterWithRoom ? "Đang lọc: Có phòng" : "Tất cả sinh viên"}
            </button>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <div className="input-group">
                <span className="input-group-text bg-white text-muted border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Nhập Mã SV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <button className="btn btn-primary" type="submit">Tìm</button>
              </div>
              {searchTerm && (
                 <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    onClick={handleResetSearch} 
                    title="Tải lại danh sách"
                 >
                   <i className="bi bi-arrow-clockwise"></i>
                 </button>
              )}
            </form>
        </div>
      </div>

      {/* TABLE LIST */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Mã SV</th>
                  <th>Họ và Tên</th>
                  <th>Phòng Ở</th>
                  <th>Quê Quán</th>
                  <th>SĐT</th>
                  <th className="text-end pe-4">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                  </td></tr>
                ) : students.length > 0 ? (
                  students.map((s) => (
                    <tr key={s.id}>
                      <td className="ps-4 fw-bold text-primary">{s.id}</td>
                      <td>
                        <div className="fw-bold text-dark">{s.lastName} {s.firstName}</div>
                        <div className="text-muted small">
                            {s.gender === "MALE" ? "Nam" : "Nữ"} - {formatDate(s.birthDate)}
                        </div>
                      </td>
                      <td>
                        {s.roomId ? (
                          <span className="badge bg-success">
                            {s.dormName} - {s.roomName}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">Chưa xếp phòng</span>
                        )}
                      </td>
                      <td>{s.hometown}</td>
                      <td>{s.phone}</td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-outline-info me-2"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(s)}
                        >
                          <i className="bi bi-eye-fill"></i>Chi tiết
                        </button>
                        
                        {s.roomId && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Xóa khỏi phòng"
                            onClick={() => handleKickFromRoom(s)}
                          >
                            <i className="bi bi-house-dash-fill"></i>Xóa khỏi phòng
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-4 d-block mb-2"></i>
                    {filterWithRoom ? "Không có sinh viên nào đang ở trong phòng." : "Không tìm thấy sinh viên nào."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL CHI TIẾT (GIỮ NGUYÊN) --- */}
      {showModal && selectedStudent && (
        <div className="modal-backdrop-custom">
          <div className="modal-content-custom modal-lg">
            <div className="modal-header-custom">
              <h5 className="mb-0 fw-bold">Hồ Sơ Sinh Viên: {selectedStudent.lastName} {selectedStudent.firstName}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            
            <div className="modal-body-custom scroll-area-modal">
                <div className="row g-3">
                    <div className="col-md-6">
                        <h6 className="text-primary border-bottom pb-2 mb-3">Thông tin cá nhân</h6>
                        <p><strong>Mã SV:</strong> {selectedStudent.id}</p>
                        <p><strong>CCCD:</strong> {selectedStudent.identityNumber}</p>
                        <p><strong>Ngày sinh:</strong> {formatDate(selectedStudent.birthDate)}</p>
                        <p><strong>Giới tính:</strong> {selectedStudent.gender}</p>
                        <p><strong>SĐT:</strong> {selectedStudent.phone}</p>
                        <p><strong>Quê quán:</strong> {selectedStudent.hometown}</p>
                        <p><strong>Lớp:</strong> {selectedStudent.className || "Chưa cập nhật"}</p>
                        <p><strong>Niên khóa:</strong> {selectedStudent.academicYear || "Chưa cập nhật"}</p>
                    </div>

                    <div className="col-md-6">
                        <h6 className="text-success border-bottom pb-2 mb-3">Thông tin cư trú</h6>
                        <p><strong>Ký túc xá:</strong> {selectedStudent.dormName || "-"}</p>
                        <p><strong>Phòng:</strong> {selectedStudent.roomName || "Chưa có phòng"}</p>
                        <p><strong>Ngày làm hợp đồng:</strong> {formatDate(selectedStudent.contractDate)}</p>
                        <p><strong>Diện ưu tiên:</strong> Mức {selectedStudent.priority}</p>

                        <h6 className="text-info border-bottom pb-2 mb-3 mt-4">Người giám hộ</h6>
                        <p><strong>Mối quan hệ:</strong> {selectedStudent.relationship}</p>
                        <p><strong>Nghề nghiệp:</strong> {selectedStudent.occupation}</p>
                        <p><strong>SĐT Người thân:</strong> {selectedStudent.guardianPhone || "N/A"}</p>
                        <p><strong>Tên Người thân:</strong> {selectedStudent.guardianName || "N/A"}</p>
                    </div>

                    <div className="col-12 mt-3">
                         <div className="p-3 bg-light rounded border">
                            <h6 className="text-dark mb-2"><i className="bi bi-person-badge me-2"></i>Tài khoản hệ thống</h6>
                            {selectedStudent.userId ? (
                                <div>
                                    <span className="me-4"><strong>Email:</strong> {selectedStudent.userEmail}</span>
                                    <span><strong className="text-success"><i className="bi bi-check-circle-fill"></i> Đã liên kết</strong></span>
                                </div>
                            ) : (
                                <span className="text-danger"><i className="bi bi-exclamation-triangle-fill"></i> Chưa liên kết tài khoản User</span>
                            )}
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="modal-footer-custom">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;