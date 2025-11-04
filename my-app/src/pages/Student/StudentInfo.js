// File: src/pages/Student/StudentInfo.js
import React, { useEffect, useState } from "react";
import "./StudentInfo.css";
import "../../pages/Register/StudentForm.css";

export default function StudentInfo() {
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  // ====== Tải dữ liệu sinh viên ======
  useEffect(() => {
    async function loadData() {
      try {
        const [resStudents, resRegs] = await Promise.all([
          fetch("http://localhost:4000/api/students"),
          fetch("http://localhost:4000/api/room_registrations"),
        ]);

        if (!resStudents.ok || !resRegs.ok)
          throw new Error("Không thể tải dữ liệu từ server.");

        const studentsData = await resStudents.json();
        const regsData = await resRegs.json();

        const approvedRegs = regsData.filter((r) => r.status === "APPROVED");
        const reg = approvedRegs.find((r) => r.student_id === studentId);
        const stu = studentsData.find((s) => s.student_id === studentId);

        const merged = {
          ...reg,
          ...stu,
          room_id: stu?.room_id || reg?.room_id || "-",
        };

        if (!stu && !reg) throw new Error("Không tìm thấy dữ liệu sinh viên.");

        setStudent(merged);
        setFormData({
          email: merged.email || "",
          phone: merged.phone || "",
          department: merged.department || "",
          class_name: merged.class_name || "",
          address: merged.address || "",
          password: merged.password || "",
        });
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentId]);

  // ====== Khi người dùng chỉnh input ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ====== Gửi cập nhật lên server ======
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const [res1, res2] = await Promise.all([
        fetch(`http://localhost:4000/api/students/${studentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }),
        fetch(`http://localhost:4000/api/room_registrations/${studentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      if (!data1.success && !data2.success)
        throw new Error("Không thể cập nhật thông tin.");

      alert("Cập nhật thông tin thành công!");
      setStudent({ ...student, ...formData });
      setEditing(false);
    } catch (err) {
      alert("Cập nhật thất bại: " + err.message);
    }
  };

  // ====== Giao diện ======
  if (loading)
    return <div className="student-detail-container">Đang tải dữ liệu...</div>;

  if (error)
    return (
      <div className="student-detail-container">
        <h2>Thông tin sinh viên</h2>
        <p className="error">{error}</p>
      </div>
    );

  if (!student)
    return (
      <div className="student-detail-container">
        <h2>Thông tin sinh viên</h2>
        <p>Không tìm thấy dữ liệu sinh viên.</p>
      </div>
    );

  // ====== Chế độ xem thông tin ======
  if (!editing)
    return (
      <div className="student-detail-container">
        <h2>Thông tin cá nhân</h2>
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
          <div className="form-group two-column">
            <div>
              <label>Địa chỉ</label>
              <div className="readonly-field">{student.address || "-"}</div>
            </div>
            <div>
              <label>Phòng đang ở</label>
              <div className="readonly-field">{student.room_id || "-"}</div>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Mật khẩu</label>
            <div className="readonly-field">{student.password || "-"}</div>
          </div>
        </div>

        <button
          className="continue-btn"
          style={{ marginTop: "20px" }}
          onClick={() => setEditing(true)}
        >
          Chỉnh sửa thông tin cá nhân
        </button>
      </div>
    );

  // ====== Chế độ chỉnh sửa thông tin ======
  return (
    <div className="student-form-container">
      <h2>Cập nhật thông tin cá nhân</h2>
      <form onSubmit={handleUpdate}>
        <div className="form-grid">
          <div className="form-group">
            <label>Họ và tên</label>
            <input type="text" value={student.full_name} readOnly />
          </div>
          <div className="form-group">
            <label>Mã sinh viên</label>
            <input type="text" value={student.student_id} readOnly />
          </div>
          <div className="form-group">
            <label>Giới tính</label>
            <input type="text" value={student.gender} readOnly />
          </div>
          <div className="form-group">
            <label>Ngày sinh</label>
            <input type="text" value={student.date_of_birth} readOnly />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Khoa</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Lớp</label>
            <input
              type="text"
              name="class_name"
              value={formData.class_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group two-column">
            <div>
              <label>Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Phòng đang ở</label>
              <input type="text" value={student.room_id || "-"} readOnly />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Mật khẩu</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ marginTop: "25px", display: "flex", gap: "15px" }}>
          <button type="submit" className="continue-btn">
            Cập nhật
          </button>
          <button
            type="button"
            className="continue-btn"
            style={{ backgroundColor: "gray" }}
            onClick={() => setEditing(false)}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}