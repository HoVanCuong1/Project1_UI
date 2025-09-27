import React from "react";
import "./App.css";

function App() {
  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/0c/Logo_VNU-HCM.png"
          alt="Logo"
          className="logo"
        />
        <h1>TRANG THÔNG TIN SINH VIÊN</h1>
      </header>

      {/* Nội dung chính */}
      <main className="main">
        <div className="half left">
          <div className="overlay">
            <h2>Dành cho sinh viên chưa ở KTX</h2>
            <button className="btn">ĐĂNG KÝ</button>
          </div>
        </div>
        <div className="half right">
          <div className="overlay">
            <h2>Dành cho sinh viên đang ở KTX</h2>
            <button className="btn">ĐĂNG NHẬP</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
