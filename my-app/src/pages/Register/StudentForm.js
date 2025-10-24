import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StudentForm.css";

export default function StudentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingInfo = location.state?.bookingInfo;

  const [student, setStudent] = useState({
    fullName: "",
    studentId: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    department: "",
    className: "",
    address: "",
    khu: bookingInfo?.khu || "",
    nha: bookingInfo?.nha || "",
    tang: bookingInfo?.tang || "",
    loaiphong: bookingInfo?.loaiPhong || "",
    phong: bookingInfo?.phong || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra bắt buộc các trường
    for (let key in student) {
      const value = student[key];

      // Chuyển tất cả về chuỗi để tránh lỗi trim()
      if (String(value).trim() === "") {
        alert("Vui lòng điền đầy đủ thông tin trước khi tiếp tục!");
        return;
      }
    }
    console.log(student);
    // Chuyển sang trang Bookings và truyền dữ liệu sinh viên
    navigate("/bookings", { state: { student } });
  };

  return (
    <div className="student-form-container">
      <h2>Biểu mẫu đăng ký nội trú</h2>
      <h3 className="section-title">Thông tin sinh viên</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={student.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="form-group">
            <label>Mã sinh viên</label>
            <input
              type="text"
              name="studentId"
              value={student.studentId}
              onChange={handleChange}
              placeholder="20180001"
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select
              name="gender"
              value={student.gender}
              onChange={handleChange}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={student.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={student.email}
              onChange={handleChange}
              placeholder="email@student.edu.vn"
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={student.phone}
              onChange={handleChange}
              placeholder="0987xxxxxx"
            />
          </div>

          <div className="form-group">
            <label>Khoa</label>
            <input
              type="text"
              name="department"
              value={student.department}
              onChange={handleChange}
              placeholder="Công nghệ thông tin"
            />
          </div>

          <div className="form-group">
            <label>Lớp</label>
            <input
              type="text"
              name="className"
              value={student.className}
              onChange={handleChange}
              placeholder="CNTT-K45"
            />
          </div>

          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={student.address}
              onChange={handleChange}
              placeholder="123 Nguyễn Trãi, Hà Nội"
            />
          </div>
        </div>

        <button type="submit" className="continue-btn">
          Tiếp tục
        </button>
      </form>
    </div>
  );
}