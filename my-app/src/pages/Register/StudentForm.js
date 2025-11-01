import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StudentForm.css";
import { getMyInfo, getStudentById, getRoomById } from "../../config/api";

export default function StudentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingInfo = location.state?.bookingInfo || {}; // nhận từ RoomDetail
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // state hiển thị/submit form
  const [student, setStudent] = useState({
    fullName: "",
    studentId: "",
    gender: "",        // "Nam" | "Nữ" | "Khác"
    dateOfBirth: "",   // yyyy-MM-dd
    email: "",
    phone: "",
    academicYear: "",
    className: "",
    address: "",
    // thông tin phòng chọn sẵn
    khu: bookingInfo.khu || "",
    tang: bookingInfo.floor || bookingInfo.tang || "",
    loaiphong: bookingInfo.loaiPhong || bookingInfo.loaiphong || "",
    phong: bookingInfo.phong || bookingInfo.roomId || "",   // id hoặc name tùy bạn dùng
    cho: bookingInfo.cho || "", // nếu chọn chỗ ở step trước
    price: bookingInfo.price || "",
  });

  // helper map giới tính từ BE (MALE/FEMALE) -> form (Nam/Nữ)
  const mapGenderToForm = (g) => {
    if (!g) return "";
    if (g === "MALE") return "Nam";
    if (g === "FEMALE") return "Nữ";
    return "Khác";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        // 1) lấy user hiện tại
        const me = await getMyInfo(); // { id, name, email, studentId, ... }
        const sid = me?.studentId || ""; // nếu là sinh viên thật sẽ có mã STUxxx

        // 2) lấy thông tin sinh viên nếu có studentId
        let stu = null;
        if (sid) {
          stu = await getStudentById(sid);
        }

        // 3) lấy info phòng nếu cần (floor/price)
        let room = null;
        const rid = bookingInfo.roomId || bookingInfo.phong; // ưu tiên roomId nếu bạn đã truyền
        if (rid) {
          room = await getRoomById(rid);
        }

        if (!mounted) return;

        setStudent((prev) => ({
          ...prev,
          // ưu tiên dữ liệu từ API student nếu có
          studentId: stu?.id || prev.studentId || sid,
          fullName: stu ? `${stu.lastName || ""} ${stu.firstName || ""}`.trim() : prev.fullName,
          gender: mapGenderToForm(stu?.gender) || prev.gender,
          dateOfBirth: stu?.birthDate || prev.dateOfBirth,
          email: stu?.userEmail || prev.email,
          phone: stu?.phone || prev.phone,
          academicYear: stu?.academicYear || prev.academicYear,
          className: stu?.className || prev.className,
          address: stu?.hometown || prev.address,

          khu: room?.dormName || bookingInfo.khu || prev.khu,
          tang: String((room?.floor ?? bookingInfo.floor ?? prev.tang) || ""),
          loaiphong:
            bookingInfo.loaiPhong ||
            (room?.maxOccupants ? `${room.maxOccupants} chỗ` : prev.loaiphong),
          phong: room?.id || bookingInfo.phong || prev.phong,
          // giữ nguyên "cho" nếu đã chọn ở RoomDetail
          cho: bookingInfo.cho || prev.cho,
          price: room?.price ?? prev.price,
        }));
      } catch (e) {
        setErr("Không tải được dữ liệu tự động. Bạn có thể điền tay.");
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [bookingInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // kiểm tra tối thiểu: các field chính + phòng đã chọn
    const required = ["fullName", "studentId", "gender", "dateOfBirth", "email", "phone", "className", "address", "phong"];
    for (const k of required) {
      const v = String(student[k] ?? "").trim();
      if (!v) {
        alert("Vui lòng điền đầy đủ thông tin trước khi tiếp tục!");
        return;
      }
    }

    // quay về bookings, không hiện chọn phòng nữa – chỉ hiện khối thông tin và nút Gửi
    navigate("/bookings", {
      state: {
        student,                // dữ liệu form (đã auto-fill + người dùng chỉnh)
        bookingInfo: {
          ...bookingInfo,       // giữ info phòng/chỗ đã chọn
          price: student.price,
          roomId: student.phong // bảo đảm có roomId để gửi đăng ký
        },
      },
    });
    console.log("[StudentForm] student.phong =", student.phong, "type:", typeof student.phong);

  };

  if (loading) {
    return <div className="student-form-container"><p>Đang tải dữ liệu...</p></div>;
  }

  return (
    <div className="student-form-container">
      <h2>Biểu mẫu đăng ký nội trú</h2>
      <h3 className="section-title">
        Thông tin sinh viên đăng ký phòng {student.phong}{student.cho ? ` - Chỗ ${student.cho}` : ""}
      </h3>
      {err && <p className="warning">{err}</p>}

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
              placeholder="STU001"
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select name="gender" value={student.gender} onChange={handleChange}>
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
            <label>Khóa</label>
            <input
              type="text"
              name="academicYear"
              value={student.academicYear}
              onChange={handleChange}
              placeholder="K63"
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
