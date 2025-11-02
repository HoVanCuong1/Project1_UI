// File: src/pages/Manager/StudentDetail.js
// Hiển thị thông tin chi tiết sinh viên (dạng chỉ xem, không chỉnh sửa)

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./StudentDetail.css";

export default function StudentDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const student = location.state?.student;

  if (!student) {
    return (
      <div className="student-detail-container">
        <h2>Thông tin sinh viên</h2>
        <p>Không có dữ liệu sinh viên để hiển thị.</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="student-detail-container">
      <h2>Thông tin chi tiết sinh viên</h2>
      <h3 className="section-title">Thông tin cá nhân</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>Họ và tên</label>
          <div className="readonly-field">{student.full_name || "-"}</div>
        </div>

        <div className="form-group">
          <label>Mã sinh viên</label>
          <div className="readonly-field">{student.student_id || "-"}</div>
        </div>

        <div className="form-group">
          <label>Giới tính</label>
          <div className="readonly-field">{student.gender || "-"}</div>
        </div>

        <div className="form-group">
          <label>Ngày sinh</label>
          <div className="readonly-field">{student.date_of_birth || "-"}</div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <div className="readonly-field">{student.email || "-"}</div>
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <div className="readonly-field">{student.phone || "-"}</div>
        </div>

        <div className="form-group">
          <label>Khoa</label>
          <div className="readonly-field">{student.department || "-"}</div>
        </div>

        <div className="form-group">
          <label>Lớp</label>
          <div className="readonly-field">{student.class_name || "-"}</div>
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <div className="readonly-field">{student.address || "-"}</div>
        </div>

        <div className="form-group">
          <label>Phòng đang ở</label>
          <div className="readonly-field">{student.room_id || "-"}</div>
        </div>
      </div>

      <button onClick={() => navigate(-1)} className="back-btn">
        Quay lại
      </button>
    </div>
  );
}
