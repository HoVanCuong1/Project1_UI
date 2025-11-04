// File: src/pages/SisUtcLogin/SisUtcLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SisUtcLogin.css";

export default function SisUtcLogin() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const DEMO_MANAGER = { studentId: "manager", password: "123", role: "MANAGER" };
  const DEMO_ADMIN = { studentId: "admin", password: "123", role: "ADMIN" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentId || !password) {
      setError("Vui lòng nhập mã tài khoản và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      // --- Kiểm tra trước tài khoản quản lý và admin ---
      if (studentId === DEMO_MANAGER.studentId && password === DEMO_MANAGER.password) {
        localStorage.setItem("utc_user", JSON.stringify({ studentId, role: "MANAGER" }));
        navigate("/manager", { replace: true });
        return;
      }
      if (studentId === DEMO_ADMIN.studentId && password === DEMO_ADMIN.password) {
        localStorage.setItem("utc_user", JSON.stringify({ studentId, role: "ADMIN" }));
        navigate("/admin", { replace: true });
        return;
      }

      // --- Nếu không phải manager/admin → kiểm tra trong danh sách sinh viên thật ---
      const res = await fetch("http://localhost:4000/api/students");
      if (!res.ok) throw new Error("Không thể tải danh sách sinh viên");
      const students = await res.json();

      const user = students.find(
        (s) => s.student_id === studentId && s.password === password
      );

      if (user) {
        const userData = { studentId, role: "USER", remember };
        if (remember) {
          localStorage.setItem("utc_user", JSON.stringify(userData));
          localStorage.setItem("studentId", studentId);
        } else {
          sessionStorage.setItem("utc_user", JSON.stringify(userData));
          localStorage.setItem("studentId", studentId);
        }

        navigate("/", { replace: true });
      } else {
        setError("Sai mã sinh viên hoặc mật khẩu");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src="/images/logo-utc.jpg" alt="UTC" className="logo" />
          <div>
            <h1>Hệ thống quản lý ký túc xá</h1>
            <p>Trường Đại học Giao thông Vận tải</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Tài khoản</label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="VD: 221230001, manager hoặc admin"
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
          />

          <div className="form-footer">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="footer">© {new Date().getFullYear()} UTC — Phiên bản demo</div>
      </div>
    </div>
  );
}
