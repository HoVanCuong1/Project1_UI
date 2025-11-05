import React, { useState } from "react";
import "./RequestTransfer.css";

export default function RequestTransfer() {
  const [form, setForm] = useState({
    studentName: "",
    studentId: "",
    room: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Yêu cầu trả phòng đã được gửi!");
    console.log("Transfer Request:", form);
    setForm({ studentName: "", studentId: "", room: "", reason: "" });
  };

  return (
    <div className="request-container">
      <h2>🏠 Yêu cầu trả phòng</h2>
      <form onSubmit={handleSubmit} className="request-form">
        <label>Họ và tên</label>
        <input
          type="text"
          name="studentName"
          value={form.studentName}
          onChange={handleChange}
          placeholder="Nguyễn Văn A"
        />

        <label>Mã sinh viên</label>
        <input
          type="text"
          name="studentId"
          value={form.studentId}
          onChange={handleChange}
          placeholder="221230764"
        />

        <label>Phòng hiện tại</label>
        <input
          type="text"
          name="room"
          value={form.room}
          onChange={handleChange}
          placeholder="Nhập số phòng (VD: A302)"
        />

        <label>Lý do trả phòng</label>
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Nhập lý do..."
        />

        <button type="submit">Gửi yêu cầu</button>
      </form>
    </div>
  );
}
