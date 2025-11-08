// ... giữ nguyên các import & axios-customize hiện có
import axios from "./axios-customize";

// ====== THÊM/BỔ SUNG API DÙNG CHO HÓA ĐƠN ======

// Lấy giá điện nước [{name:"Dien",price:3500},{name:"Nuoc",price:7000}]
export const getElectricWaterPrices = () =>
  axios.get("/webktx/roomservices/diennuoc");

// Lấy danh sách sinh viên theo roomId
// GET /webktx/students/{roomId}/students
export const getStudentsInRoom = (roomId) =>
  axios.get(`/webktx/students/${roomId}/students`);

// (Giữ nguyên các export khác của bạn...)
// ===== Auth
export const loginAPI = (payload) => axios.post("/webktx/authentication/login", payload);
export const introspectAPI = () => axios.post("/webktx/authentication/introspect");
export const logoutAPI = () => axios.post("/webktx/authentication/logout");
export const refreshAPI = () => axios.post("/webktx/authentication/refresh");

// --- Rooms ---
export const getRoomById = (id) => axios.get(`/webktx/rooms/${id}`);
export const getRoomsPaged = (pageIndex = 0, pageSize = 10) =>
  axios.get("/webktx/rooms", { params: { pageIndex, pageSize } });
export const searchRooms3 = ({ dormName, type, maxOccupants, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/_search3", { params: { dormName, type, maxOccupants, pageIndex, pageSize } });
export const searchRooms4 = ({ dormName, type, maxOccupants, floor, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/_search", { params: { dormName, type, maxOccupants, floor, pageIndex, pageSize } });
export const getRoomsByDorm = ({ dormName, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/by-dorm", { params: { dormName, pageIndex, pageSize } });
export const getRoomsByType = ({ type, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/by-type", { params: { type, pageIndex, pageSize } });
export const getRoomsByMax = ({ max, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/by-max", { params: { max, pageIndex, pageSize } });
export const getRoomsByFloor = ({ floor, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/by-floor", { params: { floor, pageIndex, pageSize } });
export const getDormNames = () => axios.get("/webktx/dormitories/names");
export const getGlobalMaxFloor = () => axios.get("/webktx/rooms/max-floor");

// --- Users/Students/Registration ---
export const getMyInfo = () => axios.get("/webktx/user/myInfo");
export const getStudentById = (id) => axios.get(`/webktx/students/${id}`);
export const createRoomRegistration = (payload) =>
  axios.post("/webktx/room-registrations/create", payload);
export const getRegistrationsByStudentId = (id) =>
  axios.get(`/webktx/room-registrations/student/${id}`, { withCredentials: true });
export const getRegistrationsByStatus = (status, pageIndex = 0, pageSize = 10) =>
  axios.get(`/webktx/room-registrations/${String(status).toLowerCase()}`, {
    params: { pageIndex, pageSize },
  });

// Registration actions
export const approveRegistration = (id) => axios.put(`/webktx/room-registrations/approve/${id}`);
export const rejectRegistration = (id) => axios.put(`/webktx/room-registrations/reject/${id}`);

// Helpers
export const _obj = (res) => res?.data?.data ?? res?.data ?? res ?? null;
export const _arr = (res) =>
  Array.isArray(res) ? res
  : Array.isArray(res?.data?.data) ? res.data.data
  : Array.isArray(res?.data?.result) ? res.data.result
  : Array.isArray(res?.data) ? res.data
  : Array.isArray(res?.result) ? res.result
  : [];

// ===== Hóa đơn =====
export const createInvoice = (payload) => axios.post(`/webktx/invoices/create`, payload);
export const getInvoicesPaged = (pageIndex=0, pageSize=10) =>
  axios.get(`/webktx/invoices`, { params: { pageIndex, pageSize } });
export const getInvoice = (invoiceId) => axios.get(`/webktx/invoices/${invoiceId}`);
export const updateInvoice = (invoiceId, body) => axios.put(`/webktx/invoices/${invoiceId}`, body);
export const deleteInvoice = (invoiceId) => axios.delete(`/webktx/invoices/${invoiceId}`);
export const recomputeInvoice = (invoiceId) => axios.put(`/webktx/invoices/${invoiceId}/recompute`);
export const addInvoiceDetail = (invoiceId, body) => axios.post(`/webktx/invoices/${invoiceId}/details`, body);
export const removeInvoiceDetail = (invoiceId, detailId) =>
  axios.delete(`/webktx/invoices/${invoiceId}/details/${detailId}`);
export const searchInvoicesByMonth = (monthYYYYMM, pageIndex=0, pageSize=10) =>
  axios.get(`/webktx/invoices/search-by-month`, { params: { month: monthYYYYMM, pageIndex, pageSize } });
export const searchInvoicesByRoom = (roomId, pageIndex=0, pageSize=10) =>
  axios.get(`/webktx/invoices/by-room`, { params: { roomId, pageIndex, pageSize } });
export const searchInvoicesByStatus = (status, pageIndex=0, pageSize=10) =>
  axios.get(`/webktx/invoices/by-status`, { params: { status, pageIndex, pageSize } });
export const getLatestUnpaidInvoiceByRoom = (roomId) =>
  axios.get(`/webktx/invoices/by-room/latest-unpaid`, { params: { roomId } });

// ================== ANNOUNCEMENTS ==================
export const createAnnouncement = (payload) =>
  axios.post(`/webktx/announcements/create`, payload);

export const uploadAnnouncementImage = (announcementId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(
    `/webktx/announcements/${announcementId}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

export const updateAnnouncement = (announcementId, body) =>
  axios.put(`/webktx/announcements/${announcementId}`, body);

export const deleteAnnouncement = (announcementId) =>
  axios.delete(`/webktx/announcements/${announcementId}`);

export const getAnnouncement = (announcementId) =>
  axios.get(`/webktx/announcements/${announcementId}`);

export const getAnnouncementsPaged = (pageIndex = 0, pageSize = 10) =>
  axios.get(`/webktx/announcements`, { params: { pageIndex, pageSize } });

export const searchAnnouncements = ({
  keyword,
  target,     // "ALL" | "STUDENT" | "MANAGER" | undefined
  channel,    // "WEB" | "EMAIL" | "SMS" | "APP" | undefined
  pageIndex = 0,
  pageSize = 10,
}) =>
  axios.get(`/webktx/announcements/_search`, {
    params: { keyword, target, channel, pageIndex, pageSize },
  });

// ---- MoMo Payment ----
export const createMomoQR = (invoiceId) =>
  axios.post(`/api/momo/create`, null, { params: { invoiceId } });
