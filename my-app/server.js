// server.js — chạy với Node 18+
// Đọc Define.json để trả dữ liệu tĩnh giống phần đăng ký sinh viên

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// ====== Đường dẫn tới Define.json ======
const DATA_PATH = path.resolve("src", "Define.json");

// ====== Helper đọc file ======
function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Lỗi đọc Define.json:", e);
    return {};
  }
}

// ===================================================
// =============== API cho chức năng Manager =========
// ===================================================

// 1. Danh sách khu (LayDSToaNha.response[].TenKhu)
app.get("/api/dorms", (req, res) => {
  const data = readData();
  const dorms = data.LayDSToaNha?.response?.map((x) => ({
    dorm_id: x.TenKhu,
    dorm_name: x.TenKhu,
  })) || [];
  res.json(dorms);
});

// 2. Danh sách nhà theo khu (LayDSToaNha.response[].MaToa)
app.get("/api/buildings", (req, res) => {
  const data = readData();
  const { dorm_id } = req.query;
  const list = data.LayDSToaNha?.response || [];
  const filtered = dorm_id ? list.filter((x) => x.TenKhu === dorm_id) : list;
  const houses = filtered.map((x) => ({
    building_id: x.MaToa,
    building_name: x.MaToa,
  }));
  res.json(houses);
});

// 3. Danh sách loại phòng theo nhà (LayDSLoaiPhong.response[])
app.get("/api/roomtypes", (req, res) => {
  const data = readData();
  const types = data.LayDSLoaiPhong?.response?.map((x) => ({
    MaLoaiPhong: x.MaLoaiPhong,
    LoaiPhong: x.LoaiPhong,
  })) || [];
  res.json(types);
});

// 4. Danh sách phòng (chuẩn hóa dữ liệu cho cả Manager và Student)
app.get("/api/rooms", (req, res) => {
  const data = readData();
  const src = data.LayDSPhongTrong?.response || [];

  const rooms = src.map((x) => ({
    roomName: x.MaPhong,
    dormName: x.TenKhu || x.Khu || "KTX A",
    floor: x.Tang || x.Floor || 1,
    roomType:
      x.LoaiPhong === "Phòng Nam"
        ? "MALE"
        : x.LoaiPhong === "Phòng Nữ"
        ? "FEMALE"
        : "MALE",
    currentOccupants: x.SoNguoiHienTai || 0,
    maxOccupants: x.SoNguoiToiDa || 6,
    roomPrice: x.GiaPhong || 1200000,
  }));

  res.json(rooms);
});


// 5. Danh sách sinh viên đã duyệt trong phòng
app.get("/api/rooms/:roomId/students", (req, res) => {
  const roomId = req.params.roomId;
  const data = readData();
  const regs = (data.room_registrations || []).filter(
    (r) => r.status === "APPROVED" && r.room_id === roomId
  );
  const students = regs.map((r) => ({
    student_id: r.student_id,
    full_name: r.full_name,
    gender: r.gender,
    department: r.department,
    class_name: r.class_name,
    email: r.email,
    phone: r.phone,
  }));
  res.json(students);
});

// ===================================================
// =============== Các API cũ (đăng ký) ==============
// ===================================================
app.get("/api/registrations", (req, res) => {
  const data = readData();
  res.json(data.room_registrations || []);
});

app.post("/api/registrations", (req, res) => {
  const data = readData();
  const list = data.room_registrations || [];
  const newReg = { registration_id: Date.now(), ...req.body };
  list.push(newReg);
  data.room_registrations = list;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  res.json({ success: true, registration_id: newReg.registration_id });
});

app.post("/api/registrations/update", (req, res) => {
  const { id, status } = req.body;
  const data = readData();
  const list = data.room_registrations || [];
  const updated = list.map((r) =>
    r.registration_id === id ? { ...r, status } : r
  );
  data.room_registrations = updated;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  res.json({ success: true });
});

app.get("/", (_, res) => res.send("Server hoạt động..."));

// ===================================================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  console.log(`Đọc dữ liệu từ: ${DATA_PATH}`);
});
