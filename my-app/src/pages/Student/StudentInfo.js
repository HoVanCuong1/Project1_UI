// File: src/pages/Student/StudentInfo.js
// Hiển thị thông tin cá nhân sinh viên đang đăng nhập (dạng chỉ xem, không chỉnh sửa)
// Dữ liệu đọc từ my-app/demo-data (nằm ngoài src)

import React, { useEffect, useState } from "react";
import "./StudentInfo.css";

export default function StudentInfo() {
  const [student, setStudent] = useState(null);

    useEffect(() => {
    const storedId = localStorage.getItem("studentId");
    if (!storedId) return;

    async function loadData() {
      try {
        const [resStudents, resRegs] = await Promise.all([
          fetch("http://localhost:4000/api/students"),
          fetch("http://localhost:4000/api/room_registrations"),
        ]);

        if (!resStudents.ok || !resRegs.ok)
          throw new Error("HTTP " + resStudents.status + " / " + resRegs.status);

        const studentsData = await resStudents.json();
        const regsData = await resRegs.json();

        const approvedRegs = Array.isArray(regsData)
          ? regsData.filter((r) => r.status === "APPROVED")
          : [];

        const regMap = new Map();
        approvedRegs.forEach((r) => regMap.set(r.student_id, r));

        const merged = Array.isArray(studentsData)
          ? studentsData.map((s) => {
              const reg = regMap.get(s.student_id);
              return {
                ...s,
                full_name: reg?.full_name || s.full_name,
                gender: reg?.gender || s.gender,
                date_of_birth: reg?.date_of_birth || s.date_of_birth,
                department: reg?.department || s.department,
                class_name: reg?.class_name || s.class_name,
                email: reg?.email || s.email,
                phone: reg?.phone || s.phone,
                address: reg?.address || s.address,
                room_id: reg ? reg.room_id : s.room_id || "-",
              };
            })
          : [];

        approvedRegs.forEach((r) => {
          if (!merged.find((s) => s.student_id === r.student_id)) merged.push({ ...r });
        });

        const currentStudent = merged.find((s) => s.student_id === storedId);
        setStudent(currentStudent || null);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      }
    }

    loadData();
  }, []);


  if (!student) {
    return (
      <div className="studentinfo-container">
        <h2>Thông tin sinh viên</h2>
        <p>Không tìm thấy dữ liệu sinh viên.</p>
      </div>
    );
  }

  return (
    <div className="studentinfo-container">
      <h2>Thông tin cá nhân</h2>

      <div className="info-grid">
        <div className="info-group">
          <label>Họ và tên</label>
          <div className="readonly-field">{student.full_name || "-"}</div>
        </div>

        <div className="info-group">
          <label>Mã sinh viên</label>
          <div className="readonly-field">{student.student_id || "-"}</div>
        </div>

        <div className="info-group">
          <label>Giới tính</label>
          <div className="readonly-field">{student.gender || "-"}</div>
        </div>

        <div className="info-group">
          <label>Ngày sinh</label>
          <div className="readonly-field">{student.date_of_birth || "-"}</div>
        </div>

        <div className="info-group">
          <label>Email</label>
          <div className="readonly-field">{student.email || "-"}</div>
        </div>

        <div className="info-group">
          <label>Số điện thoại</label>
          <div className="readonly-field">{student.phone || "-"}</div>
        </div>

        <div className="info-group">
          <label>Khoa</label>
          <div className="readonly-field">{student.department || "-"}</div>
        </div>

        <div className="info-group">
          <label>Lớp</label>
          <div className="readonly-field">{student.class_name || "-"}</div>
        </div>

        <div className="info-group">
          <label>Địa chỉ</label>
          <div className="readonly-field">{student.address || "-"}</div>
        </div>

        <div className="info-group">
          <label>Phòng đang ở</label>
          <div className="readonly-field">{student.room_id || "-"}</div>
        </div>
      </div>
    </div>
  );
}
