import React, { useEffect, useState } from "react";
import "./RoomStudentList.css";

export default function RoomStudentList({ room }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    if (!room || !room.room_id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/rooms/${room.room_id}/students`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách sinh viên:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [room]);

  return (
    <div className="room-student-container">
      <h2>
        Danh sách sinh viên – Phòng {room.room_name} (
        {room.roomType === "MALE" ? "Nam" : "Nữ"}) – Tầng {room.floor}
      </h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : students.length === 0 ? (
        <div className="no-student">Chưa có sinh viên nào trong phòng này.</div>
      ) : (
        <table className="room-student-table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>Giới tính</th>
              <th>Số điện thoại</th>
              <th>Ngày sinh</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {students.map((sv) => (
              <tr key={sv.student_id}>
                <td>{sv.student_id}</td>
                <td>{sv.full_name || sv.last_name + " " + sv.first_name}</td>
                <td>{sv.gender}</td>
                <td>{sv.phone || "-"}</td>
                <td>{sv.date_of_birth || sv.birth_date || "-"}</td>
                <td className="status-active">Đang ở</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
