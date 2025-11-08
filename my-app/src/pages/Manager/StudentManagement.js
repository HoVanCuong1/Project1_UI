// File: src/pages/Manager/StudentManagement.js
// Hiển thị danh sách sinh viên (đã duyệt và chưa đăng ký phòng) + xem chi tiết

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentManagement.css";

export default function StudentManagement() {
  const [students, setStudents] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function loadAllStudents() {
      try {
        // Lấy dữ liệu song song từ cả 2 file
        const [resStudents, resRegs] = await Promise.all([
          fetch("http://localhost:4000/api/students"),
          fetch("http://localhost:4000/api/room_registrations"),
        ]);

        if (!resStudents.ok || !resRegs.ok)
          throw new Error("HTTP " + resStudents.status + " / " + resRegs.status);

        const studentsData = await resStudents.json();
        const regsData = await resRegs.json();

        // Lấy danh sách sinh viên đã duyệt phòng
        const approvedRegs = Array.isArray(regsData)
          ? regsData.filter((r) => r.status === "APPROVED")
          : [];

        // Tạo map từ student_id -> registration (nếu có)
        const regMap = new Map();
        approvedRegs.forEach((r) => regMap.set(r.student_id, r));

        // Gộp dữ liệu
        const merged = Array.isArray(studentsData)
          ? studentsData.map((s) => {
              const reg = regMap.get(s.student_id);
              return {
                ...s,
                room_id: reg ? reg.room_id : s.room_id || "-",
                gender: reg?.gender || s.gender,
                department: reg?.department || s.department,
                class_name: reg?.class_name || s.class_name,
                email: reg?.email || s.email,
                phone: reg?.phone || s.phone,
                address: reg?.address || s.address,
                hasRoom: !!reg,
              };
            })
          : [];

        // Thêm sinh viên có trong room_registrations nhưng chưa có trong students.json
        approvedRegs.forEach((r) => {
          if (!merged.find((s) => s.student_id === r.student_id)) {
            merged.push({
              student_id: r.student_id,
              full_name: r.full_name,
              gender: r.gender,
              department: r.department,
              class_name: r.class_name,
              email: r.email,
              phone: r.phone,
              address: r.address,
              room_id: r.room_id,
              hasRoom: true,
            });
          }
        });

        if (mounted) {
          setStudents(merged);
          setFiltered(merged);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        if (mounted) {
          setError("Không thể tải dữ liệu sinh viên từ server tại cổng 4000.");
          setStudents([]);
          setFiltered([]);
        }
      }
    }

    loadAllStudents();
    return () => {
      mounted = false;
    };
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) {
      setFiltered(students);
      return;
    }
    const value = search.trim().toLowerCase();
    const result = students.filter(
      (s) =>
        String(s.student_id).toLowerCase().includes(value) ||
        (s.full_name && s.full_name.toLowerCase().includes(value))
    );
    setFiltered(result);
  }

  function handleRowClick(student) {
    navigate("/manager/student-detail", { state: { student } });
  }

  if (error) {
    return (
      <div className="smgmt-root">
        <h2>Quản lý sinh viên</h2>
        <div className="smgmt-error">{error}</div>
      </div>
    );
  }

  if (students === null) {
    return (
      <div className="smgmt-root">
        <h2>Quản lý sinh viên</h2>
        <div className="smgmt-loading">Đang tải danh sách sinh viên...</div>
      </div>
    );
  }

  return (
    <div className="smgmt-root">
      <h2>Quản lý sinh viên</h2>

      {/* Thanh tìm kiếm */}
      <form className="smgmt-search" onSubmit={handleSearch}>
        <input
          type="text"
          className="smgmt-search-input"
          placeholder="Nhập mã hoặc tên sinh viên"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="smgmt-search-btn" title="Tìm kiếm">
          🔍
        </button>
      </form>

      <div className="smgmt-table-wrap">
        <table className="smgmt-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Mã sinh viên</th>
              <th>Giới tính</th>
              <th>Khoa</th>
              <th>Lớp</th>
              <th>Phòng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="smgmt-empty">
                  Không có sinh viên để hiển thị
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.student_id}
                  onClick={() => handleRowClick(s)}
                  className="smgmt-row"
                >
                  <td>{s.full_name || "-"}</td>
                  <td>{s.student_id || "-"}</td>
                  <td>{formatGender(s.gender)}</td>
                  <td>{s.department || "-"}</td>
                  <td>{s.class_name || "-"}</td>
                  <td>{s.room_id || "-"}</td>
                  <td style={{ color: s.hasRoom ? "green" : "gray" }}>
                    {s.hasRoom ? "Đã có phòng" : "Chưa có phòng"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatGender(g) {
  if (!g && g !== 0) return "-";
  const str = String(g).toLowerCase();
  if (str === "m" || str === "male" || str === "nam") return "Nam";
  if (str === "f" || str === "female" || str === "nữ" || str === "nu")
    return "Nữ";
  if (str === "other" || str === "khác") return "Khác";
  if (Number(g) === 0) return "Nữ";
  if (Number(g) === 1) return "Nam";
  return capitalize(String(g));
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
