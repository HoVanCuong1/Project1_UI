import React, { useState } from "react";
import "./RequestFix.css";

export default function RequestFix() {
  const [form, setForm] = useState({
    room: "",
    issue: "",
    note: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Yêu cầu sửa chữa đã được gửi!");
    console.log("Fix Request:", form);
    setForm({ room: "", issue: "", note: "" });
  };

  return (
    <div className="request-container">
      <h2>🧰 Yêu cầu sửa chữa</h2>
      <form onSubmit={handleSubmit} className="request-form">
        <label>Phòng</label>
        <input
          type="text"
          name="room"
          placeholder="Nhập số phòng (VD: A202)"
          value={form.room}
          onChange={handleChange}
        />

        <label>Vấn đề gặp phải</label>
        <input
          type="text"
          name="issue"
          placeholder="VD: Hỏng đèn, hỏng ổ cắm..."
          value={form.issue}
          onChange={handleChange}
        />

        <label>Ghi chú thêm (nếu có)</label>
        <textarea
          name="note"
          placeholder="Nhập ghi chú chi tiết..."
          value={form.note}
          onChange={handleChange}
        />

        <button type="submit">Gửi yêu cầu</button>
      </form>
    </div>
  );
}