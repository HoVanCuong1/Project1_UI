/**
 * server.js — phiên bản đầy đủ cho chức năng Quản lý phòng
 * Giữ nguyên mô hình JSON để demo, tương thích hoàn toàn với dbktx.sql
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();

// ======= Bật CORS (không cần cài thư viện cors) =======
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// ======= Tạo thư mục dữ liệu =======
const DATA_DIR = path.join(__dirname, "demo-data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// ======= Đường dẫn các file =======
const roomsFile = path.join(DATA_DIR, "rooms.json");
const studentsFile = path.join(DATA_DIR, "students.json");
const regsFile = path.join(DATA_DIR, "room_registrations.json");

// ======= HÀM TIỆN ÍCH =======
function readJSON(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function ensureFiles() {
  const definePath = path.join(__dirname, "src", "Define.json");
  let importedRegs = [];

  if (fs.existsSync(definePath)) {
    try {
      const defineData = JSON.parse(fs.readFileSync(definePath, "utf8"));
      importedRegs = defineData.room_registrations || [];
    } catch (e) {
      console.error("Lỗi đọc Define.json:", e);
    }
  }

  if (!fs.existsSync(roomsFile)) writeJSON(roomsFile, []);
  if (!fs.existsSync(studentsFile)) writeJSON(studentsFile, []);

  // Nếu file room_registrations.json trống hoặc không tồn tại → nạp dữ liệu cũ
  if (!fs.existsSync(regsFile)) {
    writeJSON(regsFile, importedRegs);
  } else {
    const current = readJSON(regsFile, []);
    if (current.length === 0 && importedRegs.length > 0) {
      writeJSON(regsFile, importedRegs);
      console.log("Đã nhập dữ liệu room_registrations từ Define.json");
    }
  }
}
ensureFiles();

// ======= ĐỒNG BỘ DỮ LIỆU ĐỊNH NGHĨA BAN ĐẦU =======
const definePath = path.join(__dirname, "src", "Define.json");
if (fs.existsSync(definePath)) {
  try {
    const defineData = JSON.parse(fs.readFileSync(definePath, "utf8"));
    const regsFromDefine = defineData.room_registrations || [];
    const regsFromFile = readJSON(regsFile);
    if (regsFromDefine.length > 0 && regsFromFile.length === 0) {
      writeJSON(regsFile, regsFromDefine);
      console.log("Đã import room_registrations từ Define.json vào demo-data/");
    }
  } catch (err) {
    console.error("Lỗi đọc Define.json:", err);
  }
}


// ======= CORE LOGIC =======

// Tính lại currentOccupants dựa trên students
function recalcRoomCounts() {
  const rooms = readJSON(roomsFile);
  const students = readJSON(studentsFile);
  const counts = {};
  students.forEach((s) => {
    if (s.room_id) counts[s.room_id] = (counts[s.room_id] || 0) + 1;
  });
  rooms.forEach((r) => {
    r.currentOccupants = counts[r.room_id] || 0;
  });
  writeJSON(roomsFile, rooms);
  return rooms;
}

// ======= API =======

// 1. Lấy danh sách phòng (có filter)
app.get("/api/rooms", (req, res) => {
  let rooms = readJSON(roomsFile);
  const { dorm, gender, type, building } = req.query;
  if (dorm) rooms = rooms.filter((r) => r.dormName === dorm);
  if (gender)
    rooms = rooms.filter(
      (r) => r.roomType === (gender === "Nam" ? "MALE" : "FEMALE")
    );
  if (type) rooms = rooms.filter((r) => String(r.room_name).includes(type));
  if (building) rooms = rooms.filter((r) => r.dormName === building);
  res.json(rooms);
});

// 2. Lấy danh sách sinh viên trong một phòng
app.get("/api/rooms/:room_id/students", (req, res) => {
  const { room_id } = req.params;
  const students = readJSON(studentsFile);
  const filtered = students.filter((s) => s.room_id === room_id);
  res.json(filtered);
});

// 3. Lấy danh sách đăng ký phòng
app.get("/api/registrations", (req, res) => {
  res.json(readJSON(regsFile));
});

// 4. Sinh viên tạo đăng ký phòng
app.post("/api/registrations", (req, res) => {
  const regs = readJSON(regsFile);
  const body = req.body;

  // Lưu toàn bộ thông tin sinh viên và phòng
  const newReg = {
    registration_id: uuidv4(),
    registration_date: new Date().toISOString().split("T")[0],
    status: "PENDING",
    ...body,
  };

  regs.push(newReg);
  writeJSON(regsFile, regs);

  // Trả đúng định dạng frontend mong đợi
  res.json({ success: true, registration: newReg });
});

// 5. Manager duyệt đơn
app.post("/api/registrations/:id/approve", (req, res) => {
  const regId = req.params.id;
  const regs = readJSON(regsFile);
  const students = readJSON(studentsFile);
  const rooms = readJSON(roomsFile);

  const reg = regs.find((r) => r.registration_id === regId);
  if (!reg) return res.status(404).json({ message: "Không tìm thấy đơn" });

  const room = rooms.find((r) => r.room_id === reg.room_id);
  if (!room)
    return res.status(404).json({ message: "Phòng không tồn tại hoặc đã xóa" });

  const student = students.find((s) => s.student_id === reg.student_id);
  if (!student)
    return res
      .status(404)
      .json({ message: "Sinh viên không tồn tại hoặc chưa khai báo" });

  if (room.currentOccupants >= room.maxOccupants)
    return res.status(400).json({ message: "Phòng đã đầy" });

  // cập nhật
  reg.status = "APPROVED";
  student.room_id = room.room_id;
  room.currentOccupants += 1;

  writeJSON(regsFile, regs);
  writeJSON(studentsFile, students);
  writeJSON(roomsFile, rooms);

  res.json({ message: "Duyệt thành công", registration: reg });
});

// 6. Manager từ chối hoặc thu hồi
app.post("/api/registrations/:id/revoke", (req, res) => {
  const regId = req.params.id;
  const regs = readJSON(regsFile);
  const students = readJSON(studentsFile);
  const rooms = readJSON(roomsFile);

  const reg = regs.find((r) => r.registration_id === regId);
  if (!reg) return res.status(404).json({ message: "Không tìm thấy đơn" });

  const student = students.find((s) => s.student_id === reg.student_id);
  if (student && student.room_id === reg.room_id) {
    student.room_id = null;
    const room = rooms.find((r) => r.room_id === reg.room_id);
    if (room && room.currentOccupants > 0) room.currentOccupants -= 1;
  }

  reg.status = "REJECTED";
  writeJSON(regsFile, regs);
  writeJSON(studentsFile, students);
  writeJSON(roomsFile, rooms);
  res.json({ message: "Thu hồi / từ chối thành công", registration: reg });
});

// 7. Đồng bộ lại counts từ students
app.post("/api/reconcile", (req, res) => {
  const rooms = recalcRoomCounts();
  res.json({ message: "Đã đồng bộ lại số lượng sinh viên", rooms });
});

// 8. Lấy danh sách toàn bộ sinh viên
app.get("/api/students", (req, res) => {
  res.json(readJSON(studentsFile));
});

// 9. Chuyển sinh viên giữa phòng (manager move)
app.post("/api/students/:id/move", (req, res) => {
  const { new_room_id } = req.body;
  const { id } = req.params;
  const students = readJSON(studentsFile);
  const rooms = readJSON(roomsFile);

  const student = students.find((s) => s.student_id === id);
  if (!student) return res.status(404).json({ message: "Không tìm thấy SV" });

  const oldRoom = rooms.find((r) => r.room_id === student.room_id);
  const newRoom = rooms.find((r) => r.room_id === new_room_id);
  if (!newRoom) return res.status(404).json({ message: "Phòng mới không tồn tại" });

  if (newRoom.currentOccupants >= newRoom.maxOccupants)
    return res.status(400).json({ message: "Phòng mới đã đầy" });

  // cập nhật
  if (oldRoom && oldRoom.currentOccupants > 0) oldRoom.currentOccupants -= 1;
  newRoom.currentOccupants += 1;
  student.room_id = new_room_id;

  writeJSON(studentsFile, students);
  writeJSON(roomsFile, rooms);
  res.json({ message: "Chuyển phòng thành công", student });
});

// ======= SERVER START =======
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Demo server running on port", PORT);
});
